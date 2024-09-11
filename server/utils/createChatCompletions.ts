import OpenAI from 'openai'
import { getContext, sendEmail } from '~/ai/tools'
import sendEmailUtility from '~/server/utils/sendEmail'
import type { Message } from '~/types/types'

type CreateChatCompletionProps = {
  messages: Array<Message>
  stream: NodeJS.WritableStream
}

const createChatCompletions = async ({ messages, stream }: CreateChatCompletionProps) => {
  const { openaiApiKey } = useRuntimeConfig()

  const openAIClient = new OpenAI({
    apiKey: openaiApiKey,
  })

  // Filter out assistant messages with a tool call property, or tool messages.
  const systemMessages: Array<Message> = messages.filter(message => (message.role === 'assistant' && message.tool_calls) || message.role === 'tool')

  console.log('createChatCompletions -> creating a chat completion')

  try {
    const chatCompletionStream = await openAIClient.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      tools: [getContext, sendEmail],
      stream: true,
      stream_options: {
        include_usage: true,
      },
    })

    const toolCalls: Array<{ id: string, name: string, args: string }> = []

    for await (const chunk of chatCompletionStream) {
      if (chunk.choices[0]?.delta.tool_calls) {
        for (const toolCall of chunk.choices[0].delta.tool_calls) {
          const argumentChunk = toolCall.function?.arguments || ''

          toolCalls[toolCall.index] = {
            id: toolCalls[toolCall.index]?.id ?? toolCall.id,
            name: toolCalls[toolCall.index]?.name ?? toolCall.function?.name,
            args: toolCalls[toolCall.index]?.args ? toolCalls[toolCall.index].args + argumentChunk : argumentChunk,
          }
        }
      }

      if (chunk.choices.length) {
        if (chunk.choices[0].finish_reason === 'tool_calls') {
          const toolRequest: Message = {
            role: 'assistant',
            content: null,
            tool_calls: toolCalls.map((toolCall) => {
              return {
                id: toolCall.id,
                name: toolCall.name,
                function: {
                  name: toolCall.name,
                  arguments: toolCall.args,
                },
                type: 'function',
              }
            }),
          }

          const toolResults: Array<Message> = []

          for (const toolCall of toolCalls) {
            switch (toolCall.name) {
              case 'getContext': {
                const { searchQuery } = JSON.parse(toolCall.args)
                const vectors = await createEmbedding({ message: searchQuery })
                const records = await queryVectorDB({ vectors })
                const documents = await getEntriesById({ contentType: 'datasetItem', ids: records.map(match => match.id) })

                toolResults.push({
                  role: 'tool',
                  content: JSON.stringify({
                    context: documents.map(document => document.fields.content).join('\n'),
                  }),
                  tool_call_id: toolCall.id,
                })
                break
              }
              case 'sendEmail': {
                const { senderName, senderEmail, senderMessage } = JSON.parse(toolCall.args)

                const response = await sendEmailUtility(senderName, senderEmail, senderMessage)

                toolResults.push({
                  role: 'tool',
                  content: JSON.stringify({
                    response,
                  }),
                  tool_call_id: toolCall.id,
                })
                break
              }
            }
          }
          return createChatCompletions({ messages: [...messages, toolRequest, ...toolResults], stream })
        }

        if (chunk.choices[0].finish_reason !== 'stop') {
          stream.write(JSON.stringify({
            type: 'message',
            content: chunk.choices[0].delta.content ?? '',
          }) + '\n')
        }

        if (chunk.choices[0].finish_reason === 'stop') {
          stream.write(JSON.stringify({
            type: 'system',
            content: systemMessages,
          }))
          stream.end()
        }
      }

      if (chunk.usage) {
        console.log('createChatCompletion -> usage:', chunk.usage)
      }
    }
  }
  catch (error) {
    console.log(`There was an error in /create/message`)

    if (error instanceof Error) {
      console.log('Error message:', error.message)
    }
    else if (typeof error === 'string') {
      console.log('Error string:', error)
    }
    else if (typeof error === 'number') {
      console.log('Error number:', error)
    }
    else {
      console.log('Unknown error type:', error)
    }

    stream.write(JSON.stringify({
      type: 'message',
      content: 'There was an error. Please try later.',
    }))
    stream.end()
  }
}

export default createChatCompletions

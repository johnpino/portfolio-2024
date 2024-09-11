import OpenAI from 'openai'
import { getContext } from '~/ai/tools'
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

  console.log('createChatCompletions -> creating a chat completion')

  try {
    const chatCompletionStream = await openAIClient.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      tools: [getContext],
      stream: true,
      stream_options: {
        include_usage: true,
      },
    })

    const toolCalls: Array<{ id: string, name: string, args: string }> = []

    for await (const chunk of chatCompletionStream) {
      // console.log(chunk)
      // console.log(chunk.choices[0]?.delta)
      // console.log(chunk.choices[0]?.delta.tool_calls && chunk.choices[0].delta.tool_calls[0].function)
      // console.log('-----------------------------------')

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
            }
          }
          createChatCompletions({ messages: [...messages, toolRequest, ...toolResults], stream })
        }
        if (chunk.choices[0].finish_reason !== 'stop') {
          stream.write(chunk.choices[0].delta.content ?? '')
        }
        else {
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

    stream.write('There was an error. Please try later.')
    stream.end()
  }
}

export default createChatCompletions

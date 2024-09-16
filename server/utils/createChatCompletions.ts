import OpenAI from 'openai'
import DOMPurify from 'isomorphic-dompurify'
import { getContext, sendEmail, createCV } from '~/ai/tools'
import sendEmailUtility from '~/server/utils/sendEmail'
import createCVUtility from '~/server/utils/createCV'
import getContextUtility from '~/server/utils/getContext'
import type { Message } from '~/types/types'

type CreateChatCompletionProps = {
  messages: Array<Message>
  stream: NodeJS.WritableStream
}

const createChatCompletions = async ({ messages, stream }: CreateChatCompletionProps) => {
  const hasReachedLimitResult = await hasReachedLimit({ type: 'chatCount', limit: 7, expiration: 60, global: false })

  if (hasReachedLimitResult) {
    stream.write(JSON.stringify({
      type: 'message',
      content: 'The user has reached the limit of messages sent. Please try again in 1 minute.',
    }))
    stream.end()
    return
  }

  const { openaiApiKey } = useRuntimeConfig()

  const openAIClient = new OpenAI({
    apiKey: openaiApiKey,
  })

  console.log('createChatCompletions -> creating a chat completion')

  try {
    // Sanitize the user messages content and check if it's empty.
    const sanitizedMessages = messages.map((message) => {
      if (message.role === 'user') {
        const sanitizedContent = DOMPurify.sanitize(message.content as string, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] }).trim()

        if (sanitizedContent) {
          return {
            ...message,
            content: sanitizedContent,
          }
        }
        else {
          throw new Error('There was an error sanitizing the message content.')
        }
      }

      return message
    })

    // Filter out assistant messages with a tool call property, or tool messages.
    const systemMessages: Array<Message> = sanitizedMessages.filter(message => (message.role === 'assistant' && message.tool_calls) || message.role === 'tool')

    const chatCompletionStream = await openAIClient.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: sanitizedMessages,
      tools: [getContext, sendEmail, createCV],
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

                const documents = await getContextUtility({ searchQuery, messages: sanitizedMessages })

                toolResults.push({
                  role: 'tool',
                  content: JSON.stringify([
                    documents.map(document => ({
                      id: document.sys.id,
                      content: document.fields.content,
                    })),
                  ]),
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
              case 'createCV': {
                const { markdownContent } = JSON.parse(toolCall.args)

                const data = await createCVUtility({ markdownContent })

                toolResults.push({
                  role: 'tool',
                  content: JSON.stringify({
                    ...data,
                    url: `<a href='${data.url}' target='_blank'>Label</a>`,
                  }),
                  tool_call_id: toolCall.id,
                })
              }
            }
          }
          return createChatCompletions({ messages: [...sanitizedMessages, toolRequest, ...toolResults], stream })
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

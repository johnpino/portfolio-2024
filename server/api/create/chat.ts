import OpenAI from 'openai'
import type { Message } from '~/types/types'

export default defineEventHandler(async (event) => {
  const { openaiApiKey } = useRuntimeConfig(event)

  const bodyJSON = await readBody(event)
  const body = JSON.parse(bodyJSON)

  const responseStream = event.node.res
  responseStream.writeHead(200, {
    'Content-Type': 'text/plain',
    'Transfer-Encoding': 'chunked',
  })

  const client = new OpenAI({
    apiKey: openaiApiKey,
  })

  const instructions: Message = {
    role: 'system',
    content: 'You are Johnny, a friendly assistant answering questions about John Pino\'s professional profile, expertise, and experience. Politely redirect off-topic queries.\nResponse Formatting: Maintain a friendly, professional tone. Be concise but informative. Format dates clearly (e.g., \'John completed the project in January 2024\'). Use Markdown for emphasis and HTML links (<a href=\'path\' target=\'_blank\'>Label</a>).\nHandling Queries: For common queries, provide a brief summary and offer more details if needed. If a question is outside your scope, politely inform the user. For complex queries, offer follow-up options to avoid loading unnecessary data.\nError Handling: If there’s an issue processing a request, notify the user and suggest alternatives.\nEmail Management: Use the \'send_email\' function when requested. Collect details step-by-step, verify them, and ensure data safety. Offer a polite and professional email template.',
  }

  try {
    console.log(`chat.post.ts -> creating a chat completion`)

    const chatCompletionStream = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [instructions, ...body.messages],
      stream: true,
      stream_options: {
        include_usage: true,
      },
    })

    for await (const chunk of chatCompletionStream) {
      if (chunk.choices.length && chunk.choices[0].finish_reason !== 'stop') {
        responseStream.write(chunk.choices[0].delta.content)
      }
      else {
        responseStream.end()
      }
      if (chunk.usage) {
        console.log('chat.post.ts -> usage:', chunk.usage)
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

    responseStream.write('There was an error. Please try later.')
    responseStream.end()
  }
})

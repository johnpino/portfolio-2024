import OpenAI from 'openai'
import sendEmail from '~/server/utils/sendEmail'

export default defineEventHandler(async (event) => {
  const { openaiApiKey, assistantId } = useRuntimeConfig(event)

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

  try {
    const runStream = await client.beta.threads.runs.stream(body.threadId, {
      assistant_id: assistantId,
      additional_messages: [
        {
          role: 'user',
          content: body.message,
        },
      ],
    })

    runStream
      .on('event', async (data) => {
        if (data.event === 'thread.run.requires_action') {
          const calls = data.data.required_action?.submit_tool_outputs.tool_calls || []
          for (const call of calls) {
            if (call.function.name === 'send_email') {
              const { senderName, senderEmail, content } = JSON.parse(call.function.arguments)

              const response = await sendEmail(senderName, senderEmail, content)

              await client.beta.threads.runs.submitToolOutputsStream(body.threadId, data.data.id, {
                tool_outputs: [
                  {
                    tool_call_id: call.id,
                    output: `{ "success": ${response.status === 200 ? 'true' : 'false'} }`,
                  },
                ],
              })
                .on('textDelta', (delta) => {
                  responseStream.write(delta.value)
                })
                .on('textDone', () => {
                  responseStream.end()
                })
            }
          }
        }
      })
      .on('textDelta', (delta) => {
        responseStream.write(delta.value)
      })
      .on('textDone', () => {
        responseStream.end()
      })
      .on('error', (e) => {
        console.log(`There was an error streaming from OpenAI: ${e}`)
        responseStream.write('There was an error. Please try later.')
        responseStream.end()
      })
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

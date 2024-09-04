import OpenAI from 'openai'

import formData from 'form-data'
import Mailgun from 'mailgun.js'

export default defineEventHandler(async (event) => {
  const { openaiApiKey, assistantId, mailgunApiKey, mailgunDomain } = useRuntimeConfig(event)

  const bodyJSON = await readBody(event)

  const body = JSON.parse(bodyJSON)

  const client = new OpenAI({
    apiKey: openaiApiKey,
  })

  const responseStream = event.node.res

  responseStream.writeHead(200, {
    'Content-Type': 'text/plain',
    'Transfer-Encoding': 'chunked',
  })

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
            const functionArgs = JSON.parse(call.function.arguments)

            const mailgun = new Mailgun(formData)

            const mg = mailgun.client({
              username: 'api',
              key: mailgunApiKey,
            })

            const info = {
              from: 'Portfolio Online <info@johnpino.me>',
              to: 'iam@johnpino.me',
              subject: `New Message from ${functionArgs.senderName}`,
              text: `${functionArgs.content} ${functionArgs.senderEmail}`,
            }

            try {
              const mailgunResponse = await mg.messages.create(mailgunDomain, info)

              await client.beta.threads.runs.submitToolOutputsStream(body.threadId, data.data.id, {
                tool_outputs: [
                  {
                    tool_call_id: call.id,
                    output: `{ "success": ${mailgunResponse.status === 200 ? 'true' : 'false'} }`,
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
            catch (e) {
              console.log(`There was an error in /create/message: ${e}`)
              responseStream.write('There was an error. Please try later.')
              responseStream.end()
            }
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
})

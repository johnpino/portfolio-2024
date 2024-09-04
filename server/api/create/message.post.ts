import OpenAI from 'openai'

export default defineEventHandler(async (event) => {
  const { openaiApiKey, assistantId } = useRuntimeConfig(event)

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
            await client.beta.threads.runs.submitToolOutputsStream(body.threadId, data.data.id, {
              tool_outputs: [
                {
                  tool_call_id: call.id,
                  output: '{ "success": true }',
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
})

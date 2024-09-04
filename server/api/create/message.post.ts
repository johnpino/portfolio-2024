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
    .on('textDelta', (delta) => {
      responseStream.write(delta.value)
    })
    .on('textDone', () => {
      responseStream.end()
    })
})

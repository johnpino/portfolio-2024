import OpenAI from "openai"

export default defineEventHandler(async (event) => {
  const { openaiApiKey, assistantId } = useRuntimeConfig(event)

  const bodyJSON = await readBody(event);

  const body = JSON.parse(bodyJSON)

  const client = new OpenAI({
    apiKey: openaiApiKey
  })

  const runStream = await client.beta.threads.runs.stream(body.threadId, {
    assistant_id: assistantId,
    additional_messages: [
      {
        role: 'user',
        content: body.message
      }
    ],
  })

  return runStream.toReadableStream()
})

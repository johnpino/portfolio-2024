import OpenAI from "openai"

export default defineEventHandler(async (event) => {
  const { openaiApiKey } = useRuntimeConfig(event)
  const { initialMessage } = await readBody(event)

  const client = new OpenAI({
    apiKey: openaiApiKey
  })

  const thread = await client.beta.threads.create()

  if (initialMessage) {
    await client.beta.threads.messages.create(thread.id, {
      role: 'assistant',
      content: initialMessage
    })
  }

  return thread.id
})

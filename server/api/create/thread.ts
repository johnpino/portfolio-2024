import OpenAI from "openai"

export default defineEventHandler(async (event) => {
  const { openaiApiKey } = useRuntimeConfig(event)

  const client = new OpenAI({
    apiKey: openaiApiKey
  })

  const thread = await client.beta.threads.create()

  return thread.id
})

import { OpenAI } from 'openai'

export default defineEventHandler(async (event) => {
  const { openaiApiKey, apisSecret } = useRuntimeConfig(event)
  const { input, secret } = await readBody(event)

  if (secret !== apisSecret) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    })
  }

  const openAIClient = new OpenAI({ apiKey: openaiApiKey })

  const embeddings = openAIClient.embeddings.create({
    model: 'text-embedding-3-large',
    input,
  })

  return embeddings
})

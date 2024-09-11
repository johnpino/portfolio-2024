import OpenAI from 'openai'

type CreateEmbeddingProps = {
  message: string
}

export default async ({ message }: CreateEmbeddingProps) => {
  const { openaiApiKey } = useRuntimeConfig()

  const openAIClient = new OpenAI({
    apiKey: openaiApiKey,
  })

  const embeddings = await openAIClient.embeddings.create({
    model: 'text-embedding-3-large',
    input: message,
  })

  return embeddings.data[0].embedding
}

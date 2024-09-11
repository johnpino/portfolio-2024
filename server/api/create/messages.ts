import { Pinecone } from '@pinecone-database/pinecone'
import OpenAI from 'openai'
import getEntriesById from '~/server/utils/getEntriesById'
import type { Message } from '~/types/types'

export default defineEventHandler(async (event) => {
  const { openaiApiKey, pineconeApiKey, pineconeIndex: index } = useRuntimeConfig(event)
  const { message } = await readBody(event)

  const openAIClient = new OpenAI({
    apiKey: openaiApiKey,
  })

  const embeddings = await openAIClient.embeddings.create({
    model: 'text-embedding-3-large',
    input: message,
  })

  const pineconeClient = new Pinecone({
    apiKey: pineconeApiKey,
  })

  const pineconeIndex = pineconeClient.Index(index)

  const records = await pineconeIndex.query({
    vector: embeddings.data[0].embedding,
    topK: 10,
    includeMetadata: true,
  })

  const relevantRecords = records.matches.filter(match => match.score && match.score > 0.3)

  const documents = await getEntriesById({ contentType: 'datasetItem', ids: relevantRecords.map(match => match.id) })

  const messages: Array<Message> = []

  for (const document of documents) {
    const message: Message = {
      id: document.sys.id,
      content: document.fields.content as string,
      role: 'system',
    }

    messages.push(message)
  }

  return messages
})

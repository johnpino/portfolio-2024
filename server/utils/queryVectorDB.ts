import { Pinecone } from '@pinecone-database/pinecone'

type QueryVectorDBProps = {
  vectors: Array<number>
}

export default async ({ vectors }: QueryVectorDBProps) => {
  const { pineconeApiKey, pineconeIndex: index } = useRuntimeConfig()

  const pineconeClient = new Pinecone({
    apiKey: pineconeApiKey,
  })

  const pineconeIndex = pineconeClient.Index(index)

  const records = await pineconeIndex.query({
    vector: vectors,
    topK: 10,
    includeMetadata: true,
  })

  const relevantRecords = records.matches.filter(match => match.score && match.score > 0.3)

  return relevantRecords
}

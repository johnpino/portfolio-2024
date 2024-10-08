import { z } from 'zod'
import { zodFunction } from 'openai/helpers/zod'

const Parameters = z.object({
  searchQuery: z.string().describe('The search query, in english, generated by the assistant to retrieve relevant documents from Pinecone.'),
})

export const getContext = zodFunction({ name: 'getContext', description: 'Retrieves relevant documents based on a query, providing the assistant with the necessary context to answer questions accurately', parameters: Parameters })

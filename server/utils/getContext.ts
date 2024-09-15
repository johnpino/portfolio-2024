import type { Message } from '~/types/types'

type GetContextProps = {
  searchQuery: string
  messages: Array<Message>
}

export default async ({ searchQuery, messages }: GetContextProps) => {
  const vectors = await createEmbedding({ message: searchQuery })
  const records = await queryVectorDB({ vectors })

  const existingDocumentIds: Array<string> = messages
    .filter(message => message.role === 'tool')
    .map(message => JSON.parse(message.content as string).id)

  // Filter out documents that have already been sent to the user.
  const filteredRecords = records.filter(record => !existingDocumentIds.includes(record.id))

  const documents = await getEntriesById({ contentType: 'datasetItem', ids: filteredRecords.map(match => match.id) })

  return documents
}

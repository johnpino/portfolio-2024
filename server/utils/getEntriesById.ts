import type { Entry, EntryCollection, EntrySkeletonType } from 'contentful'
import resolveResponse from 'contentful-resolve-response'

interface GetEntriesProps {
  contentType: string
  ids: Array<string>
  limit?: number
}

export default async ({ contentType, limit = 10, ids }: GetEntriesProps) => {
  const config = useRuntimeConfig()

  const baseUrl = `${config.contentfulAPIBaseUrl}spaces/${config.contentfulSpaceID}/environments/${config.contentfulEnvironment}/entries`
  const searchParams = `?access_token=${config.contentfulDeliveryAccessToken}&limit=${limit}&content_type=${contentType}&sys.id[in]=${ids.join(',')}`
  const url = `${baseUrl}${searchParams}`

  const data = await $fetch<EntryCollection<EntrySkeletonType>>(url)

  if (data.items.length === 0) {
    return []
  }

  const resolvedData = resolveResponse(data) as Array<Entry<EntrySkeletonType, 'WITHOUT_LINK_RESOLUTION', ''>>

  return resolvedData
}

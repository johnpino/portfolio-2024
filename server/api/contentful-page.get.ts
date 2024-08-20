import type { EntryCollection, EntrySkeletonType } from "contentful"
import resolveResponse from "contentful-resolve-response"
import type { TypePage } from "~/contentful/types"

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  const config = useRuntimeConfig(event)

  const baseUrl = `${config.contentfulAPIBaseUrl}spaces/${config.contentfulSpaceID}/environments/${config.contentfulEnvironment}/entries`
  const searchParams = `?access_token=${config.contentfulDeliveryAccessToken}&include=10&limit=2`
  const url = `${baseUrl}${searchParams}&content_type=${query.contentType}&fields.slug=/${query.slug}`

  const data = await $fetch<EntryCollection<EntrySkeletonType>>(url)

  if (data.items.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: `The slug "${query.slug}" doesn't exists`,
    })
  }

  const { fields } = resolveResponse(data)[0] as TypePage<
      'WITHOUT_UNRESOLVABLE_LINKS',
      ''
    >

  return fields
})

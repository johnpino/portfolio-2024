type HandleRateLimitProps = {
  type: string
  limit: number
  expiration?: number
  global: boolean
}

export default async ({ type, limit, expiration, global }: HandleRateLimitProps) => {
  let identifier

  if (!global) {
    const event = useEvent()
    const xForwardedFor = event.node.req.headers['x-forwarded-for']
    const ipAddress = Array.isArray(xForwardedFor)
      ? xForwardedFor[0]
      : xForwardedFor?.split(',')[0]?.trim()

    if (!ipAddress) {
      throw new Error('No IP address found in the request')
    }

    identifier = ipAddress
  }
  else {
    identifier = 'global'
  }

  const { data, set } = await queryKVDB<number>({ key: `${identifier}${type}` })

  if (data === null) {
    await set(1, expiration)
  }
  else if (data >= limit) {
    return true
  }
  else {
    await set(data + 1)
  }

  return false
}

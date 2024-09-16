import { kv } from '@vercel/kv'

type QueryKVDBProps = {
  type: string
}

export default async <U>({ type }: QueryKVDBProps) => {
  const event = useEvent()
  const xForwardedFor = event.node.req.headers['x-forwarded-for']
  const ipAddress = Array.isArray(xForwardedFor)
    ? xForwardedFor[0]
    : xForwardedFor?.split(',')[0]?.trim()

  if (!ipAddress) {
    throw new Error('No IP address found in the request')
  }

  const data = await kv.get<U>(`${ipAddress}:${type}`)

  const set = async (value: U, expiration: number = 60 * 60 * 24) => {
    if (data === null) {
      return kv.set(`${ipAddress}:${type}`, value, { ex: expiration })
    }
    else {
      return kv.set(`${ipAddress}:${type}`, value, { keepTtl: true })
    }
  }

  return {
    data,
    set,
  }
}

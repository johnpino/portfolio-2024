import { kv } from '@vercel/kv'
import type { KVData } from '~/types/types'

export default async () => {
  const event = useEvent()
  const xForwardedFor = event.node.req.headers['x-forwarded-for']
  const ipAddress = Array.isArray(xForwardedFor)
    ? xForwardedFor[0]
    : xForwardedFor?.split(',')[0]?.trim()

  if (!ipAddress) {
    throw new Error('No IP address found in the request')
  }

  const data = await kv.get<KVData>(ipAddress) || {}
  const ttl = await kv.ttl(ipAddress) // Returns -2 if the key does not exist or -1 if it does not expire

  const set = async (value: KVData) => {
    return kv.set(ipAddress, { ...data, ...value }, { ex: ttl < 0 ? 60 * 60 * 24 : ttl })
  }

  return {
    data,
    set,
  }
}

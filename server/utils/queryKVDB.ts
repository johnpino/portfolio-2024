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

  const set = async (value: KVData) => {
    return kv.set(ipAddress, { ...data, ...value }, { ex: 60 * 60 * 24 })
  }

  return {
    data,
    set,
  }
}

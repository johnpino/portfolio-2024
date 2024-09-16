import { kv } from '@vercel/kv'

type QueryKVDBProps = {
  key: string
}

export default async <U>({ key }: QueryKVDBProps) => {
  const data = await kv.get<U>(key)

  const set = async (value: U, expiration: number = 60 * 60 * 24) => {
    if (data === null) {
      return kv.set(key, value, { ex: expiration })
    }
    else {
      return kv.set(key, value, { keepTtl: true })
    }
  }

  return {
    data,
    set,
  }
}

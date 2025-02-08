import { Redis } from '@upstash/redis'

type QueryKVDBProps = {
  key: string
}

export default async <U>({ key }: QueryKVDBProps) => {
  const redis = Redis.fromEnv()

  const data = await redis.get<U>(key)

  const set = async (value: U, expiration: number = 60 * 60 * 24) => {
    if (data === null) {
      return redis.set(key, value, { ex: expiration })
    }
    else {
      return redis.set(key, value, { keepTtl: true })
    }
  }

  return {
    data,
    set,
  }
}

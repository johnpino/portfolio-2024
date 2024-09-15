import type { KVData } from '~/types/types'

type HandleRateLimitProps = {
  type: keyof KVData
  limit: number
}

export default async ({ type, limit }: HandleRateLimitProps) => {
  const { data, set } = await queryKVDB()

  const limitData = data[type]

  if (!limitData) {
    await set({ [type]: 1 })
  }
  else if (limitData >= limit) {
    return true
  }
  else {
    await set({ [type]: limitData + 1 })
  }

  return false
}

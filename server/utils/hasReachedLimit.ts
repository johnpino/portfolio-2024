type HandleRateLimitProps = {
  type: string
  limit: number
  expiration?: number
}

export default async ({ type, limit, expiration }: HandleRateLimitProps) => {
  const { data, set } = await queryKVDB<number>({ type })

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

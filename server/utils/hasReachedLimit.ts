type HandleRateLimitProps = {
  type: string
  limit: number
}

export default async ({ type, limit }: HandleRateLimitProps) => {
  const { data, set } = await queryKVDB<number>({ type })

  if (data === null) {
    await set(1)
  }
  else if (data >= limit) {
    return true
  }
  else {
    await set(data + 1)
  }

  return false
}

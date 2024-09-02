export const useOpenai = async () => {
  const threadId = ref()

  const { execute } = useFetch('api/create/thread', {
    onResponse({ response }) {
      threadId.value = response._data
      localStorage.setItem('threadId', threadId.value)
    },
    immediate: false
  })

  if (import.meta.client) {
    threadId.value = localStorage.getItem('threadId')

    if (!threadId.value) {
      await execute()
    }
  }

  const { data, execute: sendMessage, status } = await useFetch('api/create/message',
    {
      method: 'post',
      body: {
        message: 'Quien es John?',
        threadId: threadId.value
      },
      immediate: false
    }
  )

  return { sendMessage, data, status }
}

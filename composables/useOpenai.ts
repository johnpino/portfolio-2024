import markdownit from 'markdown-it'

const createThread = async (ref: Ref, initialMessage?: string) => {
  const data = await $fetch('api/create/thread', {
    method: 'post',
    body: { initialMessage },
  })
  ref.value = data
}

interface UseOpenaiProps {
  initialMessage?: string
}

interface Message {
  role: 'assistant' | 'user'
  content?: string
}

export const useOpenai = (props: UseOpenaiProps = {}) => {
  const md = markdownit({ html: true })
  const isLoading = ref(false)
  const threadId = ref()

  watch(threadId, (val) => {
    localStorage.setItem('threadId', val)
  })

  if (import.meta.client) {
    threadId.value = localStorage.getItem('threadId')

    if (!threadId.value) {
      createThread(threadId, props.initialMessage)
    }
  }

  const messages = reactive<Array<Message>>(props.initialMessage ? [{ role: 'assistant', content: props.initialMessage }] : [])

  const answer = reactive<Message>({
    role: 'assistant',
    content: '',
  })

  const sendMessage = async (message: string) => {
    isLoading.value = true

    let rawMarkdown = ''

    messages.push({
      role: 'user',
      content: message,
    })

    const stream = await fetch('api/create/message',
      {
        method: 'post',
        body: JSON.stringify({
          message,
          threadId: threadId.value,
        }),
      },
    )

    resolveStream({
      stream: stream.body,
      onChunk: (data) => {
        rawMarkdown += data
        answer.content = md.render(rawMarkdown)
      },
      onReady: () => {
        messages.push({ ...answer })
        rawMarkdown = ''
        answer.content = ''
      },
      onStart: () => {
        isLoading.value = false
      },
    })
  }

  return { sendMessage, answer, isLoading, messages }
}

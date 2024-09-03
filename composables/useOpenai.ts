import type OpenAI from 'openai'
import markdownit from 'markdown-it'

const resolveStream = async ({
  onChunk,
  onReady,
  onStart,
  stream,
}: {
  onChunk: (data: string) => void
  onReady: () => void
  onStart: () => void
  stream: ReadableStream<Uint8Array> | null
}) => {
  if (!stream) return

  const reader = stream.pipeThrough(new TextDecoderStream()).getReader()

  let onStartCalled = false

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const stream = await reader.read()
    if (stream.done) break

    const chunks = stream?.value
      .split('\n')
      .filter(i => Boolean(i.length))
      .map(i => JSON.parse(i)) as Array<OpenAI.Beta.AssistantStreamEvent>

    for (const chunk of chunks) {
      if (chunk.event !== 'thread.message.delta'
        || !chunk.data.delta.content?.length
        || chunk.data.delta.content[0].type !== 'text'
        || !chunk.data.delta.content[0].text?.value) continue

      if (!onStartCalled) {
        onStart()
        onStartCalled = true
      }

      onChunk(chunk.data.delta.content[0].text.value)
    }
  }

  onReady()
}

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

  const messages = reactive<Array<{ role: string, content: string }>>(props.initialMessage ? [{ role: 'assistant', content: props.initialMessage }] : [])

  let rawMarkdown = ''

  const answer = reactive({
    role: 'assistant',
    content: '',
  })

  const sendMessage = async (message: string) => {
    isLoading.value = true

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

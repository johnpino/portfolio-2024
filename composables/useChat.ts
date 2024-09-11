import markdownIt from 'markdown-it'
import type { Message } from '~/types/types'

interface UseChatProps {
  initialMessage?: string
}

export const useChat = (props: UseChatProps) => {
  const md = markdownIt({ html: true })
  const isLoading = ref(false)

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

    try {
      const stream = await fetch('api/create/chat',
        {
          method: 'post',
          body: JSON.stringify({
            messages,
          }),
        },
      )

      resolveStream({
        stream: stream.body,
        onChunk: (data) => {
          if (data.type === 'system') {
            messages.push(...data.content)
          }

          if (data.type === 'message') {
            rawMarkdown += data.content
            answer.content = md.render(rawMarkdown)
          }
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
    catch {
      console.log('There was an error creating the chat')

      messages.push({ role: 'assistant', content: `${answer.content} <strong>Sorry, there was an error. Please try again.</strong>` })
      rawMarkdown = ''
      answer.content = ''
    }
  }

  return {
    isLoading,
    sendMessage,
    messages,
    answer,
  }
}

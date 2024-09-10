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

    const _messages = await $fetch('api/create/messages',
      {
        method: 'post',
        body: JSON.stringify({
          message,
        }),
      },
    )

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
    catch {
      console.log('There was an error creating the chat')

      messages.push({ role: 'error', content: `${answer.content} <strong>Sorry, there was an error. Please try again.</strong>` })
      rawMarkdown = ''
      answer.content = ''
    }
  }

  // Embed the query
  // Search Vectors in Pinecone
  // Search info in Contentful
  // Attach 3 previous messages for context
  // Attach a role system with info from Contentful
  // Attach a role user with query
  // Send the request to OpenAI
  // Stream the response to the client

  return {
    isLoading,
    sendMessage,
    messages,
    answer,
  }
}

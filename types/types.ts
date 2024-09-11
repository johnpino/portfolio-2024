import type OpenAI from 'openai'

export type Message = OpenAI.Chat.Completions.ChatCompletionMessageParam & {
  id?: string
}

export type StreamData = { type: 'message', content: string } | { type: 'system', content: Array<Message> }

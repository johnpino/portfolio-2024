import type OpenAI from 'openai'

export type Message = OpenAI.Chat.Completions.ChatCompletionMessageParam & {
  id?: string
}

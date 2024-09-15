import type OpenAI from 'openai'

export type Message = OpenAI.Chat.Completions.ChatCompletionMessageParam

export type StreamData = { type: 'message', content: string } | { type: 'system', content: Array<Message> }

export type KVData = { PDFCount?: number }

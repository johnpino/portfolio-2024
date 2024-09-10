export interface Message {
  role: 'assistant' | 'user' | 'system' | 'error'
  content?: string
  id?: string
}

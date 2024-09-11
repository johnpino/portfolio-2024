import { z } from 'zod'
import { zodFunction } from 'openai/helpers/zod'

const Parameters = z.object({
  senderEmail: z.string().describe('The email address of the sender.'),
  senderName: z.string().describe('The name of the sender.'),
  senderMessage: z.string().describe('The content of the email.'),
})

export const sendEmail = zodFunction({ name: 'sendEmail', description: 'Only call this when you are asked to send a message or an email', parameters: Parameters })

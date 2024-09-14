import { z } from 'zod'
import { zodFunction } from 'openai/helpers/zod'

const Parameters = z.object({
  senderEmail: z.string().describe('The email address of the sender.'),
  senderName: z.string().describe('The name of the sender.'),
  senderMessage: z.string().describe('The content of the email.'),
  emailsSent: z.number().describe('The number of emails sent until now, based on context. Do not ask the user for this information.'),
})

export const sendEmail = zodFunction({ name: 'sendEmail', description: 'Send an email to John Pino. Collect details step-by-step, always verify them with the user, and ensure data safety. For the email content offer a polite and professional email template.', parameters: Parameters })

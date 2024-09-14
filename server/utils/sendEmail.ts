import formData from 'form-data'
import type { MessagesSendResult } from 'mailgun.js'
import Mailgun from 'mailgun.js'

export default async (senderName: string, senderEmail: string, content: string, emailsSent: number): Promise<MessagesSendResult> => {
  if (emailsSent > 0) {
    return {
      status: 429,
      message: 'You have reached the limit of emails sent',
    }
  }

  const { mailgunApiKey, mailgunDomain } = useRuntimeConfig()

  const mailgun = new Mailgun(formData)

  const mg = mailgun.client({
    username: 'api',
    key: mailgunApiKey,
  })

  const data = {
    from: 'Portfolio Online <info@johnpino.me>',
    to: 'iam@johnpino.me',
    subject: `New Message from ${senderName}`,
    text: `${content} ${senderEmail}`,
  }

  return await mg.messages.create(mailgunDomain, data)
}

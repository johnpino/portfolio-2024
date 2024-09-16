import formData from 'form-data'
import type { MessagesSendResult } from 'mailgun.js'
import Mailgun from 'mailgun.js'
import hasReachedLimit from './hasReachedLimit'

export default async (senderName: string, senderEmail: string, content: string): Promise<MessagesSendResult> => {
  const hasReachedGlobalLimit = await hasReachedLimit({ type: 'emailCount', limit: 30, global: true })

  if (hasReachedGlobalLimit) {
    return {
      status: 429,
      message: `The system has reached the limit of emails sent`,
    }
  }

  const hasReachedPersonalLimit = await hasReachedLimit({ type: 'emailCount', limit: 1, global: false })

  if (hasReachedPersonalLimit) {
    return {
      status: 429,
      message: `The user has reached the limit of emails sent`,
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

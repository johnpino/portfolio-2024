import formData from 'form-data'
import Mailgun from 'mailgun.js'

export default async (senderName: string, senderEmail: string, content: string) => {
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

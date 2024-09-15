import { put } from '@vercel/blob'
import markdownIt from 'markdown-it'
import hasReachedLimitHandler from './hasReachedLimit'

type CreateCVProps = {
  markdownContent: string
}

export default async ({ markdownContent }: CreateCVProps) => {
  const hasReachedLimit = await hasReachedLimitHandler({ type: 'PDFCount', limit: 2 })

  if (hasReachedLimit) {
    return {
      success: false,
      message: 'The user has reached the limit of PDFs generated',
      url: '',
    }
  }

  const { pdfShiftApiKey } = useRuntimeConfig()

  const htmlContent = markdownIt({ html: true })
    .render(markdownContent)

  const assets = useStorage('assets:templates')
  const template = await assets.getItem('cv.html') as string
  const content = template.replace('{{content}}', htmlContent)

  try {
    const response = await fetch('https://api.pdfshift.io/v3/convert/pdf', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from('api:' + pdfShiftApiKey).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        source: content,
        format: 'Letter',
        margin: '40px 60px',
      }),
    })

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`)
    }

    const fileName = `John Pino CV - ${new Date().toISOString()}.pdf`
    const pdfBuffer = await response.arrayBuffer()

    const { url } = await put(fileName, pdfBuffer, { access: 'public' })

    console.log('createChatCompletions -> createCV -> url:', url)

    return {
      success: true,
      message: 'The CV been created successfully',
      url,
    }
  }
  catch (error) {
    console.error('Error generating PDF:', error)
    return {
      success: false,
      message: 'Error generating PDF',
      url: '',
    }
  }
}

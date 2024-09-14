import { resolve } from 'path'
import fs from 'fs'
import { put } from '@vercel/blob'
import markdownPdf from 'markdown-pdf'

type CreateCVProps = {
  markdownContent: string
}

export default async ({ markdownContent }: CreateCVProps) => {
  const outputPath = resolve(`/tmp/John Pino CV - ${new Date().toISOString()}.pdf`)

  await new Promise<void>((resolve) => {
    try {
      markdownPdf()
        .from.string(markdownContent)
        .to(outputPath, async () => {
          resolve()
        })
    }
    catch {
      return {
        success: false,
        message: 'The CV couldn\'t been created',
        url: '',
      }
    }
  })

  const pdfBuffer = fs.readFileSync(outputPath)

  const { url } = await put(outputPath, pdfBuffer, { access: 'public' })

  fs.unlinkSync(outputPath)

  console.log('createChatCompletions -> createCV -> url:', url)

  return {
    success: true,
    message: 'The CV been created successfully',
    url,
  }
}

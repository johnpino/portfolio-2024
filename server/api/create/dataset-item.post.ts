import { Pinecone } from '@pinecone-database/pinecone'
import OpenAI from 'openai'
import { verifyRequest } from '@contentful/node-apps-toolkit'

export default defineEventHandler(async (event) => {
  const { openaiApiKey, pineconeApiKey, pineconeIndex: index, contentfulWebhookSecret } = useRuntimeConfig(event)
  const body = await readBody(event)

  const canonicalRequest = {
    path: event.path,
    headers: Object.fromEntries(event.headers.entries() ?? []),
    method: event.method as 'GET' | 'HEAD' | 'PATCH' | 'POST' | 'PUT' | 'DELETE' | 'OPTIONS',
    body: JSON.stringify(body),
  }

  try {
    const isValid = verifyRequest(contentfulWebhookSecret, canonicalRequest)

    if (!isValid) {
      console.log(`There was an error in /create/message. Invalid Secret`)
      return { success: false, message: 'Invalid webhook secret' }
    }
  }
  catch (error) {
    console.log(`There was an error in /create/message while validating the secret: ${error}`)
    return { success: false, message: error }
  }

  const eventType = event.headers.get('x-contentful-topic')

  const openAIClient = new OpenAI({
    apiKey: openaiApiKey,
  })

  const pineconeClient = new Pinecone({
    apiKey: pineconeApiKey,
  })

  const pineconeIndex = pineconeClient.Index(index)

  try {
    if (eventType === 'ContentManagement.Entry.publish') {
      const embeddings = await openAIClient.embeddings.create({
        model: 'text-embedding-3-large',
        input: body.content,
      })

      await pineconeIndex.upsert([
        {
          id: body.id,
          values: embeddings.data[0].embedding,
        },
      ])
    }

    if (eventType === 'ContentManagement.Entry.delete') {
      await pineconeIndex.deleteOne(body.id)
    }
  }
  catch (error) {
    console.log(`There was an error in /create/message`)

    if (error instanceof Error) {
      console.log('Error message:', error.message)
    }
    else if (typeof error === 'string') {
      console.log('Error string:', error)
    }
    else if (typeof error === 'number') {
      console.log('Error number:', error)
    }
    else {
      console.log('Unknown error type:', error)
    }

    return { success: false, message: error }
  }

  return { success: true }
})

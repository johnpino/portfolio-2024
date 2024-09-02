import OpenAI from "openai"

interface ResponseType {
  role: string;
  content: string;
}

export default defineEventHandler(async (event) => {
  const { openaiApiKey, assistantId } = useRuntimeConfig(event)

  const body = await readBody(event)

  const client = new OpenAI({
    apiKey: openaiApiKey
  })

  const run = await client.beta.threads.runs.createAndPoll(body.threadId, {
    assistant_id: assistantId,
    additional_messages: [
      {
        role: 'user',
        content: body.message
      }
    ],
  })

  const messages = await client.beta.threads.messages.list(run.thread_id)

  return messages.data.reduce<Array<ResponseType>>((acc, cur) => {
    const accumulator = [...acc]

    accumulator.push({
      role: cur.role,
      content: cur.content[0].type === 'text' ? cur.content[0].text.value : ''
    })

    return accumulator
  }, [])
})

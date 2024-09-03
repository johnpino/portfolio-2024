import type { AsyncDataRequestStatus } from "#app";

import type OpenAI from "openai";

const resolveStream = async ({
  onChunk,
  onReady,
  stream,
}: {
  onChunk: (data: string) => void,
  onReady: () => void,
  stream: ReadableStream<Uint8Array> | null
}) => {

  if (!stream) return

  const reader = stream.pipeThrough(new TextDecoderStream()).getReader();

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const stream = await reader.read();
    if (stream.done) break;

    console.log(stream)

    const chunks = stream?.value
      .split("\n")
      .filter((i) => Boolean(i.length))
      .map((i) => JSON.parse(i)) as Array<OpenAI.Beta.AssistantStreamEvent>;

    for (const chunk of chunks) {
      if (chunk.event !== 'thread.message.delta' ||
        !chunk.data.delta.content?.length ||
        chunk.data.delta.content[0].type !== 'text' ||
        !chunk.data.delta.content[0].text?.value) continue

      onChunk(chunk.data.delta.content[0].text.value);
    }
  }

  onReady();
};

const createThread = async (ref: Ref) => {
  const data = await $fetch('api/create/thread')
  ref.value = data
}

export const useOpenai = () => {
  const threadId = ref()

  watch(threadId, val => {
    localStorage.setItem('threadId', val)
  })

  if (import.meta.client) {
    threadId.value = localStorage.getItem('threadId')

    if (!threadId.value) {
      createThread(threadId)
    }
  }

  const messages = ref<Array<{ role: string, content: string }>>([])

  const answer = ref({
    role: 'assistant',
    content: ''
  })

  const requestStatus = ref<AsyncDataRequestStatus>()

  const sendMessage = async (message: string) => {

    messages.value.push({
      role: 'user',
      content: message
    })

    const stream = await fetch('api/create/message',
      {
        method: 'post',
        body: JSON.stringify({
          message,
          threadId: threadId.value
        }),
      },
    )

    resolveStream({
      stream: stream.body,
      onChunk: (data) => {
        answer.value.content += data;
      },
      onReady: () => {
        messages.value.push({ ...answer.value });
        answer.value.content = ''
      },
    })

  }

  return { sendMessage, answer, requestStatus, messages }
}

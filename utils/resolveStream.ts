import type { StreamData } from '~/types/types'

type ResolveSteamProps = {
  onChunk: (data: StreamData) => void
  onReady: () => void
  onStart?: () => void
  stream: ReadableStream | null
}

export default async ({
  onChunk,
  onReady,
  onStart,
  stream,
}: ResolveSteamProps) => {
  if (!stream) return

  const reader = stream.pipeThrough(new TextDecoderStream()).getReader()

  let onStartCalled = false

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const stream = await reader.read()
    if (stream.done) break

    const chunks = stream.value

    if (!onStartCalled && onStart) {
      onStart()
      onStartCalled = true
    }

    for (const chunk of chunks.split('\n')) {
      try {
        if (chunk) onChunk(JSON.parse(chunk))
      }
      catch (e) {
        console.error(`Error parsing chunk: ${chunk} with error: ${e}`)
      }
    }
  }

  onReady()
}

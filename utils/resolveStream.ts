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

  let buffer = ''

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const stream = await reader.read()
    if (stream.done) break

    // Buffer the stream
    buffer += stream.value
    const chunks = buffer.split('\n')
    buffer = ''

    if (!onStartCalled && onStart) {
      onStart()
      onStartCalled = true
    }

    for (const chunk of chunks) {
      try {
        if (chunk) {
          onChunk(JSON.parse(chunk))
        }
      }
      catch {
        // If the chunk is not a valid JSON, it's probably a partial message. Keep it in the buffer.
        buffer = chunk
      }
    }
  }

  onReady()
}

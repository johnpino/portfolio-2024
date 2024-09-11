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

    if (!onStartCalled && onStart) {
      onStart()
      onStartCalled = true
    }

    console.log('buffer', buffer)

    for (const chunk of chunks) {
      console.log('chunk', chunk)
      console.log('-----------------')
      try {
        if (chunk) {
          onChunk(JSON.parse(chunk))
          buffer = ''
        }
      }
      catch (e) {
        buffer = chunk
        console.log(`Failed to parse chunk: ${chunk}. Error: ${e}`)
      }
    }
  }

  onReady()
}

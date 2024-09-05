export default async ({
  onChunk,
  onReady,
  onStart,
  stream,
}: {
  onChunk: (data: string) => void
  onReady: () => void
  onStart: () => void
  stream: ReadableStream | null
}) => {
  if (!stream) return

  const reader = stream.pipeThrough(new TextDecoderStream()).getReader()

  let onStartCalled = false

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const stream = await reader.read()
    if (stream.done) break

    const chunk = stream.value

    if (!onStartCalled) {
      onStart()
      onStartCalled = true
    }

    onChunk(chunk)
  }

  onReady()
}

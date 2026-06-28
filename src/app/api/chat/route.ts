import { streamChat } from '@/lib/llm'
import { Stage, Brain } from '@/lib/types'

export async function POST(req: Request) {
  try {
    const { stage, voiceId, brain } = (await req.json()) as {
      stage: Stage
      voiceId: string
      brain?: Brain
    }

    // For built-in brain, use server env variable
    if (!brain || brain.type === 'builtin') {
      const apiKey = process.env.DEEPSEEK_API_KEY
      if (!apiKey) {
        return new Response(
          JSON.stringify({ error: 'DEEPSEEK_API_KEY 未配置，请在 .env.local 中设置' }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        )
      }
      const stream = await streamChat(stage, voiceId, apiKey, brain)
      return sendStream(stream)
    }

    // Custom brain — use the user-provided config
    if (!brain.apiKey) {
      return new Response(
        JSON.stringify({ error: '自定义大脑未配置 API Key' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }
    const stream = await streamChat(stage, voiceId, brain.apiKey, brain)
    return sendStream(stream)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

async function sendStream(stream: ReadableStream<Uint8Array>): Promise<Response> {
  const reader = stream.getReader()
  const decoder = new TextDecoder()
  const encoder = new TextEncoder()

  const transformStream = new TransformStream({
    async start(controller) {
      let buffer = ''
      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            const trimmed = line.trim()
            if (!trimmed || trimmed === 'data: [DONE]') continue
            if (!trimmed.startsWith('data: ')) continue

            try {
              const json = JSON.parse(trimmed.slice(6))
              const content = json.choices?.[0]?.delta?.content || ''
              if (content) {
                controller.enqueue(encoder.encode(content))
              }
            } catch {
              // skip malformed JSON lines
            }
          }
        }
        // Process remaining buffer
        if (buffer.trim().startsWith('data: ')) {
          try {
            const json = JSON.parse(buffer.trim().slice(6))
            const content = json.choices?.[0]?.delta?.content || ''
            if (content) {
              controller.enqueue(encoder.encode(content))
            }
          } catch {
            // skip
          }
        }
      } finally {
        reader.releaseLock()
      }
    },
  })

  return new Response(transformStream.readable, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
    },
  })
}

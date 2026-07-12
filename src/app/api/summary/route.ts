import { summarizeChapter } from '@/lib/llm'
import { Stage, Brain } from '@/lib/types'

export async function POST(req: Request) {
  try {
    const { stage, brain } = (await req.json()) as {
      stage: Stage
      brain?: Brain
    }

    // Use built-in brain's API key
    if (!brain || brain.type === 'builtin') {
      const apiKey = process.env.DEEPSEEK_API_KEY
      if (!apiKey) {
        return new Response(
          JSON.stringify({ error: 'DEEPSEEK_API_KEY 未配置' }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        )
      }
      const summary = await summarizeChapter(stage, apiKey, brain)
      return new Response(JSON.stringify(summary), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Custom brain
    if (!brain.apiKey) {
      return new Response(
        JSON.stringify({ error: '自定义大脑未配置 API Key' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }
    const summary = await summarizeChapter(stage, brain.apiKey, brain)
    return new Response(JSON.stringify(summary), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

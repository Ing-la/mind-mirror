import { Brain } from '@/lib/types'

export async function POST(req: Request) {
  try {
    const { brain } = (await req.json()) as { brain?: Brain }

    let apiKey: string
    let endpoint: string
    let model: string

    if (!brain || brain.type === 'builtin') {
      apiKey = process.env.DEEPSEEK_API_KEY || ''
      endpoint = 'https://api.deepseek.com/chat/completions'
      model = 'deepseek-chat'
    } else {
      apiKey = brain.apiKey || ''
      endpoint = brain.endpoint || 'https://api.deepseek.com/chat/completions'
      model = brain.model || 'deepseek-chat'
    }

    if (!apiKey) {
      return Response.json(
        { ok: false, error: 'API Key 未配置' },
        { status: 400 }
      )
    }

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: '你好，请只回复一个字：好' }],
        stream: false,
        max_tokens: 10,
      }),
      signal: controller.signal,
    })

    clearTimeout(timeout)

    if (!res.ok) {
      const text = await res.text().catch(() => 'Unknown error')
      return Response.json({ ok: false, error: `HTTP ${res.status}: ${text.slice(0, 200)}` })
    }

    const json = await res.json()
    const content = json.choices?.[0]?.message?.content || ''

    return Response.json({ ok: true, reply: content.trim() })
  } catch (err) {
    const msg = err instanceof Error ? err.message : '连接超时或网络错误'
    return Response.json({ ok: false, error: msg })
  }
}

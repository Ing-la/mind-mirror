import { Stage, Voice, Brain } from './types'

const DEEPSEEK_API = 'https://api.deepseek.com/chat/completions'

function buildSystemPrompt(voice: Voice, stage: Stage): string {
  const stance = stage.stances?.[voice.id]
  const stanceBlock = stance
    ? `\n## 你在这个问题上的立场\n${stance}\n`
    : ''

  return `你是一个叫「${voice.name}」的虚拟角色，代表用户内心的一种声音。

## 你的性格设定
${voice.soul}${stanceBlock}
## 当前背景
${stage.background || '（没有额外背景信息）'}

## 对话规则
- 你用中文说话，语气自然，像一个真实的人在和朋友讨论问题。
- 每条发言不要太长，2-5句话即可，像日常对话一样自然。
- 你要基于自己的性格和立场来回应对方的观点，可以同意、反驳、补充或提出新角度。
- 不要刻意总结或结束对话，自然地表达你的想法。
- 不要出现"作为一个人工智能"之类的表述，你就是这个角色本身。
- 保持对话的真实感和对抗感，不要刻意迎合对方。`
}

function buildMessages(
  voice: Voice,
  stage: Stage
): { role: 'system' | 'user' | 'assistant'; content: string }[] {
  const msgs: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
    { role: 'system', content: buildSystemPrompt(voice, stage) },
  ]

  for (const m of stage.messages) {
    if (m.role === 'user') {
      msgs.push({ role: 'user', content: `（用户插话）${m.content}` })
    } else if (m.role === 'assistant' && m.voiceId) {
      const speaker = stage.voices.find((v) => v.id === m.voiceId)
      msgs.push({
        role: 'assistant',
        content: `${speaker ? speaker.name : '某人'}：${m.content}`,
      })
    }
  }

  return msgs
}

export async function streamChat(
  stage: Stage,
  voiceId: string,
  apiKey: string,
  brain?: Brain,
  abortSignal?: AbortSignal
): Promise<ReadableStream<Uint8Array>> {
  const voice = stage.voices.find((v) => v.id === voiceId)
  if (!voice) throw new Error(`Voice ${voiceId} not found`)

  const messages = buildMessages(voice, stage)

  // Use custom brain endpoint/model if provided, otherwise use defaults
  const endpoint = brain?.endpoint || DEEPSEEK_API
  const model = brain?.model || 'deepseek-chat'
  const key = brain?.apiKey || apiKey

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model,
      messages,
      stream: true,
      temperature: 0.8,
      max_tokens: 512,
    }),
    signal: abortSignal,
  })

  if (!res.ok) {
    const err = await res.text().catch(() => 'Unknown error')
    throw new Error(`LLM API error (${res.status}): ${err}`)
  }

  return res.body!
}

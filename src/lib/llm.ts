import { Stage, Voice, Brain, ChapterSummary } from './types'

const DEEPSEEK_API = 'https://api.deepseek.com/chat/completions'

export function buildSystemPrompt(voice: Voice, stage: Stage, userMessage?: string): string {
  let prompt = `你是一个叫「${voice.name}」的虚拟角色，代表用户内心的一种声音。

## 你的性格设定
${voice.soul}

## 当前话题背景
${stage.background || '（没有额外背景信息）'}

## 用户的介入
${userMessage ? `用户说：${userMessage}` : '对话尚未有用户介入。'}

## 对话规则
- 你用中文说话，语气自然，像一个真实的人在和朋友讨论问题。
- 每条发言 2-5 句话即可，像日常对话一样自然。
- 你要基于自己的性格和立场，全力回应对方、反驳对方、试图说服对方和用户。
- 如果对方说得有道理，承认它。这才是内心对话的真实感。
- 不要在已经充分讨论的观点上反复重复，尝试挖掘新的角度。
- 发言时自然地回应对方上一轮的核心论点。
- 不要刻意总结或结束对话，自然地表达你的想法。
- 不要出现"作为一个人工智能"之类的表述，你就是这个角色本身。`

  return prompt
}

function buildMessages(
  voice: Voice,
  stage: Stage,
  userMessage?: string
): { role: 'system' | 'user' | 'assistant'; name?: string; content: string }[] {
  const msgs: { role: 'system' | 'user' | 'assistant'; name?: string; content: string }[] = []

  // 1. 角色设定（含用户介入段）
  msgs.push({ role: 'system', content: buildSystemPrompt(voice, stage, userMessage) })

  // 2. 章节摘要（第 2 章起注入）
  if (stage.chapter >= 2 && stage.chapterSummaries.length > 0) {
    for (const cs of stage.chapterSummaries) {
      const posText = Object.entries(cs.positions)
        .map(([name, pts]) => `${name}：${pts.join('、')}`)
        .join('\n')
      msgs.push({
        role: 'system',
        content: `【第 ${cs.chapter} 章摘要】\n${cs.summary}\n\n双方观点：\n${posText}`,
      })
    }
  }

  // 3. 对话历史
  // 第 1 章（无章节摘要）：保留全部消息
  // 第 2 章起（有章节摘要）：只保留最近 1 幕（6 条）用于连贯性，其余被章节摘要替代
  const msgsToInclude = stage.chapterSummaries.length > 0
    ? stage.messages.slice(-6)
    : stage.messages

  for (const m of msgsToInclude) {
    if (m.role === 'user') {
      msgs.push({ role: 'user', content: `（用户插话）${m.content}` })
    } else if (m.role === 'assistant' && m.voiceId) {
      const speaker = stage.voices.find((v) => v.id === m.voiceId)
      msgs.push({
        role: 'assistant',
        name: speaker?.name || '某人',
        content: m.content,
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

  // 检查上一轮是否有用户发言
  const lastUserMsg = [...stage.messages].reverse().find((m) => m.role === 'user')
  const messages = buildMessages(voice, stage, lastUserMsg?.content)

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

/**
 * 章节总结 API 调用（无流式，低 temperature，输出 JSON）
 */
export async function summarizeChapter(
  stage: Stage,
  apiKey: string,
  brain?: Brain
): Promise<ChapterSummary> {
  const chapter = stage.chapter

  // 取本章的 24 条消息
  const chapterMessages = stage.messages.slice(-24)

  const dialogText = chapterMessages
    .map((m) => {
      if (m.role === 'user') return `（用户）${m.content}`
      const speaker = stage.voices.find((v) => v.id === m.voiceId)
      return `${speaker?.name || '某人'}说：${m.content}`
    })
    .join('\n\n')

  const prompt = `请总结以下两位角色在本章节对话中的核心观点和整章进程。

${dialogText}

以 JSON 格式输出，不要包含其他内容：
{
  "chapterSummary": "一段连贯的文字总结，概括整章 4 幕的核心发展...",
  "positions": {
    "${stage.voices[0]?.name || '角色A'}": ["观点1", "观点2", "..."],
    "${stage.voices[1]?.name || '角色B'}": ["观点1", "观点2", "..."]
  }
}`

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
      messages: [{ role: 'user', content: prompt }],
      stream: false,
      temperature: 0.3,
      max_tokens: 1024,
    }),
  })

  if (!res.ok) {
    const err = await res.text().catch(() => 'Unknown error')
    throw new Error(`Summary API error (${res.status}): ${err}`)
  }

  const data = await res.json()
  const content = data.choices?.[0]?.message?.content || ''
  
  // 提取 JSON（处理模型可能输出 markdown 包裹的情况）
  const jsonMatch = content.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('Failed to parse chapter summary JSON')

  const parsed = JSON.parse(jsonMatch[0])
  return {
    chapter,
    summary: parsed.chapterSummary || '',
    positions: parsed.positions || {},
  }
}

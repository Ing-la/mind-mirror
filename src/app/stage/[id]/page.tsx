'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { getStage, saveStage, getBrain } from '@/lib/store'
import { Stage, Message, AvatarColor } from '@/lib/types'
import Avatar from '@/components/Avatar'

// 调试用：在客户端重建发送给 API 的完整 prompt
function buildDebugPrompt(voice: { id: string; name: string; soul: string }, stage: Stage): string {
  const stance = stage.stances?.[voice.id]
  const stanceBlock = stance ? `\n## 你在这个问题上的立场\n${stance}\n` : ''

  const system = `你是一个叫「${voice.name}」的虚拟角色，代表用户内心的一种声音。

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

  const lines: string[] = []
  lines.push('━━━ SYSTEM ━━━━━━━━━━━━━━━━━━━━━━━━━')
  lines.push(system)

  for (const m of stage.messages) {
    if (m.role === 'user') {
      lines.push('')
      lines.push('━━━ USER ━━━━━━━━━━━━━━━━━━━━━━━━━━')
      lines.push(`（用户插话）${m.content}`)
    } else if (m.role === 'assistant' && m.voiceId) {
      const speaker = stage.voices.find((v) => v.id === m.voiceId)
      const role = m.voiceId === voice.id ? 'ASSISTANT' : 'USER（对方发言）'
      lines.push('')
      lines.push(`━━━ ${role} ━━━━━━━━━━━━━━━━━━`)
      lines.push(`${speaker?.name || '某人'}说：${m.content}`)
    }
  }

  return lines.join('\n')
}

function buildSummary(stage: Stage): string[] {
  const points: string[] = []
  for (const v of stage.voices) {
    const msgs = stage.messages.filter((m) => m.voiceId === v.id && m.role === 'assistant')
    if (msgs.length > 0) {
      const excerpts = msgs.map((m) =>
        m.content.slice(0, 120).replace(/\n/g, ' ') + (m.content.length > 120 ? '...' : '')
      )
      points.push(`${v.name}的观点：`)
      excerpts.slice(0, 3).forEach((e) => points.push(`  · ${e}`))
      points.push('')
    }
  }
  return points
}

export default function StagePage() {
  const router = useRouter()
  const params = useParams()
  const [stage, setStage] = useState<Stage | null>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const [showBackground, setShowBackground] = useState(false)
  const [showInput, setShowInput] = useState(false)
  const [interjection, setInterjection] = useState('')
  const [summary, setSummary] = useState<string[] | null>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)
  const lastPrompts = useRef<Record<string, string>>({})

  useEffect(() => {
    const id = params.id as string
    const s = getStage(id)
    if (s) {
      // 兼容旧数据：确保新字段存在
      if (s.act === undefined) s.act = 1
      if (s.actMsgCount === undefined) s.actMsgCount = 0
      setStage(s)
      if (s.status === 'ended' && s.messages.length > 0) {
        setSummary(buildSummary(s))
      }
    } else {
      router.push('/')
    }
  }, [params.id, router])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [stage?.messages.length, streamingText])

  // 流式输出单条消息
  const streamTurn = useCallback(async (voiceId: string, currentStage: Stage): Promise<string | null> => {
    setIsStreaming(true)
    setStreamingText('')
    const ctrl = new AbortController()
    abortRef.current = ctrl

    const voice = currentStage.voices.find((v) => v.id === voiceId)
    const brain = voice?.brainId ? getBrain(voice.brainId) : undefined

    if (voice) {
      lastPrompts.current[voiceId] = buildDebugPrompt(voice, currentStage)
    }

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: currentStage, voiceId, brain }),
        signal: ctrl.signal,
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: '请求失败' }))
        alert(err.error || '请求失败')
        setIsStreaming(false)
        return null
      }

      const reader = res.body?.getReader()
      if (!reader) {
        setIsStreaming(false)
        return null
      }

      const decoder = new TextDecoder()
      let fullContent = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        if (value) {
          const chunk = decoder.decode(value, { stream: true })
          fullContent += chunk
          setStreamingText(fullContent)
        }
      }

      abortRef.current = null
      return fullContent
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        return null
      }
      console.error('streamTurn error:', err)
      alert(`请求失败：${(err as Error).message || '网络错误，请检查 API Key 是否配置正确'}`)
      return null
    } finally {
      setIsStreaming(false)
    }
  }, [])

  // 自动完成一整幕（6 条消息轮流）
  const chainAct = useCallback(async (currentStage: Stage) => {
    let localStage = { ...currentStage }

    for (let count = 0; count < 6; count++) {
      const voiceId = localStage.voices[count % 2].id
      const content = await streamTurn(voiceId, localStage)
      if (content === null) return // 出错或中止

      const newMsg: Message = {
        role: 'assistant',
        voiceId,
        content,
        turn: localStage.messages.length,
        timestamp: Date.now(),
      }

      localStage = {
        ...localStage,
        messages: [...localStage.messages, newMsg],
        actMsgCount: count + 1,
      }

      setStage(localStage)
      saveStage(localStage)
      setStreamingText('')
    }
  }, [streamTurn])

  // 第 1 幕
  const handleStart = () => {
    if (!stage) return
    const updated: Stage = {
      ...stage,
      status: 'ongoing',
      act: 1,
      actMsgCount: 0,
    }
    setStage(updated)
    saveStage(updated)
    chainAct(updated)
  }

  // 下一幕
  const handleNextAct = () => {
    if (!stage) return
    setShowInput(false)
    const updated: Stage = {
      ...stage,
      act: (stage.act || 1) + 1,
      actMsgCount: 0,
    }
    setStage(updated)
    saveStage(updated)
    chainAct(updated)
  }

  // 我要发言
  const handleInterject = async () => {
    if (!stage || !interjection.trim() || isStreaming) return

    setShowInput(false)

    const userMsg: Message = {
      role: 'user',
      content: interjection.trim(),
      turn: stage.messages.length,
      timestamp: Date.now(),
    }

    const withUserMsg: Stage = {
      ...stage,
      messages: [...stage.messages, userMsg],
      act: (stage.act || 1) + 1,
      actMsgCount: 0,
    }

    setStage(withUserMsg)
    saveStage(withUserMsg)
    setInterjection('')
    chainAct(withUserMsg)
  }

  // 落幕
  const handleEnd = () => {
    if (!stage) return
    if (isStreaming) {
      abortRef.current?.abort()
    }
    const updated: Stage = {
      ...stage,
      status: 'ended',
    }
    setStage(updated)
    saveStage(updated)
    setSummary(buildSummary(updated))
  }

  // 返场
  const handleEncore = () => {
    if (!stage) return
    const updated: Stage = {
      ...stage,
      status: 'ongoing',
    }
    setStage(updated)
    saveStage(updated)
    setSummary(null)
  }

  if (!stage) {
    return (
      <div className="redesign-root h-dvh flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <p className="text-[rgba(230,223,211,0.35)]">加载中...</p>
        </div>
      </div>
    )
  }

  const isIdle = stage.messages.length === 0 && stage.status === 'ongoing' && !isStreaming
  const isActEnd = stage.messages.length > 0 && !isStreaming && stage.status === 'ongoing'
  const isEnded = stage.status === 'ended'
  const actNum = stage.act || 1

  const textColorMap: Record<string, string> = {
    cool: 'text-[#5a7a8a]',
    warm: 'text-[#b07070]',
    green: 'text-[#6a8a5a]',
    yellow: 'text-[#8a7a40]',
  }

  const s = stage!

  function VoiceSideCard({ voice, side }: { voice: { id: string; name: string; soul: string; color: AvatarColor; brainId?: string }; side: 'left' | 'right' }) {
    const stance = s.stances?.[voice.id]
    const [showStance, setShowStance] = useState(false)
    const [showPrompt, setShowPrompt] = useState(false)
    const promptText = lastPrompts.current[voice.id]
    return (
      <div className={`hidden sm:flex flex-col items-center text-center w-28 shrink-0 self-start sticky top-6 ${side === 'left' ? '-mr-1' : '-ml-1'}`}>
        <button
          onClick={() => stance && setShowStance(true)}
          className={`w-16 h-16 rounded-full overflow-hidden transition-opacity ${stance ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}
        >
          <Avatar color={voice.color} size={64} name={voice.name} />
        </button>
        <div className="mt-1.5 font-semibold text-sm text-[#e6dfd3] leading-tight">{voice.name}</div>

        {promptText && (
          <button
            onClick={() => setShowPrompt(true)}
            className="mt-1 text-[10px] text-[rgba(230,223,211,0.35)] hover:text-[#e6dfd3] transition-colors opacity-40 hover:opacity-100"
            title="查看实际发送给 AI 的完整 Prompt"
          >
            <svg className="w-3.5 h-3.5 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
        )}

        {showStance && stance && (
          <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setShowStance(false)}>
            <div className="absolute inset-0 bg-black/20" />
            <div
              className="relative max-w-xs mx-4 bg-[rgba(30,36,33,0.95)] border border-[rgba(230,223,211,0.15)] rounded-2xl p-5 shadow-lg animate-fade-in"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-2 mb-3">
                <Avatar color={voice.color} size={24} name={voice.name} />
                <span className="font-semibold text-sm text-[#e6dfd3]">{voice.name} 的心声</span>
              </div>
              <p className="text-sm text-[rgba(230,223,211,0.6)] leading-relaxed whitespace-pre-wrap">{stance}</p>
              <button
                onClick={() => setShowStance(false)}
                className="mt-4 text-xs text-[rgba(230,223,211,0.35)] hover:text-[#e6dfd3] transition-colors"
              >
                关闭
              </button>
            </div>
          </div>
        )}

        {showPrompt && promptText && (
          <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setShowPrompt(false)}>
            <div className="absolute inset-0 bg-black/30" />
            <div
              className="relative w-[90vw] max-w-2xl max-h-[85vh] mx-4 bg-[rgba(30,36,33,0.95)] border border-[rgba(230,223,211,0.15)] rounded-2xl shadow-xl animate-fade-in flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-5 py-3 border-b border-[rgba(230,223,211,0.15)] shrink-0">
                <div className="flex items-center gap-2">
                  <Avatar color={voice.color} size={20} name={voice.name} />
                  <span className="font-semibold text-sm text-[#e6dfd3]">{voice.name} · 实际发送的 Prompt</span>
                </div>
                <button
                  onClick={() => setShowPrompt(false)}
                  className="p-1 rounded-full text-[rgba(230,223,211,0.35)] hover:text-[#e6dfd3] hover:bg-[rgba(230,223,211,0.08)] transition-colors"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="overflow-y-auto p-5">
                <pre className="text-[11px] text-[rgba(230,223,211,0.6)] leading-relaxed whitespace-pre-wrap font-mono">{promptText}</pre>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="redesign-root h-dvh flex flex-col">
      <div className="bg-title">MIND MIRROR</div>
      <div className="flex-1 flex flex-col min-h-0 max-w-4xl mx-auto w-full px-4 sm:px-6 pb-4">
        {/* 顶部栏 — sticky */}
        <div className="flex items-center justify-between mt-3 mb-3 shrink-0 sticky top-0 z-10">
          <button onClick={() => router.push('/')}
            className="torn-back-btn" title="返回" style={{ marginTop: 0 }}>
            ← 返回
          </button>

          <div className="flex items-center gap-2 min-w-0 mx-2">
            {!isIdle && (
              <span className="text-xs text-[rgba(230,223,211,0.35)] shrink-0">第 {actNum} 幕</span>
            )}
            <button
              onClick={() => setShowBackground(true)}
              className="px-2.5 py-1 rounded-full text-xs text-[rgba(230,223,211,0.35)] border border-[rgba(230,223,211,0.15)] hover:text-[#e6dfd3] hover:border-[rgba(230,223,211,0.6)] transition-colors"
            >
              心镜
            </button>
          </div>

          {isEnded ? (
            <button
              onClick={handleEncore}
              className="text-xs px-3 py-1.5 rounded-full border border-[#cc665c] text-[#e6dfd3] hover:bg-[rgba(204,102,92,0.15)] transition-colors shrink-0"
            >
              返场
            </button>
          ) : !isIdle ? (
            <button
              onClick={handleEnd}
              disabled={isStreaming}
              className="text-xs px-3 py-1.5 rounded-full border border-[rgba(230,223,211,0.15)] text-[rgba(230,223,211,0.35)] hover:text-[#cc665c] hover:border-[rgba(204,102,92,0.15)] disabled:opacity-30 transition-colors shrink-0"
            >
              落幕
            </button>
          ) : (
            <div className="w-16 shrink-0" />
          )}
        </div>

        {/* 背景弹窗 */}
        {showBackground && (
          <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setShowBackground(false)}>
            <div className="absolute inset-0 bg-black/20" />
            <div
              className="relative max-w-lg mx-4 bg-[rgba(30,36,33,0.95)] border border-[rgba(230,223,211,0.15)] rounded-2xl p-5 shadow-lg animate-fade-in"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-5 h-5 text-[rgba(230,223,211,0.35)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
                  <path d="M12 16v-4" />
                  <path d="M12 8h.01" />
                </svg>
                <span className="font-semibold text-sm text-[#e6dfd3]">内心处境</span>
              </div>
              <p className="text-sm text-[rgba(230,223,211,0.6)] leading-relaxed whitespace-pre-wrap">{stage.background}</p>
              <button
                onClick={() => setShowBackground(false)}
                className="mt-4 text-xs text-[rgba(230,223,211,0.35)] hover:text-[#e6dfd3] transition-colors"
              >
                关闭
              </button>
            </div>
          </div>
        )}

        {/* 三栏布局 */}
        <div className="flex-1 flex gap-1 min-h-0 overflow-y-auto">
          <VoiceSideCard voice={stage.voices[0]} side="left" />

          <div className="flex-1 flex flex-col bg-[rgba(230,223,211,0.08)] border border-[rgba(230,223,211,0.15)] rounded-2xl min-h-0">
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {isIdle && (
                <p className="text-center text-sm text-[rgba(230,223,211,0.35)] py-8">
                  点击下方按钮，让它们开始对话
                </p>
              )}

              {stage.messages.map((msg, i) => {
                if (msg.role === 'user') {
                  return (
                    <div key={i} className="flex justify-end animate-chat-in">
                      <div className="max-w-[80%] bg-[rgba(204,102,92,0.15)] border border-[#cc665c] rounded-2xl rounded-br-sm px-4 py-2.5">
                        <p className="text-xs text-[rgba(230,223,211,0.35)] mb-1">我</p>
                        <p className="text-sm text-[#e6dfd3]">{msg.content}</p>
                      </div>
                    </div>
                  )
                }

                const voice = stage.voices.find((v) => v.id === msg.voiceId)
                const isLeft = msg.voiceId === stage.voices[0]?.id
                return (
                  <div key={i} className={`flex ${isLeft ? 'justify-start' : 'justify-end'} animate-chat-in`}>
                    <div
                      className={`max-w-[80%] border rounded-2xl px-4 py-3 ${
                        isLeft
                          ? `bg-[rgba(141,164,153,0.15)] border-l-[#8da499] rounded-bl-sm`
                          : `bg-[rgba(204,102,92,0.15)] border-r-[#cc665c] rounded-br-sm`
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        {voice && <Avatar color={voice.color} size={18} name={voice.name} />}
                        <p className={`text-xs font-semibold ${textColorMap[voice?.color || ''] || 'text-[rgba(230,223,211,0.35)]'}`}>
                          {voice?.name}
                        </p>
                      </div>
                      <p className="text-sm text-[#e6dfd3] whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                )
              })}

              {/* 流式输出 */}
              {isStreaming && streamingText && (
                <div className={`flex ${stage.messages.length % 2 === 0 ? 'justify-start' : 'justify-end'} animate-chat-in`}>
                  <div
                    className={`max-w-[80%] border rounded-2xl px-4 py-3 ${
                      stage.messages.length % 2 === 0
                        ? 'bg-[rgba(141,164,153,0.15)] border-l-[#8da499] rounded-bl-sm'
                        : 'bg-[rgba(204,102,92,0.15)] border-r-[#cc665c] rounded-br-sm'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      {stage.voices[stage.messages.length % 2] && (
                        <Avatar
                          color={stage.voices[stage.messages.length % 2].color}
                          size={18}
                          name={stage.voices[stage.messages.length % 2].name}
                        />
                      )}
                      <p className={`text-xs font-semibold ${textColorMap[stage.voices[stage.messages.length % 2]?.color || ''] || 'text-[rgba(230,223,211,0.35)]'}`}>
                        {stage.voices[stage.messages.length % 2]?.name}
                      </p>
                    </div>
                    <p className="text-sm text-[#e6dfd3] whitespace-pre-wrap">
                      {streamingText}
                      <span className="inline-block w-1.5 h-4 bg-[rgba(230,223,211,0.35)] ml-0.5 animate-pulse" />
                    </p>
                  </div>
                </div>
              )}

              {/* 观点摘要 */}
              {summary && (
                <div className="animate-fade-in bg-[rgba(204,102,92,0.15)] border border-[#cc665c] rounded-2xl p-5 mt-4">
                  <p className="text-xs tracking-[0.3em] text-[rgba(230,223,211,0.35)] text-center mb-4 font-light">— 观点摘要 —</p>
                  {summary.map((line, i) => (
                    <p key={i} className={`text-sm ${line.endsWith('：') ? 'font-semibold text-[#e6dfd3] mt-2' : 'text-[rgba(230,223,211,0.6)] ml-2'} ${line === '' ? 'h-2' : ''}`}>
                      {line}
                    </p>
                  ))}
                </div>
              )}

              <div ref={chatEndRef} />
            </div>
          </div>

          <VoiceSideCard voice={stage.voices[1]} side="right" />
        </div>

        {/* 底部控制区 */}
        {isIdle && (
          <button
            onClick={handleStart}
            className="mt-4 w-full py-4 rounded-2xl bg-[#e6dfd3] text-[#354230] text-base font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            召唤 · 让他们聊聊
          </button>
        )}

        {isActEnd && !showInput && (
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => { setShowInput(true); setInterjection('') }}
              className="flex-1 py-3.5 rounded-2xl bg-[rgba(230,223,211,0.08)] border border-[rgba(230,223,211,0.15)] text-sm font-medium text-[#e6dfd3] hover:shadow-md transition-all"
            >
              我要发言
            </button>
            <button
              onClick={handleNextAct}
              className="flex-1 py-3.5 rounded-2xl bg-[#e6dfd3] text-[#354230] text-sm font-medium hover:opacity-90 transition-opacity"
            >
              下一幕
            </button>
          </div>
        )}

        {isActEnd && showInput && (
          <div className="mt-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={interjection}
                onChange={(e) => setInterjection(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleInterject()
                  }
                }}
                placeholder="写下你的心声..."
                className="flex-1 px-4 py-3 rounded-xl bg-[rgba(230,223,211,0.08)] border border-[rgba(230,223,211,0.15)] text-sm text-[#e6dfd3] placeholder:text-[rgba(230,223,211,0.35)] focus:outline-none focus:border-[#cc665c] transition-colors"
                autoFocus
              />
              <button
                onClick={handleInterject}
                disabled={!interjection.trim()}
                className="px-5 py-3 rounded-xl bg-[#cc665c] text-white text-sm font-medium disabled:opacity-40 hover:opacity-90 transition-opacity"
              >
                发送
              </button>
            </div>
            <button
              onClick={() => setShowInput(false)}
              className="mt-2 text-xs text-[rgba(230,223,211,0.35)] hover:text-[#e6dfd3] transition-colors"
            >
              取消
            </button>
          </div>
        )}

        {isStreaming && (
          <div className="mt-4 w-full py-3 rounded-2xl bg-[rgba(230,223,211,0.08)] border border-[rgba(230,223,211,0.15)] text-sm text-[rgba(230,223,211,0.35)] text-center flex items-center justify-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-[#cc665c] animate-pulse" />
            {streamingText ? '对话中...' : '思考中...'}
          </div>
        )}

        {isEnded && (
          <div className="mt-4 space-y-3">
            <button
              onClick={() => router.push('/stage/new')}
              className="w-full py-3.5 rounded-2xl bg-[rgba(230,223,211,0.08)] border border-[rgba(230,223,211,0.15)] text-sm font-medium text-[#e6dfd3] hover:shadow-md transition-shadow flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 8v8M8 12h8" />
              </svg>
              开始一段新对话
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

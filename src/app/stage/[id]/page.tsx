'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { getStage, saveStage, getBrain } from '@/lib/store'
import { Stage, Message } from '@/lib/types'
import Avatar from '@/components/Avatar'

const MAX_TURNS = 10

function getNextSpeaker(stage: Stage): string | null {
  if (stage.status !== 'ongoing') return null
  const turnCount = Math.floor(stage.messages.length / 2)
  if (turnCount >= MAX_TURNS) return null
  return stage.messages.length % 2 === 0 ? stage.voices[0].id : stage.voices[1].id
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
  const [streamingText, setStreamingText] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [interjection, setInterjection] = useState('')
  const [summary, setSummary] = useState<string[] | null>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    const id = params.id as string
    const s = getStage(id)
    if (s) {
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

  const streamTurn = useCallback(async (voiceId: string) => {
    if (!stage) return null
    setIsStreaming(true)
    setStreamingText('')
    const ctrl = new AbortController()
    abortRef.current = ctrl

    // Look up brain for this voice
    const voice = stage.voices.find((v) => v.id === voiceId)
    const brain = voice?.brainId ? getBrain(voice.brainId) : undefined

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage, voiceId, brain }),
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
      let done = false

      while (!done) {
        const { done: isDone, value } = await reader.read()
        done = isDone
        if (value) {
          const chunk = decoder.decode(value, { stream: !done })
          fullContent += chunk
          setStreamingText(fullContent)
        }
      }

      setIsStreaming(false)
      abortRef.current = null
      return fullContent
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        setIsStreaming(false)
        return null
      }
      alert('网络请求失败，请检查 API Key 是否配置正确')
      setIsStreaming(false)
      return null
    }
  }, [stage])

  const handleStartOrContinue = async () => {
    if (!stage) return
    const nextId = getNextSpeaker(stage)
    if (!nextId) return

    const content = await streamTurn(nextId)
    if (content === null) return

    const newMsg: Message = {
      role: 'assistant',
      voiceId: nextId,
      content,
      turn: Math.floor(stage.messages.length / 2),
      timestamp: Date.now(),
    }

    const updated: Stage = {
      ...stage,
      messages: [...stage.messages, newMsg],
    }

    setStage(updated)
    saveStage(updated)
    setStreamingText('')
  }

  const handleInterject = async () => {
    if (!stage || !interjection.trim() || isStreaming) return

    const userMsg: Message = {
      role: 'user',
      content: interjection.trim(),
      turn: Math.floor(stage.messages.length / 2),
      timestamp: Date.now(),
    }

    const withUserMsg: Stage = {
      ...stage,
      messages: [...stage.messages, userMsg],
    }

    setStage(withUserMsg)
    saveStage(withUserMsg)
    setInterjection('')

    const nextId = getNextSpeaker(withUserMsg)
    if (!nextId) {
      handleEnd()
      return
    }

    const content = await streamTurn(nextId)
    if (content === null) return

    const replyMsg: Message = {
      role: 'assistant',
      voiceId: nextId,
      content,
      turn: Math.floor(withUserMsg.messages.length / 2),
      timestamp: Date.now(),
    }

    const updated: Stage = {
      ...withUserMsg,
      messages: [...withUserMsg.messages, replyMsg],
    }

    setStage(updated)
    saveStage(updated)
    setStreamingText('')
  }

  const handleEnd = () => {
    if (!stage) return
    const updated: Stage = {
      ...stage,
      status: 'ended',
    }
    setStage(updated)
    saveStage(updated)
    setSummary(buildSummary(updated))
  }

  const handleNew = () => {
    router.push('/stage/new')
  }

  if (!stage) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-[var(--text-dim)]">加载中...</p>
      </div>
    )
  }

  const nextSpeaker = getNextSpeaker(stage)
  const canContinue = !isStreaming && nextSpeaker !== null && stage.status === 'ongoing'
  const isEnded = stage.status === 'ended'
  const speakerForNext = nextSpeaker ? stage.voices.find((v) => v.id === nextSpeaker) : null
  const currentTurn = Math.floor(stage.messages.length / 2)

  const textColorMap: Record<string, string> = {
    cool: 'text-[#5a7a8a]',
    warm: 'text-[#b07070]',
    green: 'text-[#6a8a5a]',
    yellow: 'text-[#8a7a40]',
  }

  const voiceCardBg: Record<string, string> = {
    cool: 'bg-gradient-to-br from-[#e8f0f5] to-[#d5e5f0]',
    warm: 'bg-gradient-to-br from-[#f5e8e8] to-[#edd5d5]',
    green: 'bg-gradient-to-br from-[#e8f0e0] to-[#d5e8d0]',
    yellow: 'bg-gradient-to-br from-[#f5f0d8] to-[#ede5c8]',
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="h-1 bg-gradient-to-r from-[var(--warm)] via-[var(--pink)] via-[var(--blue)] to-[var(--green)] opacity-60" />

      <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 pb-8">
        {/* Header */}
        <div className="flex items-center justify-between mt-4 mb-2">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-sm text-[var(--text-soft)] hover:text-[var(--text)] transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            返回
          </button>

          {stage.status === 'ongoing' && (
            <button
              onClick={handleEnd}
              disabled={isStreaming || stage.messages.length === 0}
              className="text-xs px-3 py-1.5 rounded-full border border-[var(--line)] text-[var(--text-dim)] hover:text-[var(--pink)] hover:border-[var(--pink-soft)] disabled:opacity-30 transition-colors"
            >
              结束对话
            </button>
          )}
        </div>

        {/* Topic */}
        <div className="text-center mb-6 mt-2">
          <h1 className="text-xl font-bold text-[var(--text)]">{stage.background}</h1>
          {stage.title && (
            <p className="text-sm text-[var(--text-soft)] mt-1">{stage.title}</p>
          )}
          {isEnded && (
            <span className="inline-block mt-2 text-xs px-3 py-0.5 rounded-full bg-[var(--line)] text-[var(--text-dim)]">
              对话已结束
            </span>
          )}
        </div>

        {/* Voice Cards */}
        <div className="flex gap-3 mb-6">
          {stage.voices.map((v) => {
            const stance = stage.stances?.[v.id]
            return (
              <div
                key={v.id}
                className={`flex-1 rounded-2xl p-4 text-center shadow-sm border border-[var(--line)] ${voiceCardBg[v.color] || 'bg-white'}`}
              >
                <div className="flex justify-center mb-2">
                  <Avatar color={v.color} size={56} name={v.name} />
                </div>
                <div className="font-semibold text-sm text-[var(--text)]">{v.name}</div>
                <div className="text-xs text-[var(--text-dim)] mt-0.5 line-clamp-1 min-h-[1em]">{v.soul.slice(0, 20)}</div>
                {stance && (
                  <div className="mt-2 text-xs text-[var(--text-soft)] bg-white/60 rounded-lg px-2 py-1.5 border border-[var(--line)]">
                    立场：{stance}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Chat Area */}
        <div className="bg-[var(--card)] border border-[var(--line)] rounded-2xl shadow-[var(--shadow)] overflow-hidden">
          <div className="px-5 py-3 border-b border-[var(--line)]">
            <p className="text-xs tracking-[0.3em] text-[var(--text-dim)] text-center font-light">
              {isEnded ? '— 对话记录 —' : `— 第 ${currentTurn + 1} / ${MAX_TURNS} 轮 —`}
            </p>
          </div>

          <div className="px-5 py-4 max-h-[60vh] overflow-y-auto space-y-3">
            {stage.messages.length === 0 && !isEnded && (
              <p className="text-center text-sm text-[var(--text-dim)] py-8">
                点击下方按钮，让两个小人开始对话
              </p>
            )}

            {stage.messages.map((msg, i) => {
              if (msg.role === 'user') {
                return (
                  <div key={i} className="flex justify-end animate-chat-in">
                    <div className="max-w-[80%] bg-[var(--warm-light)] border border-[var(--warm-soft)] rounded-2xl rounded-br-sm px-4 py-2.5">
                      <p className="text-xs text-[var(--text-dim)] mb-1">你的插话</p>
                      <p className="text-sm text-[var(--text)]">{msg.content}</p>
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
                        ? `bg-[var(--blue-soft)] border-l-[var(--blue)] rounded-bl-sm`
                        : `bg-[var(--pink-soft)] border-r-[var(--pink)] rounded-br-sm`
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      {voice && <Avatar color={voice.color} size={18} name={voice.name} />}
                      <p className={`text-xs font-semibold ${textColorMap[voice?.color || ''] || 'text-[var(--text-dim)]'}`}>
                        {voice?.name}
                      </p>
                    </div>
                    <p className="text-sm text-[var(--text)] whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              )
            })}

            {/* Streaming text */}
            {isStreaming && streamingText && (
              <div className={`flex ${stage.messages.length % 2 === 0 ? 'justify-start' : 'justify-end'} animate-chat-in`}>
                <div
                  className={`max-w-[80%] border rounded-2xl px-4 py-3 ${
                    stage.messages.length % 2 === 0
                      ? 'bg-[var(--blue-soft)] border-l-[var(--blue)] rounded-bl-sm'
                      : 'bg-[var(--pink-soft)] border-r-[var(--pink)] rounded-br-sm'
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
                    <p className={`text-xs font-semibold ${textColorMap[stage.voices[stage.messages.length % 2]?.color || ''] || 'text-[var(--text-dim)]'}`}>
                      {stage.voices[stage.messages.length % 2]?.name}
                    </p>
                  </div>
                  <p className="text-sm text-[var(--text)] whitespace-pre-wrap">
                    {streamingText}
                    <span className="inline-block w-1.5 h-4 bg-[var(--text-dim)] ml-0.5 animate-pulse" />
                  </p>
                </div>
              </div>
            )}

            {/* Summary */}
            {summary && (
              <div className="animate-fade-in bg-[var(--warm-light)] border border-[var(--warm-soft)] rounded-2xl p-5 mt-4">
                <p className="text-xs tracking-[0.3em] text-[var(--text-dim)] text-center mb-4 font-light">— 观点摘要 —</p>
                {summary.map((line, i) => (
                  <p key={i} className={`text-sm ${line.endsWith('：') ? 'font-semibold text-[var(--text)] mt-2' : 'text-[var(--text-soft)] ml-2'} ${line === '' ? 'h-2' : ''}`}>
                    {line}
                  </p>
                ))}
              </div>
            )}

            <div ref={chatEndRef} />
          </div>
        </div>

        {/* Controls */}
        {!isEnded && (
          <div className="mt-4 space-y-3">
            {canContinue && (
              <button
                onClick={handleStartOrContinue}
                className="w-full py-3.5 rounded-2xl bg-[var(--text)] text-white text-sm font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                让 {speakerForNext?.name} 发言
                <span className="text-xs opacity-60">(第{currentTurn + 1}轮)</span>
              </button>
            )}

            {stage.messages.length === 0 && !isStreaming && (
              <button
                onClick={handleStartOrContinue}
                className="w-full py-4 rounded-2xl bg-[var(--text)] text-white text-base font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                幕启 · 开始对话
              </button>
            )}

            {isStreaming && (
              <div className="w-full py-3 rounded-2xl bg-[var(--card)] border border-[var(--line)] text-sm text-[var(--text-dim)] text-center flex items-center justify-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-[var(--warm)] animate-pulse" />
                说话中...
              </div>
            )}

            {stage.messages.length > 0 && !isStreaming && (
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
                  placeholder="我也想说说..."
                  className="flex-1 px-4 py-3 rounded-xl bg-[var(--card)] border border-[var(--line)] text-sm text-[var(--text)] placeholder:text-[var(--text-dim)] focus:outline-none focus:border-[var(--warm)] transition-colors"
                />
                <button
                  onClick={handleInterject}
                  disabled={!interjection.trim()}
                  className="px-5 py-3 rounded-xl bg-[var(--warm)] text-white text-sm font-medium disabled:opacity-40 hover:opacity-90 transition-opacity"
                >
                  插话
                </button>
              </div>
            )}

            {!nextSpeaker && stage.messages.length > 0 && !isStreaming && (
              <button
                onClick={handleEnd}
                className="w-full py-3 rounded-2xl bg-[var(--warm-soft)] text-[var(--text-soft)] text-sm font-medium hover:bg-[var(--warm)] hover:text-white transition-all"
              >
                查看观点摘要
              </button>
            )}
          </div>
        )}

        {isEnded && (
          <div className="mt-4">
            <button
              onClick={handleNew}
              className="w-full py-3.5 rounded-2xl bg-[var(--card)] border border-[var(--line)] text-sm font-medium text-[var(--text)] hover:shadow-md transition-shadow flex items-center justify-center gap-2"
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

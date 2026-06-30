'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCustomVoices, deleteCustomVoice, getCustomBrains, deleteCustomBrain, getBrain } from '@/lib/store'
import { Voice, Brain, DEFAULT_BRAINS } from '@/lib/types'
import Avatar from '@/components/Avatar'
import TestDot from '@/components/TestDot'

export default function VoicesPage() {
  const router = useRouter()
  const [voices, setVoices] = useState<Voice[]>([])
  const [brains, setBrains] = useState<Brain[]>([])
  const [testDots, setTestDots] = useState<Record<string, 'ok' | 'fail' | null>>({})
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setVoices(getCustomVoices())
    setBrains(getCustomBrains())
    setLoaded(true)
  }, [])

  const handleDeleteVoice = (id: string) => {
    if (confirm('确定删除这个心声？')) {
      deleteCustomVoice(id)
      setVoices(getCustomVoices())
    }
  }

  const handleDeleteBrain = (id: string) => {
    if (confirm('确定删除这个引擎配置？')) {
      deleteCustomBrain(id)
      setBrains(getCustomBrains())
    }
  }

  const testEngine = async (brain: Brain) => {
    const id = brain.id
    setTestDots((s) => ({ ...s, [id]: null }))

    try {
      const res = await fetch('/api/engine/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brain: brain.type === 'builtin' ? undefined : brain }),
      })
      const data = await res.json()
      setTestDots((s) => ({ ...s, [id]: data.ok ? 'ok' : 'fail' }))
    } catch {
      setTestDots((s) => ({ ...s, [id]: 'fail' }))
    }

    setTimeout(() => setTestDots((s) => ({ ...s, [id]: null })), 3000)
  }

  const engineName = (brainId: string | undefined) => {
    if (!brainId) return '默认'
    const b = getBrain(brainId)
    return b ? b.name : '默认'
  }

  return (
    <div className="redesign-root h-dvh flex flex-col">
      <div className="bg-title">MIND MIRROR</div>
    <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
      <div className="max-w-xl mx-auto w-full px-6 pb-20">
        <button onClick={() => router.push('/')}
          className="torn-back-btn" title="返回">
          ← 返回
        </button>

        {/* ===== 心声管理 ===== */}
        <div className="flex items-center justify-between mt-8 mb-4">
          <h1 className="text-2xl font-bold text-[#e6dfd3]">心声管理</h1>
          <button onClick={() => router.push('/voices/new')}
            className="px-5 py-2 rounded-xl bg-[#e6dfd3] text-[#354230] text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            新建心声
          </button>
        </div>

        {!loaded ? (
          <p className="text-center text-[rgba(230,223,211,0.35)] py-8">加载中...</p>
        ) : voices.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-[rgba(230,223,211,0.15)] rounded-2xl">
            <svg className="w-10 h-10 mx-auto text-[rgba(230,223,211,0.35)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
              <circle cx="9" cy="7" r="4" />
            </svg>
            <p className="text-[rgba(230,223,211,0.35)] text-sm mt-3">还没有自定义心声</p>
            <p className="text-[rgba(230,223,211,0.35)] text-xs mt-1">创建一个属于你的内心小人</p>
          </div>
        ) : (
          <div className="space-y-3">
            {voices.map((v) => (
              <div key={v.id} className="bg-[rgba(230,223,211,0.08)] border border-[rgba(230,223,211,0.15)] rounded-2xl p-4 flex items-center gap-4">
                <Avatar color={v.color} size={48} name={v.name} />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-[#e6dfd3]">{v.name}</h3>
                  <p className="text-xs text-[rgba(230,223,211,0.6)] mt-0.5 line-clamp-1">{v.soul}</p>
                  <p className="text-xs text-[rgba(230,223,211,0.35)] mt-0.5">
                    引擎：{engineName(v.brainId)}
                  </p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => router.push(`/voices/${v.id}/edit`)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-[rgba(230,223,211,0.35)] hover:text-[#e6dfd3] hover:bg-[rgba(230,223,211,0.08)] transition-colors" title="编辑">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                  <button onClick={() => handleDeleteVoice(v.id)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-[rgba(230,223,211,0.35)] hover:text-[#cc665c] hover:bg-[rgba(204,102,92,0.15)] transition-colors" title="删除">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ===== 引擎配置 ===== */}
        <div className="flex items-center justify-between mt-12 mb-4">
          <h2 className="text-2xl font-bold text-[#e6dfd3]">引擎配置</h2>
          <button onClick={() => router.push('/voices/new?tab=engine')}
            className="px-5 py-2 rounded-xl border border-[rgba(230,223,211,0.15)] text-sm text-[#e6dfd3] font-medium hover:bg-[rgba(230,223,211,0.08)] transition-colors flex items-center gap-2">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            添加引擎
          </button>
        </div>

        <div className="space-y-2">
          {DEFAULT_BRAINS.map((b) => (
            <div key={b.id} className="bg-[rgba(230,223,211,0.08)] border border-[rgba(230,223,211,0.15)] rounded-xl p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[rgba(204,102,92,0.15)] flex items-center justify-center text-sm text-[#cc665c] font-bold shrink-0">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="16" />
                  <line x1="8" y1="12" x2="16" y2="12" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-[#e6dfd3]">{b.name}</p>
                  <span className="text-xs px-1.5 py-0.5 rounded-full bg-[rgba(141,164,153,0.15)] text-[#8da499]">内置</span>
                </div>
                <p className="text-xs text-[rgba(230,223,211,0.35)] mt-0.5">{b.model || 'deepseek-chat'}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <TestDot state={testDots[b.id] ?? null} />
                <button onClick={() => testEngine(b)}
                  className="px-3.5 py-1.5 rounded-lg border border-[rgba(230,223,211,0.15)] text-xs text-[rgba(230,223,211,0.6)] hover:bg-[rgba(204,102,92,0.15)] hover:border-[#cc665c] transition-colors">
                  测试
                </button>
              </div>
            </div>
          ))}

          {brains.map((b) => (
            <div key={b.id} className="bg-[rgba(230,223,211,0.08)] border border-[rgba(230,223,211,0.15)] rounded-xl p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[rgba(204,102,92,0.15)] flex items-center justify-center text-sm text-[#cc665c] font-bold shrink-0">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="16" />
                  <line x1="8" y1="12" x2="16" y2="12" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#e6dfd3]">{b.name}</p>
                <p className="text-xs text-[rgba(230,223,211,0.35)] mt-0.5">{b.model || 'deepseek-chat'}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <TestDot state={testDots[b.id] ?? null} />
                <button onClick={() => testEngine(b)}
                  className="px-3.5 py-1.5 rounded-lg border border-[rgba(230,223,211,0.15)] text-xs text-[rgba(230,223,211,0.6)] hover:bg-[rgba(204,102,92,0.15)] hover:border-[#cc665c] transition-colors">
                  测试
                </button>
                <button onClick={() => router.push(`/engine/${b.id}/edit`)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-[rgba(230,223,211,0.35)] hover:text-[#e6dfd3] hover:bg-[rgba(230,223,211,0.08)] transition-colors" title="编辑">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
                <button onClick={() => handleDeleteBrain(b.id)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-[rgba(230,223,211,0.35)] hover:text-[#cc665c] hover:bg-[rgba(204,102,92,0.15)] transition-colors" title="删除">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
    </div>
  )
}

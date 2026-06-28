'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getStages, deleteStage } from '@/lib/store'
import { Stage } from '@/lib/types'
import Avatar from '@/components/Avatar'

export default function HomePage() {
  const router = useRouter()
  const [stages, setStages] = useState<Stage[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setStages(getStages())
    setLoaded(true)

    const handle = () => {
      setStages(getStages())
    }
    window.addEventListener('storage', handle)
    return () => window.removeEventListener('storage', handle)
  }, [])

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm('确定删除这段对话？')) {
      deleteStage(id)
      setStages(getStages())
    }
  }

  const statusLabel = (s: Stage) => (s.status === 'ongoing' ? '进行中' : '已结束')
  const statusColor = (s: Stage) =>
    s.status === 'ongoing' ? 'bg-[var(--warm)] text-white' : 'bg-[var(--line)] text-[var(--text-dim)]'

  return (
    <div className="flex-1 flex flex-col">
      <div className="h-1 bg-gradient-to-r from-[var(--warm)] via-[var(--pink)] via-[var(--blue)] to-[var(--green)] opacity-60" />

      <div className="max-w-2xl mx-auto w-full px-6 pb-20">
        {/* ── Hero ── */}
        <section className="relative pt-12 pb-6 text-center overflow-hidden">
          {/* 背景柔光 */}
          <div
            className="absolute inset-0 -top-20 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse at 50% 30%, rgba(232,196,160,0.15) 0%, transparent 70%)',
            }}
          />

          {/* 小精灵们 */}
          <div className="relative flex items-end justify-center gap-5 sm:gap-7 mb-7">
            {/* 左侧精灵 — 粉色·梦幻 */}
            <div className="animate-float-1" style={{ animationDelay: '0s' }}>
              <div className="relative">
                <Avatar color="rose" size={44} name="温柔" className="drop-shadow-sm" />
                {/* 小装饰点 */}
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[var(--pink)] opacity-40" />
              </div>
            </div>

            {/* 中心精灵 — 暖色·开心 (略大) */}
            <div className="animate-float-2 -mb-1" style={{ animationDelay: '0.6s' }}>
              <div className="relative">
                <Avatar color="warm" size={56} name="暖心" className="drop-shadow-md" />
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[var(--warm)] opacity-50" />
              </div>
            </div>

            {/* 右侧精灵 — 蓝色·平静 */}
            <div className="animate-float-3" style={{ animationDelay: '1.2s' }}>
              <div className="relative">
                <Avatar color="cool" size={44} name="冷静" className="drop-shadow-sm" />
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[var(--blue)] opacity-40" />
              </div>
            </div>
          </div>

          {/* 品牌 */}
          <div className="animate-soft-rise" style={{ animationDelay: '0.2s' }}>
            <h1 className="text-[2.75rem] sm:text-6xl font-extrabold text-[var(--text)] tracking-tight leading-tight">
              心镜
            </h1>
            <p className="text-sm sm:text-base font-light text-[var(--text-dim)] tracking-[0.4em] mt-1">
              MindMirror
            </p>
          </div>

          {/* 标语 */}
          <p className="mt-5 text-base sm:text-lg text-[var(--text-soft)] leading-relaxed max-w-xs mx-auto animate-soft-rise" style={{ animationDelay: '0.4s' }}>
            把脑袋里的小人具像化
          </p>
          <p className="text-base sm:text-lg text-[var(--text-soft)] leading-relaxed animate-soft-rise" style={{ animationDelay: '0.5s' }}>
            不给你答案，陪你
            <span className="text-[var(--pink)] font-medium">听听内心的声音</span>
          </p>

          {/* ── 按钮 ── */}
          <div className="mt-10 flex flex-col items-center gap-4 animate-soft-rise" style={{ animationDelay: '0.6s' }}>
            <button
              onClick={() => router.push('/stage/new')}
              className="group relative w-full sm:w-auto px-10 py-4 rounded-full
                bg-gradient-to-b from-[var(--warm)] to-[#dbb090]
                text-white font-semibold text-base
                shadow-[0_4px_14px_rgba(232,196,160,0.3)]
                hover:shadow-[0_6px_20px_rgba(232,196,160,0.4)]
                hover:-translate-y-0.5
                transition-all duration-300"
            >
              {/* 纸感顶部高光线 */}
              <span className="absolute inset-x-6 top-0 h-px bg-white/25 rounded-full" />
              <span className="relative z-10 flex items-center justify-center gap-3">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-white/20 shrink-0">
                  <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                  </svg>
                </span>
                <span>召唤心声</span>
              </span>
            </button>

            <button
              onClick={() => router.push('/voices')}
              className="group relative w-full sm:w-auto px-10 py-4 rounded-full
                bg-[var(--warm-light)]
                border-2 border-dashed border-[var(--warm-soft)]
                text-[var(--text)] font-medium text-base
                hover:bg-white hover:shadow-[0_4px_12px_rgba(0,0,0,0.04)]
                hover:-translate-y-0.5
                transition-all duration-300"
            >
              <span className="relative z-10 flex items-center justify-center gap-3">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[var(--warm-soft)] shrink-0">
                  <svg className="w-3.5 h-3.5 text-[var(--pink)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
                  </svg>
                </span>
                <span>心声管理</span>
              </span>
            </button>
          </div>

          {/* 按钮下方的提示 */}
          <p className="mt-4 text-xs text-[var(--text-dim)] animate-soft-rise" style={{ animationDelay: '0.8s' }}>
            召唤你内心的小人，让它们为你聊聊心里话
          </p>
        </section>

        {/* ── 历史对话 ── */}
        <section className="mt-10">
          <h2 className="text-xs tracking-[0.25em] text-[var(--text-dim)] mb-4 flex items-center justify-center gap-2">
            <span className="w-6 h-px bg-[var(--line)]" />
            对话记录
            <span className="w-6 h-px bg-[var(--line)]" />
          </h2>

          {!loaded ? (
            <div className="text-center text-[var(--text-dim)] py-8 text-sm">加载中...</div>
          ) : stages.length === 0 ? (
            <div className="text-center py-10">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[var(--warm-light)] mb-4">
                <svg className="w-5 h-5 text-[var(--warm)] opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12c0 1.821.487 3.53 1.338 5L2.5 21.5l4.5-.838A9.955 9.955 0 0012 22z" />
                  <path d="M8 12h8" /><path d="M12 8v8" />
                </svg>
              </div>
              <p className="text-sm text-[var(--text-soft)]">还没有开始过对话呢</p>
              <p className="text-xs text-[var(--text-dim)] mt-1.5">点击上方「召唤心声」，让内心的小人聊聊你的心事</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stages.map((stage, i) => (
                <div
                  key={stage.id}
                  onClick={() => router.push(`/stage/${stage.id}`)}
                  className="bg-[var(--card)] border border-[var(--line)] rounded-2xl p-5 shadow-[var(--shadow)] cursor-pointer hover:shadow-lg hover:-translate-y-0.5 hover:border-[var(--warm-soft)] transition-all duration-200 animate-fade-in"
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-[var(--text)] truncate">{stage.title || stage.background.slice(0, 30) + (stage.background.length > 30 ? '...' : '')}</h3>
                      {stage.background && (
                        <p className="text-sm text-[var(--text-soft)] mt-1 line-clamp-1">{stage.background}</p>
                      )}
                      <div className="flex items-center gap-3 mt-3">
                        <span className={`text-xs px-2.5 py-0.5 rounded-full ${statusColor(stage)}`}>
                          {statusLabel(stage)}
                        </span>
                        <span className="text-xs text-[var(--text-dim)]">
                          {stage.messages.length} 条消息
                        </span>
                        <span className="text-xs text-[var(--text-dim)]">
                          {stage.voices.map((v) => v.name).join(' vs ')}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleDelete(stage.id, e)}
                      className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-[var(--text-dim)] hover:text-[var(--pink)] hover:bg-[var(--pink-soft)] transition-colors"
                      title="删除"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <footer className="mt-16 pt-6 border-t border-[var(--line)] text-center text-xs text-[var(--text-dim)]">
          心镜 MindMirror
        </footer>
      </div>
    </div>
  )
}

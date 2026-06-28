'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { PRESET_VOICES, DEFAULT_VOICES } from '@/lib/preset-voices'
import { saveStage, generateId, getCustomVoices } from '@/lib/store'
import { Voice, Stage } from '@/lib/types'
import Avatar from '@/components/Avatar'

export default function NewStagePage() {
  const router = useRouter()
  const [background, setBackground] = useState('')
  const [voices, setVoices] = useState<Voice[]>([...DEFAULT_VOICES])
  const [stances, setStances] = useState<Record<string, string>>({})
  const [showVoicePicker, setShowVoicePicker] = useState<0 | 1 | null>(null)
  const [savedVoices, setSavedVoices] = useState<Voice[]>([])
  const [editingStanceFor, setEditingStanceFor] = useState<string | null>(null)
  const [draftStance, setDraftStance] = useState('')

  useEffect(() => {
    setSavedVoices(getCustomVoices())
  }, [])

  const handleSelectVoice = (slot: 0 | 1, voice: Voice) => {
    const next = [...voices]
    const oldStance = stances[voices[slot].id] || ''
    const newStances = { ...stances }
    delete newStances[voices[slot].id]
    newStances[voice.id] = oldStance

    next[slot] = voice
    setVoices(next)
    setStances(newStances)
    setShowVoicePicker(null)
  }

  const handleStanceChange = (voiceId: string, stance: string) => {
    setStances((prev) => ({ ...prev, [voiceId]: stance }))
  }

  const openStanceEditor = (voiceId: string) => {
    setDraftStance(stances[voiceId] || '')
    setEditingStanceFor(voiceId)
  }

  const saveStanceDraft = () => {
    if (editingStanceFor) {
      handleStanceChange(editingStanceFor, draftStance)
    }
    setEditingStanceFor(null)
    setDraftStance('')
  }

  const handleStart = () => {
    if (!background.trim()) return

    const stage: Stage = {
      id: generateId(),
      background: background.trim(),
      voices,
      stances,
      messages: [],
      status: 'ongoing',
      createdAt: Date.now(),
    }

    saveStage(stage)
    router.push(`/stage/${stage.id}`)
  }

  const canStart = background.trim().length > 0

  const colorMap: Record<string, string> = {
    cool: 'border-t-[var(--blue)]',
    warm: 'border-t-[var(--pink)]',
    green: 'border-t-[var(--green)]',
    yellow: 'border-t-[var(--yellow)]',
  }

  const pickerVoices = [
    { label: '预设角色', items: PRESET_VOICES },
    ...(savedVoices.length > 0 ? [{ label: '已保存的心声', items: savedVoices }] : []),
  ]

  return (
    <div className="flex-1 flex flex-col">
      <div className="h-1 bg-gradient-to-r from-[var(--warm)] via-[var(--pink)] via-[var(--blue)] to-[var(--green)] opacity-60" />

      <div className="max-w-xl mx-auto w-full px-6 pb-20">
        {/* Back */}
        <button
          onClick={() => router.push('/')}
          className="mt-6 flex items-center gap-2 text-sm text-[var(--text-soft)] hover:text-[var(--text)] transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          返回
        </button>

        {/* Hero */}
        <div className="mt-8 mb-2">
          <h1 className="text-2xl font-bold text-[var(--text)]">内心小剧场</h1>
          <p className="text-sm text-[var(--text-soft)] mt-1.5 leading-relaxed">
            描述你面临的处境，然后给你内心的小人各自一个立场，让它们帮你好好聊聊。
          </p>
        </div>

        {/* Background */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-[var(--text-soft)] mb-2">
            你的处境 <span className="text-[var(--pink)]">*</span>
          </label>
          <textarea
            value={background}
            onChange={(e) => setBackground(e.target.value)}
            placeholder="比如：我 30 岁，有 20 万存款，想买一辆摩托车，但家里人说太危险、不实用..."
            rows={4}
            className="w-full px-4 py-3 rounded-xl bg-[var(--card)] border border-[var(--line)] text-[var(--text)] placeholder:text-[var(--text-dim)] focus:outline-none focus:border-[var(--warm)] focus:ring-1 focus:ring-[var(--warm)] transition-colors resize-none"
          />
        </div>

        {/* Voice Selection */}
        <div className="mt-8">
          <label className="block text-sm font-medium text-[var(--text-soft)] mb-3">
            内心的两个声音
          </label>
          <div className="flex gap-4">
            {([0, 1] as const).map((slot) => {
              const voice = voices[slot]
              const currentStance = stances[voice.id] || ''
              return (
                <div
                  key={slot}
                  className={`flex-1 bg-[var(--card)] border border-[var(--line)] rounded-2xl shadow-[var(--shadow)] overflow-hidden transition-all duration-200 ${
                    showVoicePicker === slot ? 'ring-2 ring-[var(--warm)]' : ''
                  } ${colorMap[voice.color] || ''}`}
                >
                  {/* Voice Card */}
                  <div
                    onClick={() => setShowVoicePicker(showVoicePicker === slot ? null : slot)}
                    className="p-4 text-center cursor-pointer hover:bg-[var(--warm-light)] transition-colors"
                  >
                    <div className="flex justify-center mb-2">
                      <Avatar color={voice.color} size={56} name={voice.name} />
                    </div>
                    <div className="font-semibold text-sm text-[var(--text)]">{voice.name}</div>
                    <div className="text-xs text-[var(--text-dim)] mt-0.5 line-clamp-1 min-h-[1em]">{voice.soul.slice(0, 24)}</div>
                    <div className="mt-2 text-xs text-[var(--warm)] font-medium opacity-70 hover:opacity-100 transition-opacity">
                      {showVoicePicker === slot ? '收起' : '更换'} ▾
                    </div>
                  </div>

                  {/* Stance Button */}
                  <div className="px-4 pb-4">
                    <button
                      onClick={(e) => { e.stopPropagation(); openStanceEditor(voice.id) }}
                      className={`w-full py-2.5 rounded-lg text-sm border transition-all ${
                        currentStance
                          ? 'bg-[var(--warm-light)] border-[var(--warm-soft)] text-[var(--text)]'
                          : 'border-dashed border-[var(--line)] text-[var(--text-dim)] hover:border-[var(--warm-soft)] hover:text-[var(--warm)]'
                      }`}
                    >
                      {currentStance ? (
                        <span className="flex items-center justify-center gap-1.5">
                          <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 14.66V20a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2h5.34" />
                            <polygon points="18 2 22 6 12 16 8 16 8 12 18 2" />
                          </svg>
                          <span className="truncate max-w-[8rem]">{currentStance.slice(0, 20)}{currentStance.length > 20 ? '...' : ''}</span>
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-1.5">
                          <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 5v14M5 12h14" />
                          </svg>
                          写下它的心声
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Voice Picker */}
        {showVoicePicker !== null && (
          <div className="mt-4 bg-[var(--card)] border border-[var(--line)] rounded-2xl p-5 shadow-lg animate-fade-in">
            <h3 className="text-sm font-medium text-[var(--text-soft)] mb-3">
              选择第{showVoicePicker + 1}个小人
            </h3>

            {pickerVoices.map((group) => (
              <div key={group.label} className="mb-4 last:mb-0">
                <p className="text-xs text-[var(--text-dim)] mb-2 tracking-wider">{group.label}</p>
                <div className="grid grid-cols-2 gap-3">
                  {group.items.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => handleSelectVoice(showVoicePicker, v)}
                      className={`rounded-xl p-4 text-center border transition-all hover:shadow-md ${
                        voices[showVoicePicker].id === v.id
                          ? 'border-[var(--warm)] bg-[var(--warm-light)]'
                          : 'border-[var(--line)] bg-white hover:border-[var(--warm-soft)]'
                      }`}
                    >
                      <div className="flex justify-center mb-2">
                        <Avatar color={v.color} size={48} name={v.name} />
                      </div>
                      <div className="font-medium text-sm text-[var(--text)]">{v.name}</div>
                      <div className="text-xs text-[var(--text-dim)] mt-1 line-clamp-2 min-h-[1em]">{v.soul}</div>
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {/* Create new voice card */}
            <div className="mt-4 pt-4 border-t border-[var(--line)]">
              <button
                onClick={() => router.push('/voices/new')}
                className="w-full rounded-xl p-4 text-center border-2 border-dashed border-[var(--line)] bg-white hover:border-[var(--warm-soft)] hover:bg-[var(--warm-light)] transition-all hover:shadow-md"
              >
                <div className="flex justify-center mb-2">
                  <div className="w-12 h-12 rounded-full bg-[var(--warm-light)] flex items-center justify-center">
                    <svg className="w-5 h-5 text-[var(--warm)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </div>
                </div>
                <div className="font-medium text-sm text-[var(--text)]">创建心声</div>
                <div className="text-xs text-[var(--text-dim)] mt-1">设计一个全新的内心角色</div>
              </button>
            </div>
          </div>
        )}

        {/* Start button */}
        <button
          onClick={handleStart}
          disabled={!canStart}
          className="w-full mt-8 py-4 rounded-2xl bg-[var(--text)] text-white text-lg font-medium disabled:opacity-30 hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
          召唤 · 让它们聊聊
        </button>
      </div>

      {/* ── Stance Editor Modal ── */}
      {editingStanceFor !== null && (() => {
        const voice = voices.find((v) => v.id === editingStanceFor)
        if (!voice) return null
        return (
          <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/30 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) setEditingStanceFor(null) }}
          >
            <div
              className="w-full sm:max-w-lg bg-[var(--card)] rounded-t-2xl sm:rounded-2xl shadow-xl border border-[var(--line)] animate-soft-rise"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center gap-3 px-6 pt-6 pb-4 border-b border-[var(--line)]">
                <Avatar color={voice.color} size={40} name={voice.name} />
                <div>
                  <p className="font-semibold text-sm text-[var(--text)]">{voice.name} 的心声</p>
                  <p className="text-xs text-[var(--text-dim)]">写下这个声音想说的话、顾虑和看法</p>
                </div>
              </div>

              {/* Textarea */}
              <div className="px-6 py-4">
                <textarea
                  value={draftStance}
                  onChange={(e) => setDraftStance(e.target.value)}
                  placeholder={`比如：我觉得你应该冷静想想，${voice.name === '理性先生' || voices[0]?.id === voice.id ? '买摩托车的钱够付首付了' : '人生苦短，趁年轻去体验吧'}...`}
                  rows={6}
                  className="w-full px-4 py-3 rounded-xl bg-[var(--bg)] border border-[var(--line)] text-sm text-[var(--text)] placeholder:text-[var(--text-dim)] focus:outline-none focus:border-[var(--warm)] transition-colors resize-none"
                  autoFocus
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 px-6 pb-6">
                <button
                  onClick={() => { setEditingStanceFor(null); setDraftStance('') }}
                  className="flex-1 py-3 rounded-xl border border-[var(--line)] text-sm text-[var(--text-soft)] hover:bg-[var(--bg)] transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={saveStanceDraft}
                  className="flex-1 py-3 rounded-xl bg-[var(--text)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  确定
                </button>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}

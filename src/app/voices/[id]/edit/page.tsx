'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getCustomVoices, saveCustomVoice, getAllBrains } from '@/lib/store'
import { AvatarColor, Voice } from '@/lib/types'
import Avatar from '@/components/Avatar'

const ALL_COLORS: AvatarColor[] = [
  'cool', 'warm', 'green', 'yellow',
  'purple', 'orange', 'teal', 'rose', 'indigo',
]

export default function EditVoicePage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [loaded, setLoaded] = useState(false)
  const [name, setName] = useState('')
  const [soul, setSoul] = useState('')
  const [color, setColor] = useState<AvatarColor>('cool')
  const [brainId, setBrainId] = useState<string>('builtin-deepseek')

  const allBrains = getAllBrains()

  useEffect(() => {
    const voices = getCustomVoices()
    const voice = voices.find((v) => v.id === id)
    if (!voice) {
      router.push('/voices')
      return
    }
    setName(voice.name)
    setSoul(voice.soul)
    setColor(voice.color)
    setBrainId(voice.brainId ?? 'builtin-deepseek')
    setLoaded(true)
  }, [id, router])

  const handleSave = () => {
    if (!name.trim() || !loaded) return

    const voice: Voice = {
      id,
      name: name.trim(),
      soul: soul.trim() || `自定义角色：${name.trim()}`,
      color,
      brainId: brainId === 'builtin-deepseek' ? undefined : brainId,
    }

    saveCustomVoice(voice)
    router.push('/voices')
  }

  const canSave = name.trim().length > 0

  if (!loaded) {
    return (
      <div className="redesign-root h-dvh flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-[rgba(230,223,211,0.35)]">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="redesign-root h-dvh flex flex-col">
      <div className="bg-title">MIND MIRROR</div>
      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
        <div className="max-w-xl mx-auto w-full px-6 pb-20">
          <button onClick={() => router.push('/voices')}
            className="torn-back-btn" title="返回">
            ← 返回
          </button>

          <h1 className="text-2xl font-bold text-[#e6dfd3] mt-8">编辑心声</h1>
          <p className="text-sm text-[rgba(230,223,211,0.6)] mt-1">修改你内心的这个小人的设定</p>

          {/* Name */}
          <div className="mt-8">
            <label className="block text-sm font-medium text-[rgba(230,223,211,0.6)] mb-2">名字 *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="比如：大胆的我"
              className="w-full px-4 py-3 rounded-xl bg-[rgba(230,223,211,0.08)] border border-[rgba(230,223,211,0.15)] text-[#e6dfd3] placeholder:text-[rgba(230,223,211,0.35)] focus:outline-none focus:border-[#cc665c] focus:ring-1 focus:ring-[#cc665c] transition-colors"
            />
          </div>

          {/* Soul */}
          <div className="mt-5">
            <label className="block text-sm font-medium text-[rgba(230,223,211,0.6)] mb-2">灵魂设定</label>
            <textarea
              value={soul}
              onChange={(e) => setSoul(e.target.value)}
              placeholder="描述这个角色的性格特点、说话方式、价值观..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-[rgba(230,223,211,0.08)] border border-[rgba(230,223,211,0.15)] text-[#e6dfd3] placeholder:text-[rgba(230,223,211,0.35)] focus:outline-none focus:border-[#cc665c] focus:ring-1 focus:ring-[#cc665c] transition-colors resize-none"
            />
          </div>

          {/* Avatar Color */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-[rgba(230,223,211,0.6)] mb-3">头像</label>
            <div className="grid grid-cols-5 gap-3">
              {ALL_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`flex items-center justify-center p-3 rounded-xl border transition-all ${
                    color === c
                      ? 'border-[#cc665c] bg-[rgba(204,102,92,0.15)] ring-1 ring-[#cc665c]'
                      : 'border-[rgba(230,223,211,0.15)] bg-[rgba(230,223,211,0.08)] hover:border-[#cc665c]'
                  }`}
                >
                  <Avatar color={c} size={36} />
                </button>
              ))}
            </div>
          </div>

          {/* Brain Selection */}
          <div className="mt-8">
            <label className="block text-sm font-medium text-[rgba(230,223,211,0.6)] mb-3">引擎</label>
            <div className="space-y-2">
              {allBrains.map((b) => (
                <label
                  key={b.id}
                  className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                    brainId === b.id
                      ? 'border-[#cc665c] bg-[rgba(204,102,92,0.15)]'
                      : 'border-[rgba(230,223,211,0.15)] bg-[rgba(230,223,211,0.08)] hover:border-[#cc665c]'
                  }`}
                >
                  <input
                    type="radio"
                    name="brain"
                    value={b.id}
                    checked={brainId === b.id}
                    onChange={() => setBrainId(b.id)}
                    className="accent-[#cc665c]"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#e6dfd3]">{b.name}</p>
                    <p className="text-xs text-[rgba(230,223,211,0.35)]">
                      {b.type === 'builtin' ? '内置 · 使用服务端 API Key' : '自定义'}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Save */}
          <button
            onClick={handleSave}
            disabled={!canSave}
            className="w-full mt-8 py-4 rounded-2xl bg-[#e6dfd3] text-[#354230] text-lg font-medium disabled:opacity-30 hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
            保存修改
          </button>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getCustomVoices, saveCustomVoice, saveCustomBrain, generateId, getAllBrains } from '@/lib/store'
import { AvatarColor, Voice, Brain, BUILTIN_BRAIN } from '@/lib/types'
import Avatar from '@/components/Avatar'

const ALL_COLORS: AvatarColor[] = [
  'cool', 'warm', 'green', 'yellow',
  'purple', 'orange', 'teal', 'rose', 'indigo',
]

const COLOR_LABELS: Record<AvatarColor, string> = {
  cool: '冷静蓝', warm: '热情粉', green: '平和绿', yellow: '温暖黄',
  purple: '深邃紫', orange: '活力橙', teal: '宁静青', rose: '优雅玫', indigo: '沉稳靛',
}

export default function EditVoicePage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [loaded, setLoaded] = useState(false)
  const [name, setName] = useState('')
  const [soul, setSoul] = useState('')
  const [color, setColor] = useState<AvatarColor>('cool')
  const [brainId, setBrainId] = useState<string>('builtin-deepseek')

  // Custom brain form
  const [showCustomBrain, setShowCustomBrain] = useState(false)
  const [customBrainName, setCustomBrainName] = useState('')
  const [customBrainEndpoint, setCustomBrainEndpoint] = useState('https://api.deepseek.com/chat/completions')
  const [customBrainApiKey, setCustomBrainApiKey] = useState('')
  const [customBrainModel, setCustomBrainModel] = useState('deepseek-chat')

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

    let finalBrainId = brainId

    // Save custom brain if creating one
    if (showCustomBrain && customBrainName.trim() && customBrainApiKey.trim()) {
      const newBrain: Brain = {
        id: `brain-${generateId()}`,
        name: customBrainName.trim(),
        type: 'custom',
        apiKey: customBrainApiKey.trim(),
        endpoint: customBrainEndpoint.trim(),
        model: customBrainModel.trim(),
      }
      saveCustomBrain(newBrain)
      finalBrainId = newBrain.id
    }

    const voice: Voice = {
      id,
      name: name.trim(),
      soul: soul.trim() || `自定义角色：${name.trim()}`,
      color,
      brainId: finalBrainId === 'builtin-deepseek' ? undefined : finalBrainId,
    }

    saveCustomVoice(voice)
    router.push('/voices')
  }

  const canSave = name.trim().length > 0

  if (!loaded) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-sm text-[var(--text-dim)]">加载中...</p>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="h-1 bg-gradient-to-r from-[var(--warm)] via-[var(--pink)] via-[var(--blue)] to-[var(--green)] opacity-60" />

      <div className="max-w-xl mx-auto w-full px-6 pb-20">
        <button
          onClick={() => router.push('/voices')}
          className="mt-6 flex items-center gap-2 text-sm text-[var(--text-soft)] hover:text-[var(--text)] transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          返回
        </button>

        <h1 className="text-2xl font-bold text-[var(--text)] mt-8">编辑心声</h1>
        <p className="text-sm text-[var(--text-soft)] mt-1">修改你内心的这个小人的设定</p>

        {/* Name */}
        <div className="mt-8">
          <label className="block text-sm font-medium text-[var(--text-soft)] mb-2">名字 *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="比如：大胆的我"
            className="w-full px-4 py-3 rounded-xl bg-[var(--card)] border border-[var(--line)] text-[var(--text)] placeholder:text-[var(--text-dim)] focus:outline-none focus:border-[var(--warm)] focus:ring-1 focus:ring-[var(--warm)] transition-colors"
          />
        </div>

        {/* Soul */}
        <div className="mt-5">
          <label className="block text-sm font-medium text-[var(--text-soft)] mb-2">灵魂设定</label>
          <textarea
            value={soul}
            onChange={(e) => setSoul(e.target.value)}
            placeholder="描述这个角色的性格特点、说话方式、价值观..."
            rows={3}
            className="w-full px-4 py-3 rounded-xl bg-[var(--card)] border border-[var(--line)] text-[var(--text)] placeholder:text-[var(--text-dim)] focus:outline-none focus:border-[var(--warm)] focus:ring-1 focus:ring-[var(--warm)] transition-colors resize-none"
          />
        </div>

        {/* Avatar Color */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-[var(--text-soft)] mb-3">头像</label>
          <div className="grid grid-cols-5 gap-3">
            {ALL_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${
                  color === c
                    ? 'border-[var(--warm)] bg-[var(--warm-light)] ring-1 ring-[var(--warm)]'
                    : 'border-[var(--line)] bg-[var(--card)] hover:border-[var(--warm-soft)]'
                }`}
              >
                <Avatar color={c} size={36} />
                <span className="text-[10px] text-[var(--text-dim)] leading-tight text-center">{COLOR_LABELS[c]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Brain Selection */}
        <div className="mt-8">
          <label className="block text-sm font-medium text-[var(--text-soft)] mb-3">引擎</label>
          <div className="space-y-2">
            {allBrains.map((b) => (
              <label
                key={b.id}
                className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                  brainId === b.id
                    ? 'border-[var(--warm)] bg-[var(--warm-light)]'
                    : 'border-[var(--line)] bg-[var(--card)] hover:border-[var(--warm-soft)]'
                }`}
              >
                <input
                  type="radio"
                  name="brain"
                  value={b.id}
                  checked={brainId === b.id}
                  onChange={() => setBrainId(b.id)}
                  className="accent-[var(--warm)]"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-[var(--text)]">{b.name}</p>
                  <p className="text-xs text-[var(--text-dim)]">
                    {b.type === 'builtin' ? '内置 · 使用服务端 API Key' : '自定义'}
                  </p>
                </div>
              </label>
            ))}

            {/* Add custom brain button */}
            {!showCustomBrain && (
              <button
                onClick={() => { setShowCustomBrain(true); setBrainId('custom-new') }}
                className="w-full p-3.5 rounded-xl border border-dashed border-[var(--line)] text-sm text-[var(--text-dim)] hover:text-[var(--text)] hover:border-[var(--warm-soft)] transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                添加自定义引擎
              </button>
            )}
          </div>
        </div>

        {/* Custom Brain Form */}
        {showCustomBrain && (
          <div className="mt-4 bg-[var(--card)] border border-[var(--line)] rounded-2xl p-5 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-[var(--text)]">自定义引擎</h3>
              <button
                onClick={() => { setShowCustomBrain(false); setBrainId('builtin-deepseek') }}
                className="text-xs text-[var(--text-dim)] hover:text-[var(--pink)] transition-colors"
              >
                取消
              </button>
            </div>

            <div>
              <label className="block text-xs text-[var(--text-soft)] mb-1.5">名称</label>
              <input
                type="text"
                value={customBrainName}
                onChange={(e) => setCustomBrainName(e.target.value)}
                placeholder="比如：我的 OpenAI"
                className="w-full px-3 py-2 rounded-lg border border-[var(--line)] text-sm text-[var(--text)] placeholder:text-[var(--text-dim)] focus:outline-none focus:border-[var(--warm)]"
              />
            </div>
            <div>
              <label className="block text-xs text-[var(--text-soft)] mb-1.5">API 地址</label>
              <input
                type="text"
                value={customBrainEndpoint}
                onChange={(e) => setCustomBrainEndpoint(e.target.value)}
                placeholder="https://api.deepseek.com/chat/completions"
                className="w-full px-3 py-2 rounded-lg border border-[var(--line)] text-sm text-[var(--text)] placeholder:text-[var(--text-dim)] focus:outline-none focus:border-[var(--warm)]"
              />
            </div>
            <div>
              <label className="block text-xs text-[var(--text-soft)] mb-1.5">API Key</label>
              <input
                type="password"
                value={customBrainApiKey}
                onChange={(e) => setCustomBrainApiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full px-3 py-2 rounded-lg border border-[var(--line)] text-sm text-[var(--text)] placeholder:text-[var(--text-dim)] focus:outline-none focus:border-[var(--warm)]"
              />
            </div>
            <div>
              <label className="block text-xs text-[var(--text-soft)] mb-1.5">模型</label>
              <input
                type="text"
                value={customBrainModel}
                onChange={(e) => setCustomBrainModel(e.target.value)}
                placeholder="deepseek-chat"
                className="w-full px-3 py-2 rounded-lg border border-[var(--line)] text-sm text-[var(--text)] placeholder:text-[var(--text-dim)] focus:outline-none focus:border-[var(--warm)]"
              />
            </div>
          </div>
        )}

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={!canSave}
          className="w-full mt-8 py-4 rounded-2xl bg-[var(--text)] text-white text-lg font-medium disabled:opacity-30 hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
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
  )
}

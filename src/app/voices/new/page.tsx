'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { saveCustomVoice, saveCustomBrain, generateId, getCustomBrains } from '@/lib/store'
import { AvatarColor, Voice, Brain } from '@/lib/types'
import Avatar from '@/components/Avatar'
import TestDot from '@/components/TestDot'
import { ENGINE_PRESETS, ENGINE_PRESET_KEYS } from '@/lib/engine-presets'

export default function Page() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center text-sm text-[var(--text-dim)]">加载中...</div>}>
      <NewVoicePage />
    </Suspense>
  )
}

const ALL_COLORS: AvatarColor[] = [
  'cool', 'warm', 'green', 'yellow',
  'purple', 'orange', 'teal', 'rose', 'indigo',
]

const COLOR_LABELS: Record<AvatarColor, string> = {
  cool: '冷静蓝', warm: '热情粉', green: '平和绿', yellow: '温暖黄',
  purple: '深邃紫', orange: '活力橙', teal: '宁静青', rose: '优雅玫', indigo: '沉稳靛',
}

function NewVoicePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialTab = searchParams.get('tab') === 'engine' ? 'engine' : 'voice'

  const [tab, setTab] = useState<'voice' | 'engine'>(initialTab)
  const [name, setName] = useState('')
  const [soul, setSoul] = useState('')
  const [color, setColor] = useState<AvatarColor>('cool')
  const [brainId, setBrainId] = useState<string>('builtin-deepseek')
  const [existingBrains, setExistingBrains] = useState<Brain[]>([])

  // Engine tab
  const [engineName, setEngineName] = useState('')
  const [engineEndpoint, setEngineEndpoint] = useState('')
  const [engineApiKey, setEngineApiKey] = useState('')
  const [engineModel, setEngineModel] = useState('')
  const [engineApiKeyUrl, setEngineApiKeyUrl] = useState('')
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null)
  const [testDot, setTestDot] = useState<'ok' | 'fail' | null>(null)
  const [nameError, setNameError] = useState('')

  useEffect(() => {
    setExistingBrains(getCustomBrains())
  }, [])

  const validateEngineName = (val: string) => {
    setEngineName(val)
    if (val.trim() && existingBrains.some((b) => b.name === val.trim())) {
      setNameError('该名称已被使用')
    } else {
      setNameError('')
    }
  }

  const applyPreset = (key: string) => {
    if (key === 'custom') {
      setSelectedPreset(null)
      setEngineName('')
      setEngineEndpoint('')
      setEngineApiKey('')
      setEngineModel('')
      setEngineApiKeyUrl('')
      setNameError('')
      return
    }
    const preset = ENGINE_PRESETS[key]
    if (!preset) return
    setSelectedPreset(key)
    setEngineName(preset.name)
    setEngineEndpoint(preset.endpoint)
    setEngineModel(preset.model)
    setEngineApiKeyUrl(preset.apiKeyUrl)
    setNameError('')
    // 不重置 apiKey，方便切换预设时保留用户已输入的 Key
  }

  const handleSaveVoice = () => {
    if (!name.trim()) return

    const voice: Voice = {
      id: generateId(),
      name: name.trim(),
      soul: soul.trim() || `自定义角色：${name.trim()}`,
      color,
      brainId: brainId === 'builtin-deepseek' ? undefined : brainId,
    }

    saveCustomVoice(voice)
    router.push('/voices')
  }

  const handleSaveEngine = () => {
    if (!engineName.trim() || !engineApiKey.trim() || nameError) return

    const brain: Brain = {
      id: `brain-${generateId()}`,
      name: engineName.trim(),
      type: 'custom',
      apiKey: engineApiKey.trim(),
      endpoint: engineEndpoint.trim(),
      model: engineModel.trim(),
    }

    saveCustomBrain(brain)
    router.push('/voices')
  }

  const testEngine = async () => {
    if (!engineApiKey.trim()) return
    setTestDot(null)

    try {
      const res = await fetch('/api/engine/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brain: { type: 'custom', apiKey: engineApiKey.trim(), endpoint: engineEndpoint.trim(), model: engineModel.trim() },
        }),
      })
      const data = await res.json()
      setTestDot(data.ok ? 'ok' : 'fail')
    } catch {
      setTestDot('fail')
    }

    setTimeout(() => setTestDot(null), 3000)
  }

  const voiceValid = name.trim().length > 0
  const engineValid = engineName.trim().length > 0 && engineApiKey.trim().length > 0 && !nameError

  return (
    <div className="flex-1 flex flex-col">
      <div className="h-1 bg-gradient-to-r from-[var(--warm)] via-[var(--pink)] via-[var(--blue)] to-[var(--green)] opacity-60" />

      <div className="max-w-xl mx-auto w-full px-6 pb-20">
        <button onClick={() => router.push('/voices')}
          className="mt-6 flex items-center gap-2 text-sm text-[var(--text-soft)] hover:text-[var(--text)] transition-colors">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          返回
        </button>

        {/* Tabs */}
        <div className="flex gap-1 mt-8 bg-[var(--card)] border border-[var(--line)] rounded-xl p-1">
          <button onClick={() => setTab('voice')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${tab === 'voice' ? 'bg-white text-[var(--text)] shadow-sm' : 'text-[var(--text-dim)] hover:text-[var(--text)]'}`}>
            新建心声
          </button>
          <button onClick={() => setTab('engine')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${tab === 'engine' ? 'bg-white text-[var(--text)] shadow-sm' : 'text-[var(--text-dim)] hover:text-[var(--text)]'}`}>
            添加引擎
          </button>
        </div>

        {/* ===== 新建心声 ===== */}
        {tab === 'voice' && (
          <>
            <div className="mt-8">
              <label className="block text-sm font-medium text-[var(--text-soft)] mb-2">名字 *</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                placeholder="比如：大胆的我"
                className="w-full px-4 py-3 rounded-xl bg-[var(--card)] border border-[var(--line)] text-[var(--text)] placeholder:text-[var(--text-dim)] focus:outline-none focus:border-[var(--warm)] focus:ring-1 focus:ring-[var(--warm)] transition-colors" />
            </div>
            <div className="mt-5">
              <label className="block text-sm font-medium text-[var(--text-soft)] mb-2">灵魂设定</label>
              <textarea value={soul} onChange={(e) => setSoul(e.target.value)}
                placeholder="描述这个角色的性格特点、说话方式、价值观..." rows={3}
                className="w-full px-4 py-3 rounded-xl bg-[var(--card)] border border-[var(--line)] text-[var(--text)] placeholder:text-[var(--text-dim)] focus:outline-none focus:border-[var(--warm)] focus:ring-1 focus:ring-[var(--warm)] transition-colors resize-none" />
            </div>
            <div className="mt-6">
              <label className="block text-sm font-medium text-[var(--text-soft)] mb-3">头像</label>
              <div className="grid grid-cols-5 gap-3">
                {ALL_COLORS.map((c) => (
                  <button key={c} onClick={() => setColor(c)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${color === c ? 'border-[var(--warm)] bg-[var(--warm-light)] ring-1 ring-[var(--warm)]' : 'border-[var(--line)] bg-[var(--card)] hover:border-[var(--warm-soft)]'}`}>
                    <Avatar color={c} size={36} />
                    <span className="text-[10px] text-[var(--text-dim)] leading-tight text-center">{COLOR_LABELS[c]}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-8">
              <label className="block text-sm font-medium text-[var(--text-soft)] mb-3">引擎</label>
              <div className="space-y-2">
                {[...getCustomBrains(), ...(getCustomBrains().length === 0 ? [] : [])].length >= 0 &&
                  <>
                    <label className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${brainId === 'builtin-deepseek' ? 'border-[var(--warm)] bg-[var(--warm-light)]' : 'border-[var(--line)] bg-[var(--card)] hover:border-[var(--warm-soft)]'}`}>
                      <input type="radio" name="brain" value="builtin-deepseek" checked={brainId === 'builtin-deepseek'}
                        onChange={() => setBrainId('builtin-deepseek')} className="accent-[var(--warm)]" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-[var(--text)]">心镜默认 (DeepSeek)</p>
                        <p className="text-xs text-[var(--text-dim)]">内置</p>
                      </div>
                    </label>
                    {getCustomBrains().map((b) => (
                      <label key={b.id} className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${brainId === b.id ? 'border-[var(--warm)] bg-[var(--warm-light)]' : 'border-[var(--line)] bg-[var(--card)] hover:border-[var(--warm-soft)]'}`}>
                        <input type="radio" name="brain" value={b.id} checked={brainId === b.id}
                          onChange={() => setBrainId(b.id)} className="accent-[var(--warm)]" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-[var(--text)]">{b.name}</p>
                          <p className="text-xs text-[var(--text-dim)]">自定义</p>
                        </div>
                      </label>
                    ))}
                  </>
                }
              </div>
            </div>
            <button onClick={handleSaveVoice} disabled={!voiceValid}
              className="w-full mt-8 py-4 rounded-2xl bg-[var(--text)] text-white text-lg font-medium disabled:opacity-30 hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>
              保存心声
            </button>
          </>
        )}

        {/* ===== 添加引擎 ===== */}
        {tab === 'engine' && (
          <>
            {/* Presets */}
            <div className="mt-8">
              <label className="block text-sm font-medium text-[var(--text-soft)] mb-3">选择预设</label>
              <div className="flex gap-2 flex-wrap">
                {ENGINE_PRESET_KEYS.map((key) => {
                  const p = ENGINE_PRESETS[key]
                  return (
                    <button key={key} onClick={() => applyPreset(key)}
                      className={`px-4 py-2 rounded-xl border text-sm transition-all ${selectedPreset === key ? 'border-[var(--warm)] bg-[var(--warm-light)] text-[var(--warm)] font-medium' : 'border-[var(--line)] text-[var(--text-soft)] hover:border-[var(--warm-soft)]'}`}>
                      {p.name}
                    </button>
                  )
                })}
                <button onClick={() => applyPreset('custom')}
                  className={`px-4 py-2 rounded-xl border text-sm transition-all ${selectedPreset === null ? 'border-[var(--warm)] bg-[var(--warm-light)] text-[var(--warm)] font-medium' : 'border-[var(--line)] text-[var(--text-soft)] hover:border-[var(--warm-soft)]'}`}>
                  自定义
                </button>
              </div>
            </div>

            <div className="mt-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-[var(--text-soft)] mb-2">名称 *</label>
                <input type="text" value={engineName} onChange={(e) => validateEngineName(e.target.value)}
                  placeholder="比如：我的 DeepSeek"
                  className={`w-full px-4 py-3 rounded-xl bg-[var(--card)] border text-[var(--text)] placeholder:text-[var(--text-dim)] focus:outline-none focus:ring-1 transition-colors ${nameError ? 'border-[var(--pink)] focus:border-[var(--pink)] focus:ring-[var(--pink)]' : 'border-[var(--line)] focus:border-[var(--warm)] focus:ring-[var(--warm)]'}`} />
                {nameError && <p className="text-xs text-[var(--pink)] mt-1.5">{nameError}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-soft)] mb-2">API 地址</label>
                <input type="text" value={engineEndpoint} onChange={(e) => setEngineEndpoint(e.target.value)}
                  placeholder="https://api.deepseek.com/chat/completions"
                  className="w-full px-4 py-3 rounded-xl bg-[var(--card)] border border-[var(--line)] text-[var(--text)] placeholder:text-[var(--text-dim)] focus:outline-none focus:border-[var(--warm)] focus:ring-1 focus:ring-[var(--warm)] transition-colors" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-[var(--text-soft)]">API Key *</label>
                  {engineApiKeyUrl && (
                    <a href={engineApiKeyUrl} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-[var(--warm)] hover:underline">
                      获取 Key
                    </a>
                  )}
                </div>
                <input type="password" value={engineApiKey} onChange={(e) => setEngineApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="w-full px-4 py-3 rounded-xl bg-[var(--card)] border border-[var(--line)] text-[var(--text)] placeholder:text-[var(--text-dim)] focus:outline-none focus:border-[var(--warm)] focus:ring-1 focus:ring-[var(--warm)] transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-soft)] mb-2">模型</label>
                <input type="text" value={engineModel} onChange={(e) => setEngineModel(e.target.value)}
                  placeholder="deepseek-v4-flash"
                  className="w-full px-4 py-3 rounded-xl bg-[var(--card)] border border-[var(--line)] text-[var(--text)] placeholder:text-[var(--text-dim)] focus:outline-none focus:border-[var(--warm)] focus:ring-1 focus:ring-[var(--warm)] transition-colors" />
              </div>

              {/* Test */}
              <div className="flex items-center gap-3 pt-1">
                <TestDot state={testDot} />
                <button onClick={testEngine} disabled={!engineApiKey.trim()}
                  className="px-5 py-2.5 rounded-xl border border-[var(--line)] text-sm text-[var(--text-soft)] hover:bg-[var(--warm-light)] hover:border-[var(--warm-soft)] disabled:opacity-40 transition-colors">
                  测试连接
                </button>
              </div>
            </div>

            <button onClick={handleSaveEngine} disabled={!engineValid}
              className="w-full mt-8 py-4 rounded-2xl bg-[var(--text)] text-white text-lg font-medium disabled:opacity-30 hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="16" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
              添加引擎
            </button>
          </>
        )}
      </div>
    </div>
  )
}

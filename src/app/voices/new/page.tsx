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
    <Suspense fallback={<div className="flex-1 flex items-center justify-center text-sm text-[rgba(230,223,211,0.35)]">加载中...</div>}>
      <NewVoicePage />
    </Suspense>
  )
}

const ALL_COLORS: AvatarColor[] = [
  'cool', 'warm', 'green', 'yellow',
  'purple', 'orange', 'teal', 'rose', 'indigo',
]

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
    <div className="redesign-root h-dvh flex flex-col overflow-x-hidden">
      <div className="bg-title">MIND MIRROR</div>
      <div className="flex-1 flex flex-col">
        <div className="max-w-xl mx-auto w-full px-6 pb-20">
          <button onClick={() => router.push('/voices')}
            className="torn-back-btn" title="返回">
            ← 返回
          </button>

          {/* Tabs */}
          <div className="flex gap-1 mt-8 bg-[rgba(230,223,211,0.08)] border border-[rgba(230,223,211,0.15)] rounded-xl p-1">
            <button onClick={() => setTab('voice')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${tab === 'voice' ? 'bg-[rgba(230,223,211,0.15)] text-[#e6dfd3]' : 'text-[rgba(230,223,211,0.35)] hover:text-[#e6dfd3]'}`}>
              新建心声
            </button>
            <button onClick={() => setTab('engine')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${tab === 'engine' ? 'bg-[rgba(230,223,211,0.15)] text-[#e6dfd3]' : 'text-[rgba(230,223,211,0.35)] hover:text-[#e6dfd3]'}`}>
              添加引擎
            </button>
          </div>

          {/* ===== 新建心声 ===== */}
          {tab === 'voice' && (
            <>
              <div className="mt-8">
                <label className="block text-sm font-medium text-[rgba(230,223,211,0.6)] mb-2">名字 *</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="比如：大胆的我"
                  className="w-full px-4 py-3 rounded-xl bg-[rgba(230,223,211,0.08)] border border-[rgba(230,223,211,0.15)] text-[#e6dfd3] placeholder:text-[rgba(230,223,211,0.35)] focus:outline-none focus:border-[#cc665c] focus:ring-1 focus:ring-[#cc665c] transition-colors" />
              </div>
              <div className="mt-5">
                <label className="block text-sm font-medium text-[rgba(230,223,211,0.6)] mb-2">灵魂设定</label>
                <textarea value={soul} onChange={(e) => setSoul(e.target.value)}
                  placeholder="描述这个角色的性格特点、说话方式、价值观..." rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-[rgba(230,223,211,0.08)] border border-[rgba(230,223,211,0.15)] text-[#e6dfd3] placeholder:text-[rgba(230,223,211,0.35)] focus:outline-none focus:border-[#cc665c] focus:ring-1 focus:ring-[#cc665c] transition-colors resize-none" />
              </div>
              <div className="mt-6">
                <label className="block text-sm font-medium text-[rgba(230,223,211,0.6)] mb-3">头像</label>
                <div className="grid grid-cols-5 gap-3">
                  {ALL_COLORS.map((c) => (
                    <button key={c} onClick={() => setColor(c)}
                      className={`flex items-center justify-center p-3 rounded-xl border transition-all ${color === c ? 'border-[#cc665c] bg-[rgba(204,102,92,0.15)] ring-1 ring-[#cc665c]' : 'border-[rgba(230,223,211,0.15)] bg-[rgba(230,223,211,0.08)] hover:border-[#cc665c]'}`}>
                      <Avatar color={c} size={36} />
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-8">
                <label className="block text-sm font-medium text-[rgba(230,223,211,0.6)] mb-3">引擎</label>
                <div className="space-y-2">
                  {[...getCustomBrains(), ...(getCustomBrains().length === 0 ? [] : [])].length >= 0 &&
                    <>
                      <label className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${brainId === 'builtin-deepseek' ? 'border-[#cc665c] bg-[rgba(204,102,92,0.15)]' : 'border-[rgba(230,223,211,0.15)] bg-[rgba(230,223,211,0.08)] hover:border-[#cc665c]'}`}>
                        <input type="radio" name="brain" value="builtin-deepseek" checked={brainId === 'builtin-deepseek'}
                          onChange={() => setBrainId('builtin-deepseek')} className="accent-[#cc665c]" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-[#e6dfd3]">心镜默认 (DeepSeek)</p>
                          <p className="text-xs text-[rgba(230,223,211,0.35)]">内置</p>
                        </div>
                      </label>
                      {getCustomBrains().map((b) => (
                        <label key={b.id} className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${brainId === b.id ? 'border-[#cc665c] bg-[rgba(204,102,92,0.15)]' : 'border-[rgba(230,223,211,0.15)] bg-[rgba(230,223,211,0.08)] hover:border-[#cc665c]'}`}>
                          <input type="radio" name="brain" value={b.id} checked={brainId === b.id}
                            onChange={() => setBrainId(b.id)} className="accent-[#cc665c]" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-[#e6dfd3]">{b.name}</p>
                            <p className="text-xs text-[rgba(230,223,211,0.35)]">自定义</p>
                          </div>
                        </label>
                      ))}
                    </>
                  }
                </div>
              </div>
              <button onClick={handleSaveVoice} disabled={!voiceValid}
                className="w-full mt-8 py-4 rounded-2xl bg-[#e6dfd3] text-[#354230] text-lg font-medium disabled:opacity-30 hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
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
                <label className="block text-sm font-medium text-[rgba(230,223,211,0.6)] mb-3">选择预设</label>
                <div className="flex gap-2 flex-wrap">
                  {ENGINE_PRESET_KEYS.map((key) => {
                    const p = ENGINE_PRESETS[key]
                    return (
                      <button key={key} onClick={() => applyPreset(key)}
                        className={`px-4 py-2 rounded-xl border text-sm transition-all ${selectedPreset === key ? 'border-[#cc665c] bg-[rgba(204,102,92,0.15)] text-[#e6dfd3] font-medium' : 'border-[rgba(230,223,211,0.15)] text-[rgba(230,223,211,0.6)] hover:border-[#cc665c]'}`}>
                        {p.name}
                      </button>
                    )
                  })}
                  <button onClick={() => applyPreset('custom')}
                    className={`px-4 py-2 rounded-xl border text-sm transition-all ${selectedPreset === null ? 'border-[#cc665c] bg-[rgba(204,102,92,0.15)] text-[#e6dfd3] font-medium' : 'border-[rgba(230,223,211,0.15)] text-[rgba(230,223,211,0.6)] hover:border-[#cc665c]'}`}>
                    自定义
                  </button>
                </div>
              </div>

              <div className="mt-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-[rgba(230,223,211,0.6)] mb-2">名称 *</label>
                  <input type="text" value={engineName} onChange={(e) => validateEngineName(e.target.value)}
                    placeholder="比如：我的 DeepSeek"
                    className={`w-full px-4 py-3 rounded-xl bg-[rgba(230,223,211,0.08)] border text-[#e6dfd3] placeholder:text-[rgba(230,223,211,0.35)] focus:outline-none focus:ring-1 transition-colors ${nameError ? 'border-[#cc665c] focus:border-[#cc665c] focus:ring-[#cc665c]' : 'border-[rgba(230,223,211,0.15)] focus:border-[#cc665c] focus:ring-[#cc665c]'}`} />
                  {nameError && <p className="text-xs text-[#cc665c] mt-1.5">{nameError}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-[rgba(230,223,211,0.6)] mb-2">API 地址</label>
                  <input type="text" value={engineEndpoint} onChange={(e) => setEngineEndpoint(e.target.value)}
                    placeholder="https://api.deepseek.com/chat/completions"
                    className="w-full px-4 py-3 rounded-xl bg-[rgba(230,223,211,0.08)] border border-[rgba(230,223,211,0.15)] text-[#e6dfd3] placeholder:text-[rgba(230,223,211,0.35)] focus:outline-none focus:border-[#cc665c] focus:ring-1 focus:ring-[#cc665c] transition-colors" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-[rgba(230,223,211,0.6)]">API Key *</label>
                    {engineApiKeyUrl && (
                      <a href={engineApiKeyUrl} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-[#cc665c] hover:underline">
                        获取 Key
                      </a>
                    )}
                  </div>
                  <input type="password" value={engineApiKey} onChange={(e) => setEngineApiKey(e.target.value)}
                    placeholder="sk-..."
                    className="w-full px-4 py-3 rounded-xl bg-[rgba(230,223,211,0.08)] border border-[rgba(230,223,211,0.15)] text-[#e6dfd3] placeholder:text-[rgba(230,223,211,0.35)] focus:outline-none focus:border-[#cc665c] focus:ring-1 focus:ring-[#cc665c] transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[rgba(230,223,211,0.6)] mb-2">模型</label>
                  <input type="text" value={engineModel} onChange={(e) => setEngineModel(e.target.value)}
                    placeholder="deepseek-v4-flash"
                    className="w-full px-4 py-3 rounded-xl bg-[rgba(230,223,211,0.08)] border border-[rgba(230,223,211,0.15)] text-[#e6dfd3] placeholder:text-[rgba(230,223,211,0.35)] focus:outline-none focus:border-[#cc665c] focus:ring-1 focus:ring-[#cc665c] transition-colors" />
                </div>

                {/* Test */}
                <div className="flex items-center gap-3 pt-1">
                  <TestDot state={testDot} />
                  <button onClick={testEngine} disabled={!engineApiKey.trim()}
                    className="px-5 py-2.5 rounded-xl border border-[rgba(230,223,211,0.15)] text-sm text-[rgba(230,223,211,0.6)] hover:bg-[rgba(204,102,92,0.15)] hover:border-[#cc665c] disabled:opacity-40 transition-colors">
                    测试连接
                  </button>
                </div>
              </div>

              <button onClick={handleSaveEngine} disabled={!engineValid}
                className="w-full mt-8 py-4 rounded-2xl bg-[#e6dfd3] text-[#354230] text-lg font-medium disabled:opacity-30 hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
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
    </div>
  )
}

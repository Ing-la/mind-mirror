'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getCustomBrains, saveCustomBrain } from '@/lib/store'
import { Brain } from '@/lib/types'
import TestDot from '@/components/TestDot'
import { ENGINE_PRESETS, ENGINE_PRESET_KEYS } from '@/lib/engine-presets'

export default function EditEnginePage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [loaded, setLoaded] = useState(false)
  const [name, setName] = useState('')
  const [endpoint, setEndpoint] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [model, setModel] = useState('')
  const [apiKeyUrl, setApiKeyUrl] = useState('')
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null)
  const [testDot, setTestDot] = useState<'ok' | 'fail' | null>(null)
  const [nameError, setNameError] = useState('')

  useEffect(() => {
    const brains = getCustomBrains()
    const brain = brains.find((b) => b.id === id)
    if (!brain) {
      router.push('/voices')
      return
    }
    setName(brain.name)
    setEndpoint(brain.endpoint || '')
    setApiKey(brain.apiKey || '')
    setModel(brain.model || '')
    // Detect preset by matching endpoint
    const matched = ENGINE_PRESET_KEYS.find((k) => ENGINE_PRESETS[k].endpoint === brain.endpoint)
    if (matched) {
      setSelectedPreset(matched)
      setApiKeyUrl(ENGINE_PRESETS[matched].apiKeyUrl)
    } else {
      setSelectedPreset(null)
    }
    setLoaded(true)
  }, [id, router])

  const validateName = (val: string) => {
    setName(val)
    const brains = getCustomBrains().filter((b) => b.id !== id)
    if (val.trim() && brains.some((b) => b.name === val.trim())) {
      setNameError('该名称已被使用')
    } else {
      setNameError('')
    }
  }

  const applyPreset = (key: string) => {
    if (key === 'custom') {
      setSelectedPreset(null)
      setApiKeyUrl('')
      return
    }
    const preset = ENGINE_PRESETS[key]
    if (!preset) return
    setSelectedPreset(key)
    setEndpoint(preset.endpoint)
    setModel(preset.model)
    if (!name.trim()) setName(preset.name)
    setApiKeyUrl(preset.apiKeyUrl)
  }

  const handleSave = () => {
    if (!name.trim() || !apiKey.trim() || nameError) return

    const brain: Brain = {
      id,
      name: name.trim(),
      type: 'custom',
      apiKey: apiKey.trim(),
      endpoint: endpoint.trim(),
      model: model.trim(),
    }

    saveCustomBrain(brain)
    router.push('/voices')
  }

  const testEngine = async () => {
    if (!apiKey.trim()) return
    setTestDot(null)

    try {
      const res = await fetch('/api/engine/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brain: { type: 'custom', apiKey: apiKey.trim(), endpoint: endpoint.trim(), model: model.trim() },
        }),
      })
      const data = await res.json()
      setTestDot(data.ok ? 'ok' : 'fail')
    } catch {
      setTestDot('fail')
    }

    setTimeout(() => setTestDot(null), 3000)
  }

  const canSave = name.trim().length > 0 && apiKey.trim().length > 0 && !nameError

  if (!loaded) {
    return (
      <div className="redesign-root h-dvh flex flex-col overflow-x-hidden">
      <div className="bg-title">MIND MIRROR</div>
      <div className="flex-1 flex items-center justify-center">
        <p className="text-sm text-[rgba(230,223,211,0.35)]">加载中...</p>
      </div>
      </div>
    )
  }

  return (
    <div className="redesign-root h-dvh flex flex-col overflow-x-hidden">
      <div className="bg-title">MIND MIRROR</div>
    <div className="flex-1 flex flex-col">

      <div className="max-w-xl mx-auto w-full px-6 pb-20">
        <button onClick={() => router.push('/voices')}
          className="torn-back-btn" title="返回">
          ← 返回
        </button>

        <h1 className="text-2xl font-bold text-[#e6dfd3] mt-8">编辑引擎</h1>
        <p className="text-sm text-[rgba(230,223,211,0.6)] mt-1">修改引擎配置</p>

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
            <input type="text" value={name} onChange={(e) => validateName(e.target.value)}
              className={`w-full px-4 py-3 rounded-xl bg-[rgba(230,223,211,0.08)] border text-[#e6dfd3] placeholder:text-[rgba(230,223,211,0.35)] focus:outline-none focus:ring-1 transition-colors ${nameError ? 'border-[#cc665c] focus:border-[#cc665c] focus:ring-[#cc665c]' : 'border-[rgba(230,223,211,0.15)] focus:border-[#cc665c] focus:ring-[#cc665c]'}`} />
            {nameError && <p className="text-xs text-[#cc665c] mt-1.5">{nameError}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-[rgba(230,223,211,0.6)] mb-2">API 地址</label>
            <input type="text" value={endpoint} onChange={(e) => setEndpoint(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[rgba(230,223,211,0.08)] border border-[rgba(230,223,211,0.15)] text-[#e6dfd3] placeholder:text-[rgba(230,223,211,0.35)] focus:outline-none focus:border-[#cc665c] focus:ring-1 focus:ring-[#cc665c] transition-colors" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-[rgba(230,223,211,0.6)]">API Key *</label>
              {apiKeyUrl && (
                <a href={apiKeyUrl} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-[#cc665c] hover:underline">
                  获取 Key
                </a>
              )}
            </div>
            <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[rgba(230,223,211,0.08)] border border-[rgba(230,223,211,0.15)] text-[#e6dfd3] placeholder:text-[rgba(230,223,211,0.35)] focus:outline-none focus:border-[#cc665c] focus:ring-1 focus:ring-[#cc665c] transition-colors" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[rgba(230,223,211,0.6)] mb-2">模型</label>
            <input type="text" value={model} onChange={(e) => setModel(e.target.value)}
              placeholder="deepseek-v4-flash"
              className="w-full px-4 py-3 rounded-xl bg-[rgba(230,223,211,0.08)] border border-[rgba(230,223,211,0.15)] text-[#e6dfd3] placeholder:text-[rgba(230,223,211,0.35)] focus:outline-none focus:border-[#cc665c] focus:ring-1 focus:ring-[#cc665c] transition-colors" />
          </div>

          {/* Test */}
          <div className="flex items-center gap-3 pt-1">
            <TestDot state={testDot} />
            <button onClick={testEngine} disabled={!apiKey.trim()}
              className="px-5 py-2.5 rounded-xl border border-[rgba(230,223,211,0.15)] text-sm text-[rgba(230,223,211,0.6)] hover:bg-[rgba(204,102,92,0.15)] hover:border-[#cc665c] disabled:opacity-40 transition-colors">
              测试连接
            </button>
          </div>
        </div>

        <button onClick={handleSave} disabled={!canSave}
          className="w-full mt-8 py-4 rounded-2xl bg-[#e6dfd3] text-[#354230] text-lg font-medium disabled:opacity-30 hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
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

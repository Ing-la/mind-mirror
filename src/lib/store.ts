'use client'

import {
  Stage,
  Voice,
  Brain,
  BUILTIN_BRAIN,
  DEFAULT_BRAINS,
  STORAGE_KEY,
  CUSTOM_VOICES_KEY,
  CUSTOM_BRAINS_KEY,
} from './types'

// ===== Stages =====

export function getStages(): Stage[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveStage(stage: Stage): void {
  const stages = getStages()
  const idx = stages.findIndex((s) => s.id === stage.id)
  if (idx >= 0) {
    stages[idx] = stage
  } else {
    stages.unshift(stage)
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stages))
}

export function getStage(id: string): Stage | undefined {
  return getStages().find((s) => s.id === id)
}

export function deleteStage(id: string): void {
  const stages = getStages().filter((s) => s.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stages))
}

// ===== Custom Voices =====

export function getCustomVoices(): Voice[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(CUSTOM_VOICES_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveCustomVoice(voice: Voice): void {
  const voices = getCustomVoices()
  const idx = voices.findIndex((v) => v.id === voice.id)
  if (idx >= 0) {
    voices[idx] = voice
  } else {
    voices.push(voice)
  }
  localStorage.setItem(CUSTOM_VOICES_KEY, JSON.stringify(voices))
}

export function deleteCustomVoice(id: string): void {
  const voices = getCustomVoices().filter((v) => v.id !== id)
  localStorage.setItem(CUSTOM_VOICES_KEY, JSON.stringify(voices))
}

// ===== Custom Brains =====

export function getCustomBrains(): Brain[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(CUSTOM_BRAINS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveCustomBrain(brain: Brain): void {
  const brains = getCustomBrains()
  const idx = brains.findIndex((b) => b.id === brain.id)
  if (idx >= 0) {
    brains[idx] = brain
  } else {
    brains.push(brain)
  }
  localStorage.setItem(CUSTOM_BRAINS_KEY, JSON.stringify(brains))
}

export function deleteCustomBrain(id: string): void {
  const brains = getCustomBrains().filter((b) => b.id !== id)
  localStorage.setItem(CUSTOM_BRAINS_KEY, JSON.stringify(brains))
}

export function getAllBrains(): Brain[] {
  if (typeof window === 'undefined') return []
  return [...DEFAULT_BRAINS, ...getCustomBrains()]
}

export function getBrain(id: string): Brain | undefined {
  return getAllBrains().find((b) => b.id === id)
}

// ===== Utils =====

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

// ===== Data Models =====

export type AvatarColor =
  | 'cool'
  | 'warm'
  | 'green'
  | 'yellow'
  | 'purple'
  | 'orange'
  | 'teal'
  | 'rose'
  | 'indigo'

export interface Voice {
  id: string
  name: string
  soul: string
  color: AvatarColor
  brainId?: string // empty = use built-in default
}

export interface Brain {
  id: string
  name: string
  type: 'builtin' | 'custom'
  apiKey?: string
  endpoint?: string
  model?: string
}

export const BUILTIN_BRAIN: Brain = {
  id: 'builtin-deepseek',
  name: '心镜默认 (DeepSeek)',
  type: 'builtin',
}

export const DEFAULT_BRAINS: Brain[] = [BUILTIN_BRAIN]

export interface Message {
  role: 'assistant' | 'user'
  voiceId?: string
  content: string
  turn: number
  timestamp: number
}

export interface ChapterSummary {
  chapter: number
  summary: string           // 整章文字总结
  positions: Record<string, string[]> // voice.name → [观点1, 观点2, ...]
}

export interface Stage {
  id: string
  title?: string // auto-generated from background, for display
  background: string
  voices: Voice[]
  stances: Record<string, string> // voiceId → 该角色在本次对话中的立场
  messages: Message[]
  status: 'ongoing' | 'ended'
  act: number       // 当前幕次（从 1 开始）
  actMsgCount: number // 当前幕已完成的消息数（0-6）
  chapter: number   // 当前章次（从 1 开始，每 4 幕 +1）
  chapterSummaries: ChapterSummary[] // 已完成章节的总结
  createdAt: number
}

// ===== API Types =====

export interface ChatRequest {
  stage: Stage
  voiceId: string
  brain?: Brain
}

// ===== LocalStorage Keys =====

export const STORAGE_KEY = 'mindmirror-stages'
export const CUSTOM_VOICES_KEY = 'mindmirror-custom-voices'
export const CUSTOM_BRAINS_KEY = 'mindmirror-custom-brains'

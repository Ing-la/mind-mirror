// 预设引擎配置 — DeepSeek、千问、Kimi、智谱

export interface EnginePreset {
  name: string
  endpoint: string
  model: string
  apiKeyUrl: string
}

export const ENGINE_PRESETS: Record<string, EnginePreset> = {
  deepseek: {
    name: 'DeepSeek',
    endpoint: 'https://api.deepseek.com/chat/completions',
    model: 'deepseek-v4-flash',
    apiKeyUrl: 'https://platform.deepseek.com/api_keys',
  },
  qwen: {
    name: '千问',
    endpoint: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
    model: 'qwen-plus',
    apiKeyUrl: 'https://bailian.console.aliyun.com/',
  },
  kimi: {
    name: 'Kimi',
    endpoint: 'https://api.moonshot.cn/v1/chat/completions',
    model: 'moonshot-v1-auto',
    apiKeyUrl: 'https://platform.moonshot.cn/console/api-keys',
  },
  zhipu: {
    name: '智谱',
    endpoint: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
    model: 'glm-4-flash',
    apiKeyUrl: 'https://open.bigmodel.cn/usercenter/apikeys',
  },
}

export const ENGINE_PRESET_KEYS = Object.keys(ENGINE_PRESETS)

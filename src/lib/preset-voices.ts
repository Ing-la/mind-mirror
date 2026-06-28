import { Voice } from './types'

export const PRESET_VOICES: Voice[] = [
  {
    id: 'rational',
    name: '理性先生',
    soul: '冷静、逻辑、数据驱动，擅长分析利弊。说话有条理，喜欢列数据、做对比，倾向于用理性框架分析问题。',
    color: 'cool',
  },
  {
    id: 'impulsive',
    name: '冲动的伊格',
    soul: '热情、直觉、活在当下，讨厌后悔。说话有感染力，喜欢用感性打动对方，倾向于鼓励行动和尝试。',
    color: 'warm',
  },
  {
    id: 'blank',
    name: '空白',
    soul: '          ',
    color: 'indigo',
  },
  {
    id: 'dreamer',
    name: '梦想家露娜',
    soul: '理想主义，相信可能性，不被现实束缚。说话充满想象力，喜欢描绘美好愿景，倾向于追随内心和梦想。',
    color: 'yellow',
  },
]

export const DEFAULT_VOICES = [PRESET_VOICES[0], PRESET_VOICES[1]]

'use client'

import { AvatarColor } from '@/lib/types'

interface AvatarProps {
  color: AvatarColor
  size?: number
  name?: string
  className?: string
}

/* ── Types ── */

type EyeStyle = 'dot' | 'wide' | 'sparkle' | 'closed-in' | 'closed-up' | 'closed-down' | 'half' | 'line'
type FaceStyle = 'calm' | 'happy' | 'worried' | 'dreamy'
type DecoStyle = 'sparkle' | 'flutter'
type ShapeStyle = 'circle' | 'squircle'

interface CharConfig {
  name: string
  shape: ShapeStyle
  gradient: [string, string]
  glow: string
  eyeC: string
  mouthC: string
  face: FaceStyle
  eyes: EyeStyle
  blush: string | null
  blushOpacity?: number
  deco: DecoStyle
  freckles?: boolean
}

/* ── 9 characters ── */

const CHAR: Record<AvatarColor, CharConfig> = {
  warm: {
    name: '暖暖', shape: 'circle',
    gradient: ['#f5d6c6', '#e8bca8'],
    glow: '#dba8a8', eyeC: '#8a5a5a', mouthC: '#b07070',
    face: 'happy', eyes: 'wide',
    blush: '#e8a080', blushOpacity: 0.35,
    deco: 'flutter',
  },
  cool: {
    name: '凉凉', shape: 'squircle',
    gradient: ['#c8dce8', '#a0c0d4'],
    glow: '#8bb5c9', eyeC: '#4a6a7a', mouthC: '#6a8a9a',
    face: 'calm', eyes: 'closed-in',
    blush: null,
    deco: 'sparkle',
  },
  green: {
    name: '芽芽', shape: 'circle',
    gradient: ['#c8dcc0', '#a8c09c'],
    glow: '#a8c4a0', eyeC: '#5a7a4a', mouthC: '#7a9a68',
    face: 'worried', eyes: 'dot',
    blush: null,
    deco: 'sparkle',
  },
  yellow: {
    name: '星星', shape: 'circle',
    gradient: ['#f0e8c0', '#ddd09c'],
    glow: '#d4c878', eyeC: '#8a7a40', mouthC: '#b0a060',
    face: 'dreamy', eyes: 'sparkle',
    blush: '#d4a060', blushOpacity: 0.3,
    deco: 'flutter',
  },
  purple: {
    name: '灵灵', shape: 'squircle',
    gradient: ['#ddd0ed', '#c4b0d8'],
    glow: '#b898d0', eyeC: '#6a4a7a', mouthC: '#8a6a9a',
    face: 'calm', eyes: 'half',
    blush: null,
    deco: 'sparkle',
  },
  orange: {
    name: '乐乐', shape: 'squircle',
    gradient: ['#f5d0a8', '#e8bc88'],
    glow: '#d4a878', eyeC: '#8a6a3a', mouthC: '#9a7a50',
    face: 'happy', eyes: 'wide',
    blush: '#d09060', blushOpacity: 0.35,
    deco: 'flutter', freckles: true,
  },
  teal: {
    name: '悠悠', shape: 'circle',
    gradient: ['#b8ddd8', '#94c4be'],
    glow: '#88b8b0', eyeC: '#3a6a5a', mouthC: '#5a8a78',
    face: 'worried', eyes: 'closed-down',
    blush: null,
    deco: 'sparkle',
  },
  rose: {
    name: '朵朵', shape: 'circle',
    gradient: ['#f2c8d4', '#e0b0c0'],
    glow: '#c898a8', eyeC: '#7a4a5a', mouthC: '#9a6070',
    face: 'dreamy', eyes: 'closed-up',
    blush: '#d08090', blushOpacity: 0.35,
    deco: 'flutter',
  },
  indigo: {
    name: '深深', shape: 'squircle',
    gradient: ['#b8bcd8', '#98a0c4'],
    glow: '#8898b8', eyeC: '#3a4a6a', mouthC: '#586890',
    face: 'calm', eyes: 'line',
    blush: null,
    deco: 'sparkle',
  },
}

/* ── Background shape ── */

function BackgroundShape({ shape, gradientId, s, half }: {
  shape: ShapeStyle; gradientId: string; s: number; half: number
}) {
  if (shape === 'circle') {
    return <circle cx={half} cy={half} r={half * 0.85} fill={`url(#${gradientId})`} />
  }

  if (shape === 'squircle') {
    const pad = s * 0.13
    const size = s * 0.74
    return (
      <rect
        x={pad} y={pad}
        width={size} height={size}
        rx={s * 0.18} ry={s * 0.18}
        fill={`url(#${gradientId})`}
      />
    )
  }

  return null
}

/* ── Mouth ── */

function Mouth({ c, face, s, half, eyeY, faceR }: {
  c: string; face: FaceStyle; s: number; half: number; eyeY: number; faceR: number
}) {
  const sw = s * 0.04
  const y = eyeY + faceR * 0.35
  if (face === 'happy') {
    const d = `M ${half - faceR * 0.25} ${y - 0.05 * faceR} Q ${half} ${y + 0.3 * faceR} ${half + faceR * 0.25} ${y - 0.05 * faceR}`
    return <path d={d} fill="none" stroke={c} strokeWidth={sw * 1.2} strokeLinecap="round" />
  }
  if (face === 'worried') {
    const d = `M ${half - faceR * 0.18} ${y + 0.1 * faceR} Q ${half} ${y - 0.12 * faceR} ${half + faceR * 0.18} ${y + 0.1 * faceR}`
    return <path d={d} fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round" />
  }
  if (face === 'dreamy') {
    const d = `M ${half - faceR * 0.2} ${y} Q ${half} ${y + 0.2 * faceR} ${half + faceR * 0.2} ${y}`
    return <path d={d} fill={c} opacity={0.65} />
  }
  // calm
  const d = `M ${half - faceR * 0.18} ${y} Q ${half} ${y + 0.12 * faceR} ${half + faceR * 0.18} ${y}`
  return <path d={d} fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round" />
}

/* ── Eyes ── */

function Eyes({ style, c, half, eyeSpacing, eyeY, eyeR, s }: {
  style: EyeStyle; c: string; half: number; eyeSpacing: number; eyeY: number; eyeR: number; s: number
}) {
  const sw = Math.max(s * 0.035, 1.5)

  if (style === 'dot') {
    return (
      <>
        <circle cx={half - eyeSpacing} cy={eyeY} r={eyeR} fill={c} />
        <circle cx={half + eyeSpacing} cy={eyeY} r={eyeR} fill={c} />
      </>
    )
  }

  if (style === 'wide') {
    const r = eyeR * 1.3
    const hl = r * 0.35
    return (
      <>
        <circle cx={half - eyeSpacing} cy={eyeY} r={r} fill={c} />
        <circle cx={half - eyeSpacing + hl} cy={eyeY - hl} r={r * 0.35} fill="rgba(255,255,255,0.7)" />
        <circle cx={half + eyeSpacing} cy={eyeY} r={r} fill={c} />
        <circle cx={half + eyeSpacing + hl} cy={eyeY - hl} r={r * 0.35} fill="rgba(255,255,255,0.7)" />
      </>
    )
  }

  if (style === 'sparkle') {
    const r = eyeR * 1.2
    const makeStar = (cx: number, cy: number) => {
      const p: string[] = []
      for (let i = 0; i < 8; i++) {
        const a = (Math.PI / 4) * i - Math.PI / 2
        const rad = i % 2 === 0 ? r : r * 0.35
        p.push(`${cx + Math.cos(a) * rad},${cy + Math.sin(a) * rad}`)
      }
      return p.join(' ')
    }
    return (
      <>
        <polygon points={makeStar(half - eyeSpacing, eyeY)} fill={c} />
        <polygon points={makeStar(half + eyeSpacing, eyeY)} fill={c} />
      </>
    )
  }

  if (style === 'closed-in') {
    const r = eyeR * 2.5
    const dL = `M ${half - eyeSpacing - r} ${eyeY + r * 0.2} Q ${half - eyeSpacing} ${eyeY - r * 0.8} ${half - eyeSpacing + r} ${eyeY + r * 0.2}`
    const dR = `M ${half + eyeSpacing - r} ${eyeY + r * 0.2} Q ${half + eyeSpacing} ${eyeY - r * 0.8} ${half + eyeSpacing + r} ${eyeY + r * 0.2}`
    return (
      <>
        <path d={dL} fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round" />
        <path d={dR} fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round" />
      </>
    )
  }

  if (style === 'closed-up') {
    const r = eyeR * 2.5
    const dL = `M ${half - eyeSpacing - r} ${eyeY - r * 0.2} Q ${half - eyeSpacing} ${eyeY + r * 0.8} ${half - eyeSpacing + r} ${eyeY - r * 0.2}`
    const dR = `M ${half + eyeSpacing - r} ${eyeY - r * 0.2} Q ${half + eyeSpacing} ${eyeY + r * 0.8} ${half + eyeSpacing + r} ${eyeY - r * 0.2}`
    return (
      <>
        <path d={dL} fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round" />
        <path d={dR} fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round" />
      </>
    )
  }

  if (style === 'closed-down') {
    const r = eyeR * 2.5
    const dL = `M ${half - eyeSpacing - r} ${eyeY + r * 0.2} Q ${half - eyeSpacing} ${eyeY - r * 0.8} ${half - eyeSpacing + r} ${eyeY + r * 0.2}`
    const dR = `M ${half + eyeSpacing - r} ${eyeY + r * 0.2} Q ${half + eyeSpacing} ${eyeY - r * 0.8} ${half + eyeSpacing + r} ${eyeY + r * 0.2}`
    return (
      <>
        <path d={dL} fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round" />
        <path d={dR} fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round" />
      </>
    )
  }

  if (style === 'half') {
    const r = eyeR * 2.2
    const dL = `M ${half - eyeSpacing - r} ${eyeY} A ${r} ${r} 0 0 0 ${half - eyeSpacing + r} ${eyeY}`
    const dR = `M ${half + eyeSpacing - r} ${eyeY} A ${r} ${r} 0 0 0 ${half + eyeSpacing + r} ${eyeY}`
    return (
      <>
        <path d={dL} fill="none" stroke={c} strokeWidth={sw * 0.8} strokeLinecap="round" />
        <path d={dR} fill="none" stroke={c} strokeWidth={sw * 0.8} strokeLinecap="round" />
      </>
    )
  }

  // line
  const r = eyeR * 2.2
  return (
    <>
      <line x1={half - eyeSpacing - r} y1={eyeY} x2={half - eyeSpacing + r} y2={eyeY} stroke={c} strokeWidth={sw} strokeLinecap="round" />
      <line x1={half + eyeSpacing - r} y1={eyeY} x2={half + eyeSpacing + r} y2={eyeY} stroke={c} strokeWidth={sw} strokeLinecap="round" />
    </>
  )
}

/* ── Eyebrows ── */

function Eyebrows({ color, half, s, eyeSpacing, eyeY }: {
  color: AvatarColor; half: number; s: number; eyeSpacing: number; eyeY: number
}) {
  const browY = eyeY - s * 0.08
  const span = eyeSpacing * 0.8
  const sw = Math.max(s * 0.025, 1)

  switch (color) {
    case 'green': {
      const c = '#7a9a68'
      return (
        <g opacity={0.5}>
          <line x1={half - eyeSpacing - span} y1={browY + s * 0.015} x2={half - eyeSpacing + span} y2={browY - s * 0.01} stroke={c} strokeWidth={sw} strokeLinecap="round" />
          <line x1={half + eyeSpacing - span} y1={browY - s * 0.01} x2={half + eyeSpacing + span} y2={browY + s * 0.015} stroke={c} strokeWidth={sw} strokeLinecap="round" />
        </g>
      )
    }
    case 'indigo': {
      const c = '#586890'
      return (
        <g opacity={0.4}>
          <line x1={half - eyeSpacing - span} y1={browY} x2={half - eyeSpacing + span} y2={browY} stroke={c} strokeWidth={sw} strokeLinecap="round" />
          <line x1={half + eyeSpacing - span} y1={browY} x2={half + eyeSpacing + span} y2={browY} stroke={c} strokeWidth={sw} strokeLinecap="round" />
        </g>
      )
    }
    default:
      return null
  }
}

/* ── Main ── */

export default function Avatar({ color, size = 48, name, className = '' }: AvatarProps) {
  const cfg = CHAR[color]
  const s = size
  const half = s / 2
  const faceR = s * 0.30
  const faceY = half + s * 0.04
  const eyeY = faceY - faceR * 0.08
  const eyeSpacing = faceR * 0.38
  const eyeR = Math.max(s * 0.045, 2)
  const gradientId = `bg-${color}-${s}`
  const glowId = `glow-${color}-${s}`

  return (
    <svg
      width={s}
      height={s}
      viewBox={`0 0 ${s} ${s}`}
      className={`shrink-0 ${className}`}
      role="img"
      aria-label={name || cfg.name || color}
    >
      <defs>
        <radialGradient id={gradientId} cx="38%" cy="30%">
          <stop offset="0%" stopColor={cfg.gradient[0]} />
          <stop offset="100%" stopColor={cfg.gradient[1]} />
        </radialGradient>
        <filter id={glowId}>
          <feGaussianBlur stdDeviation={s * 0.07} result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Glow aura (always circular) */}
      <circle cx={half} cy={half} r={half * 0.72} fill={cfg.glow} opacity={0.18} filter={`url(#${glowId})`} />

      {/* Background shape */}
      <BackgroundShape shape={cfg.shape} gradientId={gradientId} s={s} half={half} />

      {/* Face */}
      <circle cx={half} cy={faceY} r={faceR} fill="rgba(255,255,255,0.82)" />

      {/* Eyebrows */}
      <Eyebrows color={color} half={half} s={s} eyeSpacing={eyeSpacing} eyeY={eyeY} />

      {/* Eyes */}
      <Eyes style={cfg.eyes} c={cfg.eyeC} half={half} eyeSpacing={eyeSpacing} eyeY={eyeY} eyeR={eyeR} s={s} />

      {/* Blush */}
      {cfg.blush && (
        <>
          <circle cx={half - eyeSpacing - faceR * 0.05} cy={eyeY + faceR * 0.28} r={faceR * 0.15} fill={cfg.blush} opacity={cfg.blushOpacity ?? 0.35} />
          <circle cx={half + eyeSpacing + faceR * 0.05} cy={eyeY + faceR * 0.28} r={faceR * 0.15} fill={cfg.blush} opacity={cfg.blushOpacity ?? 0.35} />
        </>
      )}

      {/* Freckles (乐乐 only) */}
      {cfg.freckles && (
        <>
          <circle cx={half - eyeSpacing - faceR * 0.15} cy={eyeY + faceR * 0.18} r={Math.max(s * 0.015, 0.8)} fill={cfg.eyeC} opacity={0.35} />
          <circle cx={half - eyeSpacing - faceR * 0.25} cy={eyeY + faceR * 0.25} r={Math.max(s * 0.015, 0.8)} fill={cfg.eyeC} opacity={0.35} />
          <circle cx={half - eyeSpacing - faceR * 0.18} cy={eyeY + faceR * 0.35} r={Math.max(s * 0.015, 0.8)} fill={cfg.eyeC} opacity={0.35} />
          <circle cx={half + eyeSpacing + faceR * 0.15} cy={eyeY + faceR * 0.18} r={Math.max(s * 0.015, 0.8)} fill={cfg.eyeC} opacity={0.35} />
          <circle cx={half + eyeSpacing + faceR * 0.25} cy={eyeY + faceR * 0.25} r={Math.max(s * 0.015, 0.8)} fill={cfg.eyeC} opacity={0.35} />
          <circle cx={half + eyeSpacing + faceR * 0.18} cy={eyeY + faceR * 0.35} r={Math.max(s * 0.015, 0.8)} fill={cfg.eyeC} opacity={0.35} />
        </>
      )}

      {/* Mouth */}
      <Mouth c={cfg.mouthC} face={cfg.face} s={s} half={half} eyeY={eyeY} faceR={faceR} />

      {/* Decorative dots */}
      {cfg.deco === 'sparkle' && (
        <>
          <circle cx={half + faceR * 0.7} cy={half - faceR * 0.65} r={s * 0.03} fill={cfg.glow} opacity={0.4} />
          <circle cx={half + faceR * 0.85} cy={half - faceR * 0.4} r={s * 0.025} fill={cfg.glow} opacity={0.3} />
        </>
      )}
      {cfg.deco === 'flutter' && (
        <>
          <circle cx={half - faceR * 0.7} cy={half - faceR * 0.5} r={s * 0.035} fill={cfg.glow} opacity={0.3} />
          <circle cx={half - faceR * 0.5} cy={half - faceR * 0.75} r={s * 0.025} fill={cfg.glow} opacity={0.25} />
        </>
      )}
    </svg>
  )
}

'use client'

import { useRef, useCallback } from 'react'
import { AvatarColor } from '@/lib/types'

interface AvatarProps {
  color: AvatarColor
  size?: number
  name?: string
  className?: string
}

/* ── Avatar SVG definitions (all viewBox="0 0 100 100") ── */

interface AvatarDef {
  shadowBg: string
  shadowRotate: number
  shadowTranslate?: [number, number]
  imgRotate: number
  imgFilter: boolean          // use torn-medium on img layer?
  shadowFilter: boolean       // use torn-heavy on shadow layer?
  hoverShadow: string
  hoverImg: string
  // 额外 hover 效果（补齐原始 HTML 中的缺失动画）
  hoverShadowBg?: string       // 阴影悬停背景色
  hoverShadowOpacity?: number  // 阴影悬停透明度
  hoverImgAnimation?: string   // img 层 keyframe 动画（替代 hoverImg）
  hoverImgFilter?: string      // img 层悬停滤镜
  render: React.ReactNode
}

const DEFS: Record<AvatarColor, AvatarDef> = {
  /* cool → 理性 (grid & diamond) */
  cool: {
    shadowBg: '#cc665c', shadowRotate: -6, shadowFilter: true,
    imgRotate: 2, imgFilter: true,
    hoverShadow: 'rotate(4deg) translate(-4px, -4px)',
    hoverImg: 'rotate(-4deg) scale(1.08)',
    render: (
      <>
        <rect width="100" height="100" fill="#1e2421" />
        {[10,30,50,70,90].map(x => <line key={x} x1={x} y1={0} x2={x} y2={100} stroke="rgba(141,164,153,0.15)" strokeWidth={0.5} />)}
        {[20,40,60,80].map(y => <line key={y} x1={0} y1={y} x2={100} y2={y} stroke="rgba(141,164,153,0.15)" strokeWidth={0.5} />)}
        <path d="M30,25 L65,15 L75,45 L40,50 Z" fill="#e6dfd3" opacity={0.9} />
        <path d="M35,53 L78,48 L70,85 L25,75 Z" fill="#dcd5c9" opacity={0.85} />
        <line x1={15} y1={85} x2={85} y2={15} stroke="#cc665c" strokeWidth={1.5} />
        <circle cx={85} cy={15} r={3} fill="#cc665c" />
      </>
    ),
  },

  /* warm → 冲动 (red triangles) */
  warm: {
    shadowBg: '#1e2421', shadowRotate: 8, shadowFilter: true,
    imgRotate: -3, imgFilter: true,
    hoverShadow: 'rotate(-4deg) translate(4px, -4px)',
    hoverImg: 'rotate(6deg) scale(1.08)',
    render: (
      <>
        <rect width="100" height="100" fill="#4a1c18" />
        <polygon points="10,20 90,10 80,80 30,90" fill="#aa443c" opacity={0.6} />
        <polygon points="25,5 95,30 70,95 5,60" fill="#cc665c" opacity={0.8} />
        <polygon points="35,35 75,25 65,75 20,65" fill="#e6dfd3" opacity={0.9} />
        <path d="M40,40 Q30,60 55,55 Q70,40 50,45 Q45,30 40,40 Z" fill="#1e2421" />
      </>
    ),
  },

  /* green → 焦虑 (circles & crosshatch) */
  green: {
    shadowBg: '#1e2421', shadowRotate: -8, shadowFilter: true,
    imgRotate: 3, imgFilter: true,
    hoverShadow: 'rotate(6deg) translate(-6px, 4px)',
    hoverImg: 'rotate(-4deg) scale(1.06)',
    render: (
      <>
        <rect width="100" height="100" fill="#4e5451" />
        <circle cx={50} cy={50} r={28} fill="#2d302f" opacity={0.5} />
        <path d="M30,50 Q45,15 60,35 T40,75 T75,50 T32,38 T68,68 T50,25 Z" fill="none" stroke="#1e2421" strokeWidth={1.8} strokeLinecap="round" />
        <path d="M40,35 Q68,20 55,65 T25,50 T75,40 T45,70 Z" fill="none" stroke="#1e2421" strokeWidth={1.2} strokeLinecap="round" />
        <path d="M32,60 L68,46 M35,44 L65,62" stroke="#bfa37a" strokeWidth={5} opacity={0.85} strokeLinecap="square" />
      </>
    ),
  },

  /* yellow → 完美 (precise circle & cross) — 阴影变红色 */
  yellow: {
    shadowBg: '#333', shadowRotate: 0, shadowFilter: true,
    imgRotate: 0, imgFilter: true,
    hoverShadow: 'translate(4px, 4px)',
    hoverImg: 'scale(1.04)',
    hoverShadowBg: '#cc665c',
    render: (
      <>
        <rect width="100" height="100" fill="#191c1a" />
        <circle cx={50} cy={50} r={28} fill="none" stroke="#e6dfd3" strokeWidth={0.7} opacity={0.8} />
        <line x1={50} y1={10} x2={50} y2={90} stroke="#e6dfd3" strokeWidth={0.4} opacity={0.5} />
        <line x1={10} y1={50} x2={90} y2={50} stroke="#e6dfd3" strokeWidth={0.4} opacity={0.5} />
        <line x1={50} y1={28} x2={50} y2={72} stroke="#cc665c" strokeWidth={2} />
        <circle cx={50} cy={28} r={2} fill="#cc665c" />
        <polygon points="78,-1 101,-1 101,22" fill="#354230" />
        <line x1={78} y1={0} x2={101} y2={23} stroke="#1e2421" strokeWidth={1} />
      </>
    ),
  },

  /* purple → 逃避 (muted geometric stacks) — 加灰度/透明度 */
  purple: {
    shadowBg: '#3d4540', shadowRotate: 8, shadowTranslate: [2, 4], shadowFilter: true,
    imgRotate: -3, imgFilter: true,
    hoverShadow: 'rotate(12deg) translate(6px, 12px)',
    hoverImg: 'rotate(-6deg) translate(-2px, 8px)',
    hoverShadowOpacity: 0.3,
    hoverImgFilter: 'url(#torn-medium) grayscale(0.3)',
    render: (
      <>
        <rect width="100" height="100" fill="#545e56" />
        <circle cx={50} cy={45} r={20} fill="#e6dfd3" opacity={0.18} />
        <path d="M28,85 Q28,66 50,66 T72,85 Z" fill="#e6dfd3" opacity={0.12} />
        <polygon points="-5,20 105,24 105,42 -5,38" fill="#bfa37a" opacity={0.55} />
        <polygon points="8,15 95,72 88,85 -2,28" fill="#a68a64" opacity={0.6} />
        <polygon points="55,52 88,48 92,68 60,72" fill="#bfa37a" opacity={0.45} />
        <circle cx={35} cy={30} r={1} fill="#fff" opacity={0.3} />
        <circle cx={68} cy={60} r={1.5} fill="#fff" opacity={0.2} />
      </>
    ),
  },

  /* orange → 天真顽童 (cute child, no torn) */
  orange: {
    shadowBg: '#1e2421', shadowRotate: -3, shadowFilter: false,
    imgRotate: 2, imgFilter: false,
    hoverShadow: 'rotate(-6deg) translate(-2px, 4px)',
    hoverImg: 'translateY(-6px) rotate(6deg) scale(1.05)',
    render: (
      <>
        <rect width="100" height="100" fill="#cc665c" />
        <path d="M30,85 C25,60 20,35 45,25 C70,15 85,35 80,60 C78,75 75,85 75,85 Z" fill="#e6dfd3" />
        <path d="M45,25 Q40,12 48,8 Q48,18 45,25" fill="#1e2421" />
        <g fill="none" stroke="#1e2421" strokeWidth={2} strokeLinecap="round">
          <path d="M38,42 Q44,38 46,44" />
          <path d="M58,40 Q64,36 66,42" />
          <circle cx={51} cy={52} r={1.5} fill="#1e2421" />
        </g>
        <polygon points="32,48 40,50 38,56 30,54" fill="#cc665c" opacity={0.6} />
        <polygon points="66,46 74,48 72,54 64,52" fill="#cc665c" opacity={0.6} />
      </>
    ),
  },

  /* teal → 激萌精灵 (spirit bounce animation) */
  teal: {
    shadowBg: '#cc665c', shadowRotate: -5, shadowTranslate: [-4, 4], shadowFilter: false,
    imgRotate: 2, imgFilter: false,
    hoverShadow: 'rotate(-5deg) translate(-4px, 4px)',
    hoverImg: '', // not used — uses animation instead
    hoverImgAnimation: 'spirit-bounce 0.6s ease-in-out infinite alternate',
    render: (
      <>
        <rect width="100" height="100" fill="#1e2421" />
        <path d="M30,85 C22,60 25,30 50,25 C75,20 82,45 78,70 C76,80 72,85 72,85 Z" fill="#e6dfd3" />
        <g fill="none" stroke="#1e2421" strokeWidth={2.5} strokeLinecap="round">
          <path d="M35,42 L43,45 L36,49" />
        </g>
        <polygon points="62,36 65,43 72,43 67,48 69,55 63,51 57,55 59,48 54,43 61,43" fill="#cc665c" />
        <path d="M43,58 Q47,62 50,58 Q53,62 57,58" fill="none" stroke="#1e2421" strokeWidth={2.5} strokeLinecap="round" />
        <circle cx={33} cy={53} r={5} fill="#cc665c" opacity={0.5} />
      </>
    ),
  },

  /* rose → 碎裂哭泣 (tremble animation) */
  rose: {
    shadowBg: '#1e2421', shadowRotate: 4, shadowTranslate: [4, 4], shadowFilter: false,
    imgRotate: -2, imgFilter: false,
    hoverShadow: 'rotate(4deg) translate(4px, 4px)',
    hoverImg: '', // not used — uses animation instead
    hoverImgAnimation: 'weeping-tremble 0.15s linear infinite',
    render: (
      <>
        <rect width="100" height="100" fill="#4d5750" />
        <path d="M20,95 Q25,45 50,45 Q75,45 80,95 Z" fill="#1e2421" opacity={0.35} />
        <path d="M28,54 Q38,46 44,56" fill="none" stroke="#e6dfd3" strokeWidth={2} opacity={0.7} strokeLinecap="round" />
        <path d="M56,56 Q62,46 72,54" fill="none" stroke="#e6dfd3" strokeWidth={2} opacity={0.7} strokeLinecap="round" />
        <path d="M46,72 Q50,66 54,72" fill="none" stroke="#e6dfd3" strokeWidth={2} strokeLinecap="round" />
        <polygon points="33,58 39,58 37,100 31,100" fill="#e6dfd3" />
        <polygon points="61,58 67,58 69,100 63,100" fill="#e6dfd3" />
      </>
    ),
  },

  /* indigo → 爆裂怒火 (rage jitter animation + 阴影变色) */
  indigo: {
    shadowBg: '#e6dfd3', shadowRotate: -6, shadowTranslate: [-2, -2], shadowFilter: false,
    imgRotate: 3, imgFilter: false,
    hoverShadow: 'scale(1.15) rotate(12deg)',
    hoverShadowBg: '#1e2421',
    hoverImg: '', // not used — uses animation instead
    hoverImgAnimation: 'rage-jitter 0.08s linear infinite',
    render: (
      <>
        <rect width="100" height="100" fill="#cc665c" />
        <path d="M10,95 L25,65 L12,50 L38,45 L25,12 L52,32 L72,8 L72,40 L92,32 L80,68 L92,95 Z" fill="#1e2421" />
        <polygon points="28,46 46,51 44,56 26,50" fill="#e6dfd3" />
        <polygon points="72,46 54,51 56,56 74,50" fill="#e6dfd3" />
        <polygon points="38,68 62,66 60,76 40,78" fill="#e6dfd3" />
        <line x1={38} y1={72} x2={62} y2={70} stroke="#1e2421" strokeWidth={1.5} />
        <line x1={50} y1={67} x2={50} y2={77} stroke="#1e2421" strokeWidth={1} />
      </>
    ),
  },
}

/* ── Component ── */

export default function Avatar({ color, size = 48, className = '' }: AvatarProps) {
  const def = DEFS[color]
  const shadowRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLDivElement>(null)

  const handleEnter = useCallback(() => {
    const s = shadowRef.current
    const i = imgRef.current
    if (s) {
      s.style.transform = def.hoverShadow
      if (def.hoverShadowBg) s.style.backgroundColor = def.hoverShadowBg
      if (def.hoverShadowOpacity !== undefined) s.style.opacity = String(def.hoverShadowOpacity)
    }
    if (i) {
      if (def.hoverImgAnimation) {
        i.style.animation = def.hoverImgAnimation
        i.style.transform = ''
      } else {
        i.style.animation = ''
        i.style.transform = def.hoverImg
      }
      if (def.hoverImgFilter) i.style.filter = def.hoverImgFilter
    }
  }, [def])

  const handleLeave = useCallback(() => {
    const s = shadowRef.current
    const i = imgRef.current
    if (s) {
      const tx = def.shadowTranslate?.[0] ?? 0
      const ty = def.shadowTranslate?.[1] ?? 0
      s.style.transform = `rotate(${def.shadowRotate}deg) translate(${tx}px, ${ty}px)`
      s.style.backgroundColor = def.shadowBg
      if (def.hoverShadowOpacity !== undefined) s.style.opacity = ''
    }
    if (i) {
      i.style.animation = ''
      i.style.transform = `rotate(${def.imgRotate}deg)`
      if (def.hoverImgFilter) i.style.filter = def.imgFilter ? 'url(#torn-medium)' : 'none'
    }
  }, [def])

  const tx = def.shadowTranslate?.[0] ?? 0
  const ty = def.shadowTranslate?.[1] ?? 0

  return (
    <>
      {/* 关键帧动画定义 */}
      <style>{`
        @keyframes spirit-bounce {
          0% { transform: translateY(0) rotate(2deg) scale(1); }
          100% { transform: translateY(-8px) rotate(-4deg) scale(1.06); }
        }
        @keyframes weeping-tremble {
          0% { transform: translate(1px, 1px) rotate(-2deg); }
          25% { transform: translate(-1px, -1px) rotate(-1.5deg); }
          50% { transform: translate(-1px, 1px) rotate(-2.5deg); }
          75% { transform: translate(1px, -1px) rotate(-2deg); }
          100% { transform: translate(1px, 1px) rotate(-2deg); }
        }
        @keyframes rage-jitter {
          0% { transform: scale(1.1) translate(2px, -2px) rotate(4deg); }
          50% { transform: scale(1.1) translate(-3px, 2px) rotate(-2deg); }
          100% { transform: scale(1.1) translate(1px, -1px) rotate(5deg); }
        }
      `}</style>
      <div
        className={`shrink-0 relative ${className}`}
        style={{ width: size, height: size, cursor: 'pointer' }}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
      >
        {/* Shadow layer */}
        <div
          ref={shadowRef}
          style={{
            position: 'absolute', top: Math.max(3, size * 0.05), left: Math.max(-3, size * -0.05),
            width: '100%', height: '100%',
            background: def.shadowBg,
            transform: `rotate(${def.shadowRotate}deg) translate(${tx}px, ${ty}px)`,
            transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.3s, opacity 0.3s',
            zIndex: 1,
            filter: def.shadowFilter ? 'url(#torn-heavy)' : 'none',
          }}
        />

        {/* Image/SVG layer */}
        <div
          ref={imgRef}
          style={{
            position: 'absolute', top: 0, left: 0,
            width: '100%', height: '100%',
            overflow: 'hidden',
            transform: `rotate(${def.imgRotate}deg)`,
            transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), filter 0.3s',
            zIndex: 2,
            filter: def.imgFilter ? 'url(#torn-medium)' : 'none',
          }}
        >
          <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', display: 'block' }}>
            {def.render}
          </svg>
        </div>
      </div>
    </>
  )
}

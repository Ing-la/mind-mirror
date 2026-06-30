'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getStages, deleteStage } from '@/lib/store'

export default function HomePage() {
  const router = useRouter()
  const stageRef = useRef<HTMLDivElement>(null)
  const hostsRef = useRef<(HTMLDivElement | null)[]>([])
  const brandRef = useRef<HTMLDivElement>(null)
  const [showHistory, setShowHistory] = useState(false)
  const [recordsList, setRecordsList] = useState<Array<{id:string;title:string;badge:string;date:string;count:number}>>([])

  useEffect(() => {
    if (!showHistory) return
    const stages = getStages()
    setRecordsList(stages
      .filter(s => s.status === 'ended' || s.messages.length > 0)
      .sort((a, b) => b.createdAt - a.createdAt)
      .map(s => ({
        id: s.id,
        title: s.title || s.background || '未命名对话',
        badge: s.voices.map(v => v.name).join(' · '),
        date: new Date(s.createdAt).toLocaleDateString('zh-CN'),
        count: s.messages.length,
      }))
    )
  }, [showHistory])

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    const hosts = hostsRef.current.filter(Boolean) as HTMLDivElement[]
    const brand = brandRef.current

    const handleMouseMove = (e: MouseEvent) => {
      const X = (e.clientX - window.innerWidth / 2) / 120
      const Y = (e.clientY - window.innerHeight / 2) / 120

      if (hosts[0]) hosts[0].style.transform = `translate(${X * 1.2}px, ${Y * 1.2}px)`
      if (hosts[1]) hosts[1].style.transform = `translate(${X * -0.8}px, ${Y * -1.5}px)`
      if (hosts[2]) hosts[2].style.transform = `translate(${X * 0.4}px, ${Y * 0.6}px)`
      if (brand) brand.style.transform = `translate(${X * -0.2}px, ${Y * -0.2}px) rotate(-3deg)`
    }

    const handleMouseLeave = () => {
      hosts.forEach(h => { if (h) h.style.transform = '' })
      if (brand) brand.style.transform = 'rotate(-3deg)'
    }

    window.addEventListener('mousemove', handleMouseMove)
    stage.addEventListener('mouseleave', handleMouseLeave)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      stage.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  return (
    <>
      <style>{`
        .home-redesign {
          --bg-canvas: #354230;
          --color-冲动: #cc665c;
          --color-理性: #1e2421;
          --color-记忆: #e6dfd3;
        }
        .home-redesign * { margin:0; padding:0; box-sizing:border-box; user-select:none; }
        .home-redesign {
          background:var(--bg-canvas); min-height:100vh; overflow:hidden;
          font-family:'PingFang SC','Hiragino Sans GB',sans-serif;
          position:relative; display:flex; justify-content:center; align-items:center;
        }

        .home-redesign .mindscape-stage {
          position:relative; width:90vw; height:85vh; max-width:1400px;
          display:grid; grid-template-columns:repeat(12,1fr); grid-template-rows:repeat(12,1fr); z-index:10;
        }
        .home-redesign .motion-host {
          position:relative; width:100%; height:100%;
          transition:transform .6s cubic-bezier(.16,1,.3,1); will-change:transform; cursor:pointer;
        }
        .home-redesign .art-bg {
          position:absolute; top:0; left:0; width:100%; height:100%;
          filter:url(#torn-heavy); z-index:1; backface-visibility:hidden;
        }
        .home-redesign .art-content {
          position:relative; z-index:2; width:100%; height:100%;
          display:flex; flex-direction:column;
        }
        .home-redesign .host-summon { grid-area:2/1/10/8; z-index:5; }
        .home-redesign .skin-summon-bg {
          background:var(--color-冲动); clip-path:polygon(0% 14%,100% 0%,86% 100%,4% 88%);
          mix-blend-mode:multiply; transition:clip-path .4s;
        }
        .home-redesign .host-summon:hover .skin-summon-bg { clip-path:polygon(0% 5%,96% 0%,91% 100%,8% 93%); }
        .home-redesign .host-summon .art-content { padding:12% 14% 10% 10%; color:var(--color-记忆); }
        .home-redesign .host-manage { grid-area:1/7/7/13; z-index:4; }
        .home-redesign .skin-manage-bg {
          background:var(--color-理性); clip-path:polygon(8% 0%,100% 9%,91% 91%,0% 81%);
          transition:background-color .4s;
        }
        .home-redesign .host-manage:hover .skin-manage-bg { background:#151917; }
        .home-redesign .host-manage .art-content { padding:10% 10% 10% 15%; color:#8da499; }
        .home-redesign .host-history { grid-area:7/5/13/12; z-index:3; }
        .home-redesign .skin-history-bg {
          background:var(--color-记忆); clip-path:polygon(2% 7%,98% 0%,100% 88%,0% 98%);
        }
        .home-redesign .host-history .art-content { padding:4% 8% 6% 22%; color:#333; justify-content:space-between; }
        .home-redesign .action-title {
          font-size:calc(1.34rem + 1vw); font-weight:900; letter-spacing:-1px; margin-bottom:14px;
          display:flex; align-items:center; justify-content:space-between; filter:url(#torn-title);
        }
        .home-redesign .action-title span { font-size:2.9vw; opacity:.15; font-family:serif; filter:none; }
        .home-redesign .action-desc { font-size:.88rem; line-height:1.75; font-weight:400; filter:url(#torn-light); }
        .home-redesign .host-history .action-title { color:#1a1a1a; margin-bottom:8px; display:flex; justify-content:center; align-items:center; position:relative; }
        .home-redesign .host-history .action-title span { position:absolute; right:0; top:50%; transform:translateY(-50%); font-size:3.35vw; opacity:.2; line-height:0.8; }
        .home-redesign .history-stack-container { position:relative; width:100%; height:165px; margin-top:10px; }
        .home-redesign .paper-layer { position:absolute; width:100%; height:100%; transition:all .4s cubic-bezier(.16,1,.3,1); }
        .home-redesign .paper-layer-bg { position:absolute; top:0; left:0; width:100%; height:100%; filter:url(#torn-heavy); z-index:1; border:1px solid rgba(0,0,0,.05); }
        .home-redesign .paper-layer-content { position:relative; z-index:2; width:100%; height:100%; padding:20px 24px; filter:url(#torn-light); overflow:hidden; }
        .home-redesign .layer-1 .paper-layer-bg { background:#fff; box-shadow:5px 5px 15px rgba(0,0,0,.05); }
        .home-redesign .layer-1 { transform:rotate(-1deg); z-index:3; }
        .home-redesign .layer-2 .paper-layer-bg { background:#eae4d8; }
        .home-redesign .layer-2 { transform:rotate(2deg) translate(5px,6px); z-index:2; }
        .home-redesign .layer-3 .paper-layer-bg { background:#dfd7c8; }
        .home-redesign .layer-3 { transform:rotate(-3deg) translate(-4px,12px); z-index:1; }
        .home-redesign .host-history:hover .layer-1 { transform:rotate(-2.5deg) translate(-2px,-8px); }
        .home-redesign .host-history:hover .layer-2 { transform:rotate(4deg) translate(12px,10px); }
        .home-redesign .host-history:hover .layer-3 { transform:rotate(-5deg) translate(-10px,22px); }
        .home-redesign .layer-1 h4 { font-size:.96rem; color:#111; margin-bottom:6px; font-weight:800; line-height:1.5; }
        .home-redesign .layer-1 p { font-size:.75rem; color:#556; line-height:1.6; font-weight:400; }
        .home-redesign .latest-badge { display:inline-block; font-size:.59rem; background:var(--color-冲动); color:#fff; padding:2px 6px; margin-bottom:6px; font-weight:bold; }
        .home-redesign .stack-meta { margin-top:10px; font-size:.67rem; color:#888; }
        .home-redesign .tape-more-btn { position:absolute; bottom:22px; right:35px; z-index:100; cursor:pointer; transform:rotate(-4deg); transition:all .3s; pointer-events:none; }
        .home-redesign .tape-btn-bg { position:absolute; top:0; left:0; width:100%; height:100%; background:#bfa37a; filter:url(#torn-heavy); box-shadow:3px 3px 0 rgba(0,0,0,.15); z-index:1; }
        .home-redesign .tape-btn-content { position:relative; z-index:2; color:#1e2421; font-size:.71rem; font-weight:700; padding:6px 20px; white-space:nowrap; filter:url(#torn-medium); }
        .home-redesign .host-history:hover .tape-more-btn { transform:rotate(-1deg) scale(1.05); }
        .home-redesign .host-history:hover .tape-btn-bg { background:var(--color-冲动); }
        .home-redesign .host-history:hover .tape-btn-content { color:#fff; }
        .home-redesign .floating-poetry { position:absolute; bottom:40px; left:45px; color:rgba(230,223,211,.55); font-size:.79rem; font-weight:300; writing-mode:vertical-rl; letter-spacing:5px; z-index:2; line-height:1.8; }
        /* Modal styles */
        .modal-overlay {
          position:fixed; inset:0; z-index:9999;
          background:rgba(0,0,0,.6); backdrop-filter:blur(4px);
          display:flex; justify-content:center; align-items:center;
          animation:fadeIn .3s ease;
        }
        .modal-overlay .modal-panel {
          position:relative; width:min(75vw,700px); max-height:80vh;
          background:var(--color-记忆); filter:url(#torn-modal); padding:4px;
          animation:scaleIn .35s cubic-bezier(.16,1,.3,1);
        }
        .modal-overlay .modal-inner {
          background:var(--color-记忆); padding:28px 32px;
          max-height:calc(80vh - 8px); overflow-y:auto;
        }
        .modal-overlay .modal-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; }
        .modal-overlay .modal-header h2 { font-size:1.3rem; font-weight:900; color:var(--color-理性); letter-spacing:-1px; filter:url(#torn-modal-title); }
        .modal-overlay .modal-close {
          background:var(--color-冲动); color:#fff; border:none; cursor:pointer;
          font-size:1rem; padding:4px 12px; font-weight:700; filter:url(#torn-light);
          transition:transform .3s;
        }
        .modal-overlay .modal-close:hover { transform:scale(1.1); }
        .modal-overlay .record-item {
          display:flex; justify-content:space-between; align-items:center;
          padding:12px 14px; margin-bottom:8px; background:rgba(0,0,0,.03);
          border-left:3px solid var(--color-冲动); transition:background .2s;
        }
        .modal-overlay .record-item:hover { background:rgba(0,0,0,.06); }
        .modal-overlay .record-info { flex:1; min-width:0; }
        .modal-overlay .record-info h4 { font-size:.85rem; font-weight:700; color:#222; margin-bottom:3px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; filter:url(#torn-modal-text); }
        .modal-overlay .record-info .record-meta { font-size:.6rem; color:#777; display:flex; gap:10px; filter:url(#torn-modal-text); }
        .modal-overlay .record-info .record-meta span { background:rgba(0,0,0,.04); padding:1px 6px; }
        .modal-overlay .record-del-btn {
          flex-shrink:0; margin-left:12px;
          background:transparent; border:1px solid rgba(204,102,92,.3); color:var(--color-冲动);
          font-size:.6rem; padding:4px 10px; cursor:pointer; font-weight:600;
          transition:all .2s; filter:url(#torn-modal-text);
        }
        .modal-overlay .record-del-btn:hover { background:var(--color-冲动); color:#fff; }
        .modal-overlay .empty-msg { text-align:center; padding:40px 0; color:#999; font-size:.85rem; font-style:italic; }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes scaleIn { from { opacity:0; transform:scale(.9) rotate(-2deg); } to { opacity:1; transform:scale(1) rotate(0); } }
      `}</style>

      <div className="home-redesign">
        <div className="bg-title">MIND MIRROR</div>

        <div className="brand-patch" ref={brandRef} onClick={() => window.location.reload()}>
          <div className="brand-patch-bg" />
          <div className="brand-patch-content">
            <h1>心镜</h1>
            <span>MIND MIRROR</span>
          </div>
        </div>

        <div className="floating-poetry">脑海里有一支不愿安静的合唱团 / 走上舞台</div>

        <main className="mindscape-stage" ref={stageRef}>
          <div className="motion-host host-summon" ref={el => { hostsRef.current[0] = el }}>
            <div className="art-bg skin-summon-bg" />
            <div className="art-content" onClick={() => router.push('/stage/new')}>
              <h2 className="action-title">召唤心声 <span>01.</span></h2>
              <p className="action-desc">把脑袋里的小人拽出来，看它们好好吵一架。不求正确的解法，只要在这场原始的、粗糙的内心博弈中，看清被情绪掩盖的自我。</p>
            </div>
          </div>

          <div className="motion-host host-manage" ref={el => { hostsRef.current[1] = el }}>
            <div className="art-bg skin-manage-bg" />
            <div className="art-content" onClick={() => router.push('/voices')}>
              <h2 className="action-title">心声管理 <span>02.</span></h2>
              <p className="action-desc">给内心的声音塑形。在此处捏造 Soul 极端的性格刻面，对接大模型底层意识。秩序由你定制。</p>
            </div>
          </div>

          <div className="motion-host host-history" ref={el => { hostsRef.current[2] = el }} onClick={() => setShowHistory(true)}>
            <div className="art-bg skin-history-bg" />
            <div className="art-content">
              <h2 className="action-title">心路 <span>03.</span></h2>
              <div className="history-stack-container">
                <div className="paper-layer layer-3"><div className="paper-layer-bg" /></div>
                <div className="paper-layer layer-2"><div className="paper-layer-bg" /></div>
                <div className="paper-layer layer-1">
                  <div className="paper-layer-bg" />
                  <div className="paper-layer-content">
                    <div className="latest-badge">意识切片</div>
                    <p className="text-[2rem] leading-tight font-medium">在每个十字路口的自我撕扯，在此处凝固为标本。</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="tape-more-btn">
              <div className="tape-btn-bg" />
              <div className="tape-btn-content">翻阅过往心镜</div>
            </div>
          </div>
        </main>

        {showHistory && (
          <div className="modal-overlay" onClick={() => setShowHistory(false)}>
            <div className="modal-panel" onClick={e => e.stopPropagation()}>
              <div className="modal-inner">
                <div className="modal-header">
                  <h2>心路历程</h2>
                  <button className="modal-close" onClick={() => setShowHistory(false)}>✕</button>
                </div>
                {recordsList.length === 0 ? (
                  <div className="empty-msg">还没有内心博弈的记录，去召唤一场吧。</div>
                ) : (
                  recordsList.map(r => (
                    <div className="record-item" key={r.id} onClick={() => { setShowHistory(false); router.push(`/stage/${r.id}`) }}>
                      <div className="record-info">
                        <h4>{r.title}</h4>
                        <div className="record-meta">
                          <span>{r.badge}</span>
                          <span>{r.date}</span>
                          <span>{r.count}条辩论</span>
                        </div>
                      </div>
                      <button className="record-del-btn" onClick={() => { deleteStage(r.id); setRecordsList(prev => prev.filter(x => x.id !== r.id)) }}>删除</button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        <svg style={{ position: 'absolute', width: 0, height: 0 }}>
          <defs>
            <filter id="torn-heavy">
              <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="4" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="15" xChannelSelector="R" yChannelSelector="G" />
            </filter>
            <filter id="torn-medium">
              <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="3" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="5.5" xChannelSelector="R" yChannelSelector="G" />
            </filter>
            <filter id="torn-title">
              <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="4" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="12" xChannelSelector="R" yChannelSelector="G" />
            </filter>
            <filter id="torn-light">
              <feTurbulence type="fractalNoise" baseFrequency="0.07" numOctaves="2" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="4" xChannelSelector="R" yChannelSelector="G" />
            </filter>
            <filter id="torn-modal">
              <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="10" xChannelSelector="R" yChannelSelector="G" />
            </filter>
            <filter id="torn-modal-title">
              <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="8" xChannelSelector="R" yChannelSelector="G" />
            </filter>
            <filter id="torn-modal-text">
              <feTurbulence type="fractalNoise" baseFrequency="0.08" numOctaves="1" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.5" xChannelSelector="R" yChannelSelector="G" />
            </filter>
          </defs>
        </svg>
      </div>
    </>
  )
}

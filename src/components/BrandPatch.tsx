'use client'

export default function BrandPatch() {
  return (
    <div className="brand-patch" onClick={() => window.location.reload()}>
      <div className="brand-patch-bg" />
      <div className="brand-patch-content">
        <h1>心镜</h1>
        <span>MIND MIRROR</span>
      </div>
    </div>
  )
}

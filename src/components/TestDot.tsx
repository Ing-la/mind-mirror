export default function TestDot({ state }: { state: 'ok' | 'fail' | null }) {
  if (!state) return null
  return (
    <svg className="w-3 h-3 shrink-0" viewBox="0 0 12 12">
      <circle cx="6" cy="6" r="5" fill={state === 'ok' ? '#22c55e' : '#e87979'} />
    </svg>
  )
}

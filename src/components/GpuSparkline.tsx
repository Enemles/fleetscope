'use client'

import { useGpuHistory } from '@/hooks/use-gpu'

const WIDTH = 120
const HEIGHT = 28

/** Mini-courbe d'utilisation (0–100 %) sur l'historique du GPU. SVG maison, léger. */
export function GpuSparkline({
  id,
  color = 'currentColor',
}: {
  id: string
  color?: string
}) {
  const history = useGpuHistory(id)
  if (history.length < 2) {
    return (
      <svg
        width="100%"
        height={HEIGHT}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        preserveAspectRatio="none"
        aria-hidden
      />
    )
  }
  const n = history.length
  const points = history
    .map((s, i) => {
      const x = (i / (n - 1)) * WIDTH
      const util = Math.min(100, Math.max(0, s.utilizationPct))
      const y = HEIGHT - (util / 100) * HEIGHT
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
  return (
    <svg
      width="100%"
      height={HEIGHT}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      preserveAspectRatio="none"
      aria-hidden
    >
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}

'use client'

import { scaleLinear } from 'd3-scale'
import { useEffect, useRef, useState } from 'react'
import { useRafLoop } from '@/hooks/use-raf-loop'
import { useTelemetryStore } from '@/lib/store/telemetry-store'

// d3-scale comme lib de MATHS (aucun rendu DOM) : util 0-100 → couleur (rampe thermique).
const utilColor = scaleLinear<string>()
  .domain([0, 40, 70, 90, 100])
  .range(['#1e40af', '#10b981', '#eab308', '#f97316', '#ef4444'])
  .clamp(true)

interface Layout {
  cols: number
  rows: number
  cell: number
}
interface Tip {
  x: number
  y: number
  id: string
  util: number
}

export function FleetHeatmapCanvas() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const layoutRef = useRef<Layout>({ cols: 1, rows: 1, cell: 8 })
  const lastUtilRef = useRef<Float32Array>(new Float32Array(0))
  const [tip, setTip] = useState<Tip | null>(null)

  // (Re)dimensionne le canvas + recalcule la grille au resize ou changement de fleet.
  useEffect(() => {
    const wrap = wrapRef.current
    const canvas = canvasRef.current
    if (!wrap || !canvas) return

    const relayout = () => {
      const n = useTelemetryStore.getState().ids.length || 1
      const w = wrap.clientWidth
      const h = wrap.clientHeight
      const dpr = window.devicePixelRatio || 1
      const cols = Math.max(1, Math.round(Math.sqrt(n * (w / h))))
      const rows = Math.ceil(n / cols)
      const cell = Math.max(1, Math.floor(Math.min(w / cols, h / rows)))
      layoutRef.current = { cols, rows, cell }
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0) // dessine en px CSS
        ctx.clearRect(0, 0, w, h)
      }
      lastUtilRef.current = new Float32Array(n).fill(NaN) // force un repeint complet
    }

    relayout()
    const ro = new ResizeObserver(relayout)
    ro.observe(wrap)
    const unsub = useTelemetryStore.subscribe((s, prev) => {
      if (s.ids.length !== prev.ids.length) relayout()
    })
    return () => {
      ro.disconnect()
      unsub()
    }
  }, [])

  // Repeint : lit le store EN TRANSIENT (getState), peint SEULEMENT les cells qui ont
  // changé → 0 render React. C'est la version extrême de la lecture throttlée Phase 4.
  useRafLoop(() => {
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    const { ids, samples } = useTelemetryStore.getState()
    const { cols, cell } = layoutRef.current
    const last = lastUtilRef.current
    const gap = cell > 5 ? 1 : 0
    for (let i = 0; i < ids.length; i++) {
      const util = samples[ids[i]]?.utilizationPct ?? 0
      if (util === last[i]) continue // inchangé → on ne repeint pas
      last[i] = util
      const x = (i % cols) * cell
      const y = Math.floor(i / cols) * cell
      ctx.fillStyle = utilColor(util)
      ctx.fillRect(x, y, cell - gap, cell - gap)
    }
  })

  const onMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { cols, cell } = layoutRef.current
    const rect = e.currentTarget.getBoundingClientRect()
    const col = Math.floor((e.clientX - rect.left) / cell)
    const i = Math.floor((e.clientY - rect.top) / cell) * cols + col
    const { ids, samples } = useTelemetryStore.getState()
    if (col < 0 || col >= cols || i < 0 || i >= ids.length) {
      setTip(null)
      return
    }
    setTip({ x: e.clientX, y: e.clientY, id: ids[i], util: samples[ids[i]]?.utilizationPct ?? 0 })
  }

  return (
    <div ref={wrapRef} className="relative h-[calc(100dvh-5.5rem)] w-full">
      <canvas
        ref={canvasRef}
        onMouseMove={onMove}
        onMouseLeave={() => setTip(null)}
        className="block"
      />
      {tip && (
        <div
          className="pointer-events-none fixed z-50 rounded-md border bg-popover px-2 py-1 text-xs shadow-md"
          style={{ left: tip.x + 12, top: tip.y + 12 }}
        >
          <span className="font-mono font-medium">{tip.id}</span> ·{' '}
          {Math.round(tip.util)}%
        </div>
      )}
    </div>
  )
}

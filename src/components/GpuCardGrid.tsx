'use client'

import { useVirtualizer } from '@tanstack/react-virtual'
import { useEffect, useRef, useState } from 'react'
import { GpuCard } from '@/components/GpuCard'
import { useFleetIds } from '@/hooks/use-fleet-ids'

const MIN_CARD_W = 200 // px — détermine le nombre de colonnes
const ROW_PITCH = 146 // px — hauteur de card (133) + gap
const GAP = 12

/** Grille virtualisée : ne monte que les cards visibles, quel que soit FLEET_SIZE. */
export function GpuCardGrid() {
  const ids = useFleetIds()
  const parentRef = useRef<HTMLDivElement>(null)
  const [cols, setCols] = useState(1)

  // Nombre de colonnes dérivé de la largeur (responsive).
  useEffect(() => {
    const el = parentRef.current
    if (!el) return
    const update = () =>
      setCols(Math.max(1, Math.floor(el.clientWidth / MIN_CARD_W)))
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // eslint-disable-next-line react-hooks/incompatible-library -- useVirtualizer renvoie des fns non-mémoïsables (attendu, le compiler skip ce composant)
  const virtualizer = useVirtualizer({
    count: ids.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_PITCH,
    overscan: 6,
    lanes: cols, // virtualise une grille à `cols` colonnes
    useFlushSync: false, // laisse React 19 batcher les updates de scroll
  })

  return (
    <div ref={parentRef} className="h-[calc(100dvh-5.5rem)] overflow-auto">
      <div
        style={{
          height: virtualizer.getTotalSize(),
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((item) => (
          <div
            key={item.key}
            style={{
              position: 'absolute',
              top: 0,
              left: `${(item.lane * 100) / cols}%`,
              width: `${100 / cols}%`,
              height: item.size,
              transform: `translateY(${item.start}px)`,
              padding: GAP / 2,
            }}
          >
            <GpuCard id={ids[item.index]} />
          </div>
        ))}
      </div>
    </div>
  )
}

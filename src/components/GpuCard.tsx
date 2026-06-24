'use client'

import { Card } from '@/components/ui/card'
import { HEALTH_COLOR } from '@/config/thresholds'
import { useGpu } from '@/hooks/use-gpu'
import { formatGb, formatPct, formatTemp, formatWatts } from '@/lib/utils'

export function GpuCard({ id }: { id: string }) {
  const { gpu, sample } = useGpu(id)
  if (!gpu) return null

  const health = sample?.health ?? 'offline'
  const util = sample?.utilizationPct ?? 0

  return (
    <Card className="gap-2 p-3">
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs font-medium">{gpu.id}</span>
        <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <span
            className="size-2 rounded-full"
            style={{ backgroundColor: HEALTH_COLOR[health] }}
          />
          {gpu.model}
        </span>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full transition-[width] duration-200"
          style={{ width: `${util}%`, backgroundColor: HEALTH_COLOR[health] }}
        />
      </div>

      <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
        <Metric label="Util" value={sample ? formatPct(sample.utilizationPct) : '—'} />
        <Metric label="Temp" value={sample ? formatTemp(sample.temperatureC) : '—'} />
        <Metric label="Mem" value={sample ? formatGb(sample.memoryUsedGb) : '—'} />
        <Metric label="Power" value={sample ? formatWatts(sample.powerDrawW) : '—'} />
      </div>
    </Card>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono tabular-nums">{value}</span>
    </div>
  )
}

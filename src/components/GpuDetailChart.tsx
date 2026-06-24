'use client'

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useGpu, useGpuHistoryThrottled } from '@/hooks/use-gpu'
import { formatGb, formatPct, formatTemp, formatWatts } from '@/lib/utils'

const SERIES = [
  { key: 'utilizationPct', name: 'Util %', color: '#10b981', axis: 'pct' },
  { key: 'temperatureC', name: 'Temp °C', color: '#f59e0b', axis: 'pct' },
  { key: 'powerDrawW', name: 'Power W', color: '#0ea5e9', axis: 'watts' },
] as const

function fmtTime(ts: number): string {
  const d = new Date(ts)
  return `${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`
}

/** Détail time-series d'un GPU. Lit l'historique échantillonné à 3 Hz (≠ débit du store). */
export function GpuDetailChart({ id }: { id: string }) {
  const { gpu, sample } = useGpu(id)
  const history = useGpuHistoryThrottled(id, 3)

  return (
    <div className="flex flex-col gap-4">
      {gpu && (
        <dl className="grid grid-cols-2 gap-x-6 gap-y-1 text-[13px]">
          <Row label="Modèle" value={gpu.model} />
          <Row label="Hôte" value={`${gpu.hostname} · ${gpu.rack}`} />
          <Row label="Util" value={sample ? formatPct(sample.utilizationPct) : '—'} />
          <Row label="Temp" value={sample ? formatTemp(sample.temperatureC) : '—'} />
          <Row
            label="Mem"
            value={sample ? `${formatGb(sample.memoryUsedGb)} / ${gpu.memoryTotalGb} GB` : '—'}
          />
          <Row label="Power" value={sample ? formatWatts(sample.powerDrawW) : '—'} />
        </dl>
      )}

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {SERIES.map((s) => (
          <span key={s.key} className="flex items-center gap-1.5">
            <span className="size-2 rounded-full" style={{ backgroundColor: s.color }} />
            {s.name}
          </span>
        ))}
      </div>

      {history.length < 2 ? (
        <div className="grid h-[260px] place-items-center text-sm text-muted-foreground">
          {"Collecte de l'historique…"}
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={history} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis
              dataKey="ts"
              type="number"
              domain={['dataMin', 'dataMax']}
              tickFormatter={fmtTime}
              tick={{ fontSize: 11 }}
              minTickGap={40}
            />
            <YAxis yAxisId="pct" domain={[0, 100]} tick={{ fontSize: 11 }} width={34} />
            <YAxis
              yAxisId="watts"
              orientation="right"
              domain={[0, 800]}
              tick={{ fontSize: 11 }}
              width={42}
            />
            <Tooltip
              labelFormatter={(ts) => fmtTime(Number(ts))}
              contentStyle={{ fontSize: 12, borderRadius: 8 }}
            />
            {SERIES.map((s) => (
              <Line
                key={s.key}
                yAxisId={s.axis}
                dataKey={s.key}
                name={s.name}
                stroke={s.color}
                strokeWidth={1.5}
                dot={false}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-mono tabular-nums">{value}</dd>
    </div>
  )
}

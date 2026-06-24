'use client'

import {
  useConnection,
  useFleetStats,
  useTelemetryMetrics,
} from '@/lib/store/telemetry-context'
import type { ConnectionState } from '@/lib/types'

const LABEL: Record<ConnectionState, string> = {
  idle: 'En attente',
  connecting: 'Connexion…',
  live: 'Live',
  reconnecting: 'Reconnexion…',
  closed: 'Déconnecté',
}

const DOT: Record<ConnectionState, string> = {
  idle: 'var(--color-zinc-400)',
  connecting: 'var(--color-amber-500)',
  live: 'var(--color-emerald-500)',
  reconnecting: 'var(--color-amber-500)',
  closed: 'var(--color-red-500)',
}

export function ConnectionStatusBar() {
  const connection = useConnection()
  const stats = useFleetStats()
  const metrics = useTelemetryMetrics()
  const pulsing = connection === 'connecting' || connection === 'reconnecting'

  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm">
      <span className="flex items-center gap-2 font-medium">
        <span
          className={`size-2.5 rounded-full${pulsing ? ' animate-pulse' : ''}`}
          style={{ backgroundColor: DOT[connection] }}
        />
        {LABEL[connection]}
      </span>
      <span className="text-muted-foreground">
        <span className="font-mono tabular-nums text-foreground">{stats.live}</span> / {stats.total} GPUs
      </span>
      <span className="text-muted-foreground">
        warn <span className="font-mono tabular-nums text-amber-500">{stats.warn}</span>
      </span>
      <span className="text-muted-foreground">
        critical <span className="font-mono tabular-nums text-red-500">{stats.critical}</span>
      </span>
      <span className="text-muted-foreground">
        <span className="font-mono tabular-nums text-foreground">{metrics.messagesPerSec}</span> msg/s
      </span>
      <span className="text-muted-foreground">
        dropped{' '}
        <span
          className={`font-mono tabular-nums${metrics.dropped > 0 ? ' text-amber-500' : ' text-foreground'}`}
        >
          {metrics.dropped}
        </span>
      </span>
    </div>
  )
}

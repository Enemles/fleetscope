import { describe, expect, it } from 'vitest'
import { selectFleetStats } from '@/lib/store/selectors'
import type { TelemetryData } from '@/lib/store/telemetry-store'
import type { GpuHealth, TelemetrySample } from '@/lib/types'

const sample = (gpuId: string, health: GpuHealth): TelemetrySample => ({
  gpuId,
  ts: 0,
  utilizationPct: 0,
  memoryUsedGb: 0,
  temperatureC: 0,
  powerDrawW: 0,
  fanPct: 0,
  health,
})

describe('selectFleetStats', () => {
  it('compte total / live / warn / critical', () => {
    const data: TelemetryData = {
      gpus: {},
      ids: ['a', 'b', 'c', 'd'],
      samples: {
        a: sample('a', 'ok'),
        b: sample('b', 'warn'),
        c: sample('c', 'critical'),
        d: sample('d', 'ok'),
      },
    }
    expect(selectFleetStats(data)).toEqual({
      total: 4,
      live: 4,
      warn: 1,
      critical: 1,
    })
  })

  it('un id sans sample compte dans total mais pas dans live', () => {
    const data: TelemetryData = {
      gpus: {},
      ids: ['a', 'b'],
      samples: { a: sample('a', 'ok') },
    }
    expect(selectFleetStats(data)).toEqual({
      total: 2,
      live: 1,
      warn: 0,
      critical: 0,
    })
  })

  it('fleet vide', () => {
    expect(selectFleetStats({ gpus: {}, ids: [], samples: {} })).toEqual({
      total: 0,
      live: 0,
      warn: 0,
      critical: 0,
    })
  })
})

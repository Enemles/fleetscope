import { beforeEach, describe, expect, it } from 'vitest'
import { useTelemetryStore } from '@/lib/store/telemetry-store'
import type { Gpu, TelemetrySample, WireMessage } from '@/lib/types'

const gpu = (id: string): Gpu => ({
  id,
  hostname: 'node-00',
  rack: 'rack-A',
  index: 0,
  model: 'H100',
  memoryTotalGb: 80,
})
const sample = (gpuId: string, util: number): TelemetrySample => ({
  gpuId,
  ts: 1,
  utilizationPct: util,
  memoryUsedGb: 0,
  temperatureC: 0,
  powerDrawW: 0,
  fanPct: 0,
  health: 'ok',
})
const snapshot = (ids: string[]): WireMessage => ({
  type: 'snapshot',
  ts: 1,
  gpus: ids.map(gpu),
  samples: ids.map((id) => sample(id, 10)),
})

beforeEach(() => {
  useTelemetryStore.setState({ gpus: {}, ids: [], samples: {}, history: {} })
})

describe('applyBatch', () => {
  it('snapshot initialise gpus / ids / samples / history', () => {
    useTelemetryStore.getState().applyBatch([snapshot(['a', 'b'])])
    const s = useTelemetryStore.getState()
    expect(s.ids).toEqual(['a', 'b'])
    expect(s.samples.a.utilizationPct).toBe(10)
    expect(s.history.a).toHaveLength(1)
  })

  it('un delta ne touche que les GPU reçus (réf stable pour les autres)', () => {
    useTelemetryStore.getState().applyBatch([snapshot(['a', 'b'])])
    const before = useTelemetryStore.getState().samples
    useTelemetryStore
      .getState()
      .applyBatch([{ type: 'delta', ts: 2, samples: [sample('a', 99)] }])
    const after = useTelemetryStore.getState().samples
    expect(after.a.utilizationPct).toBe(99)
    expect(after.a).not.toBe(before.a) // nouvelle réf
    expect(after.b).toBe(before.b) // réf inchangée → pas de re-render
  })

  it("l'historique s'accumule et reste borné", () => {
    useTelemetryStore.getState().applyBatch([snapshot(['a'])])
    for (let i = 0; i < 200; i++) {
      useTelemetryStore
        .getState()
        .applyBatch([{ type: 'delta', ts: i, samples: [sample('a', i)] }])
    }
    const h = useTelemetryStore.getState().history.a
    expect(h.length).toBeLessThanOrEqual(120) // HISTORY_LEN
    expect(h[h.length - 1].utilizationPct).toBe(199)
  })

  it('un batch sans changement (hello) garde le même state', () => {
    useTelemetryStore.getState().applyBatch([snapshot(['a'])])
    const before = useTelemetryStore.getState().samples
    useTelemetryStore
      .getState()
      .applyBatch([{ type: 'hello', serverTs: 1, tickHz: 10, fleetSize: 1 }])
    expect(useTelemetryStore.getState().samples).toBe(before)
  })
})

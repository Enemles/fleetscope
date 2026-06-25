import { describe, expect, it } from 'vitest'
import { parseWireMessage } from '@/lib/services/message-parser'

const sample = {
  gpuId: 'gpu-0000',
  ts: 1,
  utilizationPct: 5,
  memoryUsedGb: 1,
  temperatureC: 40,
  powerDrawW: 100,
  fanPct: 30,
  health: 'ok',
}

describe('parseWireMessage', () => {
  it('parse hello / snapshot / delta valides', () => {
    expect(
      parseWireMessage(
        JSON.stringify({ type: 'hello', serverTs: 1, tickHz: 10, fleetSize: 64 }),
      )?.type,
    ).toBe('hello')
    expect(
      parseWireMessage(
        JSON.stringify({ type: 'snapshot', ts: 1, gpus: [], samples: [] }),
      )?.type,
    ).toBe('snapshot')
    const delta = parseWireMessage(
      JSON.stringify({ type: 'delta', ts: 1, samples: [sample] }),
    )
    expect(delta?.type).toBe('delta')
    expect(delta?.type === 'delta' && delta.samples[0].gpuId).toBe('gpu-0000')
  })

  it('rejette un JSON cassé', () => {
    expect(parseWireMessage('{pas du json')).toBeNull()
  })

  it('rejette un type inconnu', () => {
    expect(parseWireMessage(JSON.stringify({ type: 'bogus' }))).toBeNull()
  })

  it('rejette une frame partielle / mal typée', () => {
    // samples manquant
    expect(parseWireMessage(JSON.stringify({ type: 'delta', ts: 1 }))).toBeNull()
    // sample incomplet
    expect(
      parseWireMessage(
        JSON.stringify({ type: 'delta', ts: 1, samples: [{ gpuId: 'a' }] }),
      ),
    ).toBeNull()
    // mauvais type de champ
    expect(
      parseWireMessage(
        JSON.stringify({ type: 'hello', serverTs: '1', tickHz: 10, fleetSize: 64 }),
      ),
    ).toBeNull()
    // health hors enum
    expect(
      parseWireMessage(
        JSON.stringify({ type: 'delta', ts: 1, samples: [{ ...sample, health: 'boom' }] }),
      ),
    ).toBeNull()
  })
})

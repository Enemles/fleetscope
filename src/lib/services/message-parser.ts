import { z } from 'zod'
import type { WireMessage } from '@/lib/types'

const gpu = z.object({
  id: z.string(),
  hostname: z.string(),
  rack: z.string(),
  index: z.number(),
  model: z.enum(['MI300X', 'MI325X', 'H100']),
  memoryTotalGb: z.number(),
})

const sample = z.object({
  gpuId: z.string(),
  ts: z.number(),
  utilizationPct: z.number(),
  memoryUsedGb: z.number(),
  temperatureC: z.number(),
  powerDrawW: z.number(),
  fanPct: z.number(),
  health: z.enum(['ok', 'warn', 'critical', 'offline']),
})

const wireMessage = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('hello'),
    serverTs: z.number(),
    tickHz: z.number(),
    fleetSize: z.number(),
  }),
  z.object({
    type: z.literal('snapshot'),
    ts: z.number(),
    gpus: z.array(gpu),
    samples: z.array(sample),
  }),
  z.object({ type: z.literal('delta'), ts: z.number(), samples: z.array(sample) }),
])

/** Parse + valide une frame wire. Renvoie null si illisible ou non conforme. */
export function parseWireMessage(raw: string): WireMessage | null {
  let json: unknown
  try {
    json = JSON.parse(raw)
  } catch {
    return null
  }
  const result = wireMessage.safeParse(json)
  return result.success ? result.data : null
}

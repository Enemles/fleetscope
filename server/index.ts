// Serveur WS de télémétrie — process séparé (pas un Route Handler Next).

import { WebSocketServer, WebSocket } from 'ws'
import { FleetSimulator } from './simulator'
import type { WireMessage } from './protocol'
import { FLEET_SIZE, TICK_HZ } from '../src/lib/config'

// Bind 127.0.0.1 (matche l'URL client, évite l'ambiguïté IPv6/IPv4).
const WS_PORT = Number.parseInt(process.env.WS_PORT ?? '', 10) || 4000
const sim = new FleetSimulator(FLEET_SIZE)
const wss = new WebSocketServer({ port: WS_PORT, host: '127.0.0.1' })

function send(ws: WebSocket, msg: WireMessage): void {
  if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(msg))
}

wss.on('connection', (ws) => {
  const now = Date.now()
  send(ws, { type: 'hello', serverTs: now, tickHz: TICK_HZ, fleetSize: FLEET_SIZE })
  send(ws, { type: 'snapshot', ts: now, gpus: sim.gpus, samples: sim.snapshot(now) })
})

// Boucle de broadcast : sérialise une fois, envoie à tous les clients ouverts.
const intervalMs = Math.max(1, Math.round(1000 / TICK_HZ))
setInterval(() => {
  if (wss.clients.size === 0) return
  const ts = Date.now()
  const samples = sim.tick(ts)
  if (samples.length === 0) return // rien n'a bougé ce tick → pas de frame
  const payload = JSON.stringify({ type: 'delta', ts, samples } satisfies WireMessage)
  for (const ws of wss.clients) {
    if (ws.readyState === WebSocket.OPEN) ws.send(payload)
  }
}, intervalMs)

console.log(
  `[fleetscope] WS server on ws://127.0.0.1:${WS_PORT} — ${FLEET_SIZE} GPUs @ ${TICK_HZ} Hz`,
)

// Serveur WebSocket de télémétrie — process séparé (PAS un Route Handler Next,
// cf. AGENTS.md). À la connexion : `hello` + `snapshot`. Puis un `delta` à chaque
// tick, broadcasté à tous les clients.

import { WebSocketServer, WebSocket } from 'ws'
import { FleetSimulator } from './simulator'
import type { WireMessage } from './protocol'
import { FLEET_SIZE, TICK_HZ, WS_PORT } from '../src/lib/config'

const sim = new FleetSimulator(FLEET_SIZE)
const wss = new WebSocketServer({ port: WS_PORT })

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
  const frame: WireMessage = { type: 'delta', ts, samples: sim.tick(ts) }
  const payload = JSON.stringify(frame)
  for (const ws of wss.clients) {
    if (ws.readyState === WebSocket.OPEN) ws.send(payload)
  }
}, intervalMs)

console.log(
  `[fleetscope] WS server on ws://localhost:${WS_PORT} — ${FLEET_SIZE} GPUs @ ${TICK_HZ} Hz`,
)

'use client'

import { useEffect, useRef, useState } from 'react'
import { WS_URL } from '@/lib/config'
import type { ConnectionState, WireMessage } from '@/lib/types'

/**
 * VERSION NAÏVE (Phase 1) — le "avant".
 *
 * Ouvre le WebSocket et appelle `onMessage` IMMÉDIATEMENT à chaque frame reçue :
 * 1 message = 1 update React. Pas de batching, pas de reconnexion, pas de backpressure.
 *
 * 👉 Phase 2 (à écrire par Selmene) remplace ça par :
 *    - buffer des messages dans un useRef, flush 1×/requestAnimationFrame
 *    - reconnexion avec backoff exponentiel + jitter
 *    - garde de backpressure (MAX_BUFFER) + compteur de drops
 *    - pause/reprise via la Visibility API
 */
export function useTelemetrySocket(
  onMessage: (msg: WireMessage) => void,
): ConnectionState {
  // On se connecte dès le montage : l'état part directement à "connecting".
  const [connection, setConnection] = useState<ConnectionState>('connecting')

  // Garde la dernière callback sans relancer la connexion (maj dans un effet,
  // jamais pendant le render).
  const onMessageRef = useRef(onMessage)
  useEffect(() => {
    onMessageRef.current = onMessage
  }, [onMessage])

  useEffect(() => {
    const ws = new WebSocket(WS_URL)
    ws.onopen = () => setConnection('live')
    ws.onclose = () => setConnection('closed')
    ws.onerror = () => setConnection('closed')
    ws.onmessage = (event) => {
      try {
        onMessageRef.current(JSON.parse(event.data) as WireMessage)
      } catch {
        // Frame illisible ignorée (naïf : pas de validation Zod — Phase 2/7).
      }
    }
    return () => ws.close()
  }, [])

  return connection
}

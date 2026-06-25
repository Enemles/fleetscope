'use client'

import { useEffect, useRef, useState } from 'react'
import { MAX_BUFFER, WS_URL } from '@/lib/config'
import { parseWireMessage } from '@/lib/services/message-parser'
import { backoffDelay, shouldReconnect } from '@/lib/services/reconnect'
import type { ConnectionState, WireMessage } from '@/lib/types'

export interface TelemetrySocket {
  connection: ConnectionState
  messagesPerSec: number // frames WS/s (≈ TICK_HZ)
  dropped: number // cumul droppé (backpressure)
}

export function useTelemetrySocket(
  onFlush: (batch: WireMessage[]) => void,
): TelemetrySocket {
  const [connection, setConnection] = useState<ConnectionState>('idle')
  const [messagesPerSec, setMessagesPerSec] = useState(0)
  const [dropped, setDropped] = useState(0)

  // dernière callback sans relancer l'effet (sinon le socket se rouvrirait)
  const onFlushRef = useRef(onFlush)
  useEffect(() => {
    onFlushRef.current = onFlush
  }, [onFlush])

  useEffect(() => {
    let ws: WebSocket | null = null
    let buffer: WireMessage[] = []
    let rafId: number | null = null
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null
    let attempt = 0
    let recvCount = 0
    let droppedTotal = 0
    let intentionalClose = false // unmount / onglet caché → pas de retry
    let disposed = false

    // flush rAF : vider le buffer en un seul update par frame
    const flush = () => {
      rafId = null
      if (buffer.length > 0) {
        const batch = buffer
        buffer = [] // détaché avant l'appel pour ne pas corrompre un push concurrent
        onFlushRef.current(batch)
      }
    }
    const scheduleFlush = () => {
      if (rafId === null) rafId = requestAnimationFrame(flush)
    }

    const ingest = (raw: string) => {
      const msg = parseWireMessage(raw)
      if (!msg) return // frame illisible ou non conforme
      recvCount++
      buffer.push(msg)
      // backpressure : plafonne le buffer, droppe les plus vieux
      if (buffer.length > MAX_BUFFER) {
        const overflow = buffer.length - MAX_BUFFER
        buffer.splice(0, overflow)
        droppedTotal += overflow
      }
      scheduleFlush()
    }

    const connect = () => {
      if (disposed) return
      setConnection(attempt === 0 ? 'connecting' : 'reconnecting')
      try {
        ws = new WebSocket(WS_URL)
      } catch {
        scheduleReconnect()
        return
      }
      ws.onopen = () => {
        attempt = 0
        setConnection('live')
      }
      ws.onmessage = (event) => ingest(event.data as string)
      ws.onerror = () => {
        // un 'error' est suivi d'un 'close' → onclose pilote seul l'état
      }
      ws.onclose = (event) => {
        ws = null
        if (disposed || intentionalClose) return
        if (!shouldReconnect(event.code)) {
          setConnection('closed')
          return
        }
        scheduleReconnect()
      }
    }

    const scheduleReconnect = () => {
      const delay = backoffDelay(attempt) // attempt 0 → ~1s, puis incrément
      attempt++
      setConnection('reconnecting')
      reconnectTimer = setTimeout(connect, delay)
    }

    // onglet caché → fermer (rAF gelé) ; visible → rouvrir (snapshot = resync)
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        intentionalClose = true
        if (reconnectTimer !== null) clearTimeout(reconnectTimer)
        reconnectTimer = null
        if (rafId !== null) cancelAnimationFrame(rafId)
        rafId = null
        buffer = []
        ws?.close(1000, 'tab hidden')
        ws = null
        setConnection('idle')
      } else if (!ws) {
        intentionalClose = false
        if (reconnectTimer !== null) clearTimeout(reconnectTimer)
        reconnectTimer = null
        attempt = 0
        connect()
      }
    }

    // débit + drops, échantillonnés à 1 Hz (pas un setState par frame)
    const rateTimer = setInterval(() => {
      setMessagesPerSec(recvCount)
      recvCount = 0
      setDropped(droppedTotal)
    }, 1_000)

    document.addEventListener('visibilitychange', handleVisibility)
    connect() // pas de gate sur visibilityState : headless le rapporte 'hidden'

    return () => {
      disposed = true
      intentionalClose = true
      clearInterval(rateTimer)
      if (reconnectTimer !== null) clearTimeout(reconnectTimer)
      if (rafId !== null) cancelAnimationFrame(rafId)
      document.removeEventListener('visibilitychange', handleVisibility)
      ws?.close(1000, 'unmount')
      ws = null
    }
  }, [])

  return { connection, messagesPerSec, dropped }
}

'use client'

import { useEffect, useRef } from 'react'

/** Ticker rAF réutilisable : appelle `callback(dt)` à chaque frame, hors cycle React. */
export function useRafLoop(callback: (dtMs: number) => void): void {
  const cbRef = useRef(callback)
  useEffect(() => {
    cbRef.current = callback
  }, [callback])

  useEffect(() => {
    let raf = 0
    let last = performance.now()
    const tick = (now: number) => {
      cbRef.current(now - last)
      last = now
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])
}

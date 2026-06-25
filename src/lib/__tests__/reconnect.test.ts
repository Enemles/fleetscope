import { describe, expect, it } from 'vitest'
import {
  backoffDelay,
  shouldReconnect,
  WS_CLOSE_NORMAL,
} from '@/lib/services/reconnect'

describe('backoffDelay', () => {
  const noJitter = () => 0.5 // (0.5*2 - 1) = 0 → pas de jitter

  it('croît exponentiellement (base 1 s, ×2)', () => {
    expect(backoffDelay(0, { random: noJitter })).toBe(1000)
    expect(backoffDelay(1, { random: noJitter })).toBe(2000)
    expect(backoffDelay(2, { random: noJitter })).toBe(4000)
    expect(backoffDelay(3, { random: noJitter })).toBe(8000)
  })

  it('plafonne à maxMs', () => {
    expect(backoffDelay(10, { random: noJitter })).toBe(30000)
    expect(backoffDelay(50, { random: noJitter })).toBe(30000)
  })

  it('borne le jitter à ±30 % et ne franchit jamais le plafond', () => {
    expect(backoffDelay(0, { random: () => 0 })).toBe(700) // -30 %
    expect(backoffDelay(0, { random: () => 1 })).toBe(1300) // +30 %
    expect(backoffDelay(10, { random: () => 1 })).toBe(30000) // +30 % clampé au cap
    expect(backoffDelay(10, { random: () => 0 })).toBe(21000) // -30 % du cap
  })

  it('reste ≥ 0', () => {
    expect(
      backoffDelay(0, { random: () => 0, jitter: 5 }),
    ).toBeGreaterThanOrEqual(0)
  })
})

describe('shouldReconnect', () => {
  it('ne retente pas sur fermeture normale (1000)', () => {
    expect(shouldReconnect(WS_CLOSE_NORMAL)).toBe(false)
    expect(shouldReconnect(1000)).toBe(false)
  })

  it('retente sur fermeture anormale (crash, coupure)', () => {
    expect(shouldReconnect(1006)).toBe(true)
    expect(shouldReconnect(1001)).toBe(true)
  })
})

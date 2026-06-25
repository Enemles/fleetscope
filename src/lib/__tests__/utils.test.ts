import { describe, expect, it } from 'vitest'
import {
  clamp,
  cn,
  formatGb,
  formatPct,
  formatTemp,
  formatWatts,
} from '@/lib/utils'

describe('utils', () => {
  it('clamp borne dans [min, max]', () => {
    expect(clamp(5, 0, 10)).toBe(5)
    expect(clamp(-1, 0, 10)).toBe(0)
    expect(clamp(11, 0, 10)).toBe(10)
  })

  it('les formatters arrondissent et suffixent', () => {
    expect(formatPct(42.7)).toBe('43%')
    expect(formatTemp(71.4)).toBe('71°C')
    expect(formatWatts(612.5)).toBe('613 W')
    expect(formatGb(154.2)).toBe('154 GB')
  })

  it('cn fusionne les classes (dont conditionnelles)', () => {
    expect(cn('a', false, 'b')).toBe('a b')
  })
})

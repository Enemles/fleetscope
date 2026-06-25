import { describe, expect, it } from 'vitest'
import { pushBounded } from '@/lib/services/ring-buffer'

describe('pushBounded', () => {
  it('ajoute sous la capacité', () => {
    expect(pushBounded([1, 2], 3, 5)).toEqual([1, 2, 3])
  })

  it('évince les plus vieux à capacité (ordre préservé)', () => {
    expect(pushBounded([1, 2, 3], 4, 3)).toEqual([2, 3, 4])
    expect(pushBounded([2, 3, 4], 5, 3)).toEqual([3, 4, 5])
  })

  it("part d'un buffer vide", () => {
    expect(pushBounded([], 1, 3)).toEqual([1])
  })

  it('renvoie un NOUVEAU tableau, laisse la source intacte', () => {
    const src = [1, 2]
    const out = pushBounded(src, 3, 5)
    expect(out).not.toBe(src)
    expect(src).toEqual([1, 2])
  })

  it('capacité 0 → vide', () => {
    expect(pushBounded([1, 2], 3, 0)).toEqual([])
  })
})

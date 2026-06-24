// Buffer borné immutable : renvoie un nouveau tableau de longueur ≤ capacity.
// Immutable exprès → une nouvelle référence par push, compatible sélecteurs.

export function pushBounded<T>(
  buffer: readonly T[],
  item: T,
  capacity: number,
): T[] {
  if (capacity <= 0) return []
  const start = buffer.length >= capacity ? buffer.length - capacity + 1 : 0
  const next = buffer.slice(start)
  next.push(item)
  return next
}

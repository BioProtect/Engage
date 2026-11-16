/** Deterministic colour per row id (golden-ratio spread). */
export function generateColor(id) {
  const goldenRatio = 0.618033988749895
  const normalized = (id * goldenRatio) % 1
  const colorInt = Math.floor(normalized * 0xFFFFFF)
  return `#${colorInt.toString(16).padStart(6, '0').toUpperCase()}`
}

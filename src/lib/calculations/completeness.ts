import { CompletenessResult } from './types'

export function calculateCompleteness(monthsSampled: number): CompletenessResult {
  const m = Math.max(0, Math.min(12, Math.floor(monthsSampled)))
  const completenessPct = (m / 12) * 100
  return { completenessPct: Number(completenessPct.toFixed(2)), monthsSampled: m }
}

export function calculateOverallCompleteness(categoryCompletenesses: CompletenessResult[]) {
  if (!categoryCompletenesses || categoryCompletenesses.length === 0) return 0
  const avg = categoryCompletenesses.reduce((s, c) => s + c.completenessPct, 0) / categoryCompletenesses.length
  return Number(avg.toFixed(2))
}

import { CompletenessResult } from './types'

export function calculateCompleteness(monthsSampled: number): CompletenessResult {
  const m = Math.max(0, Math.min(12, Math.floor(monthsSampled)))
  const completenessPct = (m / 12) * 100
  return { completenessPct: Number(completenessPct.toFixed(2)), monthsSampled: m }
}

type CompletenessInput =
  | CompletenessResult[]
  | Record<string, number | CompletenessResult | null | undefined>

export function calculateOverallCompleteness(categoryCompletenesses: CompletenessInput) {
  const values = Array.isArray(categoryCompletenesses)
    ? categoryCompletenesses
    : Object.values(categoryCompletenesses ?? {})

  if (values.length === 0) return 0

  const normalized = values
    .map((value) => (typeof value === 'number' ? value : value?.completenessPct))
    .filter((value): value is number => typeof value === 'number' && Number.isFinite(value))

  if (normalized.length === 0) return 0

  const avg = normalized.reduce((sum, completenessPct) => sum + completenessPct, 0) / normalized.length
  return Number(avg.toFixed(2))
}

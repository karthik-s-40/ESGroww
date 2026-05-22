import { CONFIDENCE_THRESHOLDS } from './constants'

export function getConfidenceModifier(monthsSampled: number): number {
  const months = Math.max(0, Math.floor(monthsSampled))
  for (const entry of CONFIDENCE_THRESHOLDS) {
    if (months >= entry.monthsMin) return entry.modifier
  }
  return 0
}

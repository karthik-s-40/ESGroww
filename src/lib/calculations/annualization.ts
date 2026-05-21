import { AnnualizationResult } from './types'

export function annualizeValue(sumValue: number, months: number): AnnualizationResult {
  if (!months || months <= 0) return { annualizedValue: 0, monthsSampled: 0 }
  const annualizedValue = (sumValue / months) * 12
  return { annualizedValue, monthsSampled: months }
}

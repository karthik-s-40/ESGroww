import { EmissionsResult } from './types'
import { DEFAULTS } from './constants'
import { UNIT } from './units'

/**
 * Resolve an emission factor for a given sourceType using optional config
 * Supports legacy `config.emission`, `config.emissionFactors`, and `config.defaultFactors`.
 */
export function getEmissionFactor(sourceType: string, config?: any, fallback?: number): number {
  const key = sourceType.toLowerCase()
  const fromEmissionFactors = config?.emissionFactors?.[key]
  const fromLegacyEmission = config?.emission?.[key]
  const fromDefaultFactors = config?.defaultFactors?.[key]
  return (
    fromEmissionFactors ??
    fromLegacyEmission ??
    fromDefaultFactors ??
    fallback ??
    (key === 'electricity' ? DEFAULTS.ELECTRICITY_EMISSION_FACTOR_KG_PER_KWH : 0)
  )
}

export function calculateScope2Emissions(kwh: number, factorKgPerKwh = DEFAULTS.ELECTRICITY_EMISSION_FACTOR_KG_PER_KWH, renewableKwh = 0): EmissionsResult {
  const netKwh = Math.max(0, kwh - (renewableKwh || 0))
  const kgCO2e = netKwh * factorKgPerKwh
  const tCO2e = kgCO2e / 1000
  return { kgCO2e: Number(kgCO2e.toFixed(3)), tCO2e: Number(Number(tCO2e.toFixed(3))) }
}

export function formatEmissionValueTCO2e(tCO2e: number): string {
  return `${Number(tCO2e.toFixed(2))} ${UNIT.EMISSIONS_T}`
}

export function formatEmissionValueKg(tCO2e: number): string {
  return formatEmissionValueTCO2e(tCO2e)
}

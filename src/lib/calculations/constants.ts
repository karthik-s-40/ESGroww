import { UNIT } from './units'

export const DEFAULTS = {
  ELECTRICITY_EMISSION_FACTOR_KG_PER_KWH: 0.72, // kgCO2e per kWh (example BRD value)
  STANDARD_ELECTRICITY_UNIT: UNIT.ELECTRICITY,
  STANDARD_WATER_UNIT: UNIT.WATER,
}

export const CONFIDENCE_THRESHOLDS = [
  { monthsMin: 10, modifier: 1.0 },
  { monthsMin: 7, modifier: 0.85 },
  { monthsMin: 4, modifier: 0.7 },
  { monthsMin: 1, modifier: 0.5 },
  { monthsMin: 0, modifier: 0.0 },
]

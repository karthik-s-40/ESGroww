export const UNIT = {
  ELECTRICITY: 'kWh',
  WATER: 'KL',
  DIESEL: 'litres',
  PNG_CNG: 'kg',
  WASTE: 'kg',
  REFRIGERANT: 'kg',
  EMISSIONS_KG: 'kgCO2e',
  EMISSIONS_T: 'tCO2e',
  ENERGY_INTENSITY: 'kWh/sqft/year',
  WATER_INTENSITY: 'KL/sqft/year',
  EMISSIONS_INTENSITY: 'tCO2e/sqft',
  ROAD_FREIGHT: 'tonne-km',
  POWER_FACTOR: 'ratio',
  OCCUPANCY: 'persons/day',
  OPERATING_HOURS: 'hours/day',
  BUILT_UP_AREA: 'sqft',
  PERCENT: '%',
}

type KnownUnit = string

export function normalizeUnit(unit: KnownUnit): KnownUnit {
  if (!unit) throw new Error('Unit required')
  const u = unit.trim().toLowerCase()
  if (u === 'mwh') return UNIT.ELECTRICITY
  if (u === 'kwh') return UNIT.ELECTRICITY
  if (u === 'wh') return UNIT.ELECTRICITY
  if (u === 'l' || u === 'litre' || u === 'litres') return UNIT.DIESEL
  if (u === 'kl' || u === 'kilolitre' || u === 'kilolitres') return UNIT.WATER
  if (u === 'kg') return 'kg'
  if (u === 'tonne' || u === 't' || u === 'tonnes') return 'kg'
  if (u === 'kgco2e' || u === 'kg_co2e' || u === 'kgco₂e') return UNIT.EMISSIONS_KG
  if (u === 'tco2e' || u === 't_co2e' || u === 'tco₂e') return UNIT.EMISSIONS_T
  return unit
}

export function convertToStandardUnit(value: number, fromUnit: string, targetUnit: string): number {
  if (value == null) return value
  const f = fromUnit.trim().toLowerCase()
  const t = targetUnit.trim().toLowerCase()
  // Electricity: MWh -> kWh
  if ((f === 'mwh' || f === 'mwh') && t === 'kwh') return value * 1000
  if (f === 'kwh' && t === 'kwh') return value
  if (f === 'wh' && t === 'kwh') return value / 1000

  // Water: L -> KL
  if ((f === 'l' || f === 'litre' || f === 'litres') && t === 'kl') return value / 1000
  if ((f === 'kl' || f === 'kilolitre' || f === 'kilolitres') && t === 'kl') return value

  // Mass: tonnes -> kg
  if ((f === 't' || f === 'tonne' || f === 'tonnes') && t === 'kg') return value * 1000
  if (f === 'kg' && t === 'kg') return value

  // Emissions: kgCO2e <-> tCO2e
  if ((f === 'kgco2e' || f === 'kg_co2e') && (t === 'tco2e' || t === 't_co2e')) return value / 1000
  if ((f === 'tco2e' || f === 't_co2e') && (t === 'kgco2e' || t === 'kg_co2e')) return value * 1000

  // If same unit or unknown mapping, return value (caller should validate consistency)
  return value
}

export function validateUnitConsistency(units: string[], expectedUnit: string) {
  for (const u of units) {
    const nu = normalizeUnit(u)
    if (nu !== expectedUnit) throw new Error(`Inconsistent unit: expected ${expectedUnit}, got ${u}`)
  }
}

export function formatWithUnit(value: number | null | undefined, unit: string): string {
  if (value == null) return `- ${unit}`
  // Accept a few non-primitive numeric shapes so callers can pass Decimal/DB values.
  // - objects like { kgCO2e, tCO2e }
  // - Decimal-like objects that coerce to Number
  let v: any = value as any
  if (typeof v === "object" && v !== null) {
    if (typeof v.kgCO2e === "number") v = v.kgCO2e
    else if (typeof v.tCO2e === "number") v = v.tCO2e
    else if (typeof (v as any).toNumber === "function") v = (v as any).toNumber()
    else if (typeof (v as any).toFixed === "function") v = Number(v)
    else v = Number(v)
  }

  const n = typeof v === "number" ? v : Number(v)
  if (Number.isNaN(n)) return `${String(value)} ${unit}`

  // format numbers with 2 decimal places where applicable
  const isInteger = Math.abs(Math.round(n) - n) < 1e-9
  return `${isInteger ? Math.round(n) : Number(n.toFixed(2))} ${unit}`
}

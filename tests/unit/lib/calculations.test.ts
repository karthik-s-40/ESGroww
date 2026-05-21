import { annualizeValue, calculateCompleteness, getConfidenceModifier, calculateScope2Emissions, convertToStandardUnit, UNIT, formatWithUnit } from '../../../src/lib/calculations'

describe('BRD calculation verification', () => {
  test('annualizes 88,000 kWh over 7 months to ~150,857 kWh/year', () => {
    const sum = 88000
    const months = 7
    const { annualizedValue } = annualizeValue(sum, months)
    expect(annualizedValue).toBeCloseTo(150857.142857, 3)
  })

  test('7 months gives 58.3% completeness', () => {
    const res = calculateCompleteness(7)
    expect(res.completenessPct).toBeCloseTo(58.33, 2)
  })

  test('7 months gives 0.85 confidence modifier', () => {
    const mod = getConfidenceModifier(7)
    expect(mod).toBeCloseTo(0.85, 3)
  })

  test('Scope 2 using 150,857 kWh and factor 0.72 gives ~108.62 tCO2e', () => {
    const kwh = 150857.142857
    const factor = 0.72
    const res = calculateScope2Emissions(kwh, factor, 0)
    // tCO2e
    expect(res.tCO2e).toBeCloseTo((kwh * factor) / 1000, 3)
    expect(res.tCO2e).toBeCloseTo(108.616, 2)
  })

  test('convert MWh to kWh and format unit', () => {
    const v = convertToStandardUnit(1.5, 'MWh', 'kWh')
    expect(v).toBe(1500)
    expect(formatWithUnit(v, UNIT.ELECTRICITY)).toContain('kWh')
  })
})

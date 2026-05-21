import type { ESGConfiguration } from "../config-engine";

export function calculateEnergyPerBed(
  electricityKwh: number,
  numberOfBeds: number
) {
  if (numberOfBeds === 0) return 0;
  return electricityKwh / numberOfBeds;
}

export function calculateWaterPerBed(
  totalWaterConsumptionKl: number,
  numberOfBeds: number
) {
  if (numberOfBeds === 0) return 0;
  return totalWaterConsumptionKl / numberOfBeds;
}

export function calculateWastePerBed(
  wasteKg: number,
  numberOfBeds: number
) {
  if (numberOfBeds === 0) return 0;
  return wasteKg / numberOfBeds;
}

export function calculateBenchmarkScores(
  params: {
    industry: string; // Used as sectorCode e.g., "HOSP"
    renewablePercentage: number;
    waterRecyclingPercentage: number;
    wasteDiversionPercentage: number;
    energyPerBed: number;
    energyIntensityPerSqft?: number;
    waterPerBed: number;
    wastePerBed: number;
  },
  config: ESGConfiguration
): Record<string, number> {
  // Default Healthcare industry benchmarks
  const defaultBenchmarks = {
    renewablePercentage: 30,
    waterRecyclingPercentage: 25,
    wasteDiversionPercentage: 40,
    energyPerBed: 15000,
    energyIntensityPerSqft: 15,
    waterPerBed: 800,
    wastePerBed: 1200,
  };

  const sectorBenchmarks = config?.benchmarks?.[params.industry] || {};

  const benchmarks = {
    renewablePercentage: sectorBenchmarks["renewablePercentage"] ?? defaultBenchmarks.renewablePercentage,
    waterRecyclingPercentage: sectorBenchmarks["waterRecyclingPercentage"] ?? defaultBenchmarks.waterRecyclingPercentage,
    wasteDiversionPercentage: sectorBenchmarks["wasteDiversionPercentage"] ?? defaultBenchmarks.wasteDiversionPercentage,
    energyPerBed: sectorBenchmarks["energyPerBed"] ?? defaultBenchmarks.energyPerBed,
    energyIntensityPerSqft: sectorBenchmarks["energyIntensityPerSqft"] ?? defaultBenchmarks.energyIntensityPerSqft,
    waterPerBed: sectorBenchmarks["waterPerBed"] ?? defaultBenchmarks.waterPerBed,
    wastePerBed: sectorBenchmarks["wastePerBed"] ?? defaultBenchmarks.wastePerBed,
  };

  const { renewablePercentage, waterRecyclingPercentage, wasteDiversionPercentage, energyPerBed, energyIntensityPerSqft, waterPerBed, wastePerBed } = params;

  // Calculate performance ratios (current / benchmark)
  const renewableRatio = renewablePercentage / benchmarks.renewablePercentage;
  const waterRatio = waterRecyclingPercentage / benchmarks.waterRecyclingPercentage;
  const wasteRatio = wasteDiversionPercentage / benchmarks.wasteDiversionPercentage;
  const energyRatio = energyIntensityPerSqft && energyIntensityPerSqft > 0
    ? benchmarks.energyIntensityPerSqft / energyIntensityPerSqft
    : benchmarks.energyPerBed / energyPerBed; // Lower is better for intensity
  const waterIntensityRatio = benchmarks.waterPerBed / waterPerBed;
  const wasteIntensityRatio = benchmarks.wastePerBed / wastePerBed;

  return {
    renewableScore: Math.min(renewableRatio * 100, 100),
    waterScore: Math.min(waterRatio * 100, 100),
    wasteScore: Math.min(wasteRatio * 100, 100),
    energyIntensityScore: Math.min(energyRatio * 100, 100),
    waterIntensityScore: Math.min(waterIntensityRatio * 100, 100),
    wasteIntensityScore: Math.min(wasteIntensityRatio * 100, 100),
  };
}

export function calculateGapAnalysis(
  current: Record<string, number>,
  benchmark: Record<string, number>
): {
  gaps: Record<string, number>;
  recommendations: Record<string, string>;
  priorityActions: string[];
} {
  const gaps: Record<string, number> = {};
  const recommendations: Record<string, string> = {};
  const priorityActions: string[] = [];

  for (const key in benchmark) {
    const cur = current[key] ?? 0;
    const bench = benchmark[key];
    gaps[key] = Math.max(bench - cur, 0);

    // Generate recommendations based on gaps
    if (gaps[key] > 50) {
      recommendations[key] = `Critical gap: ${gaps[key].toFixed(1)} points below benchmark. Immediate action required.`;
      priorityActions.push(`Address ${key.replace(/Score$/, '').toLowerCase()} gap urgently`);
    } else if (gaps[key] > 20) {
      recommendations[key] = `Moderate gap: ${gaps[key].toFixed(1)} points below benchmark. Plan improvements.`;
    } else if (gaps[key] > 0) {
      recommendations[key] = `Minor gap: ${gaps[key].toFixed(1)} points below benchmark. Monitor and optimize.`;
    } else {
      recommendations[key] = `Above benchmark: ${Math.abs(gaps[key]).toFixed(1)} points above target. Excellent performance.`;
    }
  }

  return { gaps, recommendations, priorityActions };
}

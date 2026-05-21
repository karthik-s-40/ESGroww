import { prisma } from "@/lib/db";
import { unstable_cache } from "next/cache";

export type EmissionFactorsConfig = Record<string, number>;
export type BenchmarkConfig = Record<string, Record<string, number>>;
export type ScoringWeightsConfig = Record<string, number>;
export type KpiRangeConfig = Record<string, { excellentMax: number; goodMax: number; fairMax: number }>;

export interface ESGConfiguration {
  emissionFactors: EmissionFactorsConfig;
  benchmarks: BenchmarkConfig;
  scoringWeights: ScoringWeightsConfig;
  kpiRanges: KpiRangeConfig;
  // Fallbacks if DB is empty, for safety
  defaultFactors: {
    electricity: number;
    diesel: number;
    ambulanceFuel: number;
    wasteKg: number;
    waterKl: number;
    refrigerants: Record<string, number>;
  };
}

const fetchConfigurationFromDb = async (): Promise<ESGConfiguration> => {
  const [
    emissionFactorsData,
    benchmarksData,
    scoringData,
    kpiRangeData,
  ] = await Promise.all([
    prisma.emissionFactor.findMany(),
    prisma.benchmarkMaster.findMany(),
    prisma.scoringWeight.findMany(),
    prisma.kpiRange.findMany(),
  ]);

  const emissionFactors: EmissionFactorsConfig = {};
  emissionFactorsData.forEach((f) => {
    // Normalizing keys to lowercase to match existing code logic
    emissionFactors[f.sourceType.toLowerCase()] = f.factorValue;
  });

  const benchmarks: BenchmarkConfig = {};
  benchmarksData.forEach((b) => {
    if (!benchmarks[b.sectorCode]) {
      benchmarks[b.sectorCode] = {};
    }
    // Using efficientMax as the primary benchmark target
    benchmarks[b.sectorCode][b.metricName] = b.efficientMax; 
  });

  const scoringWeights: ScoringWeightsConfig = {};
  scoringData.forEach((s) => {
    scoringWeights[s.category] = s.weightValue;
  });

  const kpiRanges: KpiRangeConfig = {};
  kpiRangeData.forEach((k) => {
    kpiRanges[k.metricName] = {
      excellentMax: k.excellentMax,
      goodMax: k.goodMax,
      fairMax: k.fairMax,
    };
  });

  const defaultFactors = {
    electricity: 0.72,
    diesel: 2.68,
    ambulanceFuel: 2.68,
    wasteKg: 0.8,
    waterKl: 0.5,
    refrigerants: {
      r410a: 2088,
      r32: 675,
      r134a: 1430,
    }
  };

  return {
    emissionFactors,
    benchmarks,
    scoringWeights,
    kpiRanges,
    defaultFactors,
  };
};

/**
 * Cached fetch of the ESG Configuration.
 * Revalidated when the 'esg-config' tag is invalidated.
 */
export const getESGConfiguration = unstable_cache(
  fetchConfigurationFromDb,
  ['esg-config-cache'],
  { tags: ['esg-config'], revalidate: 3600 } // Revalidate at least every hour, or on-demand
);

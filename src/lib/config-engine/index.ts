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
    totalWaterConsumptionKl: number;
    refrigerants: Record<string, number>;
  };
}

const fetchConfigurationFromDb = async (): Promise<ESGConfiguration> => {
  const safeFindMany = async (getter: () => any): Promise<any[]> => {
    try {
      const model = getter();
      if (!model || typeof model.findMany !== "function") {
        return [];
      }
      const rows = await model.findMany();
      return Array.isArray(rows) ? rows : [];
    } catch {
      return [];
    }
  };

  const [
    emissionFactorsData,
    benchmarksData,
    scoringData,
    kpiRangeData,
  ] = await Promise.all([
    safeFindMany(() => (prisma as any).emissionFactor),
    safeFindMany(() => (prisma as any).benchmarkMaster),
    safeFindMany(() => (prisma as any).scoringWeight),
    safeFindMany(() => (prisma as any).kpiRange),
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
    totalWaterConsumptionKl: 0.5,
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
const cachedGetESGConfiguration = unstable_cache(
  fetchConfigurationFromDb,
  ["esg-config-cache"],
  { tags: ["esg-config"], revalidate: 3600 }
);

export const getESGConfiguration = async (): Promise<ESGConfiguration> => {
  if (process.env.NODE_ENV === "test") {
    return fetchConfigurationFromDb();
  }
  return cachedGetESGConfiguration();
};

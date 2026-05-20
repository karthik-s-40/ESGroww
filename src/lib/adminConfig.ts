import { prisma } from "./db";

export async function getAdminCalculationFactors() {
  const [emissionFactors, benchmarks, confidence, scoring, certifications, annualization] = await Promise.all([
    prisma.emissionFactor.findMany(),
    prisma.benchmarkMaster.findMany(),
    prisma.confidenceThreshold.findMany(),
    prisma.scoringWeight.findMany(),
    prisma.certificationCutoff.findMany(),
    prisma.annualizationModifier.findMany(),
  ]);

  // Transform into easy-to-use objects for the calculation engine
  const factors = {
    emission: {} as Record<string, number>,
    benchmark: {} as Record<string, Record<string, number>>,
    confidence: confidence,
    scoring: {} as Record<string, number>,
    certification: certifications,
    annualization: annualization,
  };

  emissionFactors.forEach(f => {
    factors.emission[f.sourceType.toLowerCase()] = f.factorValue;
  });

  benchmarks.forEach(b => {
    if (!factors.benchmark[b.sectorCode]) {
      factors.benchmark[b.sectorCode] = {};
    }
    factors.benchmark[b.sectorCode][b.metricName] = b.efficientMax; // or whatever logic applies
  });

  scoring.forEach(s => {
    factors.scoring[s.category] = s.weightValue;
  });

  // Fallbacks if DB is empty
  const defaultFactors = {
    electricity: 0.72,
    diesel: 2.68,
    ambulanceFuel: 2.68,
    wasteKg: 0.8,
    waterKl: 0.5,
    R410A: 2088,
    R32: 675,
    R134A: 1430,
  };

  return { factors, defaultFactors };
}

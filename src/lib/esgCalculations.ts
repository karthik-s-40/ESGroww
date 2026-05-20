/* ========================================= */
/* ESGROWW HOSPITAL ESG CALCULATION ENGINE   */
/* ========================================= */
 
/**
 * EMISSION FACTORS
 *
 * NOTE:
 * These can later be moved to DB/config.
 */
 
const EMISSION_FACTORS = {
  electricity: 0.72, // kg CO2e / kWh
 
  diesel: 2.68, // kg CO2e / litre
 
  ambulanceFuel: 2.68,
 
  refrigerants: {
    R410A: 2088,
    R32: 675,
    R134A: 1430,
  },
  // Estimated placeholder factors (kg CO2e per unit)
  // - wasteKg: kg CO2e per kg of waste
  // - waterKl: kg CO2e per kilolitre (1 KL = 1 m^3)
  wasteKg: 0.8,
  waterKl: 0.5,
};
 
/* ========================================= */
/* SCOPE 2 EMISSIONS                         */
/* ========================================= */
 
export function calculateScope2Emissions(
  electricityKwh: number
) {
  return (
    electricityKwh *
    EMISSION_FACTORS.electricity
  );
}
 
/* ========================================= */
/* SCOPE 1 EMISSIONS                         */
/* ========================================= */
 
export function calculateDieselEmissions(
  dgDieselLitres: number
) {
  return (
    dgDieselLitres *
    EMISSION_FACTORS.diesel
  );
}
 
/* ========================================= */
/* TRANSPORT EMISSIONS                       */
/* ========================================= */
 
export function calculateTransportEmissions(
  ambulanceFuelLitres: number
) {
  return (
    ambulanceFuelLitres *
    EMISSION_FACTORS.ambulanceFuel
  );
}
 
/* ========================================= */
/* REFRIGERANT EMISSIONS                     */
/* ========================================= */
 
export function calculateRefrigerantEmissions(
  refrigerantType: string,
  leakKg: number
) {
  const factor =
    EMISSION_FACTORS.refrigerants[
      refrigerantType as keyof typeof EMISSION_FACTORS.refrigerants
    ] || 0;
 
  return factor * leakKg;
}
 
/* ========================================= */
/* WATER & WASTE EMISSIONS (SCOPE 3 HELPERS) */
/* ========================================= */
 
export function calculateWasteEmissions(
  totalWasteKg: number
) {
  return totalWasteKg * (EMISSION_FACTORS.wasteKg || 0);
}
 
export function calculateWaterEmissions(
  totalWaterKl: number
) {
  return totalWaterKl * (EMISSION_FACTORS.waterKl || 0);
}
 
/* ========================================= */
/* RENEWABLE ENERGY PERCENTAGE               */
/* ========================================= */
 
export function calculateRenewablePercentage(
  renewableKwh: number,
  totalElectricityKwh: number
) {
  if (totalElectricityKwh === 0)
    return 0;
 
  return Math.min(
    (renewableKwh /
      totalElectricityKwh) *
    100,
    100
  );
}
 
/* ========================================= */
/* WATER RECYCLING PERCENTAGE                */
/* ========================================= */
 
export function calculateWaterRecyclingPercentage(
  recycledWaterKl: number,
  totalWaterKl: number
) {
  if (totalWaterKl === 0)
    return 0;
 
  return Math.min(
    (recycledWaterKl /
      totalWaterKl) *
    100,
    100
  );
}
 
/* ========================================= */
/* WASTE DIVERSION PERCENTAGE                */
/* ========================================= */
 
export function calculateWasteDiversionPercentage(
  recyclableWasteKg: number,
  totalWasteKg: number
) {
  if (totalWasteKg === 0)
    return 0;
 
  return Math.min(
    (recyclableWasteKg /
      totalWasteKg) *
    100,
    100
  );
}
 
/* ========================================= */
/* ENERGY INTENSITY PER BED                  */
/* ========================================= */
 
export function calculateEnergyPerBed(
  electricityKwh: number,
  numberOfBeds: number
) {
  if (numberOfBeds === 0)
    return 0;
 
  return (
    electricityKwh / numberOfBeds
  );
}
 
/* ========================================= */
/* WATER INTENSITY PER BED                   */
/* ========================================= */
 
export function calculateWaterPerBed(
  waterKl: number,
  numberOfBeds: number
) {
  if (numberOfBeds === 0)
    return 0;
 
  return waterKl / numberOfBeds;
}
 
/* ========================================= */
/* WASTE PER BED                             */
/* ========================================= */
 
export function calculateWastePerBed(
  wasteKg: number,
  numberOfBeds: number
) {
  if (numberOfBeds === 0)
    return 0;
 
  return wasteKg / numberOfBeds;
}
 
/* ========================================= */
/* ESG READINESS SCORE                       */
/* ========================================= */
 
export function calculateESGReadinessScore({
  renewablePercentage,
  waterRecyclingPercentage,
  wasteDiversionPercentage,
  hasEsgPolicy,
  hasAuditReports,
  coverageRatio = 1,
}: {
  renewablePercentage: number;
 
  waterRecyclingPercentage: number;
 
  wasteDiversionPercentage: number;
 
  hasEsgPolicy: boolean;
 
  hasAuditReports: boolean;
 
  coverageRatio?: number;
}) {
  let score = 0;
 
  /**
   * ENVIRONMENTAL
   */
 
  score += renewablePercentage * 0.25;
 
  score +=
    waterRecyclingPercentage * 0.2;
 
  score +=
    wasteDiversionPercentage * 0.2;
 
  /**
   * GOVERNANCE
   */
 
  if (hasEsgPolicy) score += 15;
 
  if (hasAuditReports) score += 20;
 
  /**
   * COVERAGE ADJUSTMENT
   */
 
  const normalizedCoverage =
    Math.min(Math.max(coverageRatio, 0), 1);
 
  score *= normalizedCoverage;
 
  /**
   * MAX CAP
   */
 
  return Math.min(
    Math.round(score),
    100
  );
}
 
/* ========================================= */
/* COMPLETENESS ENGINE                       */
/* ========================================= */
 
export function calculateCategoryCompleteness(
  monthsUploaded: number
): number {
  return Math.min((monthsUploaded / 12) * 100, 100);
}
 
export function calculateOverallCompleteness({
  electricityCompleteness,
  waterCompleteness,
  wasteCompleteness,
  governanceCompleteness,
}: {
  electricityCompleteness: number;
  waterCompleteness: number;
  wasteCompleteness: number;
  governanceCompleteness: number;
}): number {
  return (
    (electricityCompleteness +
      waterCompleteness +
      wasteCompleteness +
      governanceCompleteness) /
    4
  );
}
 
/* ========================================= */
/* CONFIDENCE ENGINE                         */
/* ========================================= */
 
export function calculateConfidenceScore(
  monthsUploaded: number
): number {
  if (monthsUploaded <= 0) return 0;
  if (monthsUploaded === 1) return 0.18;
  if (monthsUploaded === 2) return 0.34;
  if (monthsUploaded >= 12) return 1.0;
  if (monthsUploaded >= 9) return 0.95;
  if (monthsUploaded >= 6) return 0.85;
  if (monthsUploaded >= 3) return 0.7;
  return 0;
}
 
/**
 * Human-readable confidence tier for UI (aligned with dynamic month coverage).
 */
export function calculateConfidenceLabel(confidence: number): string {
  if (!Number.isFinite(confidence) || confidence <= 0) return "Insufficient data";
  if (confidence < 0.35) return "Low";
  if (confidence < 0.6) return "Emerging";
  if (confidence < 0.8) return "Medium";
  if (confidence < 0.95) return "High";
  return "Very high";
}
 
/* ========================================= */
/* ANNUALIZATION ENGINE                      */
/* ========================================= */
 
export function annualizeValue(
  uploadedTotal: number,
  monthsUploaded: number
): number {
  if (monthsUploaded === 0) return 0;
  return (uploadedTotal / monthsUploaded) * 12;
}
 
export function annualizeElectricity(
  totalElectricityKwh: number,
  monthsUploaded: number
): number {
  return annualizeValue(
    totalElectricityKwh,
    monthsUploaded
  );
}
 
export function annualizeWater(
  totalWaterKl: number,
  monthsUploaded: number
): number {
  return annualizeValue(totalWaterKl, monthsUploaded);
}
 
export function annualizeFuel(
  totalFuelLitres: number,
  monthsUploaded: number
): number {
  return annualizeValue(
    totalFuelLitres,
    monthsUploaded
  );
}
 
export function annualizeWaste(
  totalWasteKg: number,
  monthsUploaded: number
): number {
  return annualizeValue(
    totalWasteKg,
    monthsUploaded
  );
}
 
// --------------------------------------------------------------------------
// ADDITIONAL ENGINE FUNCTIONS
// --------------------------------------------------------------------------
 
/**
 * Calculate benchmark scores based on industry standards.
 * Returns a JSON object where keys are metric names and values are benchmark values.
 */
export function calculateBenchmarkScores(params: {
  industry: string;
  renewablePercentage: number;
  waterRecyclingPercentage: number;
  wasteDiversionPercentage: number;
  energyPerBed: number;
  energyIntensityPerSqft?: number;
  waterPerBed: number;
  wastePerBed: number;
}): Record<string, number> {
  // Healthcare industry benchmarks (annual values)
  const benchmarks = {
    renewablePercentage: 30, // 30% renewable energy target
    waterRecyclingPercentage: 25, // 25% water recycling target
    wasteDiversionPercentage: 40, // 40% waste diversion target
    energyPerBed: 15000, // 15,000 kWh per bed per year
    energyIntensityPerSqft: 15, // 15 kWh/sqft/year target
    waterPerBed: 800, // 800 KL per bed per year
    wastePerBed: 1200, // 1,200 kg per bed per year
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
 
/**
 * Determine certification readiness based on calculated metrics.
 * Returns a JSON indicating which certifications the hospital is ready for.
 */
export function calculateCertificationReadiness(params: {
  renewablePercentage: number;
  waterRecyclingPercentage: number;
  wasteDiversionPercentage: number;
  governanceScore: number;
  completeness: number;
  confidence: number;
  benchmarkScores: Record<string, number>;
}): Record<string, boolean> {
  const { renewablePercentage, waterRecyclingPercentage, wasteDiversionPercentage, governanceScore, completeness, confidence, benchmarkScores } = params;
 
  // ISO 14001: Environmental Management Systems
  const iso14001 = renewablePercentage >= 50 && waterRecyclingPercentage >= 40 && wasteDiversionPercentage >= 30 && governanceScore >= 70;
 
  // ISO 50001: Energy Management Systems
  const iso50001 = renewablePercentage >= 60 && benchmarkScores.energyIntensityScore >= 80 && governanceScore >= 75;
 
  // NABH: National Accreditation Board for Hospitals & Healthcare Providers
  const nabh = completeness >= 80 && confidence >= 0.8 && governanceScore >= 80;
 
  // IGBC Healthcare: Indian Green Building Council
  const igbc = renewablePercentage >= 40 && waterRecyclingPercentage >= 30 && wasteDiversionPercentage >= 35 && benchmarkScores.energyIntensityScore >= 70;
 
  // LEED: Leadership in Energy and Environmental Design
  const leed = renewablePercentage >= 35 && waterRecyclingPercentage >= 25 && wasteDiversionPercentage >= 30;
 
  // WELL: WELL Building Standard
  const well = waterRecyclingPercentage >= 20 && wasteDiversionPercentage >= 25 && benchmarkScores.energyIntensityScore >= 60;
 
  // BRSR: Business Responsibility and Sustainability Reporting
  const brsr = completeness >= 75 && governanceScore >= 70 && renewablePercentage >= 25;
 
  // GRI: Global Reporting Initiative
  const gri = completeness >= 70 && confidence >= 0.7;
 
  // CDP: Carbon Disclosure Project
  const cdp = renewablePercentage >= 30 && benchmarkScores.energyIntensityScore >= 70;
 
  return {
    ISO14001: iso14001,
    ISO50001: iso50001,
    NABH: nabh,
    IGBC: igbc,
    LEED: leed,
    WELL: well,
    BRSR: brsr,
    GRI: gri,
    CDP: cdp,
  };
}
 
/**
 * Perform a gap analysis between current scores and benchmarks.
 * Returns a JSON with gap values and recommendations for each metric.
 */
export function calculateGapAnalysis(current: Record<string, number>, benchmark: Record<string, number>): {
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
 
/**
 * Determine overall readiness stage based on completeness and confidence.
 */
export function determineReadinessStage(params: {
  completeness: number;
  confidence: number;
  certificationReady: boolean;
}): string {
  const { completeness, confidence, certificationReady } = params;
  if (completeness >= 90 && confidence >= 0.9 && certificationReady) return "Ready for Certification";
  if (completeness >= 75 && confidence >= 0.75) return "Advanced";
  if (completeness >= 50) return "Intermediate";
  return "Basic";
}
 
/* ========================================= */
/* CATEGORY SCORES CALCULATION               */
/* ========================================= */
 
/**
 * Calculate individual category scores based on metrics.
 * Scores are based on renewable %, water recycling %, waste diversion %, and governance.
 */
export function calculateCategoryScores(params: {
  renewablePercentage: number;
  waterRecyclingPercentage: number;
  wasteDiversionPercentage: number;
  governanceScore: number;
  benchmarkScores: Record<string, number>;
  electricityCompleteness: number;
  waterCompleteness: number;
  wasteCompleteness: number;
}): Record<string, number> {
  const {
    renewablePercentage,
    waterRecyclingPercentage,
    wasteDiversionPercentage,
    governanceScore,
    benchmarkScores,
    electricityCompleteness,
    waterCompleteness,
    wasteCompleteness,
  } = params;
 
  const electricityMonths = Math.round((electricityCompleteness / 100) * 12);
  const electricityModifier = electricityMonths >= 3 ? calculateConfidenceScore(electricityMonths) : 0;
 
  // Energy score: parameter-level scoring where only electricity-dependent
  // components receive the confidence modifier.
  const monthlyElectricityTracking = electricityMonths > 0 ? 20 * electricityModifier : 0;
  const energyIntensityBenchmark = Math.min(20, Math.max(0, (benchmarkScores.energyIntensityScore ?? 0) * 0.2)) * electricityModifier;
  const ledCoverage = 0;
  const hvacEquipmentEfficiency = 7.5;
  const energyMonitoringSystem = 0;
  const renewableContribution = 0;
  const powerFactor = 5;
 
  const energyScore =
    monthlyElectricityTracking +
    energyIntensityBenchmark +
    ledCoverage +
    hvacEquipmentEfficiency +
    energyMonitoringSystem +
    renewableContribution +
    powerFactor;
 
  // Water score: based on recycling % and completeness
  const waterScore = Math.round(
    waterRecyclingPercentage * (waterCompleteness / 100)
  );
 
  // Waste score: based on diversion % and completeness
  const wasteScore = Math.round(
    wasteDiversionPercentage * (wasteCompleteness / 100)
  );
 
  // Governance score
  const governance = Math.round(governanceScore);
 
  return {
    energy: Math.min(Math.round(energyScore * 100) / 100, 100),
    water: Math.min(waterScore, 100),
    waste: Math.min(wasteScore, 100),
    governance: Math.min(governance, 100),
  };
}
 
/* ========================================= */
/* REGULATORY READINESS CALCULATION          */
/* ========================================= */
 
/**
 * Calculate regulatory readiness for major Indian regulations.
 */
export function calculateRegulatoryReadiness(params: {
  renewablePercentage: number;
  waterRecyclingPercentage: number;
  wasteDiversionPercentage: number;
  governanceScore: number;
  completeness: number;
  confidence: number;
  benchmarkScores: Record<string, number>;
}): {
  regulation: string;
  readiness: number;
  risk: "Low" | "Medium" | "Medium-High" | "High";
}[] {
  const {
    renewablePercentage,
    waterRecyclingPercentage,
    wasteDiversionPercentage,
    governanceScore,
    completeness,
    confidence,
    benchmarkScores,
  } = params;
 
  const regulations = [];
 
  // BRSR (Business Responsibility and Sustainability Reporting) - SEBI
  const brsrReadiness = Math.round(
    Math.min(
      completeness * 0.4 +
        governanceScore * 0.3 +
        renewablePercentage * 0.3,
      100
    )
  );
  const brsrRisk: "Low" | "Medium" | "Medium-High" | "High" =
    brsrReadiness >= 75
      ? "Low"
      : brsrReadiness >= 60
      ? "Medium"
      : "Medium-High";
  regulations.push({
    regulation: "BRSR (SEBI)",
    readiness: brsrReadiness,
    risk: brsrRisk,
  });
 
  // BMW (Biomedical Waste) Rules 2016
  const bmwReadiness = Math.round(
    Math.min(completeness * 0.5 + governanceScore * 0.5, 100)
  );
  const bmwRisk: "Low" | "Medium" | "Medium-High" | "High" =
    bmwReadiness >= 80
      ? "Low"
      : bmwReadiness >= 70
      ? "Medium"
      : bmwReadiness >= 50
      ? "Medium-High"
      : "High";
  regulations.push({
    regulation: "BMW Rules 2016",
    readiness: bmwReadiness,
    risk: bmwRisk,
  });
 
  // Hazardous Waste Rules 2016
  const hazardousReadiness = Math.round(
    Math.min(completeness * 0.6 + governanceScore * 0.4, 100)
  );
  const hazardousRisk: "Low" | "Medium" | "Medium-High" | "High" =
    hazardousReadiness >= 75
      ? "Low"
      : hazardousReadiness >= 60
      ? "Medium"
      : "Medium-High";
  regulations.push({
    regulation: "Hazardous Waste Rules",
    readiness: hazardousReadiness,
    risk: hazardousRisk,
  });
 
  // Energy Conservation Act 2001
  const energyReadiness = Math.round(
    Math.min(
      renewablePercentage * 0.4 +
        benchmarkScores.energyIntensityScore * 0.3 +
        governanceScore * 0.3,
      100
    )
  );
  const energyRisk: "Low" | "Medium" | "Medium-High" | "High" =
    energyReadiness >= 75
      ? "Low"
      : energyReadiness >= 60
      ? "Medium"
      : energyReadiness >= 45
      ? "Medium-High"
      : "High";
  regulations.push({
    regulation: "Energy Conservation Act",
    readiness: energyReadiness,
    risk: energyRisk,
  });
 
  // Water Management Act (for water recycling)
  const waterReadiness = Math.round(
    Math.min(waterRecyclingPercentage * 1.5 + completeness * 0.2, 100)
  );
  const waterRisk: "Low" | "Medium" | "Medium-High" | "High" =
    waterReadiness >= 70
      ? "Low"
      : waterReadiness >= 50
      ? "Medium"
      : "Medium-High";
  regulations.push({
    regulation: "Water Management Act",
    readiness: waterReadiness,
    risk: waterRisk,
  });
 
  return regulations;
}
 
/* ========================================= */
/* STRENGTHS & GAPS IDENTIFICATION           */
/* ========================================= */
 
/**
 * Identify strengths and critical gaps from calculated metrics.
 */
export function identifyStrengthsAndGaps(params: {
  renewablePercentage: number;
  waterRecyclingPercentage: number;
  wasteDiversionPercentage: number;
  governanceScore: number;
  completeness: number;
  benchmarkScores: Record<string, number>;
  electricityCompleteness: number;
  waterCompleteness: number;
  wasteCompleteness: number;
}): {
  strengths: string[];
  gaps: { text: string; severity: "High" | "Medium" | "Low" }[];
} {
  const {
    renewablePercentage,
    waterRecyclingPercentage,
    wasteDiversionPercentage,
    governanceScore,
    completeness,
    benchmarkScores,
    electricityCompleteness,
    waterCompleteness,
    wasteCompleteness,
  } = params;
 
  const strengths: string[] = [];
  const gaps: { text: string; severity: "High" | "Medium" | "Low" }[] = [];
 
  // Identify Strengths
  if (electricityCompleteness >= 75) {
    strengths.push(
      "Strong electricity data tracking — consistent monthly data available."
    );
  }
  if (waterCompleteness >= 75) {
    strengths.push("Comprehensive water management data — well-documented usage.");
  }
  if (wasteCompleteness >= 75) {
    strengths.push(
      "Strong waste segregation and tracking — fully implemented at source."
    );
  }
  if (governanceScore >= 70) {
    strengths.push(
      "Governance accountability established — ESG owner designated."
    );
  }
  if (completeness >= 80) {
    strengths.push(
      "High data completeness — 80%+ of ESG metrics tracked consistently."
    );
  }
  if (waterRecyclingPercentage >= 30) {
    strengths.push(
      "Water treatment infrastructure in place — recycling systems operational."
    );
  }
  if (wasteDiversionPercentage >= 40) {
    strengths.push(
      "Effective waste management — 40%+ diversion from landfill achieved."
    );
  }
 
  // Identify Gaps
  if (renewablePercentage < 25) {
    gaps.push({
      text: "No or minimal renewable energy integration — weakens multiple certifications.",
      severity: "High",
    });
  }
  if (benchmarkScores.energyIntensityScore < 60) {
    gaps.push({
      text: "Energy consumption above benchmark — implement efficiency upgrades.",
      severity: "High",
    });
  }
  if (governanceScore < 60) {
    gaps.push({
      text: "Limited ESG governance maturity — establish formal policies.",
      severity: "High",
    });
  }
  if (waterRecyclingPercentage < 15) {
    gaps.push({
      text: "Low water reuse practices — fresh water dependency is high.",
      severity: "Medium",
    });
  }
  if (wasteDiversionPercentage < 30) {
    gaps.push({
      text: "Below-benchmark waste diversion — improve segregation and recycling.",
      severity: "Medium",
    });
  }
  if (completeness < 70) {
    gaps.push({
      text: "Incomplete ESG data — insufficient months of data uploaded.",
      severity: "Medium",
    });
  }
 
  // Ensure we have at least a few items if none were found
  if (strengths.length === 0) {
    strengths.push("Data tracking initiated — foundation for improvement.");
  }
  if (gaps.length === 0) {
    gaps.push({
      text: "Continue monitoring metrics to maintain performance.",
      severity: "Low",
    });
  }
 
  return { strengths: strengths.slice(0, 4), gaps: gaps.slice(0, 4) };
}
 
/* ========================================= */
/* PRIORITY ACTION ROADMAP                   */
/* ========================================= */
 
/**
 * Generate priority action roadmap based on current metrics.
 */
export function generatePriorityRoadmap(params: {
  renewablePercentage: number;
  waterRecyclingPercentage: number;
  wasteDiversionPercentage: number;
  governanceScore: number;
  completeness: number;
  benchmarkScores: Record<string, number>;
}): { action: string; timeline: string; impact: string }[] {
  const {
    renewablePercentage,
    waterRecyclingPercentage,
    wasteDiversionPercentage,
    governanceScore,
    completeness,
    benchmarkScores,
  } = params;
 
  const roadmap: { action: string; timeline: string; impact: string }[] = [];
 
  // Immediate priority: Governance
  if (governanceScore < 70) {
    roadmap.push({
      action: "Formalize ESG policy and governance framework",
      timeline: "Immediate",
      impact: "Prerequisite for all certification pathways",
    });
  }
 
  // Immediate priority: Complete data tracking
  if (completeness < 80) {
    roadmap.push({
      action: "Achieve 100% monthly ESG data entry",
      timeline: "Immediate",
      impact: "Improves confidence in all assessments",
    });
  }
 
  // Short-term: Energy efficiency
  if (benchmarkScores.energyIntensityScore < 70) {
    roadmap.push({
      action: "Implement LED conversion program (80%+ coverage)",
      timeline: "0–3 Months",
      impact: "8–15% electricity consumption reduction",
    });
  }
 
  // Short-term: Renewable energy planning
  if (renewablePercentage < 30) {
    roadmap.push({
      action: "Develop renewable energy procurement plan",
      timeline: "0–3 Months",
      impact: "Improves IGBC and CDP readiness scores",
    });
  }
 
  // Medium-term: Water management
  if (waterRecyclingPercentage < 25) {
    roadmap.push({
      action: "Expand water recycling system capacity",
      timeline: "3–6 Months",
      impact: "Reduce freshwater consumption by 15–20%",
    });
  }
 
  // Medium-term: Energy management systems
  if (benchmarkScores.energyIntensityScore < 80) {
    roadmap.push({
      action: "Install centralized EMS/BMS monitoring",
      timeline: "3–6 Months",
      impact: "Real-time energy tracking and optimization",
    });
  }
 
  // Long-term: Renewable energy deployment
  if (renewablePercentage < 40) {
    roadmap.push({
      action: "Install rooftop solar or procure RECs",
      timeline: "6–12 Months",
      impact: "20–35% Scope 2 emissions reduction",
    });
  }
 
  // Long-term: Advanced waste management
  if (wasteDiversionPercentage < 50) {
    roadmap.push({
      action: "Establish waste-to-energy or advanced recycling",
      timeline: "6–12 Months",
      impact: "60%+ waste diversion from landfill",
    });
  }
 
  // Ensure we always have at least 5 items
  if (roadmap.length < 5) {
    roadmap.push({
      action: "Pursue advanced certifications (ISO 14001, NABH)",
      timeline: "12+ Months",
      impact: "Market differentiation and brand value",
    });
  }
 
  return roadmap.slice(0, 5);
}
 
// End of additional engine functions
 
 
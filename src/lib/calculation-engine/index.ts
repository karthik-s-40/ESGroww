import type { ESGConfiguration } from "../config-engine";
import { annualizeValue as centralAnnualizeValue } from "../calculations";
import { calculateCompleteness as centralCalculateCompleteness, getConfidenceModifier } from "../calculations";

export function calculateESGReadinessScore(params: {
  renewablePercentage: number;
  waterRecyclingPercentage: number;
  wasteDiversionPercentage: number;
  hasEsgPolicy: boolean;
  hasAuditReports: boolean;
  coverageRatio?: number;
}, config?: ESGConfiguration) {
  let score = 0;
  
  score += params.renewablePercentage * (config?.scoringWeights?.["renewable"] ?? 0.25);
  score += params.waterRecyclingPercentage * (config?.scoringWeights?.["water_recycling"] ?? 0.2);
  score += params.wasteDiversionPercentage * (config?.scoringWeights?.["waste_diversion"] ?? 0.2);

  if (params.hasEsgPolicy) score += (config?.scoringWeights?.["esg_policy"] ?? 15);
  if (params.hasAuditReports) score += (config?.scoringWeights?.["audit_reports"] ?? 20);

  const normalizedCoverage = Math.min(Math.max(params.coverageRatio ?? 1, 0), 1);
  score *= normalizedCoverage;

  return Math.min(Math.round(score), 100);
}

export function calculateCategoryCompleteness(monthsUploaded: number): number {
  return centralCalculateCompleteness(monthsUploaded).completenessPct;
}

export function calculateOverallCompleteness(params: {
  electricityCompleteness: number;
  waterCompleteness: number;
  wasteCompleteness: number;
  governanceCompleteness: number;
}): number {
  return (
    (params.electricityCompleteness +
      params.waterCompleteness +
      params.wasteCompleteness +
      params.governanceCompleteness) /
    4
  );
}

// TODO: Replace with DB driven logic if confidence logic is moved to DB (we have ConfidenceThreshold table)
export function calculateConfidenceScore(monthsUploaded: number, config?: any): number {
  // If DB-driven confidence thresholds are supplied in config, use them
  if (config?.confidenceThresholds && Array.isArray(config.confidenceThresholds)) {
    // expecting array of { monthsMin, modifier }
    const months = Math.max(0, Math.floor(monthsUploaded));
    for (const entry of config.confidenceThresholds) {
      if (months >= entry.monthsMin) return entry.modifier;
    }
  }

  // Fallback to existing mapping for backward compatibility
  if (monthsUploaded <= 0) return 0;
  if (monthsUploaded === 1) return 0.18;
  if (monthsUploaded === 2) return 0.34;
  if (monthsUploaded >= 12) return 1.0;
  if (monthsUploaded >= 9) return 0.95;
  if (monthsUploaded >= 6) return 0.85;
  if (monthsUploaded >= 3) return 0.7;
  return 0;
}

export function calculateConfidenceLabel(confidence: number): string {
  if (!Number.isFinite(confidence) || confidence <= 0) return "Insufficient data";
  if (confidence < 0.35) return "Low";
  if (confidence < 0.6) return "Emerging";
  if (confidence < 0.8) return "Medium";
  if (confidence < 0.95) return "High";
  return "Very high";
}

export function annualizeValue(uploadedTotal: number, monthsUploaded: number): number {
  return centralAnnualizeValue(uploadedTotal, monthsUploaded).annualizedValue;
}

export const annualizeElectricity = annualizeValue;
export const annualizeWater = annualizeValue;
export const annualizeFuel = annualizeValue;
export const annualizeWaste = annualizeValue;

export function calculateCertificationReadiness(params: {
  renewablePercentage: number;
  waterRecyclingPercentage: number;
  wasteDiversionPercentage: number;
  governanceScore: number;
  completeness: number;
  confidence: number;
  benchmarkScores: Record<string, number>;
}, config?: ESGConfiguration): Record<string, boolean> {
  const { renewablePercentage, waterRecyclingPercentage, wasteDiversionPercentage, governanceScore, completeness, confidence, benchmarkScores } = params;
  
  // Use config thresholds if they exist, else fallback to old hardcoded
  // Since we don't have all DB mappings yet, using hardcoded fallbacks here
  const iso14001 = renewablePercentage >= 50 && waterRecyclingPercentage >= 40 && wasteDiversionPercentage >= 30 && governanceScore >= 70;
  const iso50001 = renewablePercentage >= 60 && benchmarkScores.energyIntensityScore >= 80 && governanceScore >= 75;
  const nabh = completeness >= 80 && confidence >= 0.8 && governanceScore >= 80;
  const igbc = renewablePercentage >= 40 && waterRecyclingPercentage >= 30 && wasteDiversionPercentage >= 35 && benchmarkScores.energyIntensityScore >= 70;
  const leed = renewablePercentage >= 35 && waterRecyclingPercentage >= 25 && wasteDiversionPercentage >= 30;
  const well = waterRecyclingPercentage >= 20 && wasteDiversionPercentage >= 25 && benchmarkScores.energyIntensityScore >= 60;
  const brsr = completeness >= 75 && governanceScore >= 70 && renewablePercentage >= 25;
  const gri = completeness >= 70 && confidence >= 0.7;
  const cdp = renewablePercentage >= 30 && benchmarkScores.energyIntensityScore >= 70;

  return { ISO14001: iso14001, ISO50001: iso50001, NABH: nabh, IGBC: igbc, LEED: leed, WELL: well, BRSR: brsr, GRI: gri, CDP: cdp };
}

export function determineReadinessStage(params: {
  completeness: number;
  confidence: number;
  certificationReady: boolean;
}, config: ESGConfiguration): string {
  if (params.completeness >= 90 && params.confidence >= 0.9 && params.certificationReady) return "Ready for Certification";
  if (params.completeness >= 75 && params.confidence >= 0.75) return "Advanced";
  if (params.completeness >= 50) return "Intermediate";
  return "Basic";
}

export function calculateCategoryScores(params: {
  renewablePercentage: number;
  waterRecyclingPercentage: number;
  wasteDiversionPercentage: number;
  governanceScore: number;
  benchmarkScores: Record<string, number>;
  electricityCompleteness: number;
  waterCompleteness: number;
  wasteCompleteness: number;
}, config: ESGConfiguration): Record<string, number> {
  const electricityMonths = Math.round((params.electricityCompleteness / 100) * 12);
  const electricityModifier = electricityMonths >= 3 ? calculateConfidenceScore(electricityMonths) : 0;
  const monthlyElectricityTracking = electricityMonths > 0 ? 20 * electricityModifier : 0;
  const energyIntensityBenchmark = Math.min(20, Math.max(0, (params.benchmarkScores.energyIntensityScore ?? 0) * 0.2)) * electricityModifier;

  const energyScore = monthlyElectricityTracking + energyIntensityBenchmark + 12.5; // (7.5+5)
  const waterScore = Math.round(params.waterRecyclingPercentage * (params.waterCompleteness / 100));
  const wasteScore = Math.round(params.wasteDiversionPercentage * (params.wasteCompleteness / 100));
  const governance = Math.round(params.governanceScore);

  return {
    energy: Math.min(Math.round(energyScore * 100) / 100, 100),
    water: Math.min(waterScore, 100),
    waste: Math.min(wasteScore, 100),
    governance: Math.min(governance, 100),
  };
}

export function calculateRegulatoryReadiness(params: {
  renewablePercentage: number;
  waterRecyclingPercentage: number;
  wasteDiversionPercentage: number;
  governanceScore: number;
  completeness: number;
  confidence: number;
  benchmarkScores: Record<string, number>;
}, config: ESGConfiguration): { regulation: string; readiness: number; risk: "Low" | "Medium" | "Medium-High" | "High"; }[] {
  // BRSR
  const brsrReadiness = Math.round(Math.min(params.completeness * 0.4 + params.governanceScore * 0.3 + params.renewablePercentage * 0.3, 100));
  const brsrRisk = brsrReadiness >= 75 ? "Low" : brsrReadiness >= 60 ? "Medium" : "Medium-High";

  // BMW
  const bmwReadiness = Math.round(Math.min(params.completeness * 0.5 + params.governanceScore * 0.5, 100));
  const bmwRisk = bmwReadiness >= 80 ? "Low" : bmwReadiness >= 70 ? "Medium" : bmwReadiness >= 50 ? "Medium-High" : "High";

  // Hazardous Waste
  const hazardousReadiness = Math.round(Math.min(params.completeness * 0.6 + params.governanceScore * 0.4, 100));
  const hazardousRisk = hazardousReadiness >= 75 ? "Low" : hazardousReadiness >= 60 ? "Medium" : "Medium-High";

  // Energy Conservation
  const energyReadiness = Math.round(Math.min(params.renewablePercentage * 0.4 + params.benchmarkScores.energyIntensityScore * 0.3 + params.governanceScore * 0.3, 100));
  const energyRisk = energyReadiness >= 75 ? "Low" : energyReadiness >= 60 ? "Medium" : energyReadiness >= 45 ? "Medium-High" : "High";

  // Water Management
  const waterReadiness = Math.round(Math.min(params.waterRecyclingPercentage * 1.5 + params.completeness * 0.2, 100));
  const waterRisk = waterReadiness >= 70 ? "Low" : waterReadiness >= 50 ? "Medium" : "Medium-High";

  return [
    { regulation: "BRSR (SEBI)", readiness: brsrReadiness, risk: brsrRisk },
    { regulation: "BMW Rules 2016", readiness: bmwReadiness, risk: bmwRisk },
    { regulation: "Hazardous Waste Rules", readiness: hazardousReadiness, risk: hazardousRisk },
    { regulation: "Energy Conservation Act", readiness: energyReadiness, risk: energyRisk },
    { regulation: "Water Management Act", readiness: waterReadiness, risk: waterRisk }
  ];
}

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
}, config: ESGConfiguration): { strengths: string[]; gaps: { text: string; severity: "High" | "Medium" | "Low" }[]; } {
  const strengths: string[] = [];
  const gaps: { text: string; severity: "High" | "Medium" | "Low" }[] = [];

  if (params.electricityCompleteness >= 75) strengths.push("Strong electricity data tracking.");
  if (params.waterCompleteness >= 75) strengths.push("Comprehensive water management data.");
  if (params.wasteCompleteness >= 75) strengths.push("Strong waste segregation.");
  if (params.governanceScore >= 70) strengths.push("Governance accountability established.");
  if (params.completeness >= 80) strengths.push("High data completeness.");
  if (params.waterRecyclingPercentage >= 30) strengths.push("Water treatment infrastructure in place.");
  if (params.wasteDiversionPercentage >= 40) strengths.push("Effective waste management.");

  if (params.renewablePercentage < 25) gaps.push({ text: "No renewable energy integration.", severity: "High" });
  if (params.benchmarkScores.energyIntensityScore < 60) gaps.push({ text: "Energy consumption above benchmark.", severity: "High" });
  if (params.governanceScore < 60) gaps.push({ text: "Limited ESG governance maturity.", severity: "High" });
  if (params.waterRecyclingPercentage < 15) gaps.push({ text: "Low water reuse practices.", severity: "Medium" });
  if (params.wasteDiversionPercentage < 30) gaps.push({ text: "Below-benchmark waste diversion.", severity: "Medium" });
  if (params.completeness < 70) gaps.push({ text: "Incomplete ESG data.", severity: "Medium" });

  if (strengths.length === 0) strengths.push("Data tracking initiated.");
  // Expand the electricity strength message for richer reporting
  strengths[0] = strengths[0].replace("Strong electricity data tracking.", "Strong electricity data tracking — consistent monthly data available.");
  if (gaps.length === 0) gaps.push({ text: "Continue monitoring metrics.", severity: "Low" });

  return { strengths: strengths.slice(0, 4), gaps: gaps.slice(0, 4) };
}

export function generatePriorityRoadmap(params: {
  renewablePercentage: number;
  waterRecyclingPercentage: number;
  wasteDiversionPercentage: number;
  governanceScore: number;
  completeness: number;
  benchmarkScores: Record<string, number>;
}, config: ESGConfiguration): { action: string; timeline: string; impact: string }[] {
  const roadmap: { action: string; timeline: string; impact: string }[] = [];

  if (params.governanceScore < 70) roadmap.push({ action: "Formalize ESG policy", timeline: "Immediate", impact: "Prerequisite for certifications" });
  if (params.completeness < 80) roadmap.push({ action: "Achieve 100% monthly ESG data entry", timeline: "Immediate", impact: "Improves confidence" });
  if (params.benchmarkScores.energyIntensityScore < 70) roadmap.push({ action: "Implement LED conversion program", timeline: "0–3 Months", impact: "8–15% electricity reduction" });
  if (params.renewablePercentage < 30) roadmap.push({ action: "Develop renewable energy procurement plan", timeline: "0–3 Months", impact: "Improves IGBC scores" });
  if (params.waterRecyclingPercentage < 25) roadmap.push({ action: "Expand water recycling", timeline: "3–6 Months", impact: "Reduce freshwater consumption" });
  if (params.benchmarkScores.energyIntensityScore < 80) roadmap.push({ action: "Install EMS/BMS", timeline: "3–6 Months", impact: "Real-time energy optimization" });
  if (params.renewablePercentage < 40) roadmap.push({ action: "Install rooftop solar", timeline: "6–12 Months", impact: "20–35% Scope 2 reduction" });
  if (params.wasteDiversionPercentage < 50) roadmap.push({ action: "Establish advanced recycling", timeline: "6–12 Months", impact: "60%+ waste diversion" });

  if (roadmap.length < 5) roadmap.push({ action: "Pursue advanced certifications", timeline: "12+ Months", impact: "Market differentiation" });

  return roadmap.slice(0, 5);
}

"use server";
 
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
 
import {
  calculateScope2Emissions,
  calculateDieselEmissions,
  calculateTransportEmissions,
  calculateRefrigerantEmissions,
  calculateWasteEmissions,
  calculateWaterEmissions,
  calculateRenewablePercentage,
  calculateWaterRecyclingPercentage,
  calculateWasteDiversionPercentage,
  calculateESGReadinessScore,
  calculateCategoryCompleteness,
  calculateOverallCompleteness,
  calculateConfidenceScore,
  annualizeElectricity,
  annualizeWater,
  annualizeFuel,
  annualizeWaste,
  calculateBenchmarkScores,
  calculateGapAnalysis,
  determineReadinessStage,
  calculateEnergyPerBed,
  calculateWaterPerBed,
  calculateWastePerBed,
  calculateCategoryScores,
  calculateRegulatoryReadiness,
  identifyStrengthsAndGaps,
  generatePriorityRoadmap,
} from "@/lib/esgCalculations";
import {
  BRD_MIN_MONTHS_FOR_ANNUALIZATION,
  BRD_MIN_MONTHS_FOR_READINESS_GATE,
} from "@/lib/upload/brdConstants";
 
function distinctOperationalMonths<T extends { month: string; year: number }>(rows: T[]): number {
  return new Set(rows.map((r) => `${r.year}|${r.month}`)).size;
}
 
function annualizationDenominator(distinctMonths: number): number {
  return distinctMonths >= BRD_MIN_MONTHS_FOR_ANNUALIZATION ? distinctMonths : 0;
}
 
export async function computeAndSaveAssessment() {
  const user = await getCurrentUser();
 
  if (!user) {
    throw new Error("Unauthorized");
  }
 
  const hospitalId = user.hospitalId;
 
  const hospital = await prisma.hospital.findUnique({
    where: {
      id: hospitalId,
    },
  });
 
  if (!hospital) {
    throw new Error("Hospital not found");
  }
 
  // ─────────────────────────────────────────────
  // FETCH DATA
  // ─────────────────────────────────────────────
 
  const electricityData =
    await prisma.electricityData.findMany({
      where: { hospitalId },
    });
 
  const waterData =
    await prisma.waterData.findMany({
      where: { hospitalId },
    });
 
  const fuelData =
    await prisma.fuelData.findMany({
      where: { hospitalId },
    });
 
  const wasteData =
    await prisma.wasteData.findMany({
      where: { hospitalId },
    });
 
  const transportData =
    await prisma.transportData.findMany({
      where: { hospitalId },
    });
 
  const refrigerantData =
    await prisma.refrigerantData.findMany({
      where: { hospitalId },
    });
 
  const governanceData =
    await prisma.governanceData.findUnique({
      where: { hospitalId },
    });
 
  // ─────────────────────────────────────────────
  // TOTALS
  // ─────────────────────────────────────────────
 
  const totalElectricity =
    electricityData.reduce(
      (sum, row) =>
        sum + row.electricityKwh,
      0
    );
 
  const totalRenewable =
    electricityData.reduce(
      (sum, row) =>
        sum + row.renewableKwh,
      0
    );
 
  const totalWater =
    waterData.reduce(
      (sum, row) =>
        sum + row.waterKl,
      0
    );
 
  const totalRecycledWater =
    waterData.reduce(
      (sum, row) =>
        sum + row.recycledWaterKl,
      0
    );
 
  const totalFuel =
    fuelData.reduce(
      (sum, row) =>
        sum + row.dgDieselLitres,
      0
    );
 
  const totalWaste =
    wasteData.reduce(
      (sum, row) =>
        sum +
        row.biomedicalWasteKg +
        row.recyclableWasteKg +
        row.landfillWasteKg,
      0
    );
 
  const recyclableWaste =
    wasteData.reduce(
      (sum, row) =>
        sum + row.recyclableWasteKg,
      0
    );
 
  // ─────────────────────────────────────────────
  // MONTH COUNTS
  // ─────────────────────────────────────────────
 
  const electricityMonths = distinctOperationalMonths(electricityData);
 
  const waterMonths = distinctOperationalMonths(waterData);
 
  const fuelMonths = distinctOperationalMonths(fuelData);
 
  const wasteMonths = distinctOperationalMonths(wasteData);
 
  const transportDistinctMonths = distinctOperationalMonths(transportData);
 
  const refrigerantDistinctMonths = distinctOperationalMonths(refrigerantData);
 
  const readinessEligible =
    electricityMonths >= BRD_MIN_MONTHS_FOR_READINESS_GATE &&
    waterMonths >= BRD_MIN_MONTHS_FOR_READINESS_GATE &&
    wasteMonths >= BRD_MIN_MONTHS_FOR_READINESS_GATE;
 
  // ─────────────────────────────────────────────
  // COMPLETENESS
  // ─────────────────────────────────────────────
 
  const electricityCompleteness =
    calculateCategoryCompleteness(
      electricityMonths
    );
 
  const waterCompleteness =
    calculateCategoryCompleteness(
      waterMonths
    );
 
  const wasteCompleteness =
    calculateCategoryCompleteness(
      wasteMonths
    );
 
  const governanceCompleteness =
    governanceData ? 100 : 0;
 
  const overallCompleteness =
    calculateOverallCompleteness({
      electricityCompleteness,
      waterCompleteness,
      wasteCompleteness,
      governanceCompleteness,
    });
 
  // ─────────────────────────────────────────────
  // CONFIDENCE ENGINE
  // ─────────────────────────────────────────────
 
  const electricityConfidence =
    calculateConfidenceScore(
      electricityMonths
    );
 
  const waterConfidence =
    calculateConfidenceScore(
      waterMonths
    );
 
  const fuelConfidence =
    calculateConfidenceScore(
      fuelMonths
    );
 
  const wasteConfidence =
    calculateConfidenceScore(
      wasteMonths
    );
 
  const confidenceScore =
    (
      electricityConfidence +
      waterConfidence +
      fuelConfidence +
      wasteConfidence
    ) / 4;
 
  // ─────────────────────────────────────────────
  // ANNUALIZATION
  // ─────────────────────────────────────────────
 
  const annualizedElectricity = annualizeElectricity(
    totalElectricity,
    annualizationDenominator(electricityMonths)
  );
 
  const annualizedWater = annualizeWater(totalWater, annualizationDenominator(waterMonths));
 
  const annualizedFuel = annualizeFuel(totalFuel, annualizationDenominator(fuelMonths));
 
  const annualizedWaste = annualizeWaste(totalWaste, annualizationDenominator(wasteMonths));
 
  const energyIntensityPerSqft =
    hospital.builtUpArea > 0
      ? annualizedElectricity / hospital.builtUpArea
      : 0;
 
  // ─────────────────────────────────────────────
  // EMISSIONS
  // ─────────────────────────────────────────────
 
  const scope2Emissions =
    calculateScope2Emissions(
      annualizedElectricity
    );
 
  const dieselEmissions =
    calculateDieselEmissions(
      annualizedFuel
    );
 
  const transportEmissions =
    transportData.reduce(
      (sum, row) =>
        sum +
        calculateTransportEmissions(
          row.ambulanceFuelLitres
        ),
      0
    );
 
  const refrigerantEmissions =
    refrigerantData.reduce(
      (sum, row) =>
        sum +
        calculateRefrigerantEmissions(
          row.refrigerantType,
          row.refrigerantLeakKg
        ),
      0
    );
 
  // Compute water and waste emissions (used for Scope 3)
  const wasteEmissions =
    calculateWasteEmissions(annualizedWaste);
 
  const waterEmissions =
    calculateWaterEmissions(annualizedWater);
 
  const totalEmissions =
    scope2Emissions +
    dieselEmissions +
    refrigerantEmissions +
    transportEmissions +
    wasteEmissions +
    waterEmissions;
 
  // ─────────────────────────────────────────────
  // ESG METRICS
  // ─────────────────────────────────────────────
 
  const renewablePercentage =
    calculateRenewablePercentage(
      totalRenewable,
      totalElectricity
    );
 
  const waterRecyclingPercentage =
    calculateWaterRecyclingPercentage(
      totalRecycledWater,
      totalWater
    );
 
  const wasteDiversionPercentage =
    calculateWasteDiversionPercentage(
      recyclableWaste,
      totalWaste
    );
 
  // ─────────────────────────────────────────────
  // PER BED METRICS
  // ─────────────────────────────────────────────
 
  const energyPerBed =
    calculateEnergyPerBed(
      annualizedElectricity,
      hospital.numberOfBeds
    );
 
  const waterPerBed =
    calculateWaterPerBed(
      annualizedWater,
      hospital.numberOfBeds
    );
 
  const wastePerBed =
    calculateWastePerBed(
      annualizedWaste,
      hospital.numberOfBeds
    );
 
  // ─────────────────────────────────────────────
  // OVERALL ESG SCORE
  // ─────────────────────────────────────────────
 
  const overallScore =
    calculateESGReadinessScore({
      renewablePercentage,
      waterRecyclingPercentage,
      wasteDiversionPercentage,
      hasEsgPolicy:
        governanceData?.hasEsgPolicy ||
        false,
      hasAuditReports:
        governanceData?.hasAuditReports ||
        false,
      coverageRatio:
        confidenceScore,
    });
 
  // ─────────────────────────────────────────────
  // BENCHMARKS
  // ─────────────────────────────────────────────
 
  const benchmarkScores =
    calculateBenchmarkScores({
      industry:
        hospital.industry,
      renewablePercentage,
      waterRecyclingPercentage,
      wasteDiversionPercentage,
      energyPerBed,
      energyIntensityPerSqft,
      waterPerBed,
      wastePerBed,
    });
 
  // ─────────────────────────────────────────────
  // CATEGORY SCORES
  // ─────────────────────────────────────────────
 
  const categoryScores =
    calculateCategoryScores({
      renewablePercentage,
      waterRecyclingPercentage,
      wasteDiversionPercentage,
      governanceScore:
        governanceCompleteness,
      benchmarkScores,
      electricityCompleteness,
      waterCompleteness,
      wasteCompleteness,
    });
 
  // ─────────────────────────────────────────────
  // GAP ANALYSIS
  // ─────────────────────────────────────────────
 
  const gapAnalysis =
    calculateGapAnalysis(
      {
        renewableScore:
          renewablePercentage,
 
        waterScore:
          waterRecyclingPercentage,
 
        wasteScore:
          wasteDiversionPercentage,
      },
      benchmarkScores
    );
 
  // ─────────────────────────────────────────────
  // READINESS STAGE
  // ─────────────────────────────────────────────
 
  let readinessStage = determineReadinessStage({
    completeness: overallCompleteness,
    confidence: confidenceScore,
    certificationReady: overallScore >= 70,
  });
 
  if (!readinessEligible) {
    readinessStage = "Operational data lock (months)";
  }
 
  // ─────────────────────────────────────────────
  // REGULATORY READINESS
  // ─────────────────────────────────────────────
 
  const regulatoryReadiness =
    calculateRegulatoryReadiness({
      renewablePercentage,
      waterRecyclingPercentage,
      wasteDiversionPercentage,
      governanceScore:
        governanceCompleteness,
      completeness:
        overallCompleteness,
      confidence:
        confidenceScore,
      benchmarkScores,
    });
 
  // ─────────────────────────────────────────────
  // STRENGTHS & GAPS
  // ─────────────────────────────────────────────
 
  const {
    strengths,
    gaps,
  } =
    identifyStrengthsAndGaps({
      renewablePercentage,
      waterRecyclingPercentage,
      wasteDiversionPercentage,
      governanceScore:
        governanceCompleteness,
      completeness:
        overallCompleteness,
      benchmarkScores,
      electricityCompleteness,
      waterCompleteness,
      wasteCompleteness,
    });
 
  // ─────────────────────────────────────────────
  // ROADMAP
  // ─────────────────────────────────────────────
 
  const roadmap =
    generatePriorityRoadmap({
      renewablePercentage,
      waterRecyclingPercentage,
      wasteDiversionPercentage,
      governanceScore:
        governanceCompleteness,
      completeness:
        overallCompleteness,
      benchmarkScores,
    });
 
  // ─────────────────────────────────────────────
  // CATEGORY CONFIDENCE
  // ─────────────────────────────────────────────
 
  const categoryConfidence = [
    {
      category: "Energy",
      months:
        electricityMonths,
      confidence:
        electricityConfidence,
    },
 
    {
      category: "Water",
      months:
        waterMonths,
      confidence:
        waterConfidence,
    },
 
    {
      category: "Fuel",
      months:
        fuelMonths,
      confidence:
        fuelConfidence,
    },
 
    {
      category: "Waste",
      months:
        wasteMonths,
      confidence:
        wasteConfidence,
    },
    {
      category: "Governance",
      months: governanceData ? 1 : 0,
      confidence: governanceCompleteness ? governanceCompleteness / 100 : 0,
    },
  ];
 
  // ─────────────────────────────────────────────
  // REAL CERTIFICATION ENGINE
  // ─────────────────────────────────────────────
 
  const certificationReadinessArray =
    [
      {
        name: "ISO14001",
 
        score: Math.round(
          (
            waterRecyclingPercentage *
              0.25 +
            wasteDiversionPercentage *
              0.25 +
            renewablePercentage *
              0.2 +
            governanceCompleteness *
              0.3
          )
        ),
 
        status:
          governanceCompleteness >=
            70 &&
          waterRecyclingPercentage >=
            30
            ? "Strong Readiness"
            : governanceCompleteness >=
              50
            ? "Foundational"
            : "Not Ready",
      },
 
      {
        name: "ISO50001",
 
        score: Math.round(
          (
            renewablePercentage *
              0.45 +
            (benchmarkScores.energyIntensityScore ||
              0) *
              0.35 +
            governanceCompleteness *
              0.2
          )
        ),
 
        status:
          renewablePercentage >=
          50
            ? "Certification Possible"
            : renewablePercentage >=
              25
            ? "Foundational"
            : "Not Ready",
      },
 
      {
        name: "NABH",
 
        score: Math.round(
          (
            overallCompleteness *
              0.4 +
            confidenceScore *
              100 *
              0.2 +
            governanceCompleteness *
              0.4
          )
        ),
 
        status:
          overallCompleteness >=
          80
            ? "Strong Readiness"
            : overallCompleteness >=
              60
            ? "Foundational"
            : "Not Ready",
      },
 
      {
        name: "IGBC",
 
        score: Math.round(
          (
            renewablePercentage *
              0.3 +
            waterRecyclingPercentage *
              0.2 +
            wasteDiversionPercentage *
              0.2 +
            (benchmarkScores.energyIntensityScore ||
              0) *
              0.3
          )
        ),
 
        status:
          renewablePercentage >=
          40
            ? "Certification Possible"
            : renewablePercentage >=
              20
            ? "Foundational"
            : "Not Ready",
      },
 
      {
        name: "LEED",
 
        score: Math.round(
          (
            renewablePercentage *
              0.35 +
            waterRecyclingPercentage *
              0.25 +
            wasteDiversionPercentage *
              0.2 +
            (benchmarkScores.energyIntensityScore ||
              0) *
              0.2
          )
        ),
 
        status:
          renewablePercentage >=
          35
            ? "Certification Possible"
            : renewablePercentage >=
              15
            ? "Foundational"
            : "Not Ready",
      },
 
      {
        name: "WELL",
 
        score: Math.round(
          (
            waterRecyclingPercentage *
              0.4 +
            governanceCompleteness *
              0.3 +
            (benchmarkScores.energyIntensityScore ||
              0) *
              0.3
          )
        ),
 
        status:
          waterRecyclingPercentage >=
          25
            ? "Certification Possible"
            : waterRecyclingPercentage >=
              10
            ? "Foundational"
            : "Not Ready",
      },
 
      {
        name: "BRSR",
 
        score: Math.round(
          (
            overallCompleteness *
              0.4 +
            governanceCompleteness *
              0.3 +
            renewablePercentage *
              0.3
          )
        ),
 
        status:
          overallCompleteness >=
          75
            ? "Strong Readiness"
            : overallCompleteness >=
              50
            ? "Foundational"
            : "Not Ready",
      },
 
      {
        name: "GRI",
 
        score: Math.round(
          (
            overallCompleteness *
              0.5 +
            confidenceScore *
              100 *
              0.5
          )
        ),
 
        status:
          overallCompleteness >=
          70
            ? "Certification Possible"
            : overallCompleteness >=
              40
            ? "Foundational"
            : "Not Ready",
      },
 
      {
        name: "CDP",
 
        score: Math.round(
          (
            renewablePercentage *
              0.5 +
            (benchmarkScores.energyIntensityScore ||
              0) *
              0.5
          )
        ),
 
        status:
          renewablePercentage >=
          30
            ? "Certification Possible"
            : renewablePercentage >=
              15
            ? "Foundational"
            : "Not Ready",
      },
    ];
 
  // ─────────────────────────────────────────────
  // SAVE HISTORY
  // ─────────────────────────────────────────────
 
  await prisma.assessmentHistory.create({
    data: {
      hospitalId,
 
      completenessPct:
        overallCompleteness,
 
      confidenceScore,
 
      annualizedValues: {
        electricity:
          annualizedElectricity,
 
        water:
          annualizedWater,
 
        fuel:
          annualizedFuel,
 
        waste:
          annualizedWaste,
      },
 
      benchmarkScores,
 
      certificationReadiness:
        certificationReadinessArray,
 
      gapAnalysis,
 
      readinessStage,
    },
  });
 
  // ─────────────────────────────────────────────
  // FINAL RESPONSE
  // ─────────────────────────────────────────────
 
  return {
    overallScore,
 
    readinessStage,
 
    completeness:
      overallCompleteness,
 
    confidence:
      confidenceScore,
 
    totalEmissions,
 
    builtUpArea:
      hospital.builtUpArea,
 
    orgName:
      hospital.hospitalName,
 
    sector:
      hospital.industry,
 
    benchmarkScores,
 
    annualizedValues: {
      electricity: annualizedElectricity,
 
      water: annualizedWater,
 
      fuel: annualizedFuel,
 
      waste: annualizedWaste,
 
      monthsUploaded: {
        electricity: electricityMonths,
        water: waterMonths,
        fuel: fuelMonths,
        waste: wasteMonths,
        governance: governanceData ? 1 : 0,
        transport: transportDistinctMonths,
        refrigerants: refrigerantDistinctMonths,
      },
    },
 
    categoryScores: {
      energy:
        electricityMonths >= BRD_MIN_MONTHS_FOR_ANNUALIZATION
          ? categoryScores.energy
          : 0,
 
      water:
        waterMonths >= BRD_MIN_MONTHS_FOR_ANNUALIZATION
          ? categoryScores.water
          : 0,
 
      waste:
        wasteMonths >= BRD_MIN_MONTHS_FOR_ANNUALIZATION
          ? categoryScores.waste
          : 0,
 
      governance:
        categoryScores.governance,
    },
 
    categoryConfidence,
 
    certificationReadiness:
      certificationReadinessArray,
 
    gapAnalysis,
 
    strengths,
 
    gaps,
 
    regulatoryReadiness,
 
    roadmap,
 
    emissions: {
      // Scope 1: direct emissions (diesel gensets, refrigerants)
      scope1:
        dieselEmissions +
        refrigerantEmissions,
 
      // Scope 2: purchased electricity
      scope2:
        scope2Emissions,
 
      // Scope 3: value chain — Transport + Waste + Water (as requested)
      scope3:
        transportEmissions +
        wasteEmissions +
        waterEmissions,
    },
 
    metadata: {
      minimumRequiredMonths: BRD_MIN_MONTHS_FOR_ANNUALIZATION,
      minimumAnnualizationMonths: BRD_MIN_MONTHS_FOR_ANNUALIZATION,
      minimumReadinessMonths: BRD_MIN_MONTHS_FOR_READINESS_GATE,
      readinessEligible,
 
      dataAvailability: {
        electricity: electricityMonths > 0,
        water: waterMonths > 0,
        fuel: fuelMonths > 0,
        waste: wasteMonths > 0,
      },
 
      insufficientData: {
        electricity:
          electricityMonths > 0 && electricityMonths < BRD_MIN_MONTHS_FOR_ANNUALIZATION,
        water: waterMonths > 0 && waterMonths < BRD_MIN_MONTHS_FOR_ANNUALIZATION,
        fuel: fuelMonths > 0 && fuelMonths < BRD_MIN_MONTHS_FOR_ANNUALIZATION,
        waste: wasteMonths > 0 && wasteMonths < BRD_MIN_MONTHS_FOR_ANNUALIZATION,
      },
 
      insufficientReadiness: {
        electricity:
          electricityMonths > 0 && electricityMonths < BRD_MIN_MONTHS_FOR_READINESS_GATE,
        water: waterMonths > 0 && waterMonths < BRD_MIN_MONTHS_FOR_READINESS_GATE,
        waste: wasteMonths > 0 && wasteMonths < BRD_MIN_MONTHS_FOR_READINESS_GATE,
      },
 
      messages: {
        electricity:
          electricityMonths < BRD_MIN_MONTHS_FOR_ANNUALIZATION
            ? `Minimum ${BRD_MIN_MONTHS_FOR_ANNUALIZATION} distinct months required for annualization. ${electricityMonths} uploaded.`
            : null,
        water:
          waterMonths < BRD_MIN_MONTHS_FOR_ANNUALIZATION
            ? `Minimum ${BRD_MIN_MONTHS_FOR_ANNUALIZATION} distinct months required for annualization. ${waterMonths} uploaded.`
            : null,
        fuel:
          fuelMonths < BRD_MIN_MONTHS_FOR_ANNUALIZATION
            ? `Minimum ${BRD_MIN_MONTHS_FOR_ANNUALIZATION} distinct months required for annualization. ${fuelMonths} uploaded.`
            : null,
        waste:
          wasteMonths < BRD_MIN_MONTHS_FOR_ANNUALIZATION
            ? `Minimum ${BRD_MIN_MONTHS_FOR_ANNUALIZATION} distinct months required for annualization. ${wasteMonths} uploaded.`
            : null,
      },
 
      readinessMessages: {
        electricity:
          electricityMonths < BRD_MIN_MONTHS_FOR_READINESS_GATE
            ? `${electricityMonths} distinct month(s) uploaded. Minimum ${BRD_MIN_MONTHS_FOR_READINESS_GATE} required for readiness unlock.`
            : null,
        water:
          waterMonths < BRD_MIN_MONTHS_FOR_READINESS_GATE
            ? `${waterMonths} distinct month(s) uploaded. Minimum ${BRD_MIN_MONTHS_FOR_READINESS_GATE} required for readiness unlock.`
            : null,
        waste:
          wasteMonths < BRD_MIN_MONTHS_FOR_READINESS_GATE
            ? `${wasteMonths} distinct month(s) uploaded. Minimum ${BRD_MIN_MONTHS_FOR_READINESS_GATE} required for readiness unlock.`
            : null,
      },
    },
 
    // Add percentage metrics needed for KPI calculations
    percentages: {
      renewableEnergy:
        renewablePercentage,
      waterRecycling:
        waterRecyclingPercentage,
      wasteRecycling:
        wasteDiversionPercentage,
    },
 
    // Add per-bed and per-sqft metrics
    perBedMetrics: {
      energyPerBed,
      waterPerBed,
      wastePerBed,
    },
 
    // Hospital info needed for KPI cards
    orgBeds:
      hospital.numberOfBeds,
 
    // Total values for reference
    totals: {
      electricity:
        totalElectricity,
      renewable:
        totalRenewable,
      water:
        totalWater,
      recycledWater:
        totalRecycledWater,
      fuel:
        totalFuel,
      waste:
        totalWaste,
      recyclableWaste,
    },
  };
}
 
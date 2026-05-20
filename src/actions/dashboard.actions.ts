"use server";

import { prisma } from "@/lib/db";

import {
  calculateScope2Emissions,
  calculateDieselEmissions,
  calculateTransportEmissions,
  calculateRefrigerantEmissions,

  calculateRenewablePercentage,
  calculateWaterRecyclingPercentage,
  calculateWasteDiversionPercentage,

  calculateEnergyPerBed,
  calculateWaterPerBed,
  calculateWastePerBed,
  calculateBenchmarkScores,
  calculateCertificationReadiness,
  calculateConfidenceScore,
  calculateGapAnalysis,

  calculateESGReadinessScore,
} from "@/lib/esgCalculations";

export async function fetchDashboardIntelligence() {
  const hospital =
    await prisma.hospital.findFirst({
      include: {
        electricityData: true,
        waterData: true,
        fuelData: true,
        wasteData: true,
        refrigerantData: true,
        transportData: true,
        governanceData: true,
      },
    });

  if (!hospital) {
    throw new Error(
      "No hospital found."
    );
  }

  /* =============================== */
  /* MINIMUM DATA REQUIREMENT        */
  /* =============================== */

  // Count unique month-year combinations across all categories
  const uniqueMonths = new Set<string>();

  // Add electricity months
  hospital.electricityData.forEach(row => {
    uniqueMonths.add(`${row.month}-${row.year}`);
  });

  // Add water months
  hospital.waterData.forEach(row => {
    uniqueMonths.add(`${row.month}-${row.year}`);
  });

  // Add fuel months
  hospital.fuelData.forEach(row => {
    uniqueMonths.add(`${row.month}-${row.year}`);
  });

  // Add waste months
  hospital.wasteData.forEach(row => {
    uniqueMonths.add(`${row.month}-${row.year}`);
  });

  // Add refrigerant months
  hospital.refrigerantData.forEach(row => {
    uniqueMonths.add(`${row.month}-${row.year}`);
  });

  // Add transport months
  hospital.transportData.forEach(row => {
    uniqueMonths.add(`${row.month}-${row.year}`);
  });

  const totalUniqueMonths = uniqueMonths.size;

  if (totalUniqueMonths < 6) {
    return {
      hospitalName: hospital.hospitalName,
      industry: hospital.industry,
      error: `Insufficient data for ESG analysis. You have uploaded ${totalUniqueMonths} months of data. Minimum 6 months required.`,
      requiresMoreData: true,
      monthsUploaded: totalUniqueMonths,
      minimumRequired: 6,
    };
  }

  /* =============================== */
  /* ELECTRICITY                     */
  /* =============================== */

  const electricityKwh =
    hospital.electricityData.reduce(
      (acc, row) =>
        acc + row.electricityKwh,
      0
    );

  const renewableKwh =
    hospital.electricityData.reduce(
      (acc, row) =>
        acc + row.renewableKwh,
      0
    );

  /* =============================== */
  /* WATER                           */
  /* =============================== */

  const waterKl =
    hospital.waterData.reduce(
      (acc, row) =>
        acc + row.waterKl,
      0
    );

  const recycledWaterKl =
    hospital.waterData.reduce(
      (acc, row) =>
        acc + row.recycledWaterKl,
      0
    );

  /* =============================== */
  /* FUEL                            */
  /* =============================== */

  const dgDieselLitres =
    hospital.fuelData.reduce(
      (acc, row) =>
        acc + row.dgDieselLitres,
      0
    );

  /* =============================== */
  /* WASTE                           */
  /* =============================== */

  const totalWasteKg =
    hospital.wasteData.reduce(
      (acc, row) =>
        acc +
        row.biomedicalWasteKg +
        row.recyclableWasteKg +
        row.landfillWasteKg,
      0
    );

  const recyclableWasteKg =
    hospital.wasteData.reduce(
      (acc, row) =>
        acc +
        row.recyclableWasteKg,
      0
    );

  /* =============================== */
  /* TRANSPORT                       */
  /* =============================== */

  const ambulanceFuelLitres =
    hospital.transportData.reduce(
      (acc, row) =>
        acc +
        row.ambulanceFuelLitres,
      0
    );

  /* =============================== */
  /* EMISSIONS                       */
  /* =============================== */

  const scope2Emissions =
    calculateScope2Emissions(
      electricityKwh
    );

  const dieselEmissions =
    calculateDieselEmissions(
      dgDieselLitres
    );

  const transportEmissions =
    calculateTransportEmissions(
      ambulanceFuelLitres
    );

  let refrigerantEmissions = 0;

  for (const row of hospital.refrigerantData) {
    refrigerantEmissions +=
      calculateRefrigerantEmissions(
        row.refrigerantType,
        row.refrigerantLeakKg
      );
  }

  const totalEmissions =
    scope2Emissions +
    dieselEmissions +
    transportEmissions +
    refrigerantEmissions;

  /* =============================== */
  /* PERCENTAGES                     */
  /* =============================== */

  const renewablePercentage =
    calculateRenewablePercentage(
      renewableKwh,
      electricityKwh
    );

  const waterRecyclingPercentage =
    calculateWaterRecyclingPercentage(
      recycledWaterKl,
      waterKl
    );

  const wasteDiversionPercentage =
    calculateWasteDiversionPercentage(
      recyclableWasteKg,
      totalWasteKg
    );

  /* =============================== */
  /* HOSPITAL KPIs                   */
  /* =============================== */

  const energyPerBed =
    calculateEnergyPerBed(
      electricityKwh,
      hospital.numberOfBeds
    );

  const waterPerBed =
    calculateWaterPerBed(
      waterKl,
      hospital.numberOfBeds
    );

  const wastePerBed =
    calculateWastePerBed(
      totalWasteKg,
      hospital.numberOfBeds
    );

  /* =============================== */
  /* COVERAGE                        */
  /* =============================== */

  const categoryCoverageRatios = [
    Math.min(hospital.electricityData.length / 12, 1),
    Math.min(hospital.waterData.length / 12, 1),
    Math.min(hospital.fuelData.length / 12, 1),
    Math.min(hospital.wasteData.length / 12, 1),
    Math.min(hospital.refrigerantData.length / 12, 1),
    Math.min(hospital.transportData.length / 12, 1),
  ];

  const averageCoverageRatio =
    categoryCoverageRatios.reduce(
      (acc, ratio) => acc + ratio,
      0
    ) / categoryCoverageRatios.length;

  /* =============================== */
  /* ESG READINESS SCORE             */
  /* =============================== */

  const readinessScore =
    calculateESGReadinessScore({
      renewablePercentage,

      waterRecyclingPercentage,

      wasteDiversionPercentage,

      hasEsgPolicy:
        hospital.governanceData
          ?.hasEsgPolicy || false,

      hasAuditReports:
        hospital.governanceData
          ?.hasAuditReports || false,

      coverageRatio: averageCoverageRatio,
    });

  /* =============================== */
  /* BENCHMARK SCORES                */
  /* =============================== */

  const benchmarkScores =
    calculateBenchmarkScores({
      industry: hospital.industry,
      renewablePercentage,
      waterRecyclingPercentage,
      wasteDiversionPercentage,
      energyPerBed,
      energyIntensityPerSqft:
        hospital.builtUpArea > 0
          ? electricityKwh / hospital.builtUpArea
          : 0,
      waterPerBed,
      wastePerBed,
    });

  /* =============================== */
  /* CERTIFICATION READINESS         */
  /* =============================== */

  const certificationReadiness =
    calculateCertificationReadiness({
      renewablePercentage,
      waterRecyclingPercentage,
      wasteDiversionPercentage,
      governanceScore: readinessScore, // Using readiness score as governance proxy
      completeness: Math.round(averageCoverageRatio * 100),
      confidence: calculateConfidenceScore(Math.round(averageCoverageRatio * 12)),
      benchmarkScores,
    });

  /* =============================== */
  /* GAP ANALYSIS                    */
  /* =============================== */

  const gapAnalysis =
    calculateGapAnalysis(
      {
        renewableScore: renewablePercentage,
        waterScore: waterRecyclingPercentage,
        wasteScore: wasteDiversionPercentage,
        energyIntensityScore: energyPerBed > 0 ? (15000 / energyPerBed) * 100 : 0,
        waterIntensityScore: waterPerBed > 0 ? (800 / waterPerBed) * 100 : 0,
        wasteIntensityScore: wastePerBed > 0 ? (1200 / wastePerBed) * 100 : 0,
      },
      benchmarkScores
    );

  /* =============================== */
  /* CERTIFICATIONS                  */
  /* =============================== */

  const certifications = [
    {
      name: "NABH",
      readiness: certificationReadiness.NABH ? "Ready" : "Needs Improvement",
    },
    {
      name: "ISO 14001",
      readiness: certificationReadiness.ISO14001 ? "Ready" : "Needs Improvement",
    },
    {
      name: "IGBC Healthcare",
      readiness: certificationReadiness.IGBC ? "Ready" : "Needs Improvement",
    },
    {
      name: "LEED",
      readiness: certificationReadiness.LEED ? "Ready" : "Needs Improvement",
    },
    {
      name: "WELL",
      readiness: certificationReadiness.WELL ? "Ready" : "Needs Improvement",
    },
    {
      name: "BRSR",
      readiness: certificationReadiness.BRSR ? "Ready" : "Needs Improvement",
    },
    {
      name: "GRI",
      readiness: certificationReadiness.GRI ? "Ready" : "Needs Improvement",
    },
    {
      name: "CDP",
      readiness: certificationReadiness.CDP ? "Ready" : "Needs Improvement",
    },
  ];

  /* =============================== */
  /* FINAL RESPONSE                  */
  /* =============================== */

  return {
    hospitalName:
      hospital.hospitalName,

    industry:
      hospital.industry,

    emissions: {
      scope2Emissions:
        scope2Emissions.toFixed(2),

      dieselEmissions:
        dieselEmissions.toFixed(2),

      transportEmissions:
        transportEmissions.toFixed(2),

      refrigerantEmissions:
        refrigerantEmissions.toFixed(2),

      totalEmissions:
        totalEmissions.toFixed(2),
    },

    percentages: {
      renewablePercentage:
        renewablePercentage.toFixed(2),

      waterRecyclingPercentage:
        waterRecyclingPercentage.toFixed(2),

      wasteDiversionPercentage:
        wasteDiversionPercentage.toFixed(2),
    },

    kpis: {
      energyPerBed:
        energyPerBed.toFixed(2),

      waterPerBed:
        waterPerBed.toFixed(2),

      wastePerBed:
        wastePerBed.toFixed(2),
    },

    benchmarkScores,

    gapAnalysis,

    coverage: {
      electricityMonths:
        hospital.electricityData.length,
      waterMonths:
        hospital.waterData.length,
      fuelMonths:
        hospital.fuelData.length,
      wasteMonths:
        hospital.wasteData.length,
      refrigerantMonths:
        hospital.refrigerantData.length,
      transportMonths:
        hospital.transportData.length,
      averageCoverage:
        Math.round(averageCoverageRatio * 100),
    },

    readinessScore,

    certifications,
  };
}
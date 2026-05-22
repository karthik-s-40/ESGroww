"use server";

import { prisma } from "@/lib/db";
import { AppError, ERROR_MESSAGES } from "@/lib/errors";
import { getESGConfiguration } from "@/lib/config-engine";
import {
  calculateDieselEmissions,
  calculateRefrigerantEmissions,
  calculateScope2Emissions,
  calculateTransportEmissions,
} from "@/lib/emissions-engine";
import {
  calculateRenewablePercentage,
  calculateWaterRecyclingPercentage,
  calculateWasteDiversionPercentage,
} from "@/lib/esgCalculations";
import { formatWithUnit, UNIT } from "@/lib/calculations";
import { BRD_MIN_MONTHS_FOR_ANNUALIZATION } from "@/lib/upload/brdConstants";
import {
  annualizeElectricity,
  annualizeFuel,
  annualizeValue,
  calculateESGReadinessScore,
  determineReadinessStage,
} from "@/lib/calculation-engine";

function annualizationDenominator(distinctMonths: number): number {
  return distinctMonths >= BRD_MIN_MONTHS_FOR_ANNUALIZATION ? distinctMonths : 0;
}

import { cookies } from "next/headers";

export async function getSummaryData(assessmentCycleId?: string) {
  try {
    if (!assessmentCycleId) {
      const cookieStore = await cookies();
    }
    /* ===================================== */
    /* GET HOSPITAL                          */
    /* ===================================== */

    const dataCondition = assessmentCycleId ? { where: { assessmentCycleId } } : undefined;

    const hospital = await prisma.hospital.findFirst({
    select: {
    hospitalName: true,
    industry: true,
    numberOfBeds: true,
    builtUpArea: true,
    electricityData: dataCondition ? { ...dataCondition, select: { electricityKwh: true, renewableKwh: true, month: true, year: true } } : { select: { electricityKwh: true, renewableKwh: true, month: true, year: true } },
    waterData: dataCondition ? { ...dataCondition, select: { totalWaterConsumptionKl: true, recycledWaterKl: true, month: true, year: true } } : { select: { totalWaterConsumptionKl: true, recycledWaterKl: true, month: true, year: true } },
    fuelData: dataCondition ? { ...dataCondition, select: { dgDieselLitres: true, month: true, year: true } } : { select: { dgDieselLitres: true, month: true, year: true } },
    wasteData: dataCondition ? { ...dataCondition, select: { biomedicalWasteKg: true, recyclableWasteKg: true, landfillWasteKg: true, month: true, year: true } } : { select: { biomedicalWasteKg: true, recyclableWasteKg: true, landfillWasteKg: true, month: true, year: true } },
    refrigerantData: dataCondition ? { ...dataCondition, select: { refrigerantType: true, refrigerantLeakKg: true, month: true, year: true } } : { select: { refrigerantType: true, refrigerantLeakKg: true, month: true, year: true } },
    transportData: dataCondition ? { ...dataCondition, select: { ambulanceFuelLitres: true, month: true, year: true } } : { select: { ambulanceFuelLitres: true, month: true, year: true } },
    governanceData: { select: { hasEsgPolicy: true } },
  },
});

    if (!hospital) {
      throw new AppError(ERROR_MESSAGES.HOSPITAL_NOT_FOUND, 404);
    }

    const config = await getESGConfiguration();

  /* ===================================== */
  /* MONTH COVERAGE                        */
  /* ===================================== */

  const electricityMonths =
    new Set(
      hospital.electricityData.map(
        (d) =>
          `${d.month}-${d.year}`
      )
    ).size;

  const waterMonths =
    new Set(
      hospital.waterData.map(
        (d) =>
          `${d.month}-${d.year}`
      )
    ).size;

  const fuelMonths =
    new Set(
      hospital.fuelData.map(
        (d) =>
          `${d.month}-${d.year}`
      )
    ).size;

  const wasteMonths =
    new Set(
      hospital.wasteData.map(
        (d) =>
          `${d.month}-${d.year}`
      )
    ).size;

  const refrigerantMonths =
    new Set(
      hospital.refrigerantData.map(
        (d) =>
          `${d.month}-${d.year}`
      )
    ).size;

  const transportMonths =
    new Set(
      hospital.transportData.map(
        (d) =>
          `${d.month}-${d.year}`
      )
    ).size;

  /* ===================================== */
  /* TOTALS                                */
  /* ===================================== */

  const totalElectricity =
    hospital.electricityData.reduce(
      (sum, item) =>
        sum + item.electricityKwh,
      0
    );

  const renewableElectricity =
    hospital.electricityData.reduce(
      (sum, item) =>
        sum + item.renewableKwh,
      0
    );

  const totalWater =
    hospital.waterData.reduce(
      (sum, item) =>
        sum + item.totalWaterConsumptionKl,
      0
    );

  const recycledWater =
    hospital.waterData.reduce(
      (sum, item) =>
        sum +
        item.recycledWaterKl,
      0
    );

  const totalDiesel =
    hospital.fuelData.reduce(
      (sum, item) =>
        sum +
        item.dgDieselLitres,
      0
    );

  const totalTransportFuel =
    hospital.transportData.reduce(
      (sum, item) =>
        sum + item.ambulanceFuelLitres,
      0
    );

  const totalWaste =
    hospital.wasteData.reduce(
      (sum, item) =>
        sum +
        item.biomedicalWasteKg +
        item.recyclableWasteKg +
        item.landfillWasteKg,
      0
    );

  const recyclableWaste =
    hospital.wasteData.reduce(
      (sum, item) =>
        sum +
        item.recyclableWasteKg,
      0
    );

  const totalRefrigerantEmissions =
    hospital.refrigerantData.reduce(
      (sum, item) =>
        sum +
        calculateRefrigerantEmissions(
          item.refrigerantType,
          item.refrigerantLeakKg,
          config
        ),
      0
    );

  /* ===================================== */
  /* PERCENTAGES                           */
  /* ===================================== */

  const renewablePercentage =
    totalElectricity > 0
      ? Math.round(
          (renewableElectricity /
            totalElectricity) *
            100
        )
      : 0;

  const waterRecyclePercentage =
    totalWater > 0
      ? Math.round(
          (recycledWater /
            totalWater) *
            100
        )
      : 0;

  const recyclableWastePercentage =
    totalWaste > 0
      ? Math.round(
          (recyclableWaste /
            totalWaste) *
            100
        )
      : 0;

  /* ===================================== */
  /* ESG EMISSIONS                         */
  /* ===================================== */

  const annualizedElectricity =
    annualizeElectricity(
      totalElectricity,
      annualizationDenominator(
        electricityMonths
      )
    );

  const annualizedDiesel =
    annualizeFuel(
      totalDiesel,
      annualizationDenominator(
        fuelMonths
      )
    );

  const annualizedTransportFuel =
    annualizeFuel(
      totalTransportFuel,
      annualizationDenominator(
        transportMonths
      )
    );

  const annualizedRefrigerantEmissions =
    annualizeValue(
      totalRefrigerantEmissions,
      annualizationDenominator(
        refrigerantMonths
      )
    );

  const electricityEmissions =
    calculateScope2Emissions(
      annualizedElectricity,
      config
    );

  const dieselEmissions =
    calculateDieselEmissions(
      annualizedDiesel,
      config
    );

  const transportEmissions =
    calculateTransportEmissions(
      annualizedTransportFuel,
      config
    );

  const refrigerantEmissions =
    annualizedRefrigerantEmissions;

  const totalEmissions =
    electricityEmissions +
    dieselEmissions +
    transportEmissions +
    refrigerantEmissions;

  /* ===================================== */
  /* DATA CONFIDENCE                       */
  /* ===================================== */

  const totalCoverage =
    electricityMonths +
    waterMonths +
    fuelMonths +
    wasteMonths +
    refrigerantMonths +
    transportMonths;

  const confidence =
    Math.round(
      (totalCoverage / 72) * 100
    );

  /* ===================================== */
  /* ESG SCORE                             */
  /* ===================================== */

  const environmentalScore =
    Math.round(
      Math.max(
        0,
        Math.min(
          100,
          (
            renewablePercentage * 0.35 +
            waterRecyclePercentage * 0.25 +
            recyclableWastePercentage * 0.25 +
            Math.max(0, 100 - totalEmissions) * 0.15
          )
        )
      )
    );

  const socialScore =
    waterRecyclePercentage > 40
      ? 85
      : 65;

  const governanceScore =
    hospital.governanceData
      ?.hasEsgPolicy
      ? 90
      : 45;

  const overallScore =
    calculateESGReadinessScore({
      renewablePercentage,
      waterRecyclingPercentage: waterRecyclePercentage,
      wasteDiversionPercentage: recyclableWastePercentage,
      hasEsgPolicy: !!hospital.governanceData?.hasEsgPolicy,
      hasAuditReports: false,
      coverageRatio: confidence / 100,
    }, config);

  function safeNumber(n: any, fallback = 0) {
    return Number.isFinite(Number(n)) ? Number(n) : fallback;
  }

  /* ===================================== */
  /* READINESS STAGE                       */
  /* ===================================== */

  const readinessStage = determineReadinessStage({
    completeness: confidence,
    confidence: confidence / 100,
    certificationReady: overallScore >= 70,
  }, config);

  /* ===================================== */
  /* QUALITY CHECKS                        */
  /* ===================================== */

  const checks = [
    {
      label:
        "Electricity Tracking",
      status:
        electricityMonths >= 6,
    },

    {
      label:
        "Water Consumption Data",
      status:
        waterMonths >= 6,
    },

    {
      label:
        "Fuel Monitoring",
      status:
        fuelMonths >= 6,
    },

    {
      label:
        "Waste Management Tracking",
      status:
        wasteMonths >= 6,
    },

    {
      label:
        "Transport Monitoring",
      status:
        transportMonths >= 3,
    },

    {
      label:
        "Governance Documentation",
      status:
        !!hospital.governanceData,
    },
  ];

  /* ===================================== */
  /* RETURN FINAL DATA                     */
  /* ===================================== */

    return {
    hospital: {
      name:
        hospital.hospitalName,

      industry:
        hospital.industry,

      beds:
        hospital.numberOfBeds,

      builtUpArea:
        hospital.builtUpArea,
    },

    coverage: {
      electricityMonths,
      waterMonths,
      fuelMonths,
      wasteMonths,
      refrigerantMonths,
      transportMonths,
    },

    totals: {
      totalElectricity,
      totalWater,
      totalDiesel,
      totalTransportFuel,
      totalWaste,
      totalEmissions,
    },

    formattedTotals: {
      totalElectricity: formatWithUnit(totalElectricity, UNIT.ELECTRICITY),
      totalWater: formatWithUnit(totalWater, UNIT.WATER),
      totalDiesel: formatWithUnit(totalDiesel, UNIT.DIESEL),
      totalTransportFuel: formatWithUnit(totalTransportFuel, UNIT.DIESEL),
      totalWaste: formatWithUnit(totalWaste, UNIT.WASTE),
      totalEmissions: formatWithUnit(totalEmissions, UNIT.EMISSIONS_T),
    },

    percentages: {
      renewablePercentage,
      waterRecyclePercentage,
      recyclableWastePercentage,
    },

    scores: {
      environmentalScore: Math.round(safeNumber(environmentalScore, 0)),
      socialScore: Math.round(safeNumber(socialScore, 0)),
      governanceScore: Math.round(safeNumber(governanceScore, 0)),
      overallScore: Math.round(safeNumber(overallScore, 0)),
    },

    confidence,

    readinessStage,

    emissions: {
      electricityEmissions:
        Math.round(
          electricityEmissions
        ),

      dieselEmissions:
        Math.round(
          dieselEmissions
        ),

      transportEmissions:
        Math.round(
          transportEmissions
        ),

      refrigerantEmissions:
        Math.round(
          refrigerantEmissions
        ),

      annualizedElectricity:
        Math.round(
          annualizedElectricity
        ),

      annualizedDiesel:
        Math.round(
          annualizedDiesel
        ),

      annualizedTransportFuel:
        Math.round(
          annualizedTransportFuel
        ),

      annualizedRefrigerantEmissions:
        Math.round(
          annualizedRefrigerantEmissions
        ),
    },

    formattedAnnualizedValues: {
      annualizedElectricity: formatWithUnit(annualizedElectricity, UNIT.ELECTRICITY),
      annualizedDiesel: formatWithUnit(annualizedDiesel, UNIT.DIESEL),
      annualizedTransportFuel: formatWithUnit(annualizedTransportFuel, UNIT.DIESEL),
      annualizedRefrigerantEmissions: formatWithUnit(annualizedRefrigerantEmissions, UNIT.REFRIGERANT),
    },

    formattedEmissions: {
      electricityEmissions: formatWithUnit(Math.round(electricityEmissions), UNIT.EMISSIONS_T),
      dieselEmissions: formatWithUnit(Math.round(dieselEmissions), UNIT.EMISSIONS_T),
      transportEmissions: formatWithUnit(Math.round(transportEmissions), UNIT.EMISSIONS_T),
      refrigerantEmissions: formatWithUnit(Math.round(refrigerantEmissions), UNIT.EMISSIONS_T),
      total: formatWithUnit(totalEmissions, UNIT.EMISSIONS_T),
    },

    checks,
    };
  } catch (error) {
    console.error("[summary.actions] Failed to build summary data:", error);
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 500, "SUMMARY_GENERATION_ERROR");
  }
}
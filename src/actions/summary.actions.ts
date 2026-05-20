"use server";

import { prisma } from "@/lib/db";
import {
  annualizeElectricity,
  annualizeFuel,
  annualizeValue,
  calculateDieselEmissions,
  calculateRefrigerantEmissions,
  calculateRenewablePercentage,
  calculateScope2Emissions,
  calculateTransportEmissions,
  calculateWaterRecyclingPercentage,
  calculateWasteDiversionPercentage,
} from "@/lib/esgCalculations";
import { BRD_MIN_MONTHS_FOR_ANNUALIZATION } from "@/lib/upload/brdConstants";

function annualizationDenominator(distinctMonths: number): number {
  return distinctMonths >= BRD_MIN_MONTHS_FOR_ANNUALIZATION ? distinctMonths : 0;
}

export async function getSummaryData() {

  /* ===================================== */
  /* GET HOSPITAL                          */
  /* ===================================== */

  const latestUpload =
  await prisma.upload.findFirst({
    orderBy: {
      createdAt: "desc",
    },
  });

if (!latestUpload) {
  throw new Error("No uploads found");
}

const hospital =
  await prisma.hospital.findUnique({
    where: {
      id: latestUpload.hospitalId,
    },

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
    "Hospital not found"
  );
}

  if (!hospital) {
    throw new Error(
      "No hospital found"
    );
  }

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
        sum + item.waterKl,
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
          item.refrigerantLeakKg
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
      annualizedElectricity
    );

  const dieselEmissions =
    calculateDieselEmissions(
      annualizedDiesel
    );

  const transportEmissions =
    calculateTransportEmissions(
      annualizedTransportFuel
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
    Math.max(
      0,
      100 -
        totalEmissions / 1000
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
    Math.round(
      (environmentalScore +
        socialScore +
        governanceScore) /
        3
    );

  /* ===================================== */
  /* READINESS STAGE                       */
  /* ===================================== */

  let readinessStage =
    "Early Stage";

  if (overallScore >= 80) {
    readinessStage =
      "Advanced";
  } else if (
    overallScore >= 60
  ) {
    readinessStage =
      "Moderate";
  }

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

    percentages: {
      renewablePercentage,
      waterRecyclePercentage,
      recyclableWastePercentage,
    },

    scores: {
      environmentalScore:
        Math.round(
          environmentalScore
        ),

      socialScore,

      governanceScore,

      overallScore,
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

    checks,
  };
}
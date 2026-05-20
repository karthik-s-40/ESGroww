"use server";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/getUser";
import {
  BRD_MIN_MONTHS_FOR_ANNUALIZATION,
  BRD_MIN_MONTHS_FOR_READINESS_GATE,
  BRD_MANDATORY_READINESS_CATEGORIES,
} from "@/lib/upload/brdConstants";
import { calculateConfidenceLabel, calculateConfidenceScore } from "@/lib/esgCalculations";

const GOVERNANCE_FIELD_COUNT = 4;

export type GovernanceProgress = {
  answeredCount: number;
  totalCount: number;
  isComplete: boolean;
  lastUpdated: string | null;
};

export type CategoryReadinessSlice = {
  distinctMonths: number;
  minReadinessMonths: number;
  remainingForReadiness: number;
  readinessUnlocked: boolean;
  minAnnualizationMonths: number;
  annualizationUnlocked: boolean;
  confidence: number;
  confidenceLabel: string;
};

export type UploadReadinessSummary = {
  minReadinessMonths: number;
  minAnnualizationMonths: number;
  overallReadinessUnlocked: boolean;
  mandatoryGaps: { category: string; distinctMonths: number; remaining: number }[];
  categories: Record<
    "electricity" | "water" | "fuel" | "waste" | "refrigerants" | "transport",
    CategoryReadinessSlice
  >;
};

export type UploadProgressPayload = {
  electricity: number;
  water: number;
  fuel: number;
  waste: number;
  refrigerants: number;
  transport: number;
  governance: GovernanceProgress;
  readiness: UploadReadinessSummary;
};

function governanceProgressFromRow(
  row: {
    hasEsgPolicy: boolean;
    hasSustainabilityCommittee: boolean;
    hasAuditReports: boolean;
    hasComplianceDocs: boolean;
    createdAt: Date;
  } | null
): GovernanceProgress {
  if (!row) {
    return {
      answeredCount: 0,
      totalCount: GOVERNANCE_FIELD_COUNT,
      isComplete: false,
      lastUpdated: null,
    };
  }
  const flags = [
    row.hasEsgPolicy,
    row.hasSustainabilityCommittee,
    row.hasAuditReports,
    row.hasComplianceDocs,
  ];
  const answeredCount = flags.filter(Boolean).length;
  return {
    answeredCount,
    totalCount: GOVERNANCE_FIELD_COUNT,
    isComplete: answeredCount === GOVERNANCE_FIELD_COUNT,
    lastUpdated: row.createdAt.toISOString(),
  };
}

function distinctCalendarMonths<T extends { month: string; year: number }>(rows: T[]): number {
  return new Set(rows.map((r) => `${r.year}|${r.month}`)).size;
}

function readinessSlice(distinctMonths: number): CategoryReadinessSlice {
  const confidence = calculateConfidenceScore(distinctMonths);
  return {
    distinctMonths,
    minReadinessMonths: BRD_MIN_MONTHS_FOR_READINESS_GATE,
    remainingForReadiness: Math.max(0, BRD_MIN_MONTHS_FOR_READINESS_GATE - distinctMonths),
    readinessUnlocked: distinctMonths >= BRD_MIN_MONTHS_FOR_READINESS_GATE,
    minAnnualizationMonths: BRD_MIN_MONTHS_FOR_ANNUALIZATION,
    annualizationUnlocked: distinctMonths >= BRD_MIN_MONTHS_FOR_ANNUALIZATION,
    confidence,
    confidenceLabel: calculateConfidenceLabel(confidence),
  };
}

export async function getUploadProgress(): Promise<UploadProgressPayload | null> {
  const user = await getCurrentUser();

  if (!user || typeof user === "string" || !("hospitalId" in user)) {
    return null;
  }

  const hospitalId = String(user.hospitalId);

  const hospital = await prisma.hospital.findUnique({
    where: {
      id: hospitalId,
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
    return null;
  }

  const governance = governanceProgressFromRow(hospital.governanceData);

  const electricityMonths = distinctCalendarMonths(hospital.electricityData);
  const waterMonths = distinctCalendarMonths(hospital.waterData);
  const fuelMonths = distinctCalendarMonths(hospital.fuelData);
  const wasteMonths = distinctCalendarMonths(hospital.wasteData);
  const refrigerantMonths = distinctCalendarMonths(hospital.refrigerantData);
  const transportMonths = distinctCalendarMonths(hospital.transportData);

  const categories = {
    electricity: readinessSlice(electricityMonths),
    water: readinessSlice(waterMonths),
    fuel: readinessSlice(fuelMonths),
    waste: readinessSlice(wasteMonths),
    refrigerants: readinessSlice(refrigerantMonths),
    transport: readinessSlice(transportMonths),
  } as const;

  const mandatoryGaps = BRD_MANDATORY_READINESS_CATEGORIES.map((c) => {
    const slice = categories[c];
    return {
      category: c,
      distinctMonths: slice.distinctMonths,
      remaining: slice.remainingForReadiness,
    };
  }).filter((g) => g.distinctMonths < BRD_MIN_MONTHS_FOR_READINESS_GATE);

  const overallReadinessUnlocked = BRD_MANDATORY_READINESS_CATEGORIES.every(
    (c) => categories[c].readinessUnlocked
  );

  return {
    electricity: electricityMonths,
    water: waterMonths,
    fuel: fuelMonths,
    waste: wasteMonths,
    refrigerants: refrigerantMonths,
    transport: transportMonths,
    governance,
    readiness: {
      minReadinessMonths: BRD_MIN_MONTHS_FOR_READINESS_GATE,
      minAnnualizationMonths: BRD_MIN_MONTHS_FOR_ANNUALIZATION,
      overallReadinessUnlocked,
      mandatoryGaps,
      categories,
    },
  };
}

export async function getRecentUploads(limit = 10) {
  const user = await getCurrentUser();

  if (!user || typeof user === "string" || !("hospitalId" in user)) {
    return null;
  }

  const hospitalId = String(user.hospitalId);

  const uploads = await prisma.upload.findMany({
    where: {
      hospitalId,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: Math.min(Math.max(limit, 1), 200),
    include: {
      uploadBatch: {
        select: {
          id: true,
          batchVersion: true,
          resolutionStrategy: true,
          isSuperseded: true,
          rowCount: true,
          distinctMonthCount: true,
        },
      },
    },
  });

  return uploads;
}

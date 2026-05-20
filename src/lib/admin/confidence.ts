import type { ConfidenceThreshold } from "@prisma/client";
import {
  BRD_MIN_MONTHS_FOR_ANNUALIZATION,
  BRD_MIN_MONTHS_FOR_READINESS_GATE,
} from "@/lib/upload/brdConstants";

export function confidenceFromDistinctMonths(
  distinctMonths: number,
  thresholds: ConfidenceThreshold[]
): {
  label: string;
  modifier: number;
  annualizationEligible: boolean;
  readinessGateMet: boolean;
} {
  const sorted = [...thresholds].sort((a, b) => a.monthsMin - b.monthsMin);
  for (const row of sorted) {
    if (distinctMonths >= row.monthsMin && distinctMonths <= row.monthsMax) {
      return {
        label: row.confidenceLabel,
        modifier: row.modifier,
        annualizationEligible: distinctMonths >= BRD_MIN_MONTHS_FOR_ANNUALIZATION,
        readinessGateMet: distinctMonths >= BRD_MIN_MONTHS_FOR_READINESS_GATE,
      };
    }
  }
  return {
    label: "Insufficient",
    modifier: 0.5,
    annualizationEligible: distinctMonths >= BRD_MIN_MONTHS_FOR_ANNUALIZATION,
    readinessGateMet: distinctMonths >= BRD_MIN_MONTHS_FOR_READINESS_GATE,
  };
}

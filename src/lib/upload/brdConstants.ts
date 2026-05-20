/**
 * Central BRD configuration for uploads, readiness, and annualization.
 * Import these values instead of scattering literals across the codebase.
 */
export const BRD_MIN_MONTHS_FOR_READINESS_GATE = 6;

export const BRD_MIN_MONTHS_FOR_ANNUALIZATION = 3;

/** Maximum rows allowed in a single Excel ingestion file (calendar months). */
export const BRD_MAX_MONTHS_PER_FILE = 12;

/** Minimum rows required in a structurally valid file (incremental uploads). */
export const BRD_MIN_MONTHS_PER_FILE = 1;

export const BRD_MANDATORY_READINESS_CATEGORIES = [
  "electricity",
  "water",
  "waste",
] as const;

export type BrdMandatoryReadinessCategory =
  (typeof BRD_MANDATORY_READINESS_CATEGORIES)[number];

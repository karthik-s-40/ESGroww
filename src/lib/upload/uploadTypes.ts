export type UploadCategorySlug =
  | "electricity"
  | "water"
  | "fuel"
  | "waste"
  | "refrigerants"
  | "transport";

export type UploadCategoryPrisma =
  | "Electricity"
  | "Water"
  | "Fuel"
  | "Waste"
  | "Refrigerants"
  | "Transport";

export type MonthOverlapComparison = {
  monthKey: string;
  month: string;
  year: number;
  existing: Record<string, number | string>;
  incoming: Record<string, number | string>;
  delta: Record<string, number>;
};

export type MergePreviewPayload = {
  category: UploadCategoryPrisma;
  incomingMonthKeys: string[];
  existingMonthKeys: string[];
  overlappingMonthKeys: string[];
  newOnlyMonthKeys: string[];
  comparisons: MonthOverlapComparison[];
  fileContentHash: string;
  sourceFileName: string;
  incomingRowCount: number;
};

export type UploadSuccessPayload = {
  success: true;
  rowsUploaded: number;
  distinctMonthsTotal: number;
  uploadBatchId?: string;
  batchVersion: number;
  readinessMinMonths: number;
  remainingMonthsForReadiness: number;
  readinessUnlockedForCategory: boolean;
  confidence: number;
  confidenceLabel: string;
  mergeSummary?: string;
  warnings?: string[];
};

export type UploadMergeRequiredPayload = {
  success: false;
  code: "MERGE_REQUIRED";
  mergePreview: MergePreviewPayload;
  message: string;
};

export type UploadDuplicatePayload = {
  success: false;
  code: "DUPLICATE_DATASET";
  duplicateBatchId: string | null;
  fileContentHash: string;
  category: UploadCategoryPrisma;
  message: string;
};

export type UploadErrorPayload = {
  success: false;
  code?: "VALIDATION" | "UNAUTHORIZED" | "SERVER";
  error: string;
};

export type ExcelUploadActionResult =
  | UploadSuccessPayload
  | UploadMergeRequiredPayload
  | UploadDuplicatePayload
  | UploadErrorPayload;

export type ParsedBaseRow = {
  month: string;
  year: number;
  monthKey: string;
};

import * as XLSX from "xlsx";

import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";
import {
  BRD_MAX_MONTHS_PER_FILE,
  BRD_MIN_MONTHS_FOR_READINESS_GATE,
  
} from "@/lib/upload/brdConstants";
import { fingerprintDataset } from "@/lib/upload/datasetFingerprint";
import {
  buildCalendarMonthKey,
  buildRefrigerantRowKey,
  parseCalendarMonthKey,
  parseRefrigerantRowKey,
} from "@/lib/upload/monthKeys";
import { type MergeStrategy } from "@/lib/upload/mergeStrategies";
import type {
  ExcelUploadActionResult,
  MergePreviewPayload,
  MonthOverlapComparison,
  ParsedBaseRow,
  UploadCategoryPrisma,
} from "@/lib/upload/uploadTypes";
import {
  calculateConfidenceLabel,
  calculateConfidenceScore,
} from "@/lib/esgCalculations";

const VALID_MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function parseNumber(value: unknown, fallback = 0) {
  const parsed = Number(String(value).replace(/,/g, "").trim());
  return Number.isNaN(parsed) ? fallback : parsed;
}

function parseYear(value: unknown) {
  const parsed = parseNumber(value, NaN);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : NaN;
}

function normalizeMonth(value: unknown) {
  const raw = String(value ?? "").trim();
  if (!raw) return "";

  const normalized = raw.toLowerCase();
  const monthMap: Record<string, string> = {
    jan: "Jan",
    january: "Jan",
    feb: "Feb",
    february: "Feb",
    mar: "Mar",
    march: "Mar",
    apr: "Apr",
    april: "Apr",
    may: "May",
    jun: "Jun",
    june: "Jun",
    jul: "Jul",
    july: "Jul",
    aug: "Aug",
    august: "Aug",
    sep: "Sep",
    sept: "Sep",
    september: "Sep",
    oct: "Oct",
    october: "Oct",
    nov: "Nov",
    november: "Nov",
    dec: "Dec",
    december: "Dec",
    "1": "Jan",
    "2": "Feb",
    "3": "Mar",
    "4": "Apr",
    "5": "May",
    "6": "Jun",
    "7": "Jul",
    "8": "Aug",
    "9": "Sep",
    "10": "Oct",
    "11": "Nov",
    "12": "Dec",
  };

  return monthMap[normalized] ?? raw;
}

function parseNumericField(value: unknown, fallback = 0) {
  const raw = String(value ?? "").trim();
  if (!raw) return fallback;
  const numeric = Number(raw.replace(/,/g, ""));
  if (!Number.isFinite(numeric)) return fallback;
  return numeric;
}

function validateNumericFields(rows: Record<string, unknown>[], fields: string[], category: string) {
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    for (const field of fields) {
      const rawValue = row[field];
      if (rawValue === undefined || rawValue === null || String(rawValue).trim() === "") continue;
      const numeric = Number(String(rawValue).replace(/,/g, "").trim());
      if (!Number.isFinite(numeric)) {
        return `Invalid numeric value "${rawValue}" found in column "${field}" at row ${i + 1} in ${category} upload.`;
      }
    }
  }
  return null;
}

function validateNegativeValues(rows: Record<string, unknown>[], fields: string[], category: string) {
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    for (const field of fields) {
      const rawValue = row[field];
      if (rawValue === undefined || rawValue === null || String(rawValue).trim() === "") continue;
      const numeric = Number(String(rawValue).replace(/,/g, "").trim());
      if (numeric < 0) {
        return `Negative value "${numeric}" found in column "${field}" at row ${i + 1} in ${category} upload. Only positive values are allowed.`;
      }
    }
  }
  return null;
}

function detectAbnormalSpikes(
  rows: Record<string, unknown>[],
  fields: string[],
  category: string
): string[] {
  const warnings: string[] = [];
  for (const field of fields) {
    const values: number[] = [];
    for (let i = 0; i < rows.length; i++) {
      const rawValue = rows[i][field];
      if (rawValue === undefined || rawValue === null || String(rawValue).trim() === "") {
        values.push(0);
        continue;
      }
      const numeric = Number(String(rawValue).replace(/,/g, "").trim());
      values.push(Number.isFinite(numeric) ? numeric : 0);
    }
    for (let i = 1; i < values.length; i++) {
      const prev = values[i - 1];
      const curr = values[i];
      if (prev === 0 && curr === 0) continue;
      if (prev === 0) {
        if (curr > 0) {
          warnings.push(
            `⚠️ Spike detected: ${field} jumped from 0 to ${curr} in row ${i + 1} (${category}). Please verify.`
          );
        }
      } else {
        const percentChange = Math.abs((curr - prev) / prev) * 100;
        if (percentChange > 100) {
          warnings.push(
            `⚠️ Spike detected: ${field} increased by ${percentChange.toFixed(1)}% from row ${i} to row ${i + 1} (${category}). Verify data accuracy.`
          );
        }
        if (percentChange > 70 && curr < prev) {
          warnings.push(
            `⚠️ Drop detected: ${field} decreased by ${percentChange.toFixed(1)}% from row ${i} to row ${i + 1} (${category}). Verify data accuracy.`
          );
        }
      }
    }
  }
  return warnings;
}

// CHANGE 1 applied: removed BRD_MIN_MONTHS_PER_FILE check from validateRows
function validateRows(
  rows: Record<string, unknown>[],
  requiredFields: string[],
  category: string
): string | null {
  if (!rows.length) {
    return `Your ${category} file is empty or the column headers are incorrect.`;
  }
  if (rows.length > BRD_MAX_MONTHS_PER_FILE) {
    return `${category} upload cannot contain more than ${BRD_MAX_MONTHS_PER_FILE} months of data in a single file.`;
  }

  const missingFields = requiredFields.filter((field) =>
    rows.every(
      (row) =>
        row[field] === undefined || row[field] === null || String(row[field]).trim() === ""
    )
  );
  if (missingFields.length) {
    return `Missing required columns in ${category} upload: ${missingFields.join(", ")}.`;
  }

  const uploadedMonths = new Set<string>();
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const normalizedMonth = normalizeMonth(row.Month);
    const year = parseYear(row.Year);
    if (!VALID_MONTHS.includes(normalizedMonth)) {
      return `Invalid month "${row.Month}" found in row ${i + 1}. Allowed values are Jan-Dec only.`;
    }
    if (Number.isNaN(year)) {
      return `Invalid year "${row.Year}" found in row ${i + 1}.`;
    }
    const monthKey = buildCalendarMonthKey(year, normalizedMonth);
    if (uploadedMonths.has(monthKey)) {
      return `Duplicate month "${normalizedMonth} ${year}" found inside uploaded ${category} file.`;
    }
    uploadedMonths.add(monthKey);
  }
  return null;
}

// CHANGE 2 applied: removed BRD_MIN_MONTHS_PER_FILE check from validateRowsRefrigerants
function validateRowsRefrigerants(rows: Record<string, unknown>[]): string | null {
  const cat = "Refrigerants";
  if (!rows.length) {
    return `Your ${cat} file is empty or the column headers are incorrect.`;
  }
  if (rows.length > BRD_MAX_MONTHS_PER_FILE * 4) {
    return `${cat} upload exceeds maximum row count for a single file. Split into multiple uploads.`;
  }
  const keys = new Set<string>();
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const normalizedMonth = normalizeMonth(row.Month);
    const year = parseYear(row.Year);
    if (!VALID_MONTHS.includes(normalizedMonth)) {
      return `Invalid month "${row.Month}" found in row ${i + 1}. Allowed values are Jan-Dec only.`;
    }
    if (Number.isNaN(year)) {
      return `Invalid year "${row.Year}" found in row ${i + 1}.`;
    }
    const type = String(row.refrigerantType ?? "").trim();
    if (!type) {
      return `Missing refrigerantType in row ${i + 1}.`;
    }
    const rk = buildRefrigerantRowKey(year, normalizedMonth, type);
    if (keys.has(rk)) {
      return `Duplicate row for ${normalizedMonth} ${year} / ${type} inside uploaded file.`;
    }
    keys.add(rk);
  }
  return null;
}

function getUploadError(category: string, error: unknown) {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : JSON.stringify(error);
  return `Upload failed (${category}): ${message}`;
}

type NumericFieldList = readonly string[];

type CategoryConfig = {
  prismaCategory: UploadCategoryPrisma;
  requiredColumns: string[];
  numericFields: NumericFieldList;
  negativeFields: NumericFieldList;
  spikeFields: NumericFieldList;
};

const CATEGORY_CONFIG: Record<UploadCategoryPrisma, CategoryConfig> = {
  Electricity: {
    prismaCategory: "Electricity",
    requiredColumns: ["Month", "Year"],
    numericFields: ["electricityKwh", "renewableKwh"],
    negativeFields: ["electricityKwh", "renewableKwh"],
    spikeFields: ["electricityKwh", "renewableKwh"],
  },
  Water: {
    prismaCategory: "Water",
    requiredColumns: ["Month", "Year"],
    numericFields: ["waterKl", "recycledWaterKl"],
    negativeFields: ["waterKl", "recycledWaterKl"],
    spikeFields: ["waterKl", "recycledWaterKl"],
  },
  Fuel: {
    prismaCategory: "Fuel",
    requiredColumns: ["Month", "Year"],
    numericFields: ["dgDieselLitres"],
    negativeFields: ["dgDieselLitres"],
    spikeFields: ["dgDieselLitres"],
  },
  Waste: {
    prismaCategory: "Waste",
    requiredColumns: ["Month", "Year"],
    numericFields: ["biomedicalWasteKg", "recyclableWasteKg", "landfillWasteKg"],
    negativeFields: ["biomedicalWasteKg", "recyclableWasteKg", "landfillWasteKg"],
    spikeFields: ["biomedicalWasteKg", "recyclableWasteKg", "landfillWasteKg"],
  },
  Refrigerants: {
    prismaCategory: "Refrigerants",
    requiredColumns: ["Month", "Year", "refrigerantType"],
    numericFields: ["refrigerantLeakKg"],
    negativeFields: ["refrigerantLeakKg"],
    spikeFields: ["refrigerantLeakKg"],
  },
  Transport: {
    prismaCategory: "Transport",
    requiredColumns: ["Month", "Year"],
    numericFields: ["ambulanceFuelLitres", "staffCommuteKm"],
    negativeFields: ["ambulanceFuelLitres", "staffCommuteKm"],
    spikeFields: ["ambulanceFuelLitres", "staffCommuteKm"],
  },
};

function rowToCanonical(
  category: UploadCategoryPrisma,
  row: Record<string, unknown>
): Record<string, string | number | boolean | null> {
  const m = normalizeMonth(row.Month);
  const y = parseYear(row.Year);
  const base: Record<string, string | number | boolean | null> = {
    month: m,
    year: Number.isFinite(y) ? y : 0,
  };
  switch (category) {
    case "Electricity":
      return {
        ...base,
        electricityKwh: parseNumericField(row.electricityKwh),
        renewableKwh: parseNumericField(row.renewableKwh),
      };
    case "Water":
      return {
        ...base,
        waterKl: parseNumericField(row.waterKl),
        recycledWaterKl: parseNumericField(row.recycledWaterKl),
      };
    case "Fuel":
      return { ...base, dgDieselLitres: parseNumericField(row.dgDieselLitres) };
    case "Waste":
      return {
        ...base,
        biomedicalWasteKg: parseNumericField(row.biomedicalWasteKg),
        recyclableWasteKg: parseNumericField(row.recyclableWasteKg),
        landfillWasteKg: parseNumericField(row.landfillWasteKg),
      };
    case "Refrigerants":
      return {
        ...base,
        refrigerantType: String(row.refrigerantType ?? "").trim(),
        refrigerantLeakKg: parseNumericField(row.refrigerantLeakKg),
      };
    case "Transport":
      return {
        ...base,
        ambulanceFuelLitres: parseNumericField(row.ambulanceFuelLitres),
        staffCommuteKm: parseNumericField(row.staffCommuteKm),
      };
    default:
      return base;
  }
}

function rowKeyForCategory(category: UploadCategoryPrisma, row: Record<string, unknown>): string {
  const m = normalizeMonth(row.Month);
  const y = parseYear(row.Year);
  if (category === "Refrigerants") {
    return buildRefrigerantRowKey(y, m, String(row.refrigerantType ?? ""));
  }
  return buildCalendarMonthKey(y, m);
}

async function loadExistingMap(
  category: UploadCategoryPrisma,
  hospitalId: string
): Promise<Map<string, Record<string, unknown>>> {
  const map = new Map<string, Record<string, unknown>>();
  switch (category) {
    case "Electricity": {
      const rows = await prisma.electricityData.findMany({ where: { hospitalId } });
      for (const r of rows) {
        map.set(buildCalendarMonthKey(r.year, r.month), { ...r });
      }
      break;
    }
    case "Water": {
      const rows = await prisma.waterData.findMany({ where: { hospitalId } });
      for (const r of rows) {
        map.set(buildCalendarMonthKey(r.year, r.month), { ...r });
      }
      break;
    }
    case "Fuel": {
      const rows = await prisma.fuelData.findMany({ where: { hospitalId } });
      for (const r of rows) {
        map.set(buildCalendarMonthKey(r.year, r.month), { ...r });
      }
      break;
    }
    case "Waste": {
      const rows = await prisma.wasteData.findMany({ where: { hospitalId } });
      for (const r of rows) {
        map.set(buildCalendarMonthKey(r.year, r.month), { ...r });
      }
      break;
    }
    case "Transport": {
      const rows = await prisma.transportData.findMany({ where: { hospitalId } });
      for (const r of rows) {
        map.set(buildCalendarMonthKey(r.year, r.month), { ...r });
      }
      break;
    }
    case "Refrigerants": {
      const rows = await prisma.refrigerantData.findMany({ where: { hospitalId } });
      for (const r of rows) {
        map.set(buildRefrigerantRowKey(r.year, r.month, r.refrigerantType), { ...r });
      }
      break;
    }
    default:
      break;
  }
  return map;
}

function numericFieldsForCompare(
  category: UploadCategoryPrisma,
  row: Record<string, unknown>
): Record<string, number> {
  const c = CATEGORY_CONFIG[category];
  const out: Record<string, number> = {};
  for (const f of c.numericFields) {
    out[f] = parseNumericField(row[f]);
  }
  return out;
}

function buildComparisons(
  category: UploadCategoryPrisma,
  overlapKeys: string[],
  existing: Map<string, Record<string, unknown>>,
  incomingRows: Record<string, unknown>[]
): MonthOverlapComparison[] {
  const incomingByKey = new Map<string, Record<string, unknown>>();
  for (const row of incomingRows) {
    incomingByKey.set(rowKeyForCategory(category, row), row);
  }
  const list: MonthOverlapComparison[] = [];
  for (const key of overlapKeys) {
    const ex = existing.get(key);
    const inc = incomingByKey.get(key);
    if (!ex || !inc) continue;
    const month = normalizeMonth(inc.Month);
    const year = parseYear(inc.Year);
    const eNum = numericFieldsForCompare(category, ex as Record<string, unknown>);
    const iNum = numericFieldsForCompare(category, inc);
    const delta: Record<string, number> = {};
    for (const k of Object.keys(iNum)) {
      delta[k] = (iNum[k] ?? 0) - (eNum[k] ?? 0);
    }
    const existingPayload: Record<string, number | string> = { ...eNum };
    const incomingPayload: Record<string, number | string> = { ...iNum };
    if (category === "Refrigerants") {
      existingPayload.refrigerantType = String((ex as { refrigerantType?: string }).refrigerantType ?? "");
      incomingPayload.refrigerantType = String(inc.refrigerantType ?? "");
    }
    list.push({
      monthKey: key,
      month,
      year,
      existing: existingPayload,
      incoming: incomingPayload,
      delta,
    });
  }
  return list;
}

function parsedBaseFromRow(row: Record<string, unknown>): ParsedBaseRow {
  const month = normalizeMonth(row.Month);
  const year = parseYear(row.Year);
  return {
    month,
    year,
    monthKey: buildCalendarMonthKey(year, month),
  };
}

async function nextBatchVersion(hospitalId: string, category: string) {
  const agg = await prisma.dataUploadBatch.aggregate({
    where: { hospitalId, category },
    _max: { batchVersion: true },
  });
  return (agg._max.batchVersion ?? 0) + 1;
}

async function latestBatchHash(hospitalId: string, category: string) {
  const b = await prisma.dataUploadBatch.findFirst({
    where: { hospitalId, category },
    orderBy: { createdAt: "desc" },
    select: { id: true, fileContentHash: true },
  });
  return b;
}

type UploadMergeStrategy = MergeStrategy | "SKIP_DUPLICATE_DATASET" | "FORCE_DUPLICATE_REAUDIT";

function parseMergeStrategy(value: FormDataEntryValue | null): UploadMergeStrategy | undefined {
  const raw = String(value ?? "").trim();
  if (!raw) return undefined;
  if (raw === "ADD_TO_EXISTING" || raw === "REPLACE_EXISTING" || raw === "KEEP_EXISTING_ADD_NEW") {
    return raw;
  }
  if (raw === "SKIP_DUPLICATE_DATASET" || raw === "FORCE_DUPLICATE_REAUDIT") {
    return raw;
  }
  return undefined;
}

function mergeStrategyRequiresIncomingFile(strategy?: UploadMergeStrategy) {
  return strategy !== "SKIP_DUPLICATE_DATASET" && strategy !== "FORCE_DUPLICATE_REAUDIT";
}

function orClauseFromCalendarKeys(keys: string[]) {
  return keys
    .map((k) => parseCalendarMonthKey(k))
    .filter((p): p is { year: number; month: string } => p !== null)
    .map((p) => ({ AND: [{ year: p.year }, { month: p.month }] }));
}

export async function processCategoryExcelUpload(
  category: UploadCategoryPrisma,
  hospitalId: string,
  formData: FormData
): Promise<ExcelUploadActionResult> {
  const cfg = CATEGORY_CONFIG[category];
  const mergeStrategy = parseMergeStrategy(formData.get("mergeStrategy"));

  try {
    const file = formData.get("file") as File | null;
    if (!file || file.size === 0) {
      if (mergeStrategy && mergeStrategyRequiresIncomingFile(mergeStrategy)) {
        return { success: false, code: "VALIDATION", error: "File is required for this merge action." };
      }
    }

    const skipDataMutation =
      mergeStrategy === "SKIP_DUPLICATE_DATASET" || mergeStrategy === "FORCE_DUPLICATE_REAUDIT";

    let rows: Record<string, unknown>[] = [];
    let sourceFileName = "";

    if (!skipDataMutation) {
      if (!file || file.size === 0) {
        return { success: false, code: "VALIDATION", error: "No file uploaded" };
      }
      sourceFileName = file.name;
      const bytes = await file.arrayBuffer();
      const workbook = XLSX.read(Buffer.from(bytes), { type: "buffer" });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      rows = XLSX.utils.sheet_to_json(worksheet) as Record<string, unknown>[];
    } else {
      const name = formData.get("sourceFileName");
      sourceFileName = name ? String(name) : "duplicate-resolution";
    }

    if (!skipDataMutation) {
      const validationError =
        category === "Refrigerants"
          ? validateRowsRefrigerants(rows)
          : validateRows(rows, cfg.requiredColumns, category);
      if (validationError) {
        return { success: false, code: "VALIDATION", error: validationError };
      }

      const numericError = validateNumericFields(rows, [...cfg.numericFields], category);
      if (numericError) return { success: false, code: "VALIDATION", error: numericError };

      const negativeError = validateNegativeValues(rows, [...cfg.negativeFields], category);
      if (negativeError) return { success: false, code: "VALIDATION", error: negativeError };
    }

    const spikeWarnings = skipDataMutation
      ? []
      : detectAbnormalSpikes(rows, [...cfg.spikeFields], category);

    const canonicalRows = skipDataMutation
      ? []
      : rows.map((r) => rowToCanonical(category, r));
    const fileContentHash = skipDataMutation
      ? String(formData.get("fileContentHash") ?? "")
      : fingerprintDataset(category, canonicalRows);

    if (!skipDataMutation && !fileContentHash) {
      return { success: false, code: "VALIDATION", error: "Could not compute file fingerprint." };
    }

    const existing = await loadExistingMap(category, hospitalId);
    const existingCalendarKeys = new Set<string>();
    for (const k of existing.keys()) {
      const r = parseRefrigerantRowKey(k);
      if (r) existingCalendarKeys.add(buildCalendarMonthKey(r.year, r.month));
      else {
        const c = parseCalendarMonthKey(k);
        if (c) existingCalendarKeys.add(buildCalendarMonthKey(c.year, c.month));
      }
    }

    const incomingKeys = skipDataMutation
      ? []
      : rows.map((r) => rowKeyForCategory(category, r));
    const overlap = skipDataMutation
      ? []
      : incomingKeys.filter((k) => existing.has(k));
    const newOnly = skipDataMutation
      ? []
      : incomingKeys.filter((k) => !existing.has(k));

    const latest = await latestBatchHash(hospitalId, category);
    const isDuplicateContent =
      !skipDataMutation &&
      latest &&
      latest.fileContentHash === fileContentHash &&
      incomingKeys.length > 0;

    if (mergeStrategy === "SKIP_DUPLICATE_DATASET") {
      const distinct = existingCalendarKeys.size;
      const conf = calculateConfidenceScore(distinct);
      return {
        success: true,
        rowsUploaded: 0,
        distinctMonthsTotal: distinct,
        batchVersion: 0,
        readinessMinMonths: BRD_MIN_MONTHS_FOR_READINESS_GATE,
        remainingMonthsForReadiness: Math.max(0, BRD_MIN_MONTHS_FOR_READINESS_GATE - distinct),
        readinessUnlockedForCategory: distinct >= BRD_MIN_MONTHS_FOR_READINESS_GATE,
        confidence: conf,
        confidenceLabel: calculateConfidenceLabel(conf),
        mergeSummary: "Duplicate dataset skipped — no database changes.",
      };
    }

    if (mergeStrategy === "FORCE_DUPLICATE_REAUDIT") {
      const fh = String(formData.get("fileContentHash") ?? "").trim();
      if (!fh) {
        return {
          success: false,
          code: "VALIDATION",
          error: "fileContentHash is required when recording a duplicate-dataset audit trail.",
        };
      }
      const version = await nextBatchVersion(hospitalId, category);
      const batch = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const b = await tx.dataUploadBatch.create({
          data: {
            hospitalId,
            category,
            sourceFileName,
            fileContentHash: fh,
            batchVersion: version,
            resolutionStrategy: mergeStrategy,
            distinctMonthCount: existingCalendarKeys.size,
            rowCount: 0,
            monthKeysCsv: null,
          },
        });
        const anchor = Array.from(existingCalendarKeys).sort()[0]?.split("|") ?? ["2020", "Jan"];
        const y = Number(anchor[0]) || 2020;
        const m = anchor[1] || "Jan";
        await tx.upload.create({
          data: {
            hospitalId,
            category,
            fileUrl: sourceFileName,
            sourceFile: sourceFileName,
            month: m,
            year: y,
            uploadBatchId: b.id,
            version,
            rowCount: 0,
            fileContentHash: fh,
            resolutionStrategy: mergeStrategy,
          },
        });
        return b;
      });
      const distinct = existingCalendarKeys.size;
      const conf = calculateConfidenceScore(distinct);
      return {
        success: true,
        rowsUploaded: 0,
        distinctMonthsTotal: distinct,
        uploadBatchId: batch.id,
        batchVersion: version,
        readinessMinMonths: BRD_MIN_MONTHS_FOR_READINESS_GATE,
        remainingMonthsForReadiness: Math.max(0, BRD_MIN_MONTHS_FOR_READINESS_GATE - distinct),
        readinessUnlockedForCategory: distinct >= BRD_MIN_MONTHS_FOR_READINESS_GATE,
        confidence: conf,
        confidenceLabel: calculateConfidenceLabel(conf),
        mergeSummary: "Identical dataset re-uploaded — audit batch recorded without altering values.",
      };
    }

    if (isDuplicateContent && !mergeStrategy) {
      return {
        success: false,
        code: "DUPLICATE_DATASET",
        duplicateBatchId: latest?.id ?? null,
        fileContentHash,
        category,
        message:
          "This file matches the last uploaded dataset for this category (content hash). Skip, record a compliance re-audit, or resolve overlaps if values changed.",
      };
    }

    if (overlap.length > 0 && !mergeStrategy) {
      const mergePreview: MergePreviewPayload = {
        category,
        incomingMonthKeys: [...new Set(incomingKeys)].sort(),
        existingMonthKeys: [...existing.keys()].sort(),
        overlappingMonthKeys: [...new Set(overlap)].sort(),
        newOnlyMonthKeys: [...new Set(newOnly)].sort(),
        comparisons: buildComparisons(category, [...new Set(overlap)], existing, rows),
        fileContentHash,
        sourceFileName,
        incomingRowCount: rows.length,
      };
      return {
        success: false,
        code: "MERGE_REQUIRED",
        mergePreview,
        message:
          "The upload overlaps existing calendar months. Choose how to resolve overlaps before data is written.",
      };
    }

    const strategy: MergeStrategy =
      mergeStrategy === "ADD_TO_EXISTING" ||
      mergeStrategy === "REPLACE_EXISTING" ||
      mergeStrategy === "KEEP_EXISTING_ADD_NEW"
        ? mergeStrategy
        : "KEEP_EXISTING_ADD_NEW";
    const version = await nextBatchVersion(hospitalId, category);
    const monthKeysCsv = [...new Set(incomingKeys)].sort().join(",");

    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const batch = await tx.dataUploadBatch.create({
        data: {
          hospitalId,
          category,
          sourceFileName,
          fileContentHash,
          batchVersion: version,
          resolutionStrategy: strategy,
          distinctMonthCount: new Set(
            incomingKeys.map((k) => {
              const r = parseRefrigerantRowKey(k);
              if (r) return buildCalendarMonthKey(r.year, r.month);
              const c = parseCalendarMonthKey(k);
              return c ? buildCalendarMonthKey(c.year, c.month) : k;
            })
          ).size,
          rowCount: rows.length,
          monthKeysCsv,
        },
      });

      const keysToInsert = new Set<string>();

      /* -------------------------------- */
      /* KEEP EXISTING + ADD NEW          */
      /* -------------------------------- */

      if (strategy === "KEEP_EXISTING_ADD_NEW") {
        for (const k of newOnly) {
          keysToInsert.add(k);
        }
      }

      /* -------------------------------- */
      /* REPLACE EXISTING                 */
      /* -------------------------------- */

      else if (strategy === "REPLACE_EXISTING") {
        const uniqueOverlapCalendarKeys = [
          ...new Set(
            overlap.map((k) => {
              const r = parseRefrigerantRowKey(k);

              if (r) {
                return buildCalendarMonthKey(r.year, r.month);
              }

              const c = parseCalendarMonthKey(k);

              return c ? buildCalendarMonthKey(c.year, c.month) : k;
            })
          ),
        ];

        const orCal = orClauseFromCalendarKeys(uniqueOverlapCalendarKeys);

        if (category === "Electricity" && orCal.length) {
          await tx.electricityData.deleteMany({
            where: { hospitalId, OR: orCal },
          });
        } else if (category === "Water" && orCal.length) {
          await tx.waterData.deleteMany({
            where: { hospitalId, OR: orCal },
          });
        } else if (category === "Fuel" && orCal.length) {
          await tx.fuelData.deleteMany({
            where: { hospitalId, OR: orCal },
          });
        } else if (category === "Waste" && orCal.length) {
          await tx.wasteData.deleteMany({
            where: { hospitalId, OR: orCal },
          });
        } else if (category === "Transport" && orCal.length) {
          await tx.transportData.deleteMany({
            where: { hospitalId, OR: orCal },
          });
        }

        // CHANGE 5 applied: Refrigerants support in REPLACE_EXISTING
        else if (category === "Refrigerants") {
          const refrigerantKeys = overlap
            .map((k) => parseRefrigerantRowKey(k))
            .filter(
              (p): p is NonNullable<ReturnType<typeof parseRefrigerantRowKey>> => p !== null
            );

          if (refrigerantKeys.length) {
            await tx.refrigerantData.deleteMany({
              where: {
                hospitalId,
                OR: refrigerantKeys.map((p) => ({
                  AND: [
                    { year: p.year },
                    { month: p.month },
                    { refrigerantType: p.refrigerantType },
                  ],
                })),
              },
            });
          }
        }

        for (const k of incomingKeys) {
          keysToInsert.add(k);
        }
      }

      /* -------------------------------- */
      /* ADD TO EXISTING                  */
      /* -------------------------------- */

      else if (strategy === "ADD_TO_EXISTING") {
        for (const row of rows) {
          const key = rowKeyForCategory(category, row);
          const existingRow = existing.get(key);

          if (existingRow) {
            if (category === "Electricity") {
              await tx.electricityData.update({
                where: { id: existingRow.id as string },
                data: {
                  electricityKwh:
                    Number(existingRow.electricityKwh) +
                    parseNumericField(row.electricityKwh),
                  renewableKwh:
                    Number(existingRow.renewableKwh) +
                    parseNumericField(row.renewableKwh),
                },
              });
            } else if (category === "Water") {
              await tx.waterData.update({
                where: { id: existingRow.id as string },
                data: {
                  waterKl:
                    Number(existingRow.waterKl) + parseNumericField(row.waterKl),
                  recycledWaterKl:
                    Number(existingRow.recycledWaterKl) +
                    parseNumericField(row.recycledWaterKl),
                },
              });
            } else if (category === "Fuel") {
              await tx.fuelData.update({
                where: { id: existingRow.id as string },
                data: {
                  dgDieselLitres:
                    Number(existingRow.dgDieselLitres) +
                    parseNumericField(row.dgDieselLitres),
                },
              });
            } else if (category === "Waste") {
              await tx.wasteData.update({
                where: { id: existingRow.id as string },
                data: {
                  biomedicalWasteKg:
                    Number(existingRow.biomedicalWasteKg) +
                    parseNumericField(row.biomedicalWasteKg),
                  recyclableWasteKg:
                    Number(existingRow.recyclableWasteKg) +
                    parseNumericField(row.recyclableWasteKg),
                  landfillWasteKg:
                    Number(existingRow.landfillWasteKg) +
                    parseNumericField(row.landfillWasteKg),
                },
              });
            } else if (category === "Transport") {
              await tx.transportData.update({
                where: { id: existingRow.id as string },
                data: {
                  ambulanceFuelLitres:
                    Number(existingRow.ambulanceFuelLitres) +
                    parseNumericField(row.ambulanceFuelLitres),
                  staffCommuteKm:
                    Number(existingRow.staffCommuteKm) +
                    parseNumericField(row.staffCommuteKm),
                },
              });
            } else if (category === "Refrigerants") {
              await tx.refrigerantData.update({
                where: { id: existingRow.id as string },
                data: {
                  refrigerantLeakKg:
                    Number(existingRow.refrigerantLeakKg) +
                    parseNumericField(row.refrigerantLeakKg),
                },
              });
            }
          } else {
            keysToInsert.add(key);
          }
        }
      }

      /* -------------------------------- */
      /* DEFAULT                          */
      /* -------------------------------- */

      else {
        for (const k of incomingKeys) {
          keysToInsert.add(k);
        }
      }

      // CHANGE 4 applied: removed dead uniqueOverlapCalendarKeys block that was here

      let inserted = 0;
      for (const row of rows) {
        const key = rowKeyForCategory(category, row);
        if (!keysToInsert.has(key)) continue;
        const pb = parsedBaseFromRow(row);
        if (category === "Electricity") {
          await tx.electricityData.create({
            data: {
              hospitalId,
              month: pb.month,
              year: pb.year,
              electricityKwh: parseNumericField(row.electricityKwh),
              renewableKwh: parseNumericField(row.renewableKwh),
              sourceBatchId: batch.id,
            },
          });
          inserted++;
        } else if (category === "Water") {
          await tx.waterData.create({
            data: {
              hospitalId,
              month: pb.month,
              year: pb.year,
              waterKl: parseNumericField(row.waterKl),
              recycledWaterKl: parseNumericField(row.recycledWaterKl),
              sourceBatchId: batch.id,
            },
          });
          inserted++;
        } else if (category === "Fuel") {
          await tx.fuelData.create({
            data: {
              hospitalId,
              month: pb.month,
              year: pb.year,
              dgDieselLitres: parseNumericField(row.dgDieselLitres),
              sourceBatchId: batch.id,
            },
          });
          inserted++;
        } else if (category === "Waste") {
          await tx.wasteData.create({
            data: {
              hospitalId,
              month: pb.month,
              year: pb.year,
              biomedicalWasteKg: parseNumericField(row.biomedicalWasteKg),
              recyclableWasteKg: parseNumericField(row.recyclableWasteKg),
              landfillWasteKg: parseNumericField(row.landfillWasteKg),
              sourceBatchId: batch.id,
            },
          });
          inserted++;
        } else if (category === "Transport") {
          await tx.transportData.create({
            data: {
              hospitalId,
              month: pb.month,
              year: pb.year,
              ambulanceFuelLitres: parseNumericField(row.ambulanceFuelLitres),
              staffCommuteKm: parseNumericField(row.staffCommuteKm),
              sourceBatchId: batch.id,
            },
          });
          inserted++;
        } else if (category === "Refrigerants") {
          await tx.refrigerantData.create({
            data: {
              hospitalId,
              month: pb.month,
              year: pb.year,
              refrigerantType: String(row.refrigerantType ?? ""),
              refrigerantLeakKg: parseNumericField(row.refrigerantLeakKg),
              sourceBatchId: batch.id,
            },
          });
          inserted++;
        }
      }

      const refreshed = await loadExistingMapFromTx(tx, category, hospitalId);
      const distinctCal = distinctCalendarMonthsFromMap(refreshed);

      const firstRow = rows[0];
      const anchor = firstRow ? parsedBaseFromRow(firstRow) : { month: "Jan", year: 2020, monthKey: "2020|Jan" };

      await tx.upload.create({
        data: {
          hospitalId,
          category,
          fileUrl: sourceFileName,
          sourceFile: sourceFileName,
          month: anchor.month,
          year: anchor.year,
          uploadBatchId: batch.id,
          version,
          rowCount: inserted,
          fileContentHash,
          resolutionStrategy: strategy,
        },
      });

      return { batch, inserted, distinctCal };
    });

    const distinctAfter = result.distinctCal;
    const conf = calculateConfidenceScore(distinctAfter);

    let mergeSummary = "";

    if (strategy === "ADD_TO_EXISTING") {
      mergeSummary =
        "Existing overlapping months were aggregated and new months were inserted.";
    } else if (strategy === "REPLACE_EXISTING") {
      mergeSummary =
        "Existing overlapping months were replaced and new months were inserted.";
    } else if (strategy === "KEEP_EXISTING_ADD_NEW") {
      mergeSummary =
        "Existing months were preserved and only new months were inserted.";
    }

    return {
      success: true,
      rowsUploaded: result.inserted,
      distinctMonthsTotal: distinctAfter,
      uploadBatchId: result.batch.id,
      batchVersion: version,
      readinessMinMonths: BRD_MIN_MONTHS_FOR_READINESS_GATE,
      remainingMonthsForReadiness: Math.max(0, BRD_MIN_MONTHS_FOR_READINESS_GATE - distinctAfter),
      readinessUnlockedForCategory: distinctAfter >= BRD_MIN_MONTHS_FOR_READINESS_GATE,
      confidence: conf,
      confidenceLabel: calculateConfidenceLabel(conf),
      mergeSummary,
      warnings: spikeWarnings.length ? spikeWarnings : undefined,
    };
  } catch (error) {
    console.error(`${category} upload error:`, error);
    return { success: false, code: "SERVER", error: getUploadError(category, error) };
  }
}

function distinctCalendarMonthsFromMap(map: Map<string, Record<string, unknown>>): number {
  const s = new Set<string>();
  for (const k of map.keys()) {
    const r = parseRefrigerantRowKey(k);
    if (r) s.add(buildCalendarMonthKey(r.year, r.month));
    else {
      const c = parseCalendarMonthKey(k);
      if (c) s.add(buildCalendarMonthKey(c.year, c.month));
    }
  }
  return s.size;
}

async function loadExistingMapFromTx(
  tx: Prisma.TransactionClient,
  category: UploadCategoryPrisma,
  hospitalId: string
) {
  const map = new Map<string, Record<string, unknown>>();
  if (category === "Electricity") {
    const rows = await tx.electricityData.findMany({ where: { hospitalId } });
    for (const r of rows) map.set(buildCalendarMonthKey(r.year, r.month), { ...r });
  } else if (category === "Water") {
    const rows = await tx.waterData.findMany({ where: { hospitalId } });
    for (const r of rows) map.set(buildCalendarMonthKey(r.year, r.month), { ...r });
  } else if (category === "Fuel") {
    const rows = await tx.fuelData.findMany({ where: { hospitalId } });
    for (const r of rows) map.set(buildCalendarMonthKey(r.year, r.month), { ...r });
  } else if (category === "Waste") {
    const rows = await tx.wasteData.findMany({ where: { hospitalId } });
    for (const r of rows) map.set(buildCalendarMonthKey(r.year, r.month), { ...r });
  } else if (category === "Transport") {
    const rows = await tx.transportData.findMany({ where: { hospitalId } });
    for (const r of rows) map.set(buildCalendarMonthKey(r.year, r.month), { ...r });
  } else if (category === "Refrigerants") {
    const rows = await tx.refrigerantData.findMany({ where: { hospitalId } });
    for (const r of rows) map.set(buildRefrigerantRowKey(r.year, r.month, r.refrigerantType), { ...r });
  }
  return map;
}
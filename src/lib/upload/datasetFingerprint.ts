import { createHash } from "crypto";

import type { UploadCategoryPrisma } from "@/lib/upload/uploadTypes";

/**
 * Canonical fingerprint for duplicate detection (content-based, not filename).
 * Rows are sorted by primary keys so row order in Excel does not matter.
 */
export function fingerprintDataset(
  category: UploadCategoryPrisma,
  canonicalRows: Record<string, string | number | boolean | null>[]
): string {
  const normalized = canonicalRows.map((r) => sortKeysDeep(r));
  normalized.sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
  const payload = JSON.stringify({ category, rows: normalized });
  return createHash("sha256").update(payload).digest("hex");
}

function sortKeysDeep(
  value: Record<string, string | number | boolean | null>
): Record<string, string | number | boolean | null> {
  const keys = Object.keys(value).sort();
  const out: Record<string, string | number | boolean | null> = {};
  for (const k of keys) {
    out[k] = value[k];
  }
  return out;
}

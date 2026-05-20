import type { UploadCategoryPrisma } from "@/lib/upload/uploadTypes";

export function buildCalendarMonthKey(year: number, month: string): string {
  return `${year}|${month}`;
}

export function buildRefrigerantRowKey(
  year: number,
  month: string,
  refrigerantType: string
): string {
  const t = String(refrigerantType ?? "")
    .trim()
    .toUpperCase();
  return `${year}|${month}|${t}`;
}

export function parseCalendarMonthKey(key: string): { year: number; month: string } | null {
  const parts = key.split("|");
  if (parts.length !== 2) return null;
  const year = Number(parts[0]);
  const month = parts[1];
  if (!Number.isFinite(year) || !month) return null;
  return { year, month };
}

export function parseRefrigerantRowKey(
  key: string
): { year: number; month: string; refrigerantType: string } | null {
  const parts = key.split("|");
  if (parts.length !== 3) return null;
  const year = Number(parts[0]);
  const month = parts[1];
  const refrigerantType = parts[2];
  if (!Number.isFinite(year) || !month) return null;
  return { year, month, refrigerantType };
}

export function distinctCalendarMonthCount(keys: Iterable<string>): number {
  const set = new Set<string>();
  for (const k of keys) {
    const p = parseCalendarMonthKey(k) ?? parseRefrigerantRowKey(k);
    if (p) set.add(buildCalendarMonthKey(p.year, p.month));
  }
  return set.size;
}

export function prismaCategoryToSlug(
  c: UploadCategoryPrisma
): "electricity" | "water" | "fuel" | "waste" | "refrigerants" | "transport" {
  switch (c) {
    case "Electricity":
      return "electricity";
    case "Water":
      return "water";
    case "Fuel":
      return "fuel";
    case "Waste":
      return "waste";
    case "Refrigerants":
      return "refrigerants";
    case "Transport":
      return "transport";
    default:
      return "electricity";
  }
}

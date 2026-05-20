/**
 * Mirrors spike / drop rules used in `processCategoryExcelUpload.detectAbnormalSpikes`
 * so admin intelligence stays aligned with ingestion validation (BRD).
 */
export function detectSpikesInNumericSeries(
  values: number[],
  fieldLabel: string,
  categoryLabel: string
): string[] {
  const warnings: string[] = [];
  for (let i = 1; i < values.length; i++) {
    const prev = values[i - 1];
    const curr = values[i];
    if (prev === 0 && curr === 0) continue;
    if (prev === 0) {
      if (curr > 0) {
        warnings.push(
          `Spike: ${fieldLabel} jumped from 0 to ${curr} between periods ${i} → ${i + 1} (${categoryLabel}).`
        );
      }
      continue;
    }
    const percentChange = Math.abs((curr - prev) / prev) * 100;
    if (percentChange > 100) {
      warnings.push(
        `Spike: ${fieldLabel} changed ${percentChange.toFixed(1)}% between periods ${i} → ${i + 1} (${categoryLabel}).`
      );
    }
    if (percentChange > 70 && curr < prev) {
      warnings.push(
        `Drop: ${fieldLabel} decreased ${percentChange.toFixed(1)}% between periods ${i} → ${i + 1} (${categoryLabel}).`
      );
    }
  }
  return warnings;
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { confidenceFromDistinctMonths } from "@/lib/admin/confidence";
import { detectSpikesInNumericSeries } from "@/lib/admin/seriesValidation";
import { BRD_MAX_MONTHS_PER_FILE } from "@/lib/upload/brdConstants";

function severityForCheck(status: string, checkType: string): "critical" | "warning" | "info" | "success" {
  if (status === "Fail") return "critical";
  if (status === "Partial") return "warning";
  if (checkType === "spike_detection") return "warning";
  return "info";
}

export async function GET() {
  try {
    const [thresholds, batches, uploads, validations, hospitalRows] = await Promise.all([
      prisma.confidenceThreshold.findMany({ orderBy: { monthsMin: "asc" } }),
      prisma.dataUploadBatch.findMany({
        orderBy: { createdAt: "desc" },
        take: 200,
        include: {
          hospital: { select: { id: true, hospitalName: true } },
          uploadRecord: { select: { id: true, isReplaced: true } },
        },
      }),
      prisma.upload.findMany({
        orderBy: { createdAt: "desc" },
        take: 150,
        include: { hospital: { select: { hospitalName: true } } },
      }),
      prisma.validationResult.findMany({
        orderBy: { createdAt: "desc" },
        take: 200,
        include: { hospital: { select: { hospitalName: true } } },
      }),
      prisma.hospital.findMany({ select: { id: true, hospitalName: true } }),
    ]);

    const allHospitalIds = hospitalRows.map((h) => h.id);
    const hospitalNameById = new Map(hospitalRows.map((h) => [h.id, h.hospitalName]));

    const hashGroups = new Map<string, { hospitalId: string; category: string; hash: string; count: number }>();
    for (const b of batches) {
      const k = `${b.hospitalId}|${b.category}|${b.fileContentHash}`;
      const cur = hashGroups.get(k);
      if (cur) cur.count += 1;
      else hashGroups.set(k, { hospitalId: b.hospitalId, category: b.category, hash: b.fileContentHash, count: 1 });
    }
    const duplicateFingerprints = [...hashGroups.values()].filter((g) => g.count > 1);

    const electricity = await prisma.electricityData.findMany({
      where: { hospitalId: { in: allHospitalIds } },
      select: { hospitalId: true, month: true, year: true, electricityKwh: true },
      orderBy: [{ year: "asc" }, { month: "asc" }],
    });

    const spikeSignals: {
      hospitalId: string;
      hospitalName: string;
      category: string;
      message: string;
      severity: "warning" | "critical";
    }[] = [];

    const byHospElec = new Map<string, typeof electricity>();
    for (const row of electricity) {
      const list = byHospElec.get(row.hospitalId) ?? [];
      list.push(row);
      byHospElec.set(row.hospitalId, list);
    }
    for (const [hid, rows] of byHospElec) {
      const sorted = [...rows].sort(
        (a, b) => a.year - b.year || String(a.month).localeCompare(String(b.month))
      );
      const values = sorted.map((r) => r.electricityKwh);
      const msgs = detectSpikesInNumericSeries(values, "electricityKwh", "Electricity");
      if (msgs.length) {
        const name = hospitalNameById.get(hid) ?? hid;
        for (const message of msgs.slice(0, 3)) {
          spikeSignals.push({
            hospitalId: hid,
            hospitalName: name,
            category: "Electricity",
            message,
            severity: "warning",
          });
        }
      }
    }

    const [
      elecCounts,
      waterCounts,
      wasteCounts,
      fuelCounts,
      refCounts,
      transportCounts,
    ] = await Promise.all([
      prisma.electricityData.groupBy({
        by: ["hospitalId"],
        _count: { _all: true },
        where: { hospitalId: { in: allHospitalIds } },
      }),
      prisma.waterData.groupBy({
        by: ["hospitalId"],
        _count: { _all: true },
        where: { hospitalId: { in: allHospitalIds } },
      }),
      prisma.wasteData.groupBy({
        by: ["hospitalId"],
        _count: { _all: true },
        where: { hospitalId: { in: allHospitalIds } },
      }),
      prisma.fuelData.groupBy({
        by: ["hospitalId"],
        _count: { _all: true },
        where: { hospitalId: { in: allHospitalIds } },
      }),
      prisma.refrigerantData.groupBy({
        by: ["hospitalId"],
        _count: { _all: true },
        where: { hospitalId: { in: allHospitalIds } },
      }),
      prisma.transportData.groupBy({
        by: ["hospitalId"],
        _count: { _all: true },
        where: { hospitalId: { in: allHospitalIds } },
      }),
    ]);

    function summaryFor(
      label: string,
      grouped: { hospitalId: string; _count: { _all: number } }[]
    ) {
      const orgs = grouped.length;
      const avgMonths = orgs ? Math.round(grouped.reduce((s, g) => s + g._count._all, 0) / orgs) : 0;
      const conf = confidenceFromDistinctMonths(avgMonths, thresholds);
      const completeness = Math.min(Math.round((avgMonths / 12) * 100), 100);
      return {
        category: label,
        organizationsWithData: orgs,
        avgDistinctMonths: avgMonths,
        completenessPct: completeness,
        confidenceLabel: conf.label,
        confidenceModifier: conf.modifier,
        annualizationEligible: conf.annualizationEligible,
        readinessGateMet: conf.readinessGateMet,
        brdMaxMonthsPerFile: BRD_MAX_MONTHS_PER_FILE,
      };
    }

    const categorySummaries = [
      summaryFor("Electricity", elecCounts),
      summaryFor("Water", waterCounts),
      summaryFor("Waste", wasteCounts),
      summaryFor("Fuel", fuelCounts),
      summaryFor("Refrigerants", refCounts),
      summaryFor("Transport", transportCounts),
    ];

    const uploadRows = uploads.map((u) => ({
      id: u.id,
      fileName: u.sourceFile ?? u.fileUrl.split("/").pop() ?? "File",
      category: u.category,
      month: u.month,
      year: u.year,
      uploadDate: u.createdAt,
      uploadedAt: u.uploadedAt,
      hospitalName: u.hospital.hospitalName,
      hospitalId: u.hospitalId,
      rowCount: u.rowCount,
      version: u.version,
      isReplaced: u.isReplaced,
      fileContentHash: u.fileContentHash,
      resolutionStrategy: u.resolutionStrategy,
      processingStatus: u.isReplaced ? "Superseded" : u.uploadBatchId ? "Ingested" : "Recorded",
    }));

    const batchRows = batches.map((b) => ({
      id: b.id,
      hospitalId: b.hospitalId,
      hospitalName: b.hospital.hospitalName,
      category: b.category,
      sourceFileName: b.sourceFileName,
      createdAt: b.createdAt,
      rowCount: b.rowCount,
      distinctMonthCount: b.distinctMonthCount,
      batchVersion: b.batchVersion,
      fileContentHash: b.fileContentHash,
      isSuperseded: b.isSuperseded,
      resolutionStrategy: b.resolutionStrategy,
      linkedUploadId: b.uploadRecord?.id ?? null,
      processingStatus: b.isSuperseded ? "Superseded" : "Committed",
    }));

    const validationRows = validations.map((v) => ({
      id: v.id,
      createdAt: v.createdAt,
      hospitalId: v.hospitalId,
      hospitalName: v.hospital.hospitalName,
      category: v.category,
      checkType: v.checkType,
      status: v.status,
      affectedMonth: v.affectedMonth,
      affectedYear: v.affectedYear,
      notes: v.notes,
      severity: severityForCheck(v.status, v.checkType),
      displayReason: v.notes ?? humanizeCheck(v.checkType),
    }));

    const batchCountsByDay = await prisma.$queryRaw<{ day: Date; c: bigint }[]>`
      SELECT date_trunc('day', "createdAt") AS day, COUNT(*)::bigint AS c
      FROM "DataUploadBatch"
      WHERE "createdAt" >= (CURRENT_TIMESTAMP - interval '90 day')
      GROUP BY 1
      ORDER BY 1 ASC
    `;

    return NextResponse.json({
      uploads: uploadRows,
      batches: batchRows,
      categorySummaries,
      validations: validationRows,
      duplicateFingerprints,
      spikeWarnings: spikeSignals,
      ingestTrend90d: batchCountsByDay.map((r) => ({
        day: r.day.toISOString(),
        count: Number(r.c),
      })),
    });
  } catch (error) {
    console.error("Error fetching uploads intelligence:", error);
    return NextResponse.json({ error: "Failed to fetch uploads" }, { status: 500 });
  }
}

function humanizeCheck(checkType: string) {
  const map: Record<string, string> = {
    negative_value: "Negative values detected (BRD)",
    missing_months: "Missing calendar months in operational series",
    spike_detection: "Abnormal period-on-period variance (BRD spike / drop rules)",
    duplicate_entry: "Duplicate month or fingerprint collision",
    unit_consistency: "Unit or column consistency review",
    cross_category: "Cross-category consistency (e.g. renewable ≤ total)",
  };
  return map[checkType] ?? checkType;
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { logAdminAudit } from "@/lib/admin/audit";
import { revalidateTag } from "next/cache";
import {
  BRD_MAX_MONTHS_PER_FILE,
  BRD_MIN_MONTHS_FOR_ANNUALIZATION,
  BRD_MIN_MONTHS_FOR_READINESS_GATE,
} from "@/lib/upload/brdConstants";

export const dynamic = "force-dynamic";

function safeRevalidateConfigTag() {
  try {
    revalidateTag("esg-config", "max" as any);
  } catch {
    // In unit tests, Next.js revalidation context is not available.
  }
}

export async function GET() {
  try {
    const [benchmarks, emissionFactors, confidenceThresholds, certificationApplicability] =
      await Promise.all([
        prisma.benchmarkMaster.findMany(),
        prisma.emissionFactor.findMany(),
        prisma.confidenceThreshold.findMany(),
        prisma.certificationApplicability.findMany(),
      ]);

    return NextResponse.json({
      brdConstants: {
        BRD_MAX_MONTHS_PER_FILE,
        BRD_MIN_MONTHS_FOR_ANNUALIZATION,
        BRD_MIN_MONTHS_FOR_READINESS_GATE,
      },
      benchmarks,
      emissionFactors,
      confidenceThresholds,
      certificationApplicability,
    });
  } catch (e) {
    console.error("system-config get", e);
    return NextResponse.json({ error: "Failed to load configuration" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { type, payload, id, patch } = body;

    if (type === "benchmark" && id && patch) {
      const row = await prisma.benchmarkMaster.update({
        where: { id },
        data: patch,
      });
      await logAdminAudit({
        action: "benchmark.update",
        entityType: "BenchmarkMaster",
        entityId: id,
        summary: `Updated benchmark ${id}`,
        metadata: { patch },
      });

      safeRevalidateConfigTag();
      return NextResponse.json({ ok: true, row });
    }

    if (type === "emissionFactor") {
      const { sourceType, factorValue } = payload;
      await prisma.emissionFactor.upsert({
        where: { sourceType_region: { sourceType, region: "National" } },
        create: { sourceType, region: "National", factorValue, unit: "kgCO2e", overrideAllowed: false },
        update: { factorValue },
      });
      await logAdminAudit({ action: "config.update", entityType: "EmissionFactor", entityId: sourceType, summary: `Updated emission factor ${sourceType} to ${factorValue}`, metadata: { payload } });
    } else if (type === "benchmark") {
      const { metricName, efficientMax } = payload;
      await prisma.benchmarkMaster.upsert({
        where: { sectorCode_metricName: { sectorCode: "HOSP", metricName } },
        create: { sectorCode: "HOSP", metricName, efficientMax, acceptableMin: 0, acceptableMax: efficientMax * 1.5, unit: "unit" },
        update: { efficientMax },
      });
      await logAdminAudit({ action: "config.update", entityType: "BenchmarkMaster", entityId: metricName, summary: `Updated benchmark ${metricName} to ${efficientMax}`, metadata: { payload } });
    } else if (type === "scoringWeight") {
      const { category, weightValue } = payload;
      await prisma.scoringWeight.upsert({
        where: { category },
        create: { category, weightValue },
        update: { weightValue },
      });
      await logAdminAudit({ action: "config.update", entityType: "ScoringWeight", entityId: category, summary: `Updated weight ${category} to ${weightValue}`, metadata: { payload } });
    } else if (type === "kpiRange") {
      const { metricName, excellentMax, goodMax, fairMax } = payload;
      await prisma.kpiRange.upsert({
        where: { metricName },
        create: { metricName, excellentMax, goodMax, fairMax },
        update: { excellentMax, goodMax, fairMax },
      });
      await logAdminAudit({ action: "config.update", entityType: "KpiRange", entityId: metricName, summary: `Updated KPI ${metricName}`, metadata: { payload } });
    } else {
      return NextResponse.json({ error: "Unknown type" }, { status: 400 });
    }

    // Force Next.js cache revalidation so calculations pick up the new constants
    safeRevalidateConfigTag();
    
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("system-config patch", e);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

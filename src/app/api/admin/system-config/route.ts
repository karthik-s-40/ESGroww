import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { logAdminAudit } from "@/lib/admin/audit";
import { getESGConfiguration } from "@/lib/config-engine";
import { revalidateTag } from "next/cache";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const config = await getESGConfiguration();
    return NextResponse.json(config);
  } catch (e) {
    console.error("system-config get", e);
    return NextResponse.json({ error: "Failed to load configuration" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { type, payload } = body;

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
    revalidateTag("esg-config", "max" as any);
    
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("system-config patch", e);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

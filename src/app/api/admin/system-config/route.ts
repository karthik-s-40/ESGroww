import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { logAdminAudit } from "@/lib/admin/audit";
import {
  BRD_MAX_MONTHS_PER_FILE,
  BRD_MIN_MONTHS_FOR_ANNUALIZATION,
  BRD_MIN_MONTHS_FOR_READINESS_GATE,
} from "@/lib/upload/brdConstants";
import { revalidateTag } from "next/cache";

export async function GET() {
  try {
    const [benchmarks, emissionFactors, confidence, applicability] = await Promise.all([
      prisma.benchmarkMaster.findMany({ orderBy: [{ sectorCode: "asc" }, { metricName: "asc" }] }),
      prisma.emissionFactor.findMany({ orderBy: [{ sourceType: "asc" }, { region: "asc" }] }),
      prisma.confidenceThreshold.findMany({ orderBy: { monthsMin: "asc" } }),
      prisma.certificationApplicability.findMany({
        orderBy: [{ sectorCode: "asc" }, { certificationName: "asc" }],
      }),
    ]);

    return NextResponse.json({
      brdConstants: {
        BRD_MAX_MONTHS_PER_FILE,
        BRD_MIN_MONTHS_FOR_ANNUALIZATION,
        BRD_MIN_MONTHS_FOR_READINESS_GATE,
      },
      benchmarks,
      emissionFactors,
      confidenceThresholds: confidence,
      certificationApplicability: applicability,
    });
  } catch (e) {
    console.error("system-config get", e);
    return NextResponse.json({ error: "Failed to load configuration" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = (await req.json()) as {
      type: "benchmark" | "emissionFactor" | "confidence" | "applicability";
      id: string;
      patch: Record<string, unknown>;
    };

    if (!body?.type || !body?.id || !body?.patch) {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }

    if (body.type === "benchmark") {
      const prev = await prisma.benchmarkMaster.findUnique({ where: { id: body.id } });
      if (!prev) return NextResponse.json({ error: "Not found" }, { status: 404 });
      const { sectorCode, metricName, efficientMax, acceptableMin, acceptableMax, unit } = body.patch as Record<
        string,
        string | number
      >;
      const next = await prisma.benchmarkMaster.update({
        where: { id: body.id },
        data: {
          ...(sectorCode != null ? { sectorCode: String(sectorCode) } : {}),
          ...(metricName != null ? { metricName: String(metricName) } : {}),
          ...(efficientMax != null ? { efficientMax: Number(efficientMax) } : {}),
          ...(acceptableMin != null ? { acceptableMin: Number(acceptableMin) } : {}),
          ...(acceptableMax != null ? { acceptableMax: Number(acceptableMax) } : {}),
          ...(unit != null ? { unit: String(unit) } : {}),
        },
      });
      await logAdminAudit({
        action: "benchmark.update",
        entityType: "BenchmarkMaster",
        entityId: body.id,
        summary: `Updated benchmark ${next.metricName} (${next.sectorCode})`,
        metadata: { before: prev, after: next },
      });
      return NextResponse.json({ ok: true, row: next });
    }

    if (body.type === "emissionFactor") {
      const prev = await prisma.emissionFactor.findUnique({ where: { id: body.id } });
      if (!prev) return NextResponse.json({ error: "Not found" }, { status: 404 });
      const { sourceType, region, factorValue, unit, overrideAllowed } = body.patch as Record<string, unknown>;
      const next = await prisma.emissionFactor.update({
        where: { id: body.id },
        data: {
          ...(sourceType != null ? { sourceType: String(sourceType) } : {}),
          ...(region != null ? { region: String(region) } : {}),
          ...(factorValue != null ? { factorValue: Number(factorValue) } : {}),
          ...(unit != null ? { unit: String(unit) } : {}),
          ...(overrideAllowed != null ? { overrideAllowed: Boolean(overrideAllowed) } : {}),
        },
      });
      await logAdminAudit({
        action: "emissionFactor.update",
        entityType: "EmissionFactor",
        entityId: body.id,
        summary: `Updated emission factor ${next.sourceType} / ${next.region}`,
        metadata: { before: prev, after: next },
      });
      return NextResponse.json({ ok: true, row: next });
    }

    if (body.type === "confidence") {
      const prev = await prisma.confidenceThreshold.findUnique({ where: { id: body.id } });
      if (!prev) return NextResponse.json({ error: "Not found" }, { status: 404 });
      const { monthsMin, monthsMax, modifier, confidenceLabel } = body.patch as Record<string, unknown>;
      const next = await prisma.confidenceThreshold.update({
        where: { id: body.id },
        data: {
          ...(monthsMin != null ? { monthsMin: Number(monthsMin) } : {}),
          ...(monthsMax != null ? { monthsMax: Number(monthsMax) } : {}),
          ...(modifier != null ? { modifier: Number(modifier) } : {}),
          ...(confidenceLabel != null ? { confidenceLabel: String(confidenceLabel) } : {}),
        },
      });
      await logAdminAudit({
        action: "confidenceThreshold.update",
        entityType: "ConfidenceThreshold",
        entityId: body.id,
        summary: `Updated confidence band ${next.monthsMin}-${next.monthsMax} months`,
        metadata: { before: prev, after: next },
      });
      revalidateTag("esg-config", "max");
      return NextResponse.json({ ok: true, row: next });
    }

    if (body.type === "applicability") {
      const prev = await prisma.certificationApplicability.findUnique({ where: { id: body.id } });
      if (!prev) return NextResponse.json({ error: "Not found" }, { status: 404 });
      const { sectorCode, certificationName, importanceLevel } = body.patch as Record<string, unknown>;
      const next = await prisma.certificationApplicability.update({
        where: { id: body.id },
        data: {
          ...(sectorCode != null ? { sectorCode: String(sectorCode) } : {}),
          ...(certificationName != null ? { certificationName: String(certificationName) } : {}),
          ...(importanceLevel != null ? { importanceLevel: String(importanceLevel) } : {}),
        },
      });
      await logAdminAudit({
        action: "certificationApplicability.update",
        entityType: "CertificationApplicability",
        entityId: body.id,
        summary: `Updated applicability ${next.certificationName} (${next.sectorCode})`,
        metadata: { before: prev, after: next },
      });
      revalidateTag("esg-config", "max");
      return NextResponse.json({ ok: true, row: next });
    }

    return NextResponse.json({ error: "Unknown type" }, { status: 400 });
  } catch (e) {
    console.error("system-config patch", e);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      type: "benchmark" | "emissionFactor" | "confidence" | "applicability";
      data: Record<string, unknown>;
    };

    if (!body?.type || !body?.data) {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }

    if (body.type === "benchmark") {
      const { sectorCode, metricName, efficientMax, acceptableMin, acceptableMax, unit } = body.data as Record<string, string | number>;
      const next = await prisma.benchmarkMaster.create({
        data: {
          sectorCode: String(sectorCode || "HOSP"),
          metricName: String(metricName || "New Metric"),
          efficientMax: Number(efficientMax || 0),
          acceptableMin: Number(acceptableMin || 0),
          acceptableMax: Number(acceptableMax || 0),
          unit: String(unit || ""),
        },
      });
      await logAdminAudit({
        action: "benchmark.create",
        entityType: "BenchmarkMaster",
        entityId: next.id,
        summary: `Created benchmark ${next.metricName}`,
        metadata: { after: next },
      });
      revalidateTag("esg-config", "max");
      return NextResponse.json({ ok: true, row: next });
    }

    if (body.type === "emissionFactor") {
      const { sourceType, region, factorValue, unit, overrideAllowed } = body.data as Record<string, unknown>;
      const next = await prisma.emissionFactor.create({
        data: {
          sourceType: String(sourceType || "Electricity"),
          region: String(region || "National"),
          factorValue: Number(factorValue || 0),
          unit: String(unit || ""),
          overrideAllowed: Boolean(overrideAllowed),
        },
      });
      await logAdminAudit({
        action: "emissionFactor.create",
        entityType: "EmissionFactor",
        entityId: next.id,
        summary: `Created emission factor ${next.sourceType}`,
        metadata: { after: next },
      });
      revalidateTag("esg-config", "max");
      return NextResponse.json({ ok: true, row: next });
    }

    if (body.type === "confidence") {
      const { monthsMin, monthsMax, modifier, confidenceLabel } = body.data as Record<string, unknown>;
      const next = await prisma.confidenceThreshold.create({
        data: {
          monthsMin: Number(monthsMin || 0),
          monthsMax: Number(monthsMax || 0),
          modifier: Number(modifier || 0),
          confidenceLabel: String(confidenceLabel || "Unknown"),
        },
      });
      await logAdminAudit({
        action: "confidenceThreshold.create",
        entityType: "ConfidenceThreshold",
        entityId: next.id,
        summary: `Created confidence band`,
        metadata: { after: next },
      });
      revalidateTag("esg-config", "max");
      return NextResponse.json({ ok: true, row: next });
    }

    if (body.type === "applicability") {
      const { sectorCode, certificationName, importanceLevel } = body.data as Record<string, unknown>;
      const next = await prisma.certificationApplicability.create({
        data: {
          sectorCode: String(sectorCode || "HOSP"),
          certificationName: String(certificationName || "ISO"),
          importanceLevel: String(importanceLevel || "High"),
        },
      });
      await logAdminAudit({
        action: "certificationApplicability.create",
        entityType: "CertificationApplicability",
        entityId: next.id,
        summary: `Created applicability ${next.certificationName}`,
        metadata: { after: next },
      });
      revalidateTag("esg-config", "max");
      return NextResponse.json({ ok: true, row: next });
    }

    if (body.type === "seed") {
      await prisma.emissionFactor.createMany({
        data: [
          { sourceType: "Electricity", region: "National", factorValue: 0.72, unit: "kgCO2e/kWh", overrideAllowed: false },
          { sourceType: "Diesel", region: "National", factorValue: 2.68, unit: "kgCO2e/L", overrideAllowed: false },
          { sourceType: "AmbulanceFuel", region: "National", factorValue: 2.68, unit: "kgCO2e/L", overrideAllowed: false },
          { sourceType: "Waste", region: "National", factorValue: 0.8, unit: "kgCO2e/kg", overrideAllowed: false },
          { sourceType: "Water", region: "National", factorValue: 0.5, unit: "kgCO2e/kL", overrideAllowed: false },
        ],
        skipDuplicates: true
      });
      await prisma.benchmarkMaster.createMany({
        data: [
          { sectorCode: "HOSP", metricName: "renewablePercentage", efficientMax: 30, acceptableMin: 0, acceptableMax: 20, unit: "%" },
          { sectorCode: "HOSP", metricName: "waterRecyclingPercentage", efficientMax: 25, acceptableMin: 0, acceptableMax: 15, unit: "%" },
          { sectorCode: "HOSP", metricName: "wasteDiversionPercentage", efficientMax: 40, acceptableMin: 0, acceptableMax: 30, unit: "%" },
          { sectorCode: "HOSP", metricName: "energyPerBed", efficientMax: 15000, acceptableMin: 18000, acceptableMax: 20000, unit: "kWh/bed" },
          { sectorCode: "HOSP", metricName: "waterPerBed", efficientMax: 800, acceptableMin: 1000, acceptableMax: 1200, unit: "kL/bed" },
          { sectorCode: "HOSP", metricName: "wastePerBed", efficientMax: 1200, acceptableMin: 1500, acceptableMax: 1800, unit: "kg/bed" },
        ],
        skipDuplicates: true
      });
      await logAdminAudit({
        action: "system.seed",
        entityType: "System",
        entityId: "seed",
        summary: `Seeded default master data`,
        metadata: {},
      });
      revalidateTag("esg-config", "max");
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Unknown type" }, { status: 400 });
  } catch (e) {
    console.error("system-config post", e);
    return NextResponse.json({ error: "Create failed" }, { status: 500 });
  }
}


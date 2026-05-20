import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { confidenceFromDistinctMonths } from "@/lib/admin/confidence";

async function categoryBlock(hospitalId: string, thresholds: Awaited<ReturnType<typeof prisma.confidenceThreshold.findMany>>) {
  const [elec, water, waste, fuel, ref, transport] = await Promise.all([
    prisma.electricityData.count({ where: { hospitalId } }),
    prisma.waterData.count({ where: { hospitalId } }),
    prisma.wasteData.count({ where: { hospitalId } }),
    prisma.fuelData.count({ where: { hospitalId } }),
    prisma.refrigerantData.count({ where: { hospitalId } }),
    prisma.transportData.count({ where: { hospitalId } }),
  ]);

  const rows = [
    { category: "Electricity", months: elec },
    { category: "Water", months: water },
    { category: "Waste", months: waste },
    { category: "Fuel", months: fuel },
    { category: "Refrigerants", months: ref },
    { category: "Transport", months: transport },
  ].map((r) => {
    const completeness = Math.min(Math.round((r.months / 12) * 100), 100);
    const conf = confidenceFromDistinctMonths(r.months, thresholds);
    let status = "Insufficient";
    if (completeness === 100) status = "Complete";
    else if (completeness >= 50) status = "Partial";
    else if (completeness >= 25) status = "Low";
    return {
      category: r.category,
      months: r.months,
      completeness,
      confidenceLabel: conf.label,
      confidenceModifier: conf.modifier,
      annualizationEligible: conf.annualizationEligible,
      readinessGateMet: conf.readinessGateMet,
      status,
    };
  });
  return rows;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const hospitalId = searchParams.get("hospitalId");
    const thresholds = await prisma.confidenceThreshold.findMany({ orderBy: { monthsMin: "asc" } });

    const hospitals = await prisma.hospital.findMany({
      select: { id: true, hospitalName: true },
      orderBy: { hospitalName: "asc" },
    });

    if (!hospitalId || hospitalId === "all") {
      const blocks = await Promise.all(
        hospitals.map(async (h) => ({
          hospitalId: h.id,
          hospitalName: h.hospitalName,
          categories: await categoryBlock(h.id, thresholds),
        }))
      );
      return NextResponse.json({ hospitals, hospitalId: "all", perHospital: blocks });
    }

    const hospital = await prisma.hospital.findUnique({
      where: { id: hospitalId },
      select: { id: true, hospitalName: true, builtUpArea: true },
    });

    if (!hospital) {
      return NextResponse.json({ error: "Hospital not found" }, { status: 404 });
    }

    const [metrics, emissions, validations, scores] = await Promise.all([
      prisma.calculatedMetric.findMany({
        where: { hospitalId },
        orderBy: { createdAt: "desc" },
        take: 80,
      }),
      prisma.emissionsSummary.findMany({
        where: { hospitalId },
        orderBy: [{ scope: "asc" }, { source: "asc" }],
      }),
      prisma.validationResult.findMany({
        where: { hospitalId },
        orderBy: { createdAt: "desc" },
        take: 100,
      }),
      prisma.eSGScore.findMany({
        where: { hospitalId },
        orderBy: { createdAt: "desc" },
        take: 1,
      }),
    ]);

    const categories = await categoryBlock(hospitalId, thresholds);

    return NextResponse.json({
      hospitals,
      hospitalId,
      hospitalName: hospital.hospitalName,
      builtUpArea: hospital.builtUpArea,
      categories,
      formulas: {
        annualization: "(Σ monthly values for category) ÷ (distinct months uploaded) × 12",
        intensityEnergy: "Annualized electricity (kWh) ÷ built-up area (sqft)",
        intensityWater: "Annualized water (KL) ÷ built-up area (sqft)",
        renewableShare: "(Renewable kWh ÷ Total electricity kWh) × 100",
        confidencePropagation: "Readiness and certification scores absorb ConfidenceThreshold modifiers from BRD tables.",
      },
      calculatedMetrics: metrics,
      emissionsSummary: emissions,
      validationResults: validations,
      latestEsgScore: scores[0] ?? null,
    });
  } catch (e) {
    console.error("calculations", e);
    return NextResponse.json({ error: "Failed to load calculations" }, { status: 500 });
  }
}

"use server";

import { prisma } from "@/lib/db";
import { cookies } from "next/headers";

export async function getAssessmentCycles() {
  try {
    const dbCycles = await prisma.assessmentCycle.findMany({
      orderBy: { startDate: "desc" },
    });
    
    const cycles = dbCycles.map(c => ({
      ...c,
      year: c.startDate ? c.startDate.getFullYear() : new Date().getFullYear(),
    }));

    const cookieStore = await cookies();
    let activeId = cookieStore.get("activeAssessmentCycleId")?.value;
    
    // Fallback: If no cookie but we have cycles, default to the latest one
    if (!activeId && cycles.length > 0) {
      activeId = cycles[0].id;
      cookieStore.set("activeAssessmentCycleId", activeId, { path: "/" });
    }

    return { cycles, activeId };
  } catch (error) {
    console.error("Failed to get assessment cycles", error);
    return { cycles: [], activeId: null };
  }
}

export async function createAssessmentCycle(name: string, year: number) {
  const hospital = await prisma.hospital.findFirst();
  if (!hospital) throw new Error("No hospital found");
  
  const cycle = await prisma.assessmentCycle.create({
    data: {
      name,
      hospitalId: hospital.id,
      startDate: new Date(`${year}-01-01`),
      endDate: new Date(`${year}-12-31`),
    }
  });
  
  const cookieStore = await cookies();
  cookieStore.set("activeAssessmentCycleId", cycle.id, { path: "/" });
  
  const { revalidatePath } = await import("next/cache");
  revalidatePath("/");
  
  return { success: true, cycle };
}

export async function setActiveAssessmentCycle(cycleId: string) {
  const cookieStore = await cookies();
  cookieStore.set("activeAssessmentCycleId", cycleId, { path: "/" });
  const { revalidatePath } = await import("next/cache");
  revalidatePath("/");
  return { success: true };
}

export async function lockAssessmentCycle() {
  const cookieStore = await cookies();
  const activeId = cookieStore.get("activeAssessmentCycleId")?.value;
  if (!activeId) return { success: false, error: "No active assessment cycle" };

  await prisma.assessmentCycle.update({
    where: { id: activeId },
    data: { isLocked: true },
  });

  const { revalidatePath } = await import("next/cache");
  revalidatePath("/");
  return { success: true };
}

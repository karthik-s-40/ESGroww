"use server";

import { prisma } from "@/lib/db";
import { cookies } from "next/headers";

export async function getAssessmentCycles() {
  try {
    const cycles = await prisma.assessmentCycle.findMany({
      orderBy: { startDate: "desc" },
    });
    
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

export async function setActiveAssessmentCycle(cycleId: string) {
  const cookieStore = await cookies();
  cookieStore.set("activeAssessmentCycleId", cycleId, { path: "/" });
  return { success: true };
}

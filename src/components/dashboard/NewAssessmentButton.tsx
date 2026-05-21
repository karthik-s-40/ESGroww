"use client";

import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function NewAssessmentButton() {
  const router = useRouter();

  const handleCreate = async () => {
    const name = window.prompt("Enter assessment name (e.g. FY 2025):");
    if (!name) return;
    
    const yearStr = window.prompt("Enter assessment year (e.g. 2025):");
    const year = parseInt(yearStr || new Date().getFullYear().toString(), 10);
    
    const { createAssessmentCycle, setActiveAssessmentCycle } = await import("@/actions/assessmentCycle.actions");
    const res = await createAssessmentCycle(name, year);
    
    await setActiveAssessmentCycle(res.cycle.id);
    
    window.location.href = "/esg-readiness-platform";
  };

  return (
    <Button 
      onClick={handleCreate}
      variant="outline"
      className="gap-2 h-9 border-[#00673F] text-[#00673F] hover:bg-[#00673F]/10 font-semibold"
    >
      <Plus className="h-4 w-4" />
      Start New Assessment
    </Button>
  );
}

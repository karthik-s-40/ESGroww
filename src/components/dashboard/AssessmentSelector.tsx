"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAssessmentCycles, setActiveAssessmentCycle } from "@/actions/assessmentCycle.actions";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function AssessmentSelector() {
  const router = useRouter();
  const [cycles, setCycles] = useState<any[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    getAssessmentCycles().then((data) => {
      setCycles(data.cycles);
      setActiveId(data.activeId || "");
    });
  }, []);

  if (cycles.length === 0) return null;

  const handleSelect = async (val: string | null) => {
    if (!val) return;
    
    if (val === "CREATE_NEW") {
      const name = window.prompt("Enter assessment name (e.g. FY 2025):");
      if (!name) return;
      const yearStr = window.prompt("Enter assessment year (e.g. 2025):");
      const year = parseInt(yearStr || new Date().getFullYear().toString(), 10);
      
      const { createAssessmentCycle } = await import("@/actions/assessmentCycle.actions");
      const res = await createAssessmentCycle(name, year);
      
      setActiveId(res.cycle.id);
      
      const { getAssessmentCycles } = await import("@/actions/assessmentCycle.actions");
      const data = await getAssessmentCycles();
      setCycles(data.cycles);
      
      router.refresh();
      return;
    }

    setActiveId(val);
    await setActiveAssessmentCycle(val);
    router.refresh();
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground font-medium">Cycle:</span>
      <Select value={activeId} onValueChange={handleSelect}>
        <SelectTrigger className="h-8 w-[160px] text-xs font-semibold bg-secondary/20 border-border">
          <SelectValue placeholder="Select Cycle" />
        </SelectTrigger>
        <SelectContent>
          {cycles.map((c) => (
            <SelectItem key={c.id} value={c.id} className="text-xs">
              {c.name} ({c.year})
            </SelectItem>
          ))}
          <SelectItem value="CREATE_NEW" className="text-xs font-semibold text-emerald-600 focus:text-emerald-700">
             + Start New Assessment
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

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

  const handleSelect = async (val: string | null) => {
    if (!val) return;

    setActiveId(val);
    await setActiveAssessmentCycle(val);
    window.location.reload();
  };

  if (cycles.length === 0) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground font-medium">Cycle:</span>
        <div className="h-8 w-[140px] rounded-md bg-secondary/20 border border-border animate-pulse" />
      </div>
    );
  }

  // Ensure activeId actually exists in cycles to prevent Radix from rendering the raw ID
  const validActiveId = cycles.some(c => c.id === activeId) ? activeId : undefined;
  
  // Explicitly find the active name to bypass Radix UI hydration bugs
  const activeName = cycles.find(c => c.id === validActiveId)?.name;

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground font-medium">Cycle:</span>
      <Select value={validActiveId} onValueChange={handleSelect}>
        <SelectTrigger className="h-8 w-[140px] text-xs font-semibold bg-secondary/20 border-border">
          <SelectValue placeholder="Select Cycle">
            {activeName}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {cycles.map((c) => (
            <SelectItem key={c.id} value={c.id} className="text-xs">
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

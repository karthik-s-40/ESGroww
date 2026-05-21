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
        </SelectContent>
      </Select>
    </div>
  );
}

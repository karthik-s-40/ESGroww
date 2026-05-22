"use client";

import { useRouter } from "next/navigation";
import { CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { setActiveAssessmentCycle } from "@/actions/assessmentCycle.actions";

type Props = {
  cycles: any[];
  activeId: string | null;
};

export function HistoryTable({ cycles, activeId }: Props) {
  const router = useRouter();

  const handleSetActive = async (id: string) => {
    await setActiveAssessmentCycle(id);
    window.location.href = "/results";
  };

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      <table className="w-full text-left text-sm">
        <thead className="bg-muted/50 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border">
          <tr>
            <th className="px-6 py-4">Assessment Name</th>
            <th className="px-6 py-4">Reporting Year</th>
            <th className="px-6 py-4">Created On</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {cycles.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                No assessments found.
              </td>
            </tr>
          ) : (
            cycles.map((cycle) => {
              const isActive = cycle.id === activeId;
              
              return (
                <tr key={cycle.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-6 py-4 font-medium text-foreground">
                    {cycle.name}
                    {isActive && (
                      <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                        <CheckCircle2 className="h-3 w-3" /> Active
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{cycle.year}</td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {new Date(cycle.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    {cycle.isLocked ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                        <CheckCircle2 className="h-3 w-3" /> Completed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full border border-amber-100 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                        <Clock className="h-3 w-3" /> In Progress
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button
                      variant={isActive ? "secondary" : "outline"}
                      size="sm"
                      disabled={isActive}
                      onClick={() => handleSetActive(cycle.id)}
                    >
                      {isActive ? "Currently Viewing" : "View Results"}
                    </Button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

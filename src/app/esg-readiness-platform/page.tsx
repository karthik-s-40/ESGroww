import { Info, AlertTriangle } from "lucide-react";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

import { PageWrapper } from "@/components/layout/page-wrapper";
import { SectionCard } from "@/components/layout/section-card";
import UploadWorkspace from "@/components/upload/UploadWorkspace";
import { BRD_MIN_MONTHS_FOR_READINESS_GATE } from "@/lib/upload/brdConstants";
import { NewAssessmentButton } from "@/components/dashboard/NewAssessmentButton";

export default async function UploadPage() {
  const cookieStore = await cookies();
  const activeId = cookieStore.get("activeAssessmentCycleId")?.value;
  let isLocked = false;
  if (activeId) {
    const cycle = await prisma.assessmentCycle.findUnique({ where: { id: activeId }, select: { isLocked: true } });
    if (cycle?.isLocked) isLocked = true;
  }

  return (
    <div className="flex w-full min-w-0 flex-col bg-background text-foreground">
      <PageWrapper maxWidth="full" dense className="pb-14">
        <header className="flex shrink-0 flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b border-border pb-2">
          <div className="flex items-end gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">Assessment</h1>
            <p className="hidden min-w-0 flex-1 text-xs leading-snug text-muted-foreground md:block md:truncate lg:text-sm">
              Upload operational records and complete the governance questionnaire.
            </p>
          </div>
          <NewAssessmentButton />
        </header>

        <SectionCard size="sm" className="shrink-0 border-l-[3px] border-l-primary bg-accent/30 shadow-none ring-foreground/5">
          <div className="flex items-start gap-2 text-[11px] leading-snug text-accent-foreground">
            <Info className="mt-0.5 size-3.5 shrink-0 text-primary" aria-hidden />
            <p>
              <strong className="font-semibold text-foreground">Incremental uploads</strong> are always accepted when valid. Readiness for
              summary unlocks at <strong>{BRD_MIN_MONTHS_FOR_READINESS_GATE} distinct months</strong> each for Electricity, Water, and Waste. {" "}
              <strong className="font-semibold text-foreground">12 months</strong> recommended for maximum confidence.
            </p>
          </div>
        </SectionCard>

        {isLocked ? (
          <SectionCard size="sm" className="mt-4 shrink-0 border-l-[3px] border-l-red-500 bg-red-50 shadow-none">
            <div className="flex items-center gap-2 text-sm leading-snug text-red-800 font-medium">
              <AlertTriangle className="size-4 shrink-0 text-red-600" />
              <p>Already marked as complete, cannot edit.</p>
            </div>
          </SectionCard>
        ) : (
          <UploadWorkspace />
        )}
      </PageWrapper>
    </div>
  );
}
import { Info } from "lucide-react";

import { PageWrapper } from "@/components/layout/page-wrapper";
import { SectionCard } from "@/components/layout/section-card";
import UploadWorkspace from "@/components/upload/UploadWorkspace";
import { BRD_MIN_MONTHS_FOR_READINESS_GATE } from "@/lib/upload/brdConstants";

export default function UploadPage() {
  return (
    <div className="flex h-full w-full min-w-0 flex-col overflow-hidden bg-background text-foreground">
      <PageWrapper maxWidth="full" dense className="h-full overflow-hidden pb-14">
        <header className="flex shrink-0 flex-wrap items-end gap-x-3 gap-y-1 border-b border-border pb-2">
          <h1 className="text-base font-bold tracking-tight text-foreground sm:text-lg">Assessment</h1>
          <p className="hidden min-w-0 flex-1 text-[11px] leading-snug text-muted-foreground md:block md:truncate">
            Upload operational records and complete the governance questionnaire.
          </p>
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

        <UploadWorkspace />

        <footer className="fixed bottom-0 left-0 right-0 z-50 flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-border bg-background/95 px-4 py-2 text-[10px] text-muted-foreground backdrop-blur-sm supports-[backdrop-filter]:bg-background/80">
          <span>© {new Date().getFullYear()} ESGroww</span>
          <span>v0.1.0</span>
        </footer>
      </PageWrapper>
    </div>
  );
}
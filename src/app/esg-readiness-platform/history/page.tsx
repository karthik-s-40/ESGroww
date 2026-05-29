import { getAssessmentCycles } from "@/actions/assessmentCycle.actions";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { HistoryTable } from "@/components/history/HistoryTable";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const { cycles, activeId } = await getAssessmentCycles();

  return (
    <PageWrapper className="pb-14">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">Assessment History</h1>
        <p className="text-sm text-muted-foreground">
          View all your past assessments, switch your active session, and review historical data.
        </p>
      </header>

      <HistoryTable cycles={cycles} activeId={activeId || null} />
    </PageWrapper>
  );
}

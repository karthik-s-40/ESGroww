"use client";

import { useCallback, useState } from "react";

import ProceedButton from "@/components/upload/ProceedButton";
import RecentUploadsTable from "@/components/upload/RecentUploadsTable";
import UploadCategoryGrid from "@/components/upload/UploadCategoryGrid";
import UploadOverviewPanel from "@/components/upload/UploadOverviewPanel";
import { BRD_MIN_MONTHS_FOR_READINESS_GATE } from "@/lib/upload/brdConstants";

/** Laptop-first dashboard: primary path in one viewport; uploads list scrolls inside panel. */
export default function UploadWorkspace() {
  const [refreshKey, setRefreshKey] = useState(0);
  const bump = useCallback(() => setRefreshKey((k) => k + 1), []);

  return (
    <div className="grid min-h-0 w-full min-w-0 grid-cols-1 gap-2 lg:grid-cols-12 lg:gap-2.5 lg:max-h-[min(calc(100dvh-13rem),860px)] lg:overflow-hidden">
      {/* Main bento: categories + governance / additional */}
      <section className="flex min-h-0 min-w-0 flex-col overflow-y-auto overflow-x-hidden lg:col-span-9 2xl:col-span-9">
        <UploadCategoryGrid onDataChanged={bump} compact />
      </section>

      {/* Side rail: overview + recent + proceed */}
      <aside className="flex min-h-0 min-w-0 flex-col gap-2 overflow-hidden lg:col-span-3 2xl:col-span-3">
        <UploadOverviewPanel refreshKey={refreshKey} variant="compact" />

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm">
          <RecentUploadsTable refreshKey={refreshKey} limit={10} showViewAllLink compact />
        </div>

        <div className="flex shrink-0 flex-col gap-1.5 rounded-lg border border-border bg-card px-2.5 py-2 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[10px] leading-snug text-muted-foreground">
            Electricity, Water, Waste: {BRD_MIN_MONTHS_FOR_READINESS_GATE} distinct months each to unlock summary (incremental uploads
            accumulate).
          </p>
          <ProceedButton refreshKey={refreshKey} compact />
        </div>
      </aside>
    </div>
  );
}

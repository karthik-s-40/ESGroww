"use client";

import { useEffect, useState } from "react";
import { adminGlassCard, AdminEmpty, AdminSectionTitle, ExportCsvButton } from "@/components/admin/admin-ui";
import { Badge } from "@/components/ui/badge";

type Line = {
  id: string;
  ts: string;
  source: "config" | "ingestion" | "validation";
  summary: string;
  meta?: string;
};

export default function AuditLogsPage() {
  const [items, setItems] = useState<Line[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/audit-logs");
        const json = await res.json();
        if (!cancelled) {
          if (!res.ok) setError(json.error ?? "Failed");
          else setItems(json.items ?? []);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-[#d5ddd6] border-t-[#00673F]" />
      </div>
    );
  }

  if (error) {
    return <AdminEmpty title="Audit trail unavailable" body={error} />;
  }

  return (
    <div className="space-y-8 pb-10">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#3d5248]/80">Compliance</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#15221a]">Audit & activity trail</h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#3d5248]">
          Unified chronological feed: configuration edits (AdminAuditLog), ingestion batches, and validation outcomes.
          Export for external GRC systems or annual assurance workflows.
        </p>
      </div>

      <div className="flex justify-end">
        <ExportCsvButton
          filename="esgroww-audit-trail.csv"
          rows={items as unknown as Record<string, unknown>[]}
          columns={[
            { key: "ts", header: "Timestamp" },
            { key: "source", header: "Source" },
            { key: "summary", header: "Summary" },
            { key: "meta", header: "Meta" },
          ]}
        />
      </div>

      <AdminSectionTitle
        eyebrow="Ledger"
        title="Chronological audit stream"
        description="Most recent events first — capped for UI performance; use database replication for long-term archival."
      />

      <div className={adminGlassCard("max-h-[720px] space-y-2 overflow-y-auto p-3")}>
        {items.length === 0 ? (
          <AdminEmpty
            title="No audit events yet"
            body="After you edit master data in System Config, AdminAuditLog records appear here alongside ingestion and validation history."
          />
        ) : (
          items.map((it) => (
            <div key={it.id} className="flex gap-3 rounded-lg border border-[#eceee8] bg-white/70 px-3 py-2 text-xs">
              <div className="w-[150px] shrink-0 text-[11px] text-[#3d5248]">{new Date(it.ts).toLocaleString()}</div>
              <Badge variant="outline" className="h-5 shrink-0 text-[9px] uppercase">
                {it.source}
              </Badge>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-[#15221a]">{it.summary}</p>
                {it.meta ? <p className="mt-0.5 text-[11px] text-[#004d7c]">{it.meta}</p> : null}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

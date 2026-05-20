"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function adminGlassCard(className?: string) {
  return cn(
    "flex min-h-[112px] flex-col rounded-xl border border-[#d5ddd6]/90 bg-white/75 p-4 shadow-sm ring-1 ring-[#00673F]/[0.06] backdrop-blur-sm",
    className
  );
}

export function AdminSectionTitle({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#3d5248]/85">{eyebrow}</p>
      <h2 className="mt-1 text-lg font-semibold tracking-tight text-[#15221a]">{title}</h2>
      {description ? <p className="mt-1 max-w-3xl text-sm leading-relaxed text-[#3d5248]">{description}</p> : null}
    </div>
  );
}

export function AdminEmpty({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-start gap-3 rounded-xl border border-dashed border-[#00673F]/25 bg-[#00673F]/[0.03] p-8"
      )}
    >
      <p className="text-sm font-semibold text-[#15221a]">{title}</p>
      <p className="max-w-lg text-sm leading-relaxed text-[#3d5248]">{body}</p>
      {action}
    </div>
  );
}

export function ExportCsvButton({
  filename,
  rows,
  columns,
}: {
  filename: string;
  rows: Record<string, unknown>[];
  columns: { key: string; header: string }[];
}) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="h-8 border-[#d5ddd6] text-xs"
      onClick={() => {
        const esc = (v: unknown) => {
          const s = v == null ? "" : String(v);
          if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
          return s;
        };
        const header = columns.map((c) => esc(c.header)).join(",");
        const lines = rows.map((r) => columns.map((c) => esc(r[c.key])).join(","));
        const csv = "\uFEFF" + [header, ...lines].join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
      }}
    >
      Export CSV
    </Button>
  );
}

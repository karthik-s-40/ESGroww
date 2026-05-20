"use client";

import React from "react";
import { AlertCircle, Loader2 } from "lucide-react";

interface PageLayoutProps {
  title: string;
  description?: string;
  loading?: boolean;
  error?: string | null;
  children: React.ReactNode;
}

export default function PageLayout({
  title,
  description,
  loading = false,
  error = null,
  children,
}: PageLayoutProps) {
  const header = (
    <div className="mb-3 border-b border-slate-200/90 pb-2">
      <h1 className="text-base font-bold tracking-tight text-slate-900 sm:text-lg">{title}</h1>
      {description && (
        <p className="mt-0.5 text-xs leading-snug text-slate-500">{description}</p>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="w-full py-2">
        {header}
        <div className="flex items-center justify-center py-16 text-slate-400">
          <Loader2 className="size-5 animate-spin mr-2" />
          <span className="text-sm">Loading…</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full py-2">
        {header}
        <div className="flex items-center gap-2 rounded-lg border border-rose-100 bg-rose-50 px-3 py-2.5 text-sm text-rose-700">
          <AlertCircle className="size-4 shrink-0" />
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-2">
      {header}
      {children}
    </div>
  );
}

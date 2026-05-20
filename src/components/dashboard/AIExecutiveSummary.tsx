"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { PrintReportButton } from "@/components/shared/PrintReportButton";

export function AIExecutiveSummary() {
  return (
    <Card className="border-slate-200 print:shadow-none print:border-none">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-slate-700" />
          <CardTitle className="text-slate-900">AI Executive Summary</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-slate-600 text-sm leading-relaxed mb-4">
          Sunrise Multispeciality Hospital demonstrates strong operational sustainability fundamentals with structured utility tracking, strong waste segregation practices, and moderate governance maturity. Current operational performance indicates potential for NABH, IGBC Healthcare, and ISO 14001 pathways. Key improvement opportunities include renewable energy integration, centralized energy monitoring systems, and enhanced ESG governance formalization.
        </p>
        <div className="print:hidden">
          <PrintReportButton />
        </div>
      </CardContent>
    </Card>
  );
}

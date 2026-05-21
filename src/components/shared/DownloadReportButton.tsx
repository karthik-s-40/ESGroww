"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { pdf } from "@react-pdf/renderer";
import { VectorReportTemplate } from "@/components/pdf/VectorReportTemplate";
import { type KPIBenchmark } from "@/lib/kpiUtils";

export interface DownloadReportData {
  orgName?: string;
  sector?: string;
  overallScore: number;
  readinessStage: string;
  completeness: number;
  confidence: number;
  totalEmissions: number;
  annualizedValues: { electricity: number; water: number; fuel: number; waste: number };
  certificationReadiness?: { name: string; score: number; status: string }[];
  categoryScores?: { energy: number; water: number; waste: number; governance: number };
  emissions?: { scope1: number; scope2: number; scope3: number };
  strengths?: string[];
  builtUpArea?: number;
  orgBuiltUpArea?: number;
  percentages?: { renewableEnergy?: number; waterRecycling?: number; wasteRecycling?: number };
  gaps?: { text: string; severity: "High" | "Medium" | "Low" }[];
  regulatoryReadiness?: { regulation: string; readiness: number; risk: "Low" | "Medium" | "Medium-High" | "High" }[];
  roadmap?: { action: string; timeline: string; impact: string }[];
  evaluatedKpis?: Record<string, KPIBenchmark>;
}

interface DownloadReportButtonProps {
  data: DownloadReportData;
  className?: string;
  label?: string;
  disabled?: boolean;
  /**
   * Root element that contains one or more `[data-pdf-page]` print canvases.
   * Each page is rasterized separately and composited onto a copy of `public/pdf_template/template.pdf`.
   */
  captureRootId: string;
}

export function DownloadReportButton({
  data,
  className,
  label = "Download PDF Report",
  disabled = false,
  captureRootId,
}: DownloadReportButtonProps) {
  const [busy, setBusy] = useState(false);

  const safeFileName = () => {
    const name = data.orgName ? data.orgName.replace(/[^a-zA-Z0-9\- ]/g, "").trim() : "SAM-ESG-Assessment";
    return `${name.replace(/\s+/g, "-") || "SAM-ESG-Assessment"}-ESG-Report.pdf`;
  };

  const handleDownload = async () => {
    setBusy(true);
    try {
      // 1. Generate PDF blob using @react-pdf/renderer
      const blob = await pdf(<VectorReportTemplate data={data} />).toBlob();
      
      // 2. Trigger download
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = safeFileName();
      a.rel = "noopener";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      window.alert("Could not prepare the PDF. Please try again or refresh the page.");
    } finally {
      setBusy(false);
    }
  };

  const effectiveDisabled = disabled || busy;
  const effectiveLabel = busy ? "Preparing PDF…" : label;

  return (
    <Button variant="secondary" className={className} onClick={() => void handleDownload()} disabled={effectiveDisabled}>
      {effectiveLabel}
    </Button>
  );
}

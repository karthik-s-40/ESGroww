"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { buildResultsPdfWithTemplate, triggerPdfDownload } from "@/lib/pdf/buildResultsPdfWithTemplate";

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
    const el = document.getElementById(captureRootId);
    if (!(el instanceof HTMLElement)) {
      window.alert("Could not find the report content to export.");
      return;
    }
    setBusy(true);
    try {
      const bytes = await buildResultsPdfWithTemplate(el);
      triggerPdfDownload(bytes, safeFileName());
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
    <Button variant="default" className={className} onClick={() => void handleDownload()} disabled={effectiveDisabled}>
      {effectiveLabel}
    </Button>
  );
}

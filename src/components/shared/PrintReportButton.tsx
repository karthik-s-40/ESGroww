"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface PrintReportButtonProps {
  label?: string;
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

export function PrintReportButton({ label = "Download Full Report (PDF)", className, variant = "outline" }: PrintReportButtonProps) {
  const handlePrint = () => {
    // Basic Print Screen Tracker Logic
    console.log("[Tracker] Action Triggered: Print Screen / Download Report");
    
    // In a real app, this might insert a record into the DB with trackReportDownload(userId)
    fetch('/api/track-print', { method: 'POST', body: JSON.stringify({ action: 'print_report', timestamp: new Date() }) })
      .catch(err => console.debug("Mock tracking route not found, just tracking locally", err));

    window.print();
  };

  return (
    <Button 
      variant={variant}
      className={className || "text-emerald-700 border-emerald-200 bg-emerald-50 hover:bg-emerald-100"}
      onClick={handlePrint}
    >
      <Download className="w-4 h-4 mr-2" /> {label}
    </Button>
  );
}

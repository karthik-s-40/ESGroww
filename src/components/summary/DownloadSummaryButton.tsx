"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";
import { Download } from "lucide-react";

export function DownloadSummaryButton({ targetId }: { targetId: string }) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    const element = document.getElementById(targetId);
    if (!element) return;
    
    setIsDownloading(true);
    try {
      // Store original styles that we might modify
      const originalStyle = element.style.cssText;
      
      const imgData = await toPng(element, {
        pixelRatio: 2,
        backgroundColor: "#ffffff",
        filter: (node) => {
          if (node instanceof HTMLElement) {
            return !node.hasAttribute("data-html2canvas-ignore");
          }
          return true;
        },
      });
      
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });
      
      // We need original dimensions to calculate aspect ratio
      const rect = element.getBoundingClientRect();
      const canvasWidth = rect.width;
      const canvasHeight = rect.height;
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvasHeight * pdfWidth) / canvasWidth;
      
      let finalWidth = pdfWidth;
      let finalHeight = pdfHeight;
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Ensure it fits exactly on one A4 page if it's too tall, maintaining aspect ratio
      if (pdfHeight > pageHeight) {
        finalHeight = pageHeight - 20; // 10mm padding top and bottom
        finalWidth = (canvasWidth * finalHeight) / canvasHeight;
      }
      
      const xOffset = (pdfWidth - finalWidth) / 2;
      
      // Calculate a slight Y offset if we want padding, or just center it vertically
      // If it's shorter than page height, we can add a 10mm top margin
      let yOffset = 10;
      if (pdfHeight < pageHeight) {
          yOffset = 10;
      } else {
          yOffset = (pageHeight - finalHeight) / 2;
      }
      
      pdf.addImage(imgData, "PNG", xOffset, yOffset, finalWidth, finalHeight);
      pdf.save("ESG-Summary-Report.pdf");
      
    } catch (error) {
      console.error("Failed to generate PDF", error);
      alert("Failed to download PDF. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Button 
      onClick={handleDownload} 
      disabled={isDownloading}
      className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
      data-html2canvas-ignore="true"
    >
      <Download className="w-4 h-4" />
      {isDownloading ? "Generating..." : "Download PDF"}
    </Button>
  );
}

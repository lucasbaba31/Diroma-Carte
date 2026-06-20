"use client";

import { useState, useRef } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Menu } from "@/types";
import { FORMAT_DIMENSIONS } from "@/lib/utils";

interface ExportButtonProps {
  menu: Menu;
  previewRef: React.RefObject<HTMLDivElement | null>;
}

export function ExportButton({ menu, previewRef }: ExportButtonProps) {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    if (!previewRef.current) return;
    setExporting(true);

    try {
      const { default: html2canvas } = await import("html2canvas");
      const { default: jsPDF } = await import("jspdf");

      const dims = FORMAT_DIMENSIONS[menu.format] ?? FORMAT_DIMENSIONS.A4_PORTRAIT;
      const isLandscape = menu.format === "A4_LANDSCAPE";

      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
        width: dims.width,
        height: dims.height,
      });

      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF({
        orientation: isLandscape ? "landscape" : "portrait",
        unit: "mm",
        format: menu.format.startsWith("A5") ? "a5" : "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${menu.name.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.pdf`);
    } catch (err) {
      console.error("Export PDF failed:", err);
      alert("Erreur lors de l'export PDF");
    } finally {
      setExporting(false);
    }
  };

  const handleExportPNG = async () => {
    if (!previewRef.current) return;
    setExporting(true);

    try {
      const { default: html2canvas } = await import("html2canvas");
      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
      });

      const link = document.createElement("a");
      link.download = `${menu.name.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Export PNG failed:", err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Button onClick={handleExport} disabled={exporting} variant="default">
        {exporting ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Download className="h-4 w-4 mr-2" />
        )}
        {exporting ? "Export..." : "PDF"}
      </Button>
      <Button onClick={handleExportPNG} disabled={exporting} variant="outline">
        PNG
      </Button>
    </div>
  );
}

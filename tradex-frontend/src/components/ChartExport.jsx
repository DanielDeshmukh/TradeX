import React, { useState } from "react";

function ChartExport({ chartRef }) {
  const [exporting, setExporting] = useState(false);
  const [format, setFormat] = useState("png");

  const exportChart = async () => {
    if (!chartRef?.current) return;
    
    setExporting(true);
    try {
      const chart = chartRef.current;
      
      // Get the chart canvas
      const canvas = chart.querySelector("canvas");
      if (!canvas) {
        console.error("No canvas found in chart");
        return;
      }

      // Create a new canvas with white background
      const exportCanvas = document.createElement("canvas");
      exportCanvas.width = canvas.width;
      exportCanvas.height = canvas.height;
      const ctx = exportCanvas.getContext("2d");
      
      // Fill white background
      ctx.fillStyle = "#0B0E15";
      ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
      
      // Draw the chart
      ctx.drawImage(canvas, 0, 0);

      // Convert to blob and download
      const mimeType = format === "png" ? "image/png" : "image/jpeg";
      const quality = format === "jpeg" ? 0.95 : undefined;
      
      exportCanvas.toBlob(
        (blob) => {
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `tradex-chart-${Date.now()}.${format}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          setExporting(false);
        },
        mimeType,
        quality
      );
    } catch (err) {
      console.error("Export failed:", err);
      setExporting(false);
    }
  };

  const copyToClipboard = async () => {
    if (!chartRef?.current) return;
    
    setExporting(true);
    try {
      const chart = chartRef.current;
      const canvas = chart.querySelector("canvas");
      if (!canvas) return;

      const blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/png")
      );
      
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);
      
      setExporting(false);
    } catch (err) {
      console.error("Copy failed:", err);
      setExporting(false);
    }
  };

  return (
    <div className="glass-card p-4">
      <h3 className="text-sm font-semibold mb-3 text-content-secondary">Export Chart</h3>

      <div className="flex flex-wrap gap-2 mb-3">
        <button
          onClick={() => setFormat("png")}
          className={`px-3 py-1.5 text-xs rounded-lg transition-all ${
            format === "png"
              ? "bg-brand text-white"
              : "bg-surface-input text-content-secondary hover:bg-surface"
          }`}
        >
          PNG
        </button>
        <button
          onClick={() => setFormat("jpeg")}
          className={`px-3 py-1.5 text-xs rounded-lg transition-all ${
            format === "jpeg"
              ? "bg-brand text-white"
              : "bg-surface-input text-content-secondary hover:bg-surface"
          }`}
        >
          JPEG
        </button>
      </div>

      <div className="flex gap-2">
        <button
          onClick={exportChart}
          disabled={exporting}
          className="flex-1 px-4 py-2 bg-brand text-white rounded-lg text-sm font-medium 
                     hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {exporting ? "Exporting..." : `Download ${format.toUpperCase()}`}
        </button>
        <button
          onClick={copyToClipboard}
          disabled={exporting}
          className="px-4 py-2 bg-surface-input text-content-secondary rounded-lg text-sm 
                     hover:bg-surface transition-colors disabled:opacity-50"
        >
          Copy
        </button>
      </div>
    </div>
  );
}

export default ChartExport;

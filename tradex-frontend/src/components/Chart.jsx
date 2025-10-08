// src/components/Chart.jsx
import { useEffect, useRef, useState } from "react";
import {
  createChart,
  CrosshairMode,
  CandlestickSeries,
  LineSeries,
  AreaSeries,
} from "lightweight-charts";

const Chart = ({ chartType, candles = [], overlays = [], onReady }) => {
  const containerRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!containerRef.current) return;

    // Reset chart
    if (chartRef.current) {
      try {
        chartRef.current.remove();
      } catch {}
      chartRef.current = null;
      seriesRef.current = null;
    }

    // If no candles, show "No data"
    if (!candles.length) {
      setLoading(false);
      return;
    }

    setLoading(true);

    // Create chart
    const chart = createChart(containerRef.current, {
      layout: { background: { type: "solid", color: "#0F1117" }, textColor: "#FFFFFF" },
      grid: { vertLines: { color: "#1F2937" }, horzLines: { color: "#1F2937" } },
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,
      crosshair: { mode: CrosshairMode.Normal },
      timeScale: { rightOffset: 10, barSpacing: 10, borderVisible: false },
    });

    chartRef.current = chart;

    // Determine series type
    let SeriesClass = CandlestickSeries;
    let seriesOptions = {};
    let data = candles;

    if (chartType?.toLowerCase() === "line") {
      SeriesClass = LineSeries;
      seriesOptions = { color: "#4ade80", lineWidth: 2 };
      data = candles.map(({ time, close }) => ({ time, value: close }));
    } else if (chartType?.toLowerCase() === "area") {
      SeriesClass = AreaSeries;
      seriesOptions = {
        topColor: "rgba(96,165,250,0.4)",
        bottomColor: "rgba(30,41,59,0.2)",
        lineColor: "#60A5FA",
        lineWidth: 2,
      };
      data = candles.map(({ time, close }) => ({ time, value: close }));
    } else {
      seriesOptions = {
        upColor: "#26a69a",
        downColor: "#ef5350",
        wickUpColor: "#26a69a",
        wickDownColor: "#ef5350",
        borderVisible: false,
      };
    }

    const series = chart.addSeries(SeriesClass, seriesOptions);
    series.setData(data);
    seriesRef.current = series;

    // Tooltip
    const tooltip = document.createElement("div");
    tooltip.style.cssText = `
      position: absolute; display: none; pointer-events: none;
      padding: 8px; font-size: 12px; border-radius: 2px;
      background: rgba(0,0,0,0.8); color: white; z-index: 10;
      font-family: -apple-system, BlinkMacSystemFont, 'Trebuchet MS', Roboto, Ubuntu, sans-serif;
    `;
    containerRef.current.appendChild(tooltip);

    chart.subscribeCrosshairMove(param => {
      if (!param || !param.time || !param.seriesData.get(series)) {
        tooltip.style.display = "none";
        return;
      }

      tooltip.style.display = "block";
      const d = param.seriesData.get(series);

      if (SeriesClass === CandlestickSeries) {
        const { open, high, low, close } = d;
        tooltip.innerHTML = `
          <div class="flex justify-between text-xs mt-1">
            <span>Open:</span><span class="text-green-400">${open.toFixed(2)}</span>
          </div>
          <div class="flex justify-between text-xs">
            <span>High:</span><span class="text-green-400">${high.toFixed(2)}</span>
          </div>
          <div class="flex justify-between text-xs">
            <span>Low:</span><span class="text-red-400">${low.toFixed(2)}</span>
          </div>
          <div class="flex justify-between text-xs">
            <span>Close:</span><span class="text-white">${close.toFixed(2)}</span>
          </div>
          <div class="font-semibold text-xs text-white">Time: <span class="text-[#7F3DFF]">${param.time}</span></div>
        `;
      } else {
        tooltip.innerHTML = `
          <div class="font-semibold text-xs text-white">Time: <span class="text-[#7F3DFF]">${param.time}</span></div>
          <div class="text-white text-sm mt-1">Price: ${d.value.toFixed(2)}</div>
        `;
      }

      const { x, y } = param.point;
      const rect = containerRef.current.getBoundingClientRect();
      let left = x + 12;
      if (left + 140 > rect.width) left = x - 150;
      let top = y + 12;
      if (top + 80 > rect.height) top = y - 90;

      tooltip.style.left = `${left}px`;
      tooltip.style.top = `${top}px`;
      tooltip.style.padding = "8px 10px";
      tooltip.style.borderRadius = "8px";
      tooltip.style.background = "#000000";
      tooltip.style.boxShadow = "0 4px 12px rgba(0,0,0,0.6)";
    });

    if (onReady) onReady({ chart, series, timeScale: chart.timeScale() });

    setLoading(false);

    return () => {
      chart.remove();
      tooltip.remove();
    };
  }, [candles, chartType, overlays, onReady]);

  return (
    <div ref={containerRef} className="w-full h-full relative flex items-center justify-center">
      {loading && (
        <div className="text-white font-semibold">
          Loading chart data...
        </div>
      )}
      {!loading && candles.length === 0 && (
        <div className="text-white font-semibold text-center">
          Apologies, no data available for the selected symbol.
        </div>
      )}
    </div>
  );
};

export default Chart;

import { useEffect, useRef, useState } from "react";
import { createChart, CrosshairMode, CandlestickSeries, LineSeries, AreaSeries } from "lightweight-charts";

const Chart = ({ chartType = "candlestick", candles = [], onReady }) => {
  const containerRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef(null);
  const tooltipRef = useRef(null);
  const currentChartTypeRef = useRef(chartType);
  const previousCandlesRef = useRef([]);
  const [loading, setLoading] = useState(true);

  const normalizeCandles = (data) => {
    if (!Array.isArray(data)) {
      return [];
    }

    const normalized = data
      .map((c) => {
        if (!c) {
          return null;
        }

        const { open, high, low, close, time, volume } = c;

        if (open == null || high == null || low == null || close == null || !time) {
          return null;
        }

        let t = time;

        if (typeof t === "string" && t.includes("T")) {
          t = Math.floor(new Date(t).getTime() / 1000);
        } else if (typeof t === "number" && t > 1e12) {
          t = Math.floor(t / 1000);
        } else if (typeof t !== "number") {
          return null;
        }

        const normalized = {
          time: t,
          open: +open,
          high: +high,
          low: +low,
          close: +close,
          volume: +volume || 0,
        };
        return normalized;
      })
      .filter(Boolean)
      .sort((a, b) => a.time - b.time);

    return normalized;
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: { background: { type: "solid", color: "#0F1117" }, textColor: "#FFFFFF" },
      grid: { vertLines: { color: "#1F2937" }, horzLines: { color: "#1F2937" } },
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,
      crosshair: { mode: CrosshairMode.Normal },
      timeScale: { rightOffset: 10, barSpacing: 10, borderVisible: false },
    });
    chartRef.current = chart;

    const tooltip = document.createElement("div");
    Object.assign(tooltip.style, {
      position: "absolute",
      display: "none",
      pointerEvents: "none",
      padding: "8px",
      fontSize: "12px",
      borderRadius: "4px",
      background: "rgba(0,0,0,0.8)",
      color: "#fff",
      zIndex: 10,
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Trebuchet MS', Roboto, Ubuntu, sans-serif",
    });
    containerRef.current.appendChild(tooltip);
    tooltipRef.current = tooltip;

    const onResize = () => {
      if (chartRef.current && containerRef.current) {
        chartRef.current.applyOptions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      if (chartRef.current) {
        chart.remove();
      }
      if (tooltip.parentNode) {
        tooltip.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (!chartRef.current || !tooltipRef.current) return;

    const chart = chartRef.current;
    const tooltip = tooltipRef.current;

    const crosshairHandler = (param) => {
      const series = seriesRef.current;
      if (!param || !param.time || !series || !param.seriesData.has(series)) {
        tooltip.style.display = "none";
        return;
      }
      const d = param.seriesData.get(series);
      if (!d) {
        tooltip.style.display = "none";
        return;
      }
      tooltip.style.display = "block";
      const type = currentChartTypeRef.current.toLowerCase();
      if (type === "candlestick") {
        tooltip.innerHTML = `
          <div class="text-xs font-mono">O: ${d.open?.toFixed(2)}</div>
          <div class="text-xs font-mono">H: ${d.high?.toFixed(2)}</div>
          <div class="text-xs font-mono">L: ${d.low?.toFixed(2)}</div>
          <div class="text-xs font-mono">C: ${d.close?.toFixed(2)}</div>
          <div class="text-xs font-semibold text-[#7F3DFF]">${param.time}</div>
        `;
      } else {
        tooltip.innerHTML = `
          <div class="text-xs font-semibold text-white">Time: ${param.time}</div>
          <div class="text-sm text-white mt-1">Price: ${d.value?.toFixed(2) ?? "--"}</div>
        `;
      }
      const { x, y } = param.point || {};
      const rect = containerRef.current?.getBoundingClientRect();
      if (x != null && y != null && rect) {
        let left = x + 12;
        if (left + 140 > rect.width) left = x - 150;
        let top = y + 12;
        if (top + 80 > rect.height) top = y - 90;
        tooltip.style.left = `${left}px`;
        tooltip.style.top = `${top}px`;
      }
    };

    chart.subscribeCrosshairMove(crosshairHandler);

    return () => {
      chart.unsubscribeCrosshairMove(crosshairHandler);
    };
  }, []);

  useEffect(() => {
    if (!chartRef.current) {
      return;
    }

    const chart = chartRef.current;
    const type = chartType.toLowerCase();
    const typeChanged = currentChartTypeRef.current.toLowerCase() !== type;

    const normalized = normalizeCandles(candles);

    if (normalized.length === 0) {
      setLoading(false);
      return;
    }

    if (typeChanged || !seriesRef.current) {
      currentChartTypeRef.current = chartType;

      if (seriesRef.current) {
        chart.removeSeries(seriesRef.current);
        seriesRef.current = null;
      }

      let SeriesClass = CandlestickSeries;
      let seriesOptions = {};
      let data = normalized;

      if (type === "line") {
        SeriesClass = LineSeries;
        seriesOptions = { color: "#4ade80", lineWidth: 2 };
        data = normalized.map((c) => ({ time: c.time, value: c.close }));
      } else if (type === "area") {
        SeriesClass = AreaSeries;
        seriesOptions = {
          topColor: "rgba(96,165,250,0.4)",
          bottomColor: "rgba(30,41,59,0.2)",
          lineColor: "#60A5FA",
          lineWidth: 2,
        };
        data = normalized.map((c) => ({ time: c.time, value: c.close }));
      } else {
        seriesOptions = {
          upColor: "#26a69a",
          downColor: "#ef5350",
          wickUpColor: "#26a69a",
          wickDownColor: "#ef5350",
          borderVisible: false,
        };
      }

      seriesRef.current = chart.addSeries(SeriesClass, seriesOptions);

      if (seriesRef.current) {
        seriesRef.current.setData(data);
      }

      if (onReady && seriesRef.current) {
        onReady({ chart, series: seriesRef.current, timeScale: chart.timeScale() });
      }

      previousCandlesRef.current = normalized;
      setLoading(false);
      return;
    }

    const prevCandles = previousCandlesRef.current;
    const dataChanged = prevCandles.length !== normalized.length || JSON.stringify(prevCandles) !== JSON.stringify(normalized);

    if (!dataChanged) {
      return;
    }

    let data = normalized;
    if (type === "line" || type === "area") {
      data = normalized.map((c) => ({ time: c.time, value: c.close }));
    }

    if (seriesRef.current && data.length > 0) {
      seriesRef.current.setData(data);
    }

    previousCandlesRef.current = normalized;
    setLoading(false);
  }, [candles, chartType, onReady]);

  return (
    <div ref={containerRef} className="w-full h-full relative flex items-center justify-center">
      {loading && <div className="text-white font-semibold">Loading chart data...</div>}
      {!loading && (!candles || candles.length === 0) && (
        <div className="text-white font-semibold text-center">
          Apologies, no data available for the selected symbol.
        </div>
      )}
    </div>
  );
};

export default Chart;





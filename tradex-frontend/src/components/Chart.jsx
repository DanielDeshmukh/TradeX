import { useEffect, useRef, useState } from "react";
import {
  createChart,
  CrosshairMode,
  CandlestickSeries,
  LineSeries,
  AreaSeries,
} from "lightweight-charts";
import useCandles from "../utils/useCandles";

const ANIMATION_DURATION = 260;
const MIN_VISIBLE_BARS = 50;
const MAX_VISIBLE_BARS = 1000;
const DEFAULT_VISIBLE_BARS = 100;
const ZOOM_STEP = 0.1;
const SCROLL_STEP = 10;

const Chart = ({ chartType: propChartType, overlays = [] }) => {
  const containerRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef(null);
  const timeScaleRef = useRef(null);
  const rafRef = useRef(null);
  const mountedRef = useRef(false);

  const [defaultSettings, setDefaultSettings] = useState({
    chart_type: "candlestick",
    chart_interval: "1h",
  });

  const dedupeAndSort = (data) => {
    const seen = new Set();
    return [...(data || [])]
      .sort((a, b) => a.time - b.time)
      .filter((item) => {
        if (seen.has(item.time)) return false;
        seen.add(item.time);
        return true;
      });
  };

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  const cancelAnimation = () => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  };

  const easeOutQuad = (t) => t * (2 - t);

  const animateRange = (timeScale, targetFrom, targetTo, duration = ANIMATION_DURATION) => {
    if (!timeScale) return;
    cancelAnimation();

    const nowStart = performance.now();
    const current = timeScale.getVisibleLogicalRange?.();
    if (!current) {
      try {
        timeScale.setVisibleLogicalRange({ from: targetFrom, to: targetTo });
      } catch { }
      return;
    }

    const startFrom = Number(current.from);
    const startTo = Number(current.to);
    const deltaFrom = targetFrom - startFrom;
    const deltaTo = targetTo - startTo;

    const step = (t) => {
      if (!mountedRef.current) return;
      const elapsed = t - nowStart;
      const progress = clamp(elapsed / duration, 0, 1);
      const eased = easeOutQuad(progress);

      const newFrom = startFrom + deltaFrom * eased;
      const newTo = startTo + deltaTo * eased;

      try {
        timeScale.setVisibleLogicalRange({ from: newFrom, to: newTo });
      } catch { }

      if (progress < 1) rafRef.current = requestAnimationFrame(step);
      else rafRef.current = null;
    };

    rafRef.current = requestAnimationFrame(step);
  };

  const applyShortcut = (action) => {
    if (!chartRef.current || !timeScaleRef.current || !seriesRef.current) return;

    const series = seriesRef.current.series;
    const timeScale = timeScaleRef.current;
    const bars = seriesRef.current.data.length;
    if (!bars) return;

    const visible = timeScale.getVisibleLogicalRange();
    let from = visible?.from ?? Math.max(0, bars - DEFAULT_VISIBLE_BARS);
    let to = visible?.to ?? bars - 1;
    let width = to - from;

    switch (action) {
      case "zoom_in":
        {
          const delta = width * ZOOM_STEP;
          from += delta / 2;
          to -= delta / 2;
        }
        break;
      case "zoom_out":
        {
          const delta = width * ZOOM_STEP;
          from -= delta / 2;
          to += delta / 2;
        }
        break;
      case "scroll_left":
        from -= SCROLL_STEP;
        to -= SCROLL_STEP;
        break;
      case "scroll_right":
        from += SCROLL_STEP;
        to += SCROLL_STEP;
        break;
      case "reset_view":
        from = Math.max(0, bars - DEFAULT_VISIBLE_BARS);
        to = bars - 1;
        break;
      default:
        return;
    }

    from = clamp(from, 0, bars - 1);
    to = clamp(to, 0, bars - 1);
    if (to - from < MIN_VISIBLE_BARS) to = clamp(from + MIN_VISIBLE_BARS, 0, bars - 1);
    if (to - from > MAX_VISIBLE_BARS) to = clamp(from + MAX_VISIBLE_BARS, 0, bars - 1);

    animateRange(timeScale, from, to);
  };

  const { candles, loading, error } = useCandles(500, defaultSettings.chart_interval);

  useEffect(() => {
    if (!containerRef.current || loading || error) return;

    if (chartRef.current) {
      cancelAnimation();
      try { chartRef.current.remove(); } catch { }
      chartRef.current = null;
      seriesRef.current = null;
      timeScaleRef.current = null;
    }

    const chart = createChart(containerRef.current, {
      layout: { background: { type: "solid", color: "#0F1117" }, textColor: "#FFFFFF" },
      grid: { vertLines: { color: "#1F2937" }, horzLines: { color: "#1F2937" } },
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,
      crosshair: { mode: CrosshairMode.Normal },
      timeScale: { rightOffset: 10, barSpacing: 10, borderVisible: false },
    });

    chartRef.current = chart;
    const timeScale = chart.timeScale();
    timeScaleRef.current = timeScale;

    const typeToUse = (propChartType || defaultSettings.chart_type || "candlestick").toLowerCase();
    let SeriesClass = CandlestickSeries;
    let formattedData = [];
    let seriesOptions = {};

    if (typeToUse === "line") {
      SeriesClass = LineSeries;
      formattedData = candles.map(({ time, close }) => ({ time, value: close }));
      seriesOptions = { color: "#4ade80", lineWidth: 2 };
    } else if (typeToUse === "area") {
      SeriesClass = AreaSeries;
      formattedData = candles.map(({ time, close }) => ({ time, value: close }));
      seriesOptions = {
        topColor: "rgba(96, 165, 250, 0.4)",
        bottomColor: "rgba(30, 41, 59, 0.2)",
        lineColor: "#60A5FA",
        lineWidth: 2,
      };
    } else {
      formattedData = candles;
      seriesOptions = {
        upColor: "#26a69a",
        downColor: "#ef5350",
        wickUpColor: "#26a69a",
        wickDownColor: "#ef5350",
        borderVisible: false,
      };
    }

    const sortedData = dedupeAndSort(formattedData || []);
    const series = chart.addSeries(SeriesClass, seriesOptions);
    series.setData(sortedData);
    seriesRef.current = { series, data: sortedData };

    overlays.forEach((segment) => {
      if (!Array.isArray(segment)) return;
      const validated = dedupeAndSort(
        segment.map(({ time, value }) => ({ time, value })).filter((p) => p.time && typeof p.value === "number")
      );
      if (validated.length > 0) {
        const overlaySeries = chart.addSeries(LineSeries, { color: "yellow", lineWidth: 2 });
        overlaySeries.setData(validated);
      }
    });

    const bars = sortedData.length;
    const from = Math.max(0, bars - DEFAULT_VISIBLE_BARS);
    const to = bars - 1;
    requestAnimationFrame(() => {
      try { timeScale.setVisibleLogicalRange({ from, to }); timeScale.scrollToRealTime(); } catch { }
    });

    const resizeObserver = new ResizeObserver(() => {
      if (!containerRef.current || !chartRef.current) return;
      chart.applyOptions({ width: containerRef.current.clientWidth, height: containerRef.current.clientHeight });
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      cancelAnimation();
      if (chartRef.current) try { chartRef.current.remove(); } catch { }
      chartRef.current = null;
      seriesRef.current = null;
      timeScaleRef.current = null;
    };
  }, [propChartType, candles, overlays, loading, error]);

  useEffect(() => {
    mountedRef.current = true;
    const pressedKeys = new Set();
    let loop = null;

    const runLoop = () => {
      if (pressedKeys.has("Shift")) {
        if (pressedKeys.has("ArrowUp")) applyShortcut("zoom_in");
        if (pressedKeys.has("ArrowDown")) applyShortcut("zoom_out");
        if (pressedKeys.has("ArrowLeft")) applyShortcut("scroll_left");
        if (pressedKeys.has("ArrowRight")) applyShortcut("scroll_right");
        if (pressedKeys.has("R")) applyShortcut("reset_view");
      }
      loop = requestAnimationFrame(runLoop);
    };

    const keyDownHandler = (e) => {
      pressedKeys.add(e.key);
      if (!loop) runLoop();
      if (e.shiftKey && ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) e.preventDefault();
    };

    const keyUpHandler = (e) => {
      pressedKeys.delete(e.key);
      if (pressedKeys.size === 0) {
        cancelAnimationFrame(loop);
        loop = null;
      }
    };

    window.addEventListener("keydown", keyDownHandler);
    window.addEventListener("keyup", keyUpHandler);

    return () => {
      mountedRef.current = false;
      window.removeEventListener("keydown", keyDownHandler);
      window.removeEventListener("keyup", keyUpHandler);
      cancelAnimationFrame(loop);
    };
  }, []);

  if (loading) return <div className="text-gray-400">Loading chart...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return <div ref={containerRef} className="cursor-crosshair h-full w-full" />;
};

export default Chart;

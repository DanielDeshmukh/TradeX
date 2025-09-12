import { useEffect, useRef, useState } from "react";
import {
  createChart,
  CrosshairMode,
  CandlestickSeries,
  LineSeries,
  AreaSeries,
} from "lightweight-charts";
import useCandles from "../utils/useCandles";
import supabase from "../lib/supabase";


const ANIMATION_DURATION = 220;
const MIN_VISIBLE_BARS = 2;

const Chart = ({ chartType: propChartType, onReady, overlays = [] }) => {
  const containerRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef(null); 
  const timeScaleRef = useRef(null);
  const rafRef = useRef(null); 
  const mountedRef = useRef(true);

  const [defaultSettings, setDefaultSettings] = useState({
    chart_type: "candlestick",
    chart_interval: "1h",
  });

  const dedupeAndSort = (data) => {
    const seen = new Set();
    return [...data]
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

  const animateRange = (timeScale, targetFrom, targetTo, duration = ANIMATION_DURATION) => {
    cancelAnimation();
    if (!timeScale) return;

    const start = performance.now();
    const current = timeScale.getVisibleLogicalRange?.();
    if (!current) {
      try {
        timeScale.setVisibleLogicalRange({ from: targetFrom, to: targetTo });
      } catch {}
      return;
    }

    const startFrom = Number(current.from);
    const startTo = Number(current.to);
    const deltaFrom = targetFrom - startFrom;
    const deltaTo = targetTo - startTo;

    const step = (now) => {
      if (!mountedRef.current) return;
      const t = clamp((now - start) / duration, 0, 1);
      const ease = t * (2 - t);
      const newFrom = startFrom + deltaFrom * ease;
      const newTo = startTo + deltaTo * ease;

      try {
        timeScale.setVisibleLogicalRange({ from: newFrom, to: newTo });
      } catch (err) {
      }

      if (t < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        rafRef.current = null;
      }
    };

    rafRef.current = requestAnimationFrame(step);
  };

  const applyChartStateSafely = (chartState) => {
    if (!chartRef.current || !timeScaleRef.current || !seriesRef.current) {
      console.warn("applyChartStateSafely: chart not ready");
      return false;
    }
    if (!chartState || typeof chartState.from !== "number" || typeof chartState.to !== "number") {
      console.warn("applyChartStateSafely: invalid chartState", chartState);
      return false;
    }

    const { from: rawFrom, to: rawTo } = chartState;

    const data = seriesRef.current.data;
    if (!Array.isArray(data) || data.length === 0) {
      console.warn("applyChartStateSafely: no series data to map to");
      return false;
    }
    const bars = data.length;

    const likelyPercentSpace = Math.abs(rawFrom) <= 100 && Math.abs(rawTo) <= 100;

    const scaledFrom = likelyPercentSpace
      ? Math.floor((rawFrom / 100) * bars)
      : Math.floor(rawFrom);

    const scaledTo = likelyPercentSpace
      ? Math.floor((rawTo / 100) * bars)
      : Math.floor(rawTo);

    const clampedFrom = clamp(scaledFrom, 0, bars - 1);
    const clampedTo = clamp(scaledTo, 0, bars - 1);

    let targetFrom = Math.min(clampedFrom, clampedTo);
    let targetTo = Math.max(clampedFrom, clampedTo);

    if (targetTo - targetFrom < MIN_VISIBLE_BARS) {
      const extra = MIN_VISIBLE_BARS - (targetTo - targetFrom);
      const expandLeft = Math.floor(extra / 2);
      const expandRight = extra - expandLeft;
      targetFrom = clamp(targetFrom - expandLeft, 0, bars - 1);
      targetTo = clamp(targetTo + expandRight, 0, bars - 1);
    }

    const curRange = timeScaleRef.current.getVisibleLogicalRange?.();
    if (curRange) {
      const curFrom = Number(curRange.from);
      const curTo = Number(curRange.to);
      const epsilon = 0.5;
      if (Math.abs(curFrom - targetFrom) < epsilon && Math.abs(curTo - targetTo) < epsilon) {
        return true;
      }
    }

    animateRange(timeScaleRef.current, targetFrom, targetTo);
    return true;
  };

  useEffect(() => {
    mountedRef.current = true;
    let canceled = false;
    (async () => {
      try {
        const {
          data: { user } = {},
        } = await supabase.auth.getUser();
        if (!user || canceled) return;

        const { data, error } = await supabase
          .from("profiles")
          .select("chart_type, chart_interval")
          .eq("id", user.id)
          .single();

        if (!error && data && !canceled) {
          setDefaultSettings({
            chart_type: data.chart_type || "candlestick",
            chart_interval: data.chart_interval || "1h",
          });
        }
      } catch (err) {
        console.warn("fetchSettings failed, using defaults", err?.message ?? err);
      }
    })();

    return () => {
      canceled = true;
    };
  }, []);

  const { candles, loading, error } = useCandles(500, defaultSettings.chart_interval);

  useEffect(() => {
    if (!containerRef.current || loading || error) return;

    if (chartRef.current) {
      try {
        chartRef.current.remove();
      } catch (err) {
        console.warn("chart.remove() during reinit:", err?.message ?? err);
      }
      chartRef.current = null;
      seriesRef.current = null;
      timeScaleRef.current = null;
      cancelAnimation();
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
      SeriesClass = CandlestickSeries;
      formattedData = candles;
      seriesOptions = {
        upColor: "#26a69a",
        downColor: "#ef5350",
        wickUpColor: "#26a69a",
        wickDownColor: "#ef5350",
        borderVisible: false,
      };
    }

    const series = chart.addSeries(SeriesClass, seriesOptions);
    const sortedData = dedupeAndSort(formattedData || []);
    series.setData(sortedData);
    seriesRef.current = { series, data: sortedData };

    // overlays
    if (Array.isArray(overlays) && overlays.length > 0) {
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
    }

    const from = Math.max(0, sortedData.length - 100);
    const to = sortedData.length - 1;
    requestAnimationFrame(() => {
      try {
        timeScale.setVisibleLogicalRange({ from, to });
        timeScale.scrollToRealTime();
      } catch (err) {
      }
    });

    if (typeof onReady === "function") {
      onReady({ chart, timeScale, series, data: sortedData });
    }

    const resizeObserver = new ResizeObserver(() => {
      if (!containerRef.current || !chartRef.current) return;
      chart.applyOptions({ width: containerRef.current.clientWidth, height: containerRef.current.clientHeight });
    });
    resizeObserver.observe(containerRef.current);

    const onApply = (ev) => {
      try {
        const payload = ev?.detail;
        if (!payload) return;
        applyChartStateSafely(payload);
      } catch (err) {
        console.warn("applyChartState event error", err);
      }
    };
    window.addEventListener("applyChartState", onApply);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("applyChartState", onApply);
      cancelAnimation();
      if (chartRef.current) {
        try {
          chartRef.current.remove();
        } catch (err) {
          console.warn("chart.remove() on unmount:", err?.message ?? err);
        }
        chartRef.current = null;
      }
      seriesRef.current = null;
      timeScaleRef.current = null;
    };
  }, [propChartType, defaultSettings, candles, overlays, loading, error, onReady]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);


  if (loading) return <div className="text-gray-400">Loading chart...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return <div ref={containerRef} className="cursor-crosshair h-full w-full" />;
};

export default Chart;

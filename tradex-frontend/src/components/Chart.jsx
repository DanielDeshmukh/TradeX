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

const Chart = ({ chartType: propChartType, onReady, overlays = [] }) => {
  const containerRef = useRef(null);
  const seriesRef = useRef(null);
  const chartRef = useRef(null);
  const timeScaleRef = useRef(null);

  const [defaultSettings, setDefaultSettings] = useState({
    chart_type: "candlestick",
    chart_interval: "1h",
  });

  function dedupeAndSort(data) {
    const seen = new Set();
    return [...data]
      .sort((a, b) => a.time - b.time)
      .filter((item) => {
        if (seen.has(item.time)) return false;
        seen.add(item.time);
        return true;
      });
  }

  useEffect(() => {
    const fetchSettings = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("chart_type, chart_interval")
        .eq("id", user.id)
        .single();

      if (!error && data) {
        setDefaultSettings({
          chart_type: data.chart_type || "candlestick",
          chart_interval: data.chart_interval || "1h",
        });
      }
    };

    fetchSettings();
  }, []);

  const { candles, loading, error } = useCandles(
    500,
    defaultSettings.chart_interval
  );

  useEffect(() => {
    if (!containerRef.current || loading || error) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: "solid", color: "#0F1117" },
        textColor: "#FFFFFF",
      },
      grid: {
        vertLines: { color: "#1F2937" },
        horzLines: { color: "#1F2937" },
      },
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,
      handleScroll: true,
      handleScale: true,
      crosshair: { mode: CrosshairMode.Normal },
      timeScale: {
        rightOffset: 10,
        barSpacing: 10,
        borderVisible: false,
      },
    });

    chartRef.current = chart;
    const timeScale = chart.timeScale();
    timeScaleRef.current = timeScale;

    let series;
    let formattedData = [];

    const typeToUse =
      (propChartType || "").toLowerCase() ||
      (defaultSettings.chart_type || "candlestick");

    switch (typeToUse) {
      case "candlestick":
        series = chart.addSeries(CandlestickSeries, {
          upColor: "#26a69a",
          downColor: "#ef5350",
          wickUpColor: "#26a69a",
          wickDownColor: "#ef5350",
          borderVisible: false,
        });
        formattedData = candles;
        break;

      case "line":
        series = chart.addSeries(LineSeries, { color: "#4ade80", lineWidth: 2 });
        formattedData = candles.map(({ time, close }) => ({
          time,
          value: close,
        }));
        break;

      case "area":
        series = chart.addSeries(AreaSeries, {
          topColor: "rgba(96, 165, 250, 0.4)",
          bottomColor: "rgba(30, 41, 59, 0.2)",
          lineColor: "#60A5FA",
          lineWidth: 2,
        });
        formattedData = candles.map(({ time, close }) => ({
          time,
          value: close,
        }));
        break;

      default:
        return;
    }

    if (formattedData.length > 0) {
      const sortedData = dedupeAndSort(formattedData);
      series.setData(sortedData);
      seriesRef.current = series;

      if (Array.isArray(overlays) && overlays.length > 0) {
        overlays.forEach((segment) => {
          if (!Array.isArray(segment)) return;

          const validatedData = dedupeAndSort(
            segment
              .map(({ time, value }) => ({ time, value }))
              .filter((p) => p.time && typeof p.value === "number")
          );

          if (validatedData.length > 0) {
            const overlaySeries = chart.addSeries(LineSeries, {
              color: "yellow",
              lineWidth: 2,
            });
            overlaySeries.setData(validatedData);
          }
        });
      }

      const from = Math.max(0, sortedData.length - 100);
      const to = sortedData.length - 1;

      requestAnimationFrame(() => {
        timeScale.setVisibleLogicalRange({ from, to });
        timeScale.scrollToRealTime();
      });

      if (typeof onReady === "function") {
        onReady({
          chart,
          timeScale,
          series,
          priceRange: {
            minValue: Math.min(...sortedData.map((d) => d.value ?? d.close)),
            maxValue: Math.max(...sortedData.map((d) => d.value ?? d.close)),
          },
          canvasHeight: containerRef.current.clientHeight,
        });
      }

      const resizeObserver = new ResizeObserver(() => {
        chart.applyOptions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      });

      resizeObserver.observe(containerRef.current);
      return () => resizeObserver.disconnect();
    }

    return () => chart.remove();
  }, [propChartType, defaultSettings, candles, overlays, loading, error, onReady]);

  if (loading) return <div className="text-gray-400">Loading chart...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return <div ref={containerRef} className="cursor-crosshair h-full w-full" />;
};

export default Chart;

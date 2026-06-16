import { useEffect, useRef, useState, useCallback } from "react";
import { createChart, CrosshairMode, CandlestickSeries, LineSeries, AreaSeries } from "lightweight-charts";
import CrosshairTooltip from "./CrosshairTooltip";

// Technical indicator calculations
export function calculateSMA(data, period) {
  const result = [];
  for (let i = period - 1; i < data.length; i++) {
    let sum = 0;
    for (let j = 0; j < period; j++) sum += data[i - j].close;
    result.push({ time: data[i].time, value: +(sum / period).toFixed(2) });
  }
  return result;
}

export function calculateEMA(data, period) {
  const k = 2 / (period + 1);
  const result = [];
  let ema = data.slice(0, period).reduce((s, d) => s + d.close, 0) / period;
  result.push({ time: data[period - 1].time, value: +ema.toFixed(2) });
  for (let i = period; i < data.length; i++) {
    ema = data[i].close * k + ema * (1 - k);
    result.push({ time: data[i].time, value: +ema.toFixed(2) });
  }
  return result;
}

export function calculateBollingerBands(data, period = 20, stdDev = 2) {
  const sma = calculateSMA(data, period);
  const upper = [];
  const lower = [];
  for (let i = period - 1; i < data.length; i++) {
    const slice = data.slice(i - period + 1, i + 1);
    const mean = slice.reduce((s, d) => s + d.close, 0) / period;
    const variance = slice.reduce((s, d) => s + (d.close - mean) ** 2, 0) / period;
    const sd = Math.sqrt(variance);
    const time = data[i].time;
    upper.push({ time, value: +(mean + stdDev * sd).toFixed(2) });
    lower.push({ time, value: +(mean - stdDev * sd).toFixed(2) });
  }
  return { middle: sma, upper, lower };
}

export function calculateVWAP(data) {
  const result = [];
  let cumVol = 0;
  let cumTP = 0;
  for (const d of data) {
    const tp = (d.high + d.low + d.close) / 3;
    cumTP += tp * (d.volume || 1);
    cumVol += d.volume || 1;
    result.push({ time: d.time, value: +(cumTP / cumVol).toFixed(2) });
  }
  return result;
}

export function calculateRSI(data, period = 14) {
  const result = [];
  let gains = 0;
  let losses = 0;
  for (let i = 1; i <= period && i < data.length; i++) {
    const diff = data[i].close - data[i - 1].close;
    if (diff > 0) gains += diff;
    else losses -= diff;
  }
  let avgGain = gains / period;
  let avgLoss = losses / period;
  const rsi = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);
  result.push({ time: data[period].time, value: +rsi.toFixed(2) });
  for (let i = period + 1; i < data.length; i++) {
    const diff = data[i].close - data[i - 1].close;
    avgGain = (avgGain * (period - 1) + (diff > 0 ? diff : 0)) / period;
    avgLoss = (avgLoss * (period - 1) + (diff < 0 ? -diff : 0)) / period;
    const val = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);
    result.push({ time: data[i].time, value: +val.toFixed(2) });
  }
  return result;
}

const INDICATOR_COLORS = {
  sma20: "#f59e0b",
  ema12: "#8b5cf6",
  bb_upper: "rgba(139,92,246,0.3)",
  bb_lower: "rgba(139,92,246,0.3)",
  bb_middle: "rgba(139,92,246,0.5)",
  vwap: "#06b6d4",
  rsi: "#f97316",
};

const Chart = ({ chartType = "candlestick", candles = [], onReady, indicators = {}, signals = [] }) => {
  const containerRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef(null);
  const overlaySeriesRef = useRef({});
  const currentChartTypeRef = useRef(chartType);
  const previousCandlesRef = useRef([]);
  const [loading, setLoading] = useState(true);
  const [crosshairData, setCrosshairData] = useState(null);
  const [crosshairVisible, setCrosshairVisible] = useState(false);

  const normalizeCandles = (data) => {
    if (!Array.isArray(data)) return [];
    return data
      .map((c) => {
        if (!c) return null;
        const { open, high, low, close, time, volume } = c;
        if (open == null || high == null || low == null || close == null || !time) return null;
        let t = time;
        if (typeof t === "string" && t.includes("T")) t = Math.floor(new Date(t).getTime() / 1000);
        else if (typeof t === "number" && t > 1e12) t = Math.floor(t / 1000);
        else if (typeof t !== "number") return null;
        return { time: t, open: +open, high: +high, low: +low, close: +close, volume: +volume || 0 };
      })
      .filter(Boolean)
      .sort((a, b) => a.time - b.time);
  };

  // Add/remove overlay indicators
  const updateOverlays = useCallback((chart, normalized) => {
    // Remove old overlays
    Object.values(overlaySeriesRef.current).forEach((s) => {
      try { chart.removeSeries(s); } catch {}
    });
    overlaySeriesRef.current = {};

    if (indicators.sma20) {
      const smaData = calculateSMA(normalized, 20);
      const s = chart.addSeries(LineSeries, { color: INDICATOR_COLORS.sma20, lineWidth: 1, priceLineVisible: false, lastValueVisible: false });
      s.setData(smaData);
      overlaySeriesRef.current.sma20 = s;
    }
    if (indicators.ema12) {
      const emaData = calculateEMA(normalized, 12);
      const s = chart.addSeries(LineSeries, { color: INDICATOR_COLORS.ema12, lineWidth: 1, priceLineVisible: false, lastValueVisible: false });
      s.setData(emaData);
      overlaySeriesRef.current.ema12 = s;
    }
    if (indicators.bollinger) {
      const bb = calculateBollingerBands(normalized, 20, 2);
      const upper = chart.addSeries(LineSeries, { color: INDICATOR_COLORS.bb_upper, lineWidth: 1, priceLineVisible: false, lastValueVisible: false });
      upper.setData(bb.upper);
      const lower = chart.addSeries(LineSeries, { color: INDICATOR_COLORS.bb_lower, lineWidth: 1, priceLineVisible: false, lastValueVisible: false });
      lower.setData(bb.lower);
      const middle = chart.addSeries(LineSeries, { color: INDICATOR_COLORS.bb_middle, lineWidth: 1, lineStyle: 2, priceLineVisible: false, lastValueVisible: false });
      middle.setData(bb.middle);
      overlaySeriesRef.current.bb_upper = upper;
      overlaySeriesRef.current.bb_lower = lower;
      overlaySeriesRef.current.bb_middle = middle;
    }
    if (indicators.vwap) {
      const vwapData = calculateVWAP(normalized);
      const s = chart.addSeries(LineSeries, { color: INDICATOR_COLORS.vwap, lineWidth: 1, priceLineVisible: false, lastValueVisible: false });
      s.setData(vwapData);
      overlaySeriesRef.current.vwap = s;
    }
  }, [indicators]);

  // Add signal markers
  const updateMarkers = useCallback((series, normalized) => {
    if (!signals || signals.length === 0 || !series) return;
    const markers = signals
      .map((sig) => {
        const candle = normalized.find((c) => c.time === sig.time);
        if (!candle) return null;
        return {
          time: sig.time,
          position: sig.signal === "buy" ? "belowBar" : "aboveBar",
          color: sig.signal === "buy" ? "#22c55e" : "#ef4444",
          shape: sig.signal === "buy" ? "arrowUp" : "arrowDown",
          text: sig.signal.toUpperCase(),
        };
      })
      .filter(Boolean);
    if (markers.length > 0) series.setMarkers(markers);
  }, [signals]);

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

    const onResize = () => {
      if (chartRef.current && containerRef.current) {
        chartRef.current.applyOptions({ width: containerRef.current.clientWidth, height: containerRef.current.clientHeight });
      }
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      chart.remove();
    };
  }, []);

  useEffect(() => {
    if (!chartRef.current) return;
    const chart = chartRef.current;
    const crosshairHandler = (param) => {
      const series = seriesRef.current;
      if (!param || !param.time || !series || !param.seriesData.has(series)) {
        setCrosshairVisible(false);
        return;
      }
      const d = param.seriesData.get(series);
      if (!d) {
        setCrosshairVisible(false);
        return;
      }
      const { x, y } = param.point || {};
      setCrosshairData({
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close,
        volume: d.volume,
        time: param.time,
        x: x || 0,
        y: y || 0,
      });
      setCrosshairVisible(true);
    };
    chart.subscribeCrosshairMove(crosshairHandler);
    return () => chart.unsubscribeCrosshairMove(crosshairHandler);
  }, []);

  useEffect(() => {
    if (!chartRef.current) return;
    const chart = chartRef.current;
    const type = chartType.toLowerCase();
    const typeChanged = currentChartTypeRef.current.toLowerCase() !== type;
    const normalized = normalizeCandles(candles);
    if (normalized.length === 0) { setLoading(false); return; }

    if (typeChanged || !seriesRef.current) {
      currentChartTypeRef.current = chartType;
      if (seriesRef.current) { chart.removeSeries(seriesRef.current); seriesRef.current = null; }
      let SeriesClass = CandlestickSeries;
      let seriesOptions = {};
      let data = normalized;
      if (type === "line") {
        SeriesClass = LineSeries;
        seriesOptions = { color: "#4ade80", lineWidth: 2 };
        data = normalized.map((c) => ({ time: c.time, value: c.close }));
      } else if (type === "area") {
        SeriesClass = AreaSeries;
        seriesOptions = { topColor: "rgba(96,165,250,0.4)", bottomColor: "rgba(30,41,59,0.2)", lineColor: "#60A5FA", lineWidth: 2 };
        data = normalized.map((c) => ({ time: c.time, value: c.close }));
      } else {
        seriesOptions = { upColor: "#26a69a", downColor: "#ef5350", wickUpColor: "#26a69a", wickDownColor: "#ef5350", borderVisible: false };
      }
      seriesRef.current = chart.addSeries(SeriesClass, seriesOptions);
      if (seriesRef.current) seriesRef.current.setData(data);
      updateOverlays(chart, normalized);
      updateMarkers(seriesRef.current, normalized);
      if (onReady && seriesRef.current) onReady({ chart, series: seriesRef.current, timeScale: chart.timeScale() });
      previousCandlesRef.current = normalized;
      setLoading(false);
      return;
    }

    const prevCandles = previousCandlesRef.current;
    const dataChanged = prevCandles.length !== normalized.length || JSON.stringify(prevCandles) !== JSON.stringify(normalized);
    if (!dataChanged) return;
    let data = normalized;
    if (type === "line" || type === "area") data = normalized.map((c) => ({ time: c.time, value: c.close }));
    if (seriesRef.current && data.length > 0) seriesRef.current.setData(data);
    updateOverlays(chart, normalized);
    updateMarkers(seriesRef.current, normalized);
    previousCandlesRef.current = normalized;
    setLoading(false);
  }, [candles, chartType, onReady, indicators, signals]);

  return (
    <div ref={containerRef} className="w-full h-full relative flex items-center justify-center">
      {loading && <div className="text-white font-semibold">Loading chart data...</div>}
      {!loading && (!candles || candles.length === 0) && (
        <div className="text-white font-semibold text-center">Apologies, no data available for the selected symbol.</div>
      )}
      <CrosshairTooltip data={crosshairData} visible={crosshairVisible} />
    </div>
  );
};

export default Chart;

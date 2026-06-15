import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Chart from "./Chart";
import TimeFrameModal from "./TimeFrameModal";
import ChartTypeModal from "./ChartTypeModal";
import ShortcutModal from "./ShortcutModal";
import { usePatternFinderStore } from "../store/usePatternFinderStore";

const safeToFixed = (value, fallback = "--") => {
  const n = Number(value);
  return !isNaN(n) ? n.toFixed(2) : fallback;
};

const ChartContainer = ({ selectedAsset }) => {
  const chartApiRef = useRef(null);
  const { matchedSegments } = usePatternFinderStore();

  const currentAsset = useMemo(() => {
    if (!selectedAsset?.securityId) return null;
    return {
      name: selectedAsset.name,
      security_id: selectedAsset.securityId,
      exchange_segment: selectedAsset.exchangeSegment,
    };
  }, [selectedAsset?.securityId, selectedAsset?.name, selectedAsset?.exchangeSegment]);

  const [ohlcvData, setOhlcvData] = useState([]);
  const [chartReady, setChartReady] = useState(false);
  const [timeFrame, setTimeFrame] = useState("1min");
  const [chartType, setChartType] = useState("Candlestick");
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [showChartModal, setShowChartModal] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);

  const fetchOHLCV = useCallback(async () => {
    if (!currentAsset?.security_id) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/live_feed`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          security_id: currentAsset.security_id,
          exchange: currentAsset.exchange_segment,
          instrument_type: "EQUITY",
          symbolName: currentAsset.name,
        }),
      });
      if (!res.ok) throw new Error(`Backend returned ${res.status}`);
      const data = await res.json();
      const formatted = (data?.data || [])
        .map((c) => {
          let t = typeof c.timestamp === "string" ? new Date(c.timestamp).getTime() : c.timestamp;
          if (t > 1e12) t = Math.floor(t / 1000);
          return {
            time: t,
            open: Number(c.open),
            high: Number(c.high),
            low: Number(c.low),
            close: Number(c.close),
            volume: Number(c.volume),
          };
        })
        .filter(Boolean)
        .sort((a, b) => a.time - b.time);
      setOhlcvData((prev) => {
        if (prev.length && prev[prev.length - 1]?.time === formatted[formatted.length - 1]?.time) return prev;
        return formatted;
      });
    } catch (err) {
      console.error("fetchOHLCV Error:", err);
      setOhlcvData([]);
    }
  }, [currentAsset?.security_id, currentAsset?.exchange_segment, currentAsset?.name]);

  const fetchOHLCVRef = useRef(fetchOHLCV);
  useEffect(() => {
    fetchOHLCVRef.current = fetchOHLCV;
  }, [fetchOHLCV]);

  useEffect(() => {
    if (!currentAsset?.security_id) return;
    let active = true;
    fetchOHLCVRef.current();
    const interval = setInterval(() => {
      if (active) fetchOHLCVRef.current();
    }, 3000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [currentAsset?.security_id]);

  const handleChartReady = useCallback(({ chart, series, timeScale }) => {
    chartApiRef.current = { chart, series, timeScale };
    timeScale.scrollToRealTime();
    setChartReady(true);
  }, []);

  const handleFullscreen = useCallback(() => {
    if (!currentAsset) return;
    const url = `/fullscreen-chart?assetId=${encodeURIComponent(currentAsset.security_id)}&assetName=${encodeURIComponent(
      currentAsset.name
    )}&chartType=${encodeURIComponent(chartType)}&timeFrame=${encodeURIComponent(timeFrame)}`;
    window.open(url, "_blank");
  }, [currentAsset, chartType, timeFrame]);

  useEffect(() => {
    const triggerShortcut = (keyCombo) => {
      const ts = chartApiRef.current?.timeScale;
      if (!ts) return;
      switch (keyCombo) {
        case "Shift + ArrowUp":
          ts.setBarSpacing((ts.barSpacing ?? 10) * 1.1);
          break;
        case "Shift + ArrowDown":
          ts.setBarSpacing((ts.barSpacing ?? 10) * 0.9);
          break;
        case "Shift + ArrowLeft": {
          const range = ts.getVisibleLogicalRange?.();
          if (range) ts.setVisibleLogicalRange({ from: range.from - 20, to: range.to - 20 });
          break;
        }
        case "Shift + ArrowRight": {
          const range = ts.getVisibleLogicalRange?.();
          if (range) ts.setVisibleLogicalRange({ from: range.from + 20, to: range.to + 20 });
          break;
        }
        case "Shift + R":
          ts.scrollToRealTime();
          break;
        case "Shift + F":
          handleFullscreen();
          break;
        case "Ctrl + /":
          setShowShortcuts(true);
          break;
      }
    };

    const keyHandler = (e) => {
      if (e.repeat) return;
      const keyCombo = [e.ctrlKey ? "Ctrl" : null, e.shiftKey ? "Shift" : null, e.key.length === 1 ? e.key.toUpperCase() : e.key]
        .filter(Boolean)
        .join(" + ");
      triggerShortcut(keyCombo);
    };

    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  }, [handleFullscreen]);

  useEffect(() => {
    const escHandler = (e) => {
      if (e.key === "Escape") {
        setShowShortcuts(false);
        setShowTimeModal(false);
        setShowChartModal(false);
      }
    };
    document.addEventListener("keydown", escHandler);
    return () => document.removeEventListener("keydown", escHandler);
  }, []);

  const lastCandle = useMemo(() => ohlcvData[ohlcvData.length - 1] || null, [ohlcvData]);
  const getColor = useCallback(
    (type) => {
      if (!lastCandle) return "text-gray-400";
      if (type === "close") return lastCandle.close >= lastCandle.open ? "text-green-400" : "text-red-400";
      return "text-gray-300";
    },
    [lastCandle]
  );

  return (
    <div className="relative w-full h-full flex flex-col">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between m-4 gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white drop-shadow-md">{currentAsset?.name || "Loading..."}</h2>
          {lastCandle && (
            <div className="flex flex-wrap gap-2 mt-1 text-xs font-mono">
              <span className={`${getColor("open")}`}>O: {safeToFixed(lastCandle.open)}</span>
              <span className={`${getColor("high")}`}>H: {safeToFixed(lastCandle.high)}</span>
              <span className={`${getColor("low")}`}>L: {safeToFixed(lastCandle.low)}</span>
              <span className={`${getColor("close")}`}>C: {safeToFixed(lastCandle.close)}</span>
              <span className="text-gray-400">V: {lastCandle.volume.toLocaleString()}</span>
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-3 sm:gap-4">
          <button
            onClick={() => {
              setShowTimeModal((p) => !p);
              setShowChartModal(false);
            }}
            className="btn-primary text-sm px-4 py-1 rounded-lg transition shadow-lg"
          >
            Timeframes
          </button>
          <button
            onClick={() => {
              setShowChartModal((p) => !p);
              setShowTimeModal(false);
            }}
            className="btn-primary text-sm px-4 py-1 rounded-lg transition shadow-lg"
          >
            Charts
          </button>
        </div>
      </div>
      <div className="w-full h-[500px] md:h-[600px] rounded-2xl bg-surface-elevated/70 backdrop-blur-sm p-4 shadow-inner shadow-brand/20 relative flex items-center justify-center">
        <Chart candles={ohlcvData} chartType={chartType} overlays={matchedSegments} onReady={handleChartReady} />
      </div>
      {showTimeModal && <TimeFrameModal selected={timeFrame} onSelect={setTimeFrame} onClose={() => setShowTimeModal(false)} />}
      {showChartModal && <ChartTypeModal selected={chartType} onSelect={setChartType} data={ohlcvData} onClose={() => setShowChartModal(false)} />}
      {showShortcuts && (
        <ShortcutModal
          onClose={() => setShowShortcuts(false)}
          chartReady={chartReady}
          zoomIn={() => chartApiRef.current?.timeScale.setBarSpacing((chartApiRef.current?.timeScale.barSpacing ?? 10) * 1.1)}
          zoomOut={() => chartApiRef.current?.timeScale.setBarSpacing((chartApiRef.current?.timeScale.barSpacing ?? 10) * 0.9)}
          scrollLeft={() => {
            const ts = chartApiRef.current?.timeScale;
            const range = ts?.getVisibleLogicalRange?.();
            if (ts && range) ts.setVisibleLogicalRange({ from: range.from - 20, to: range.to - 20 });
          }}
          scrollRight={() => {
            const ts = chartApiRef.current?.timeScale;
            const range = ts?.getVisibleLogicalRange?.();
            if (ts && range) ts.setVisibleLogicalRange({ from: range.from + 20, to: range.to + 20 });
          }}
          resetView={() => chartApiRef.current?.timeScale.scrollToRealTime?.()}
          handleFullscreen={handleFullscreen}
        />
      )}
    </div>
  );
};

export default ChartContainer;

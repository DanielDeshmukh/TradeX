// src/components/ChartContainer.jsx
import { MdFullscreen } from "react-icons/md";
import Chart from "./Chart";
import { usePatternFinderStore } from "../store/usePatternFinderStore";
import TimeFrameModal from "./TimeFrameModal.jsx";
import ChartTypeModal from "./ChartTypeModal.jsx";
import ShortcutModal from "./ShortcutModal";
import { useState, useRef, useCallback, useEffect } from "react";
import supabase from "../lib/supabase.js";

// ✅ Helper: safely format numbers
const safeToFixed = (value, fallback = "--") =>
  typeof value === "number" && !isNaN(value) ? value.toFixed(2) : fallback;

const ChartContainer = ({ selectedAsset }) => {
  const chartApiRef = useRef(null);
  const [chartReady, setChartReady] = useState(false);
  const [timeFrame, setTimeFrame] = useState("1min");
  const [chartType, setChartType] = useState("Candlestick");
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [showChartModal, setShowChartModal] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [candles, setCandles] = useState([]);
  const [loadingCandles, setLoadingCandles] = useState(false);

  const [currentAsset, setCurrentAsset] = useState({
    name: null,
    security_id: null,
    exchange_segment: "NSE_EQ",
    price: "--",
    change: "--",
    isPositive: true,
  });

  const { matchedSegments } = usePatternFinderStore();

  // ✅ Handle selected asset or default asset
  useEffect(() => {
    const fetchDefaultOrSelected = async () => {
      if (selectedAsset?.securityId) {
        setCurrentAsset({
          name: selectedAsset.name,
          security_id: selectedAsset.securityId,
          exchange_segment: selectedAsset.exchangeSegment,
          price: safeToFixed(selectedAsset.price, "--"),
          change: safeToFixed(selectedAsset.change, "--"),
          isPositive: selectedAsset.isPositive,
        });
        return;
      }

      const { data, error } = await supabase
        .from("wishlist")
        .select("security_id, symbol_name, exchange_segment")
        .order("created_at", { ascending: true })
        .limit(1);

      if (error) return console.error("Error fetching default symbol:", error);

      if (data?.length) {
        const first = data[0];
        setCurrentAsset({
          name: first.symbol_name || first.security_id,
          security_id: first.security_id,
          exchange_segment: first.exchange_segment || "NSE_EQ",
          price: "--",
          change: "--",
          isPositive: true,
        });
      } else {
        setCurrentAsset({
          name: "NIFTY 50",
          security_id: "NIFTY 50",
          exchange_segment: "NSE_INDEX",
          price: "--",
          change: "--",
          isPositive: true,
        });
      }
    };

    fetchDefaultOrSelected();
  }, [selectedAsset]);

  // ✅ Fetch candles whenever asset or timeframe changes
  useEffect(() => {
    if (!currentAsset.security_id || !timeFrame) return;

    const fetchCandles = async () => {
      setLoadingCandles(true);
      const { data, error } = await supabase
        .from("candles")
        .select("timestamp, open, high, low, close, volume")
        .eq("security_id", currentAsset.security_id)
        .eq("timeframe", timeFrame)
        .order("timestamp", { ascending: true });

      if (error || !data?.length) {
        console.error("Error fetching candles:", error?.message || "No data");
        setCandles([]);
        setLoadingCandles(false);
        return;
      }

      const formatted = data.map(c => ({
        time: Math.floor(new Date(c.timestamp).getTime() / 1000),
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
        volume: c.volume,
      }));

      // Update current price & change
      const latest = formatted[formatted.length - 1];
      const prev = formatted.length > 1 ? formatted[formatted.length - 2] : latest;
      const price = safeToFixed(latest.close, "--");
      const changeValue = prev ? latest.close - prev.close : 0;

      setCurrentAsset(prevState => ({
        ...prevState,
        price,
        change: safeToFixed(changeValue, "--"),
        isPositive: changeValue >= 0,
      }));

      setCandles(formatted);
      setLoadingCandles(false);
    };

    fetchCandles();
  }, [currentAsset.security_id, timeFrame]);

  // ✅ Chart ready callback
  const handleChartReady = useCallback(({ chart, timeScale, series }) => {
    chartApiRef.current = { chart, timeScale, series };
    timeScale.scrollToRealTime();
    setChartReady(true);
  }, []);

  // ✅ Fullscreen
  const handleFullscreen = () => {
    if (!currentAsset.security_id) return;
    const url = `/fullscreen-chart?assetId=${encodeURIComponent(
      currentAsset.security_id
    )}&assetName=${encodeURIComponent(
      currentAsset.name
    )}&chartType=${encodeURIComponent(chartType)}&timeFrame=${encodeURIComponent(timeFrame)}`;
    window.open(url, "_blank");
  };

  // ✅ Restored Shortcut Logic (old working version)
  useEffect(() => {
    const triggerShortcut = (keyCombo) => {
      console.log("Shortcut triggered:", keyCombo);

      const ts = chartApiRef.current?.timeScale;
      if (!ts) return;

      switch (keyCombo) {
        case "Shift + ArrowUp":
          ts.setBarSpacing?.((ts?.barSpacing ?? 10) * 1.1);
          break;
        case "Shift + ArrowDown":
          ts.setBarSpacing?.((ts?.barSpacing ?? 10) * 0.9);
          break;
        case "Shift + ArrowLeft":
          {
            const range = ts.getVisibleLogicalRange?.();
            if (range) ts.setVisibleLogicalRange({ from: range.from - 20, to: range.to - 20 });
          }
          break;
        case "Shift + ArrowRight":
          {
            const range = ts.getVisibleLogicalRange?.();
            if (range) ts.setVisibleLogicalRange({ from: range.from + 20, to: range.to + 20 });
          }
          break;
        case "Shift + R":
          ts.scrollToRealTime?.();
          break;
        case "Shift + F":
          handleFullscreen();
          break;
        case "Ctrl + /":
          setShowShortcuts(true);
          break;
        default:
          break;
      }
    };

    const keyHandler = (e) => {
      if (e.repeat) return;

      const keyCombo = [
        e.ctrlKey ? "Ctrl" : null,
        e.shiftKey ? "Shift" : null,
        e.key.length === 1 ? e.key.toUpperCase() : e.key
      ].filter(Boolean).join(" + ");

      triggerShortcut(keyCombo);
    };

    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  }, [chartReady]);

  // ✅ Escape key closes modals
  useEffect(() => {
    const escHandler = e => {
      if (e.key === "Escape") {
        setShowShortcuts(false);
        setShowTimeModal(false);
        setShowChartModal(false);
      }
    };
    document.addEventListener("keydown", escHandler);
    return () => document.removeEventListener("keydown", escHandler);
  }, []);

  if (!currentAsset.security_id) {
    return (
      <div className="text-white flex items-center justify-center h-full">
        Loading Chart...
      </div>
    );
  }

  return (
    <div className="relative group w-full h-full">
      {/* Fullscreen button */}
      <div className="absolute z-10 top-4 right-4 sm:top-12 sm:right-12">
        <button
          onClick={handleFullscreen}
          title="Fullscreen"
          className="text-white text-2xl transition-transform hover:scale-125 hover:text-[#7F3DFF] drop-shadow-lg"
        >
          <MdFullscreen />
        </button>
      </div>

      {/* Symbol info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between m-4 gap-3 sm:gap-0">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white drop-shadow-md">
            {currentAsset.name || "Loading..."}
          </h2>
          <p className={`font-semibold ${currentAsset.isPositive ? "text-green-400" : "text-red-400"} drop-shadow-md`}>
            {currentAsset.price} <span className="ml-2">{currentAsset.change}</span>
          </p>
        </div>

        <div className="flex flex-wrap gap-3 sm:gap-4 pr-8 sm:pr-16">
          <div className="relative">
            <button
              onClick={() => { setShowTimeModal(!showTimeModal); setShowChartModal(false); }}
              className="bg-gradient-to-r from-[#7F3DFF] to-[#5A18E9] text-white text-sm px-4 py-1 rounded-lg hover:opacity-90 transition w-full sm:w-auto shadow-lg"
            >
              Timeframes
            </button>
            {showTimeModal && (
              <TimeFrameModal selected={timeFrame} onSelect={setTimeFrame} onClose={() => setShowTimeModal(false)} />
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => { setShowChartModal(!showChartModal); setShowTimeModal(false); }}
              className="bg-gradient-to-r from-[#7F3DFF] to-[#5A18E9] text-white text-sm px-4 py-1 rounded-lg hover:opacity-90 transition w-full sm:w-auto shadow-lg"
            >
              Charts
            </button>
            {showChartModal && (
              <ChartTypeModal selected={chartType} onSelect={setChartType} data={candles} onClose={() => setShowChartModal(false)} />
            )}
          </div>
        </div>
      </div>

      {/* Chart component */}
      <div className="w-full h-[400px] sm:h-[500px] md:h-[600px] rounded-2xl bg-[#1C1F24]/70 backdrop-blur-sm p-4 shadow-inner shadow-[#7F3DFF]/20 relative flex items-center justify-center">
        {loadingCandles && candles.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center text-white font-semibold">
            Loading candles...
          </div>
        ) : (
          <Chart
            chartType={chartType}
            onReady={handleChartReady}
            overlays={matchedSegments}
            candles={candles}
            symbolId={currentAsset.security_id}
            exchange={currentAsset.exchange_segment}
            timeframe={timeFrame}
          />
        )}
      </div>

      {showShortcuts && (
        <ShortcutModal
          onClose={() => setShowShortcuts(false)}
          chartReady={chartReady}
          zoomIn={() => chartApiRef.current?.timeScale.setBarSpacing((chartApiRef.current?.timeScale?.barSpacing ?? 10) * 1.1)}
          zoomOut={() => chartApiRef.current?.timeScale.setBarSpacing((chartApiRef.current?.timeScale?.barSpacing ?? 10) * 0.9)}
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

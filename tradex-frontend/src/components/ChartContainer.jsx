import { useAsset } from "../context/AssetContext";
import { MdFullscreen } from "react-icons/md";
import Chart from "./Chart";
import { usePatternFinderStore } from "../store/usePatternFinderStore";
import TimeFrameModal from "./TimeFrameModal.jsx";
import ChartTypeModal from "./ChartTypeModal.jsx";
import ShortcutModal from "./ShortcutModal";
import { useState, useRef, useCallback, useEffect } from "react";
import mockData from "../DataCreation/mockData.js";

const ChartContainer = () => {
  const { selectedAsset } = useAsset();
  const Data = mockData;
  const chartRef = useRef(null);
  const chartApiRef = useRef(null);
  const [chartReady, setChartReady] = useState(false);
  const [timeFrame, setTimeFrame] = useState("5m");
  const [chartType, setChartType] = useState("Candlestick");
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [showChartModal, setShowChartModal] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);

  const { matchedSegments } = usePatternFinderStore();

  const handleFullscreen = () => {
    const url = `/fullscreen-chart?asset=${encodeURIComponent(selectedAsset?.name)}&chartType=${encodeURIComponent(chartType)}&timeFrame=${encodeURIComponent(timeFrame)}`;
    window.open(url, "_blank");
  };

  const handleChartReady = useCallback(({ chart, timeScale, series }) => {
    if (chart && timeScale && series) {
      chartApiRef.current = { chart, timeScale, series };
      timeScale.scrollToRealTime();
      setChartReady(true);
    }
  }, []);

  const triggerShortcut = async (keyCombo) => {
    console.log("Shortcut triggered:", keyCombo);
  };

  useEffect(() => {
    const keyHandler = (e) => {
      if (e.repeat) return;

      const keyCombo = [
        e.ctrlKey ? "Ctrl" : null,
        e.shiftKey ? "Shift" : null,
        e.key.length === 1 ? e.key.toUpperCase() : e.key
      ].filter(Boolean).join(" + ");

      triggerShortcut(keyCombo);
    };

    window.addEventListener("keydown", keyHandler);
    return () => window.removeEventListener("keydown", keyHandler);
  }, [chartReady]);

  return (
    <div className="relative group w-full h-full">
      <div className="absolute z-10 top-4 right-4 sm:top-12 sm:right-12">
        <button
          onClick={handleFullscreen}
          title="Fullscreen"
          className="text-white text-2xl transition-transform hover:scale-125"
        >
          <MdFullscreen />
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between m-4 gap-3 sm:gap-0">
        <div>
          <h2 className="text-lg sm:text-xl font-bold">{selectedAsset?.name}</h2>
          <p className={`font-semibold ${selectedAsset?.isPositive ? "text-green-500" : "text-red-500"}`}>
            {selectedAsset?.price} <span className="ml-2">{selectedAsset?.change}</span>
          </p>
        </div>

        <div className="flex flex-wrap gap-3 sm:gap-4">
          <div className="relative">
            <button
              onClick={() => { setShowTimeModal(!showTimeModal); setShowChartModal(false); }}
              className="bg-gradient-to-r from-[#7F3DFF] to-[#5A18E9] text-white text-sm px-4 py-1 rounded hover:opacity-90 transition w-full sm:w-auto"
            >
              Timeframes
            </button>
            {showTimeModal && (
              <TimeFrameModal
                selected={timeFrame}
                onSelect={setTimeFrame}
                onClose={() => setShowTimeModal(false)}
              />
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => { setShowChartModal(!showChartModal); setShowTimeModal(false); }}
              className="bg-gradient-to-r from-[#7F3DFF] to-[#5A18E9] text-white text-sm px-4 py-1 rounded hover:opacity-90 transition w-full sm:w-auto"
            >
              Charts
            </button>
            {showChartModal && (
              <ChartTypeModal
                selected={chartType}
                onSelect={setChartType}
                data={Data}
                onClose={() => setShowChartModal(false)}
              />
            )}
          </div>
        </div>
      </div>

      <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-20">
        {chartReady && matchedSegments.map((segment, index) => {
          const points = segment
            .map(({ time, value }) => {
              const x = chartApiRef.current?.timeScale?.timeToCoordinate?.(time);
              const y = chartApiRef.current?.series?.priceToCoordinate?.(value);
              return x !== undefined && y !== undefined ? `${x},${y}` : null;
            })
            .filter(Boolean)
            .join(" ");
          return (
            <polyline key={index} points={points} fill="none" stroke="yellow" strokeWidth="2" />
          );
        })}
      </svg>

      <div
        ref={chartRef}
        className="w-full h-[400px] sm:h-[500px] md:h-[600px] rounded-xl bg-[#1C1F24] p-4"
      >
        <Chart chartType={chartType} onReady={handleChartReady} overlays={matchedSegments} />
      </div>

      {showShortcuts && (
        <ShortcutModal
          onClose={() => setShowShortcuts(false)}
          chartReady={chartReady}
          zoomIn={() => triggerShortcut("Shift + ArrowUp")}
          zoomOut={() => triggerShortcut("Shift + ArrowDown")}
          scrollLeft={() => triggerShortcut("Shift + ArrowLeft")}
          scrollRight={() => triggerShortcut("Shift + ArrowRight")}
          resetView={() => triggerShortcut("Shift + R")}
          handleFullscreen={handleFullscreen}
          setShowShortcuts={setShowShortcuts}
        />
      )}
    </div>
  );
};

export default ChartContainer;

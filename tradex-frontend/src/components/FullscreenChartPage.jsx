import { useState, useRef, useCallback, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Chart from "./Chart";
import ShortcutModal from "./ShortcutModal.jsx";
import TimeFrameModal from "./TimeFrameModal";
import ChartTypeModal from "./ChartTypeModal";
import { MdFullscreenExit } from "react-icons/md";
import { FaChartBar } from "react-icons/fa";
import useKeyPress from "./useKeyPress.js";
import { usePatternFinderStore } from "../store/usePatternFinderStore";

const FullscreenChartPage = () => {
  const { open } = usePatternFinderStore();
  const [searchParams] = useSearchParams();
  const asset = searchParams.get("asset") || "N/A";
  const initialChartType = searchParams.get("chartType") || "Candlestick";
  const initialTimeFrame = searchParams.get("timeFrame") || "5m";
  const [chartType, setChartType] = useState(initialChartType);
  const [timeFrame, setTimeFrame] = useState(initialTimeFrame);
  const chartApiRef = useRef(null);
  const [chartReady, setChartReady] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [showChartModal, setShowChartModal] = useState(false);

  const handleChartReady = useCallback(({ chart, timeScale, series }) => {
    chartApiRef.current = { chart, timeScale, series };
    timeScale.scrollToRealTime();
    setChartReady(true);
  }, []);

  useKeyPress(["Ctrl + /"], () => setShowShortcuts(true));

  useEffect(() => {
    const escHandler = (e) => {
      if (e.key === "Escape") {
        window.close();
      }
    };
    window.addEventListener("keydown", escHandler);
    return () => window.removeEventListener("keydown", escHandler);
  }, []);

  const price = "₹19,425.35";
  const change = "+1.24%";

  return (
    <div className="fixed inset-0 w-full h-full bg-[#0f1117] flex flex-col overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 sm:p-6 z-50 bg-[#0f1117]/70 backdrop-blur-md gap-3 sm:gap-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">{asset}</h1>
          <p
            className={`text-base sm:text-lg ${
              parseFloat(change) >= 0 ? "text-green-400" : "text-red-400"
            }`}
          >
            {price} <span className="ml-2">{change}</span>
          </p>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 relative">
          <button
            onClick={open}
            className="bg-gradient-to-r from-[#7F3DFF] to-[#5A18E9] text-white text-xs sm:text-sm font-semibold px-3 sm:px-4 py-1.5 rounded-md shadow-md hover:opacity-90 transition flex items-center gap-x-1 sm:gap-x-2"
          >
            <FaChartBar />
            Find Patterns
          </button>

          <div className="relative">
            <button
              onClick={() => {
                setShowTimeModal(!showTimeModal);
                setShowChartModal(false);
              }}
              className="bg-gradient-to-r from-[#7F3DFF] to-[#5A18E9] text-white text-xs sm:text-sm px-3 sm:px-4 py-1 rounded hover:opacity-90 transition"
            >
              Timeframes
            </button>
            {showTimeModal && (
              <div className="absolute left-0 top-full mt-2 sm:mt-1 z-50">
                <TimeFrameModal
                  selected={timeFrame}
                  onSelect={setTimeFrame}
                  onClose={() => setShowTimeModal(false)}
                />
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => {
                setShowChartModal(!showChartModal);
                setShowTimeModal(false);
              }}
              className="bg-gradient-to-r from-[#7F3DFF] to-[#5A18E9] text-white text-xs sm:text-sm px-3 sm:px-4 py-1 rounded hover:opacity-90 transition"
            >
              Charts
            </button>
            {showChartModal && (
              <div className="absolute left-0 top-full mt-2 sm:mt-1 z-50">
                <ChartTypeModal
                  selected={chartType}
                  onSelect={setChartType}
                  onClose={() => setShowChartModal(false)}
                />
              </div>
            )}
          </div>

          <button
            title="Exit Fullscreen"
            onClick={() => window.close()}
            className="text-white text-lg sm:text-2xl hover:scale-110 transition-transform"
          >
            <MdFullscreenExit />
          </button>
        </div>
      </div>

      <div className="flex-1 w-full relative">
        <Chart
          chartType={chartType}
          onReady={handleChartReady}
        />
      </div>

      {showShortcuts && <ShortcutModal onClose={() => setShowShortcuts(false)} />}
    </div>
  );
};

export default FullscreenChartPage;

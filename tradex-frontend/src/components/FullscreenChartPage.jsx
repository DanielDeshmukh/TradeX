// src/components/FullscreenChartPage.jsx
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
import supabase from "../lib/supabase.js";

const safeToFixed = (value, fallback = "--") => {
    if (typeof value === "number" && !isNaN(value)) return value.toFixed(2);
    return fallback;
};

const FullscreenChartPage = () => {
    const { open } = usePatternFinderStore();
    const [searchParams] = useSearchParams();

    // Query parameters
    const assetId = searchParams.get("assetId") || "N/A";
    const assetName = searchParams.get("assetName") || assetId;
    const initialChartType = searchParams.get("chartType") || "Candlestick";
    const initialTimeFrame = searchParams.get("timeFrame") || "5m";

    const [chartType, setChartType] = useState(initialChartType);
    const [timeFrame, setTimeFrame] = useState(initialTimeFrame);
    const chartApiRef = useRef(null);
    const [chartReady, setChartReady] = useState(false);
    const [showShortcuts, setShowShortcuts] = useState(false);
    const [showTimeModal, setShowTimeModal] = useState(false);
    const [showChartModal, setShowChartModal] = useState(false);
    const [candles, setCandles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [price, setPrice] = useState("--");
    const [change, setChange] = useState("--");
    const [isPositive, setIsPositive] = useState(true);

    const handleChartReady = useCallback(({ chart, timeScale, series }) => {
        chartApiRef.current = { chart, timeScale, series };
        timeScale.scrollToRealTime();
        setChartReady(true);
    }, []);

    // Fetch candles from Supabase
    useEffect(() => {
        if (!assetId || !timeFrame) return;
        setLoading(true);

        const fetchCandles = async () => {
            const { data, error } = await supabase
                .from("candles")
                .select("timestamp, open, high, low, close, volume")
                .eq("security_id", assetId)
                .eq("timeframe", timeFrame)
                .order("timestamp", { ascending: true });

            if (error) {
                console.error("Error fetching candles:", error.message);
                setCandles([]);
                setLoading(false);
                return;
            }

            const formatted = (data || []).map(c => ({
                time: Math.floor(new Date(c.timestamp).getTime() / 1000), // seconds
                open: c.open,
                high: c.high,
                low: c.low,
                close: c.close,
                volume: c.volume,
            }));

            setCandles(formatted);

            // Set price and change from latest candle
            if (formatted.length) {
                const latest = formatted[formatted.length - 1];
                setPrice(safeToFixed(latest.close, "--"));
                const prev = formatted.length > 1 ? formatted[formatted.length - 2] : latest;
                const chg = latest.close - prev.close;
                setChange(`${chg >= 0 ? "+" : ""}${chg.toFixed(2)}`);
                setIsPositive(chg >= 0);
            }

            setLoading(false);
        };

        fetchCandles();
    }, [assetId, timeFrame]);

    // Chart navigation functions
    const smoothScrollTo = (newFrom, newTo, duration = 200) => {
        const ts = chartApiRef.current?.timeScale;
        if (!ts) return;
        const start = ts.getVisibleLogicalRange?.();
        if (!start) return;

        const startFrom = start.from;
        const startTo = start.to;
        const startTime = performance.now();

        const animate = (time) => {
            const elapsed = time - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const currentFrom = startFrom + (newFrom - startFrom) * progress;
            const currentTo = startTo + (newTo - startTo) * progress;
            ts.setVisibleLogicalRange({ from: currentFrom, to: currentTo });
            if (progress < 1) requestAnimationFrame(animate);
        };

        requestAnimationFrame(animate);
    };

    const resetView = () => {
        const ts = chartApiRef.current?.timeScale;
        ts?.scrollToRealTime?.();
        setTimeout(() => ts?.setBarSpacing?.(10), 100);
    };
    const zoomIn = () => {
        const ts = chartApiRef.current?.timeScale;
        const range = ts?.getVisibleLogicalRange?.();
        if (!ts || !range) return;
        const center = (range.from + range.to) / 2;
        const size = range.to - range.from;
        const newSize = Math.max(10, size * 0.8);
        ts.setVisibleLogicalRange({ from: center - newSize / 2, to: center + newSize / 2 });
    };
    const zoomOut = () => {
        const ts = chartApiRef.current?.timeScale;
        const range = ts?.getVisibleLogicalRange?.();
        if (!ts || !range) return;
        const center = (range.from + range.to) / 2;
        const size = range.to - range.from;
        const newSize = Math.min(500, size * 1.25);
        ts.setVisibleLogicalRange({ from: center - newSize / 2, to: center + newSize / 2 });
    };
    const scrollLeft = () => {
        const ts = chartApiRef.current?.timeScale;
        const range = ts?.getVisibleLogicalRange?.();
        if (!ts || !range) return;
        smoothScrollTo(range.from - 20, range.to - 20);
    };
    const scrollRight = () => {
        const ts = chartApiRef.current?.timeScale;
        const range = ts?.getVisibleLogicalRange?.();
        if (!ts || !range) return;
        smoothScrollTo(range.from + 20, range.to + 20);
    };

    const triggerShortcut = (keyCombo) => {
        switch (keyCombo) {
            case "Shift + ArrowUp": zoomIn(); break;
            case "Shift + ArrowDown": zoomOut(); break;
            case "Shift + ArrowLeft": scrollLeft(); break;
            case "Shift + ArrowRight": scrollRight(); break;
            case "Shift + R": resetView(); break;
            case "Shift + F": window.close(); break;
            case "Ctrl + /": setShowShortcuts(true); break;
        }
    };

    // Bind hotkeys
    useKeyPress(["Ctrl + /"], () => setShowShortcuts(true));
    useKeyPress(["Shift + ArrowUp"], () => chartReady && zoomIn());
    useKeyPress(["Shift + ArrowDown"], () => chartReady && zoomOut());
    useKeyPress(["Shift + ArrowLeft"], () => chartReady && scrollLeft());
    useKeyPress(["Shift + ArrowRight"], () => chartReady && scrollRight());
    useKeyPress(["Shift + R"], () => chartReady && resetView());
    useKeyPress(["Shift + F"], () => window.close());

    useEffect(() => {
        const escHandler = (e) => {
            if (e.key === "Escape") window.close();
        };
        window.addEventListener("keydown", escHandler);
        return () => window.removeEventListener("keydown", escHandler);
    }, []);

    return (
        <div className="fixed inset-0 w-full h-full bg-[#0B0E15] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 sm:p-6
                            z-50 bg-bg-secondary/60 backdrop-blur-md shadow-lg shadow-brand/20 gap-3 sm:gap-0">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-white drop-shadow-md">{assetName}</h1>
                    <p className={`text-base sm:text-lg font-semibold ${isPositive ? "text-bullish drop-shadow-md" : "text-bearish drop-shadow-md"}`}>
                        {price} <span className="ml-2">{change}</span>
                    </p>
                </div>

                <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 relative">
                    <button
                        onClick={open}
                        className="bg-gradient-to-r from-[#7F3DFF] to-[#5A18E9] text-white text-xs sm:text-sm font-semibold
                                   px-3 sm:px-4 py-1.5 rounded-lg shadow-lg hover:opacity-90 transition flex items-center gap-x-1 sm:gap-x-2"
                    >
                        <FaChartBar /> Find Patterns
                    </button>

                    <div className="relative">
                        <button
                            onClick={() => { setShowTimeModal(!showTimeModal); setShowChartModal(false); }}
                            className="bg-gradient-to-r from-[#7F3DFF] to-[#5A18E9] text-white text-xs sm:text-sm px-3 sm:px-4 py-1 rounded-lg shadow hover:opacity-90 transition"
                        >
                            Timeframes
                        </button>
                        {showTimeModal && <TimeFrameModal selected={timeFrame} onSelect={setTimeFrame} onClose={() => setShowTimeModal(false)} />}
                    </div>

                    <div className="relative">
                        <button
                            onClick={() => { setShowChartModal(!showChartModal); setShowTimeModal(false); }}
                            className="bg-gradient-to-r from-[#7F3DFF] to-[#5A18E9] text-white text-xs sm:text-sm px-3 sm:px-4 py-1 rounded-lg shadow hover:opacity-90 transition"
                        >
                            Charts
                        </button>
                        {showChartModal && <ChartTypeModal selected={chartType} onSelect={setChartType} onClose={() => setShowChartModal(false)} />}
                    </div>

                    <button
                        title="Exit Fullscreen"
                        onClick={() => window.close()}
                        className="text-white text-lg sm:text-2xl hover:scale-110 transition-transform drop-shadow-md"
                    >
                        <MdFullscreenExit />
                    </button>
                </div>
            </div>

            {/* Chart */}
            <div className="flex-1 w-full relative bg-surface-elevated/70 backdrop-blur-sm p-4 rounded-2xl shadow-inner shadow-brand/20 flex items-center justify-center">
                {loading ? (
                    <p className="text-white">Loading chart data...</p>
                ) : candles.length === 0 ? (
                    <p className="text-white">Apologies, no data available for selected symbol.</p>
                ) : (
                    <Chart 
                        chartType={chartType} 
                        onReady={handleChartReady} 
                        symbolId={assetId} 
                        candles={candles}
                        timeFrame={timeFrame}
                    />
                )}
            </div>

            {/* Shortcuts */}
            {showShortcuts && (
                <ShortcutModal
                    onClose={() => setShowShortcuts(false)}
                    chartReady={chartReady}
                    zoomIn={zoomIn}
                    zoomOut={zoomOut}
                    scrollLeft={scrollLeft}
                    scrollRight={scrollRight}
                    resetView={resetView}
                    handleFullscreen={() => window.close()}
                    setShowShortcuts={setShowShortcuts}
                />
            )}
        </div>
    );
};

export default FullscreenChartPage;

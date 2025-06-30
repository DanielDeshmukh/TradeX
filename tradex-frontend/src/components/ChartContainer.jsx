import { useAsset } from '../context/AssetContext';
import { MdFullscreen } from 'react-icons/md';
import TimeFrameModal from './TimeFrameModal.jsx';
import Chart from './Chart';
import { usePatternFinderStore } from '../store/usePatternFinderStore';
import ChartTypeModal from './ChartTypeModal.jsx';
import mockData from '../DataCreation/mockData.js';
import { useState, useRef, useCallback, useEffect } from 'react';
import useKeyPress from './useKeyPress';
import ShortcutModal from './ShortcutModal';

const ChartContainer = ({ assetName }) => {
  const { selectedAsset } = useAsset();
  const chartRef = useRef(null);
  const chartApiRef = useRef(null);
  const { matchedSegments } = usePatternFinderStore();
  const [timeFrame, setTimeFrame] = useState('5m');
  const [chartType, setChartType] = useState('Candlestick');
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [showChartModal, setShowChartModal] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [chartReady, setChartReady] = useState(false);

  const handleFullscreen = () => {
    const url = `/fullscreen-chart?asset=${encodeURIComponent(selectedAsset?.name)}&chartType=${encodeURIComponent(chartType)}&timeFrame=${encodeURIComponent(timeFrame)}`;
    window.open(url, '_blank');
  };

  const handleChartReady = useCallback(({ chart, timeScale }) => {
    if (chart && timeScale) {
      chartApiRef.current = { chart, timeScale };
      timeScale.scrollToRealTime();
      setChartReady(true);
    } else {
      console.warn('Invalid chart or timeScale passed to handleChartReady');
    }
  }, []);

  const resetView = () => {
    const ts = chartApiRef.current?.timeScale;
    if (ts?.scrollToRealTime) {
      ts.scrollToRealTime();
      setTimeout(() => ts.setBarSpacing?.(10), 100);
    }
  };

  const zoomIn = () => {
    const ts = chartApiRef.current?.timeScale;
    if (!ts) return;

    const range = ts.getVisibleLogicalRange?.();
    if (!range) return;

    const rangeSize = range.to - range.from;
    const center = (range.to + range.from) / 2;
    const newRangeSize = Math.max(10, rangeSize * 0.8);

    const newFrom = center - newRangeSize / 2;
    const newTo = center + newRangeSize / 2;

    ts.setVisibleLogicalRange({ from: newFrom, to: newTo });
  };

  useEffect(() => {
  console.log("Matched Segments for Drawing:", matchedSegments);
}, [matchedSegments]);


  const zoomOut = () => {
    const ts = chartApiRef.current?.timeScale;
    if (!ts) return;

    const range = ts.getVisibleLogicalRange?.();
    if (!range) return;

    const rangeSize = range.to - range.from;
    const center = (range.to + range.from) / 2;
    const newRangeSize = Math.min(500, rangeSize * 1.25);

    const newFrom = center - newRangeSize / 2;
    const newTo = center + newRangeSize / 2;

    ts.setVisibleLogicalRange({ from: newFrom, to: newTo });
  };
  const scrollLeft = () => {
    const ts = chartApiRef.current?.timeScale;
    const range = ts?.getVisibleLogicalRange?.();
    if (!range) return;

    const newFrom = range.from - 20;
    const newTo = range.to - 20;

    ts.setVisibleLogicalRange({ from: newFrom, to: newTo });
  };

  const scrollRight = () => {
    const ts = chartApiRef.current?.timeScale;
    const range = ts?.getVisibleLogicalRange?.();
    if (!range) return;

    const newFrom = range.from + 20;
    const newTo = range.to + 20;

    ts.setVisibleLogicalRange({ from: newFrom, to: newTo });
  };

  useKeyPress(['Ctrl + /'], () => setShowShortcuts(true));
  useKeyPress(['Shift + ArrowUp'], () => chartReady && zoomIn());
  useKeyPress(['Shift + ArrowDown'], () => chartReady && zoomOut());
  useKeyPress(['Shift + ArrowLeft'], () => chartReady && scrollLeft());
  useKeyPress(['Shift + ArrowRight'], () => chartReady && scrollRight());
  useKeyPress(['Shift + R'], () => chartReady && resetView());
  useKeyPress(['Shift + F'], handleFullscreen);

  useEffect(() => {
    const escHandler = (e) => {
      if (e.key === 'Escape') {
        setShowShortcuts(false);
        setShowTimeModal(false);
        setShowChartModal(false);
      }
    };
    window.addEventListener('keydown', escHandler);
    return () => window.removeEventListener('keydown', escHandler);
  }, []);

  return (
    <div className="relative group w-full h-full">
      <div className="absolute z-10 top-24 right-16">
        <button
          onClick={handleFullscreen}
          title="Fullscreen"
          className="text-white text-2xl transition-transform hover:scale-125"
        >
          <MdFullscreen />
        </button>
      </div>




      <div className="flex items-center justify-between m-4">
        <div>
          <h2 className="text-xl font-bold">{selectedAsset?.name}</h2>
          <p className={`font-semibold ${selectedAsset?.isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {selectedAsset?.price} <span className="ml-2">{selectedAsset?.change}</span>
          </p>
        </div>

        <div className="flex gap-4">
          <div className="relative">
            <button
              onClick={() => {
                setShowTimeModal(!showTimeModal);
                setShowChartModal(false);
              }}
              className="bg-gradient-to-r from-[#7F3DFF] to-[#5A18E9] text-white text-sm px-4 py-1 rounded hover:opacity-90 transition"
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
              onClick={() => {
                setShowChartModal(!showChartModal);
                setShowTimeModal(false);
              }}
              className="bg-gradient-to-r from-[#7F3DFF] to-[#5A18E9] text-white text-sm mr-8 px-4 py-1 rounded hover:opacity-90 transition"
            >
              Charts
            </button>
            {showChartModal && (
              <ChartTypeModal
                selected={chartType}
                onSelect={setChartType}
                onClose={() => setShowChartModal(false)}
              />
            )}
          </div>
        </div>
      </div>

      <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
        {matchedSegments.map((segment, index) => (
          <polyline
            key={index}
            points={segment.map(([x, y]) => `${x},${y}`).join(' ')}
            fill="none"
            stroke="yellow"
            strokeWidth="2"
          />
        ))}
      </svg>

      {matchedSegments.length > 0 && (
        <p className="text-yellow-400 text-xs mt-2">
          {matchedSegments.length} similar patterns found
        </p>
      )}


      <div ref={chartRef} className="w-full h-[500px] rounded-xl bg-[#1C1F24] p-4">
        <Chart chartType={chartType} data={mockData} onReady={handleChartReady} />
      </div>

      {showShortcuts && <ShortcutModal onClose={() => setShowShortcuts(false)} />}
    </div>
  );
};

export default ChartContainer;

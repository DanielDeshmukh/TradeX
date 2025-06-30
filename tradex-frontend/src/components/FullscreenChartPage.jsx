import { useState, useRef, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Chart from './Chart';
import ShortcutModal from './ShortcutModal.jsx';
import TimeFrameModal from './TimeFrameModal';
import ChartTypeModal from './ChartTypeModal';
import { MdFullscreenExit } from 'react-icons/md';
import mockData from '../DataCreation/mockData.js';
import useKeyPress from './useKeyPress.js';


const FullscreenChartPage = () => {

  const [searchParams] = useSearchParams();
  const asset = searchParams.get('asset') || 'N/A';
  const chartTypeFromURL = searchParams.get('chartType') || 'Candlestick';
  const [chartType, setChartType] = useState(chartTypeFromURL);
  const chartRef = useRef(null);
  const chartApiRef = useRef(null);
  const [chartReady, setChartReady] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [timeFrame, setTimeFrame] = useState('5m');
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [showChartModal, setShowChartModal] = useState(false);

  const handleChartReady = useCallback(({ chart, timeScale }) => {
    chartApiRef.current = { chart, timeScale };
    timeScale.scrollToRealTime();
    setChartReady(true);
  }, []);


   const zoomIn = () => {
    const ts = chartApiRef.current?.timeScale;
    if (!ts) return;
    const range = ts.getVisibleLogicalRange?.();
    if (!range) return;
    const rangeSize = range.to - range.from;
    const center = (range.to + range.from) / 2;
    const newRangeSize = Math.max(10, rangeSize * 0.8);
    ts.setVisibleLogicalRange({ from: center - newRangeSize / 2, to: center + newRangeSize / 2 });
  };

  const zoomOut = () => {
    const ts = chartApiRef.current?.timeScale;
    if (!ts) return;
    const range = ts.getVisibleLogicalRange?.();
    if (!range) return;
    const rangeSize = range.to - range.from;
    const center = (range.to + range.from) / 2;
    const newRangeSize = Math.min(500, rangeSize * 1.25);
    ts.setVisibleLogicalRange({ from: center - newRangeSize / 2, to: center + newRangeSize / 2 });
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

  const resetView = () => {
    const ts = chartApiRef.current?.timeScale;
    if (ts?.scrollToRealTime) {
      ts.scrollToRealTime();
      setTimeout(() => ts.setBarSpacing?.(10), 100);
    }
  };
 

  useEffect(() => {
      const escHandler = (e) => {
        if (e.key === 'Escape') {
          window.close();
        }
      };
      window.addEventListener('keydown', escHandler);
      return () => window.removeEventListener('keydown', escHandler);
    }, []);
  useKeyPress(['Ctrl + /'], () => setShowShortcuts(true));
  useKeyPress(['Shift + ArrowUp'], () => chartReady && zoomIn());
  useKeyPress(['Shift + ArrowDown'], () => chartReady && zoomOut());
  useKeyPress(['Shift + ArrowLeft'], () => chartReady && scrollLeft());
  useKeyPress(['Shift + ArrowRight'], () => chartReady && scrollRight());
  useKeyPress(['Shift + R'], () => chartReady && resetView());
  useKeyPress(['Esc'], () => chartReady && escHandler());

  const price = '₹19,425.35';
  const change = '+1.24%';

  return (
    <div className="w-screen h-screen bg-[#0f111700] relative overflow-hidden">
      <div className="absolute top-4 left-4 z-50 bg-[#ffffff00] backdrop-blur-md px-6 py-4 rounded-xl text-white shadow-lg">
        <h1 className="text-2xl font-bold">{asset}</h1>
        <p className={`text-lg ${parseFloat(change) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {price} <span className="ml-2">{change}</span>
        </p>
      </div>

      <div className="absolute top-4 right-4 z-50 flex space-x-4">
        {/* Timeframes */}
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

        {/* Chart Types */}
        <div className="relative">
          <button
            onClick={() => {
              setShowChartModal(!showChartModal);
              setShowTimeModal(false);
            }}
            className="bg-gradient-to-r from-[#7F3DFF] to-[#5A18E9] text-white text-sm mr-20 px-4 py-1 rounded hover:opacity-90 transition"
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


      <div className="absolute top-4 right-4 z-50 flex space-x-3">
        {/* Buttons omitted for brevity */}
        <button
          title="Exit Fullscreen"
          onClick={() => window.close()}
          className=" absolute text-white text-2xl top-2 hover:scale-125 transition-transform right-10"
        >
          <MdFullscreenExit />
        </button>
      </div>

      {/* Chart Canvas */}
      <div className="absolute inset-0 z-10">
        <Chart chartType={chartType} data={mockData}  onReady={handleChartReady}/>
      </div>
            {showShortcuts && <ShortcutModal onClose={() => setShowShortcuts(false)} />}

    </div>
  );
};

export default FullscreenChartPage;
import { useAsset } from '../context/AssetContext';
import { MdFullscreen } from 'react-icons/md';
import TimeFrameModal from './TimeFrameModal.jsx';
import Chart from './Chart';
import { usePatternFinderStore } from '../store/usePatternFinderStore';
import ChartTypeModal from './ChartTypeModal.jsx';
import { usePatternMatcher, remapSegmentsToTimestamps } from '../utils/usePatternMatcher.js';
import mockData from '../DataCreation/mockData.js';
import { useState, useRef, useCallback, useEffect } from 'react';
import useKeyPress from './useKeyPress';
import ShortcutModal from './ShortcutModal';

const ChartContainer = () => {
  const { selectedAsset } = useAsset();
  const [matchedSegments, setMatchedSegments] = useState([]);
  const chartRef = useRef(null);
  const [updateKey, setUpdateKey] = useState(0);
  const chartApiRef = useRef(null);
  const [chartReady, setChartReady] = useState(false);
  const { matchedSegments: rawSegments } = usePatternFinderStore(state => state.matchedSegments);
  const [timestampedSegments, setTimestampedSegments] = useState([]);
  const { matchPattern } = usePatternMatcher();
  const [timeFrame, setTimeFrame] = useState('5m');
  const [chartType, setChartType] = useState('Candlestick');
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [showChartModal, setShowChartModal] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);

  const handleFullscreen = () => {
    const url = `/fullscreen-chart?asset=${encodeURIComponent(selectedAsset?.name)}&chartType=${encodeURIComponent(chartType)}&timeFrame=${encodeURIComponent(timeFrame)}`;
    window.open(url, '_blank');
  };

  useEffect(() => {
    const chartSeries = mockData.map((d, i) => [i, d.close]); 
    const drawnPattern = chartSeries.slice(20, 30); 

    const rawMatches = matchPattern(drawnPattern, chartSeries, 0.8);

    const matchedSegments = rawMatches.map(({ start, end }) =>
      chartSeries.slice(start, end + 1)
    );

    console.log("Simulated Matched Segments:", matchedSegments);
    usePatternFinderStore.getState().setMatchedSegments(matchedSegments);
  }, []);

  useEffect(() => {
  if (Array.isArray(mockData) && Array.isArray(rawSegments) && mockData.length && rawSegments.length) {
    const converted = remapSegmentsToTimestamps(rawSegments, mockData);
    setTimestampedSegments(converted);
  }
}, [rawSegments, mockData]);

  const handleChartReady = useCallback(({ chart, timeScale, series }) => {
  if (chart && timeScale && series) {
    chartApiRef.current = { chart, timeScale, series };
    timeScale.scrollToRealTime();
    setChartReady(true);
  } else {
    console.warn('Invalid chart/timeScale/series passed to handleChartReady');
  }
}, []);

const remapSegmentsToTimestamps = (segments, candles) => {
  return segments.map(segment =>
    segment.map(([index, price]) => {
      const candle = candles[index];
      if (!candle) return null;
      return [candle.time, price];
    }).filter(Boolean)
  );
};

  const drawnSegments = matchedSegments.map(segment =>
  segment.map(([index, price]) => {
    const candle = mockData[index];
    return [candle?.time, price]; 
    }).filter(([time]) => time !== undefined)
);


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

  useEffect(() => {
  if (!chartReady) return;

  const timeScale = chartApiRef.current?.timeScale;

  const handleVisibleRangeChange = () => {
    setUpdateKey((prev) => prev + 1); 
  };

  const unsubscribe = timeScale?.subscribeVisibleTimeRangeChange?.(handleVisibleRangeChange);

  return () => {
    unsubscribe && unsubscribe();
  };
}, [chartReady]);


  useEffect(() => {
    console.log("Mapped Segment Coordinates:", drawnSegments.map(seg =>
  seg.map(([t, p]) => ({
    x: chartApiRef.current?.timeScale?.timeToCoordinate?.(t),
    y: chartApiRef.current?.priceScale?.priceToCoordinate?.(p),
  }))
));
  }, [drawnSegments]);


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

      <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-20">
  {chartReady && matchedSegments.map((segment, index) => {
    const points = segment
      .map(([time, price]) => {
        const x = chartApiRef.current?.timeScale?.timeToCoordinate?.(time);
        const y = chartApiRef.current?.series?.priceToCoordinate?.(price); // ✅ FIXED

        return x !== undefined && y !== undefined ? `${x},${y}` : null;
      })
      .filter(Boolean)
      .join(' ');

    return (
      <polyline
        key={index}
        points={points}
        fill="none"
        stroke="yellow"
        strokeWidth="2"
      />
    );
  })}
</svg>


      <div ref={chartRef} className="w-full h-[500px] rounded-xl bg-[#1C1F24] p-4">
        <Chart
          chartType={chartType}
          data={mockData}
          onReady={(refs) => chartApiRef.current = refs.chart}
          overlays={matchedSegments}
          
        />
      </div>

      {showShortcuts && <ShortcutModal onClose={() => setShowShortcuts(false)} />}
    </div>
  );
};

export default ChartContainer;

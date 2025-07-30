import { useEffect, useRef, useState, useMemo } from 'react';
import { usePatternOverlaySegments } from '../utils/usePatternOverlaySegments';
import { usePatternFinderStore } from '../store/usePatternFinderStore';
import {
  createChart,
  CandlestickSeries,
  LineSeries,
  AreaSeries,
  CrosshairMode
} from 'lightweight-charts';



const Chart = ({ chartType, data, onReady, overlays = [], }) => {
  const { matchedSegments } = usePatternOverlaySegments();
  console.log("✅ Matched Segments in Chart:", matchedSegments?.length ?? 0);
if (Array.isArray(matchedSegments) && matchedSegments.length > 0) {
  console.log("🔍 First segment sample:", matchedSegments[0]);
} else {
  console.warn("⚠️ No matched segments or invalid format:", matchedSegments);
}

  const allOverlaySegments = useMemo(() => {
    return [...(overlays || []), ...(matchedSegments || [])];
  }, [overlays, matchedSegments]); const chartRef = useRef(null);
  const [chart, setChart] = useState(null);
  const [series, setSeries] = useState(null);


  const containerRef = useRef(null);
  const seriesRef = useRef(null);
  const initialBarSpacing = 10;
  const timeScaleRef = useRef(null);

  useEffect(() => {
    if (!chart || !chartRef.current || !series) return;

    chart.removeOverlaySeries?.();

    allOverlaySegments.forEach((segment, index) => {
      if (!Array.isArray(segment) || segment.length === 0) return;

      const overlaySeries = chart.addSeries(LineSeries, {
        color: 'yellow',
        lineWidth: 2,
        priceLineVisible: true,
      });

      const validatedData = segment.filter(p =>
        typeof p.time !== 'undefined' && typeof p.value === 'number'
      );

      overlaySeries.setData(validatedData);
      console.log(`🟡 Overlay ${index}: Plotted ${validatedData.length} points`);
    });
  }, [chart, series, allOverlaySegments, matchedSegments]);

 useEffect(() => {
  const chart = createChart(containerRef.current, {
    layout: {
      background: { type: 'solid', color: '#0F1117' },
      textColor: '#FFFFFF',
    },
    grid: {
      vertLines: { color: '#1F2937' },
      horzLines: { color: '#1F2937' },
    },
    width: containerRef.current.clientWidth,
    height: containerRef.current.clientHeight,
    handleScroll: true,
    handleScale: true,
    crosshair: { mode: CrosshairMode.Normal },
    timeScale: {
      rightOffset: 10,
      barSpacing: initialBarSpacing,
      fixLeftEdge: true,
      fixRightEdge: false,
      lockVisibleTimeRangeOnResize: false,
      rightBarStaysOnScroll: false,
      borderVisible: false,
    },
  });

  chartRef.current = chart;
  const timeScale = chart.timeScale();
  timeScaleRef.current = timeScale;

  let series;
  let formattedData = [];

  switch (chartType.toLowerCase()) {
    case 'candlestick':
      series = chart.addSeries(CandlestickSeries, {
        upColor: '#26a69a',
        downColor: '#ef5350',
        wickUpColor: '#26a69a',
        wickDownColor: '#ef5350',
        borderVisible: false,
      });
      formattedData = data;
      break;

    case 'line':
      series = chart.addSeries(LineSeries, {
        color: '#4ade80',
        lineWidth: 2,
      });
      formattedData = data.map(({ time, close }) => ({ time, value: close }));
      break;

    case 'area':
      series = chart.addSeries(AreaSeries, {
        topColor: 'rgba(96, 165, 250, 0.4)',
        bottomColor: 'rgba(30, 41, 59, 0.2)',
        lineColor: '#60A5FA',
        lineWidth: 2,
      });
      formattedData = data.map(({ time, close }) => ({ time, value: close }));
      break;

    default:
      return;
  }

  series.setData(formattedData);
  seriesRef.current = series;

  const overlaySeries = [];

  if (allOverlaySegments.length) {
    allOverlaySegments.forEach((segment, i) => {
      if (!Array.isArray(segment)) return;

      const highlightSeries = chart.addSeries(LineSeries, {
        color: 'rgba(255, 255, 0, 0.6)',
        lineWidth: 2,
        priceLineVisible: false,
      });

      const validatedData = segment
        .map(({ time, value }) => ({ time, value }))
        .filter(p => typeof p.time !== 'undefined' && typeof p.value === 'number');

      highlightSeries.setData(validatedData);
      overlaySeries.push(highlightSeries);

      if (i === 0 && validatedData.length > 0 && chart.timeScale()) {
        const firstTime = validatedData[0].time;
        const lastTime = validatedData[validatedData.length - 1].time;
        chart.timeScale().setVisibleRange({ from: firstTime, to: lastTime });
      }
    });
  }

  if (overlays.length) {
    const first = overlays[0];
    if (first && chart.timeScale()) {
      chart.timeScale().setVisibleLogicalRange({
        from: first.from - 5,
        to: first.to + 5
      });
    }
  }

  const from = Math.max(0, formattedData.length - 100);
  const to = formattedData.length - 1;

  const visibleData = formattedData.slice(from, to + 1);
  const prices = visibleData.map(d => d.value ?? d.close);
  const minValue = Math.min(...prices);
  const maxValue = Math.max(...prices);

  requestAnimationFrame(() => {
    timeScale.setVisibleLogicalRange({ from, to });
  });

  requestAnimationFrame(() => {
    timeScale.scrollToRealTime();
    chart.applyOptions({
      timeScale: {
        barSpacing: initialBarSpacing,
      },
    });
  });

  if (onReady && typeof onReady === 'function') {
    const canvasHeight = containerRef.current.clientHeight;
    onReady({
      chart,
      timeScale,
      series,
      priceRange: {
        minValue,
        maxValue
      },
      canvasHeight,
    });
  }

  const resizeObserver = new ResizeObserver(() => {
    chart.applyOptions({
      width: containerRef.current.clientWidth,
    });
  });

  resizeObserver.observe(containerRef.current);

  return () => {
    resizeObserver.disconnect();
    overlaySeries.forEach((s) => chart.removeSeries(s));
    chart.remove();
  };
}, [chartType, data, onReady, overlays, allOverlaySegments]);


return <div ref={containerRef} className="cursor-crosshair h-full w-full" />;
};

export default Chart;

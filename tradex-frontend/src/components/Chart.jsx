import { useEffect, useRef } from 'react';
import {
  createChart,
  CandlestickSeries,
  LineSeries,
  AreaSeries,
  CrosshairMode
} from 'lightweight-charts';

const Chart = ({ chartType, data, onReady }) => {
  const chartRef = useRef(null);
  const containerRef = useRef(null);
  const seriesRef = useRef(null);
  const initialBarSpacing = 10;
  const timeScaleRef = useRef(null);

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

    switch (chartType) {
      case 'Candlestick':
        series = chart.addSeries(CandlestickSeries, {
          upColor: '#26a69a',
          downColor: '#ef5350',
          wickUpColor: '#26a69a',
          wickDownColor: '#ef5350',
          borderVisible: false,
        });
        formattedData = data;
        break;

      case 'Line':
        series = chart.addSeries(LineSeries, {
          color: '#4ade80',
          lineWidth: 2,
        });
        formattedData = data.map(({ time, close }) => ({ time, value: close }));
        break;

      case 'Area':
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

    

  const from = Math.max(0, formattedData.length - 100);
const to = formattedData.length - 1;

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
      onReady({ chart, timeScale });
    }

    const resizeObserver = new ResizeObserver(() => {
      chart.applyOptions({
        width: containerRef.current.clientWidth,
      });
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
    };
  }, [chartType, data, onReady]);

  return <div ref={containerRef} className="cursor-crosshair h-full w-full" />;
};

export default Chart;

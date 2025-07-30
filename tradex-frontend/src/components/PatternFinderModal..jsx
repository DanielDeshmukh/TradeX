import React, { useRef, useEffect, useState } from 'react';
import { usePatternFinderStore } from '../store/usePatternFinderStore';
import { usePatternMatcher } from '../utils/usePatternMatcher.js';
import { X } from 'lucide-react';

import mockData from '../DataCreation/mockData.js';


const PatternFinderModal = () => {
  const { matchedSegments, isOpen, close } = usePatternFinderStore();
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawnPoints, setDrawnPoints] = useState([]);
  const { matchPattern } = usePatternMatcher();
  const [chartPoints] = useState(mockData);
  const accuracySliderRef = useRef();

  const handleFindPatterns = () => {
    if (!drawnPoints.length || !chartPoints.length) return;

    const accuracy = parseFloat(accuracySliderRef.current.value || 0.5);

    const canvas = canvasRef.current;
    const canvasHeight = canvas.height;

    const normalizedDrawn = drawnPoints.map(([x, y], index) => {
      const relativeY = 1 - y / canvasHeight;
      return [index, relativeY];
    });

    const chartSeries = chartPoints.map((p, i) => [i, p.close]);

    const matches = matchPattern(normalizedDrawn, chartSeries, accuracy, true);

    const convertMatchesToSegments = (matches, fullChartData) => {
      return matches
        .map(({ start, end }) => {
          const rawSlice = fullChartData.slice(start, end + 1);
          const segment = rawSlice
            .map(p => ({ time: p.time, value: p.close }))
            .filter(p => p.time && typeof p.value === 'number');

          return segment.length > 0 ? segment : null;
        })
        .filter(Boolean);
    };


    const overlaySegments = convertMatchesToSegments(matches, chartPoints)
    usePatternFinderStore.getState().setMatchedSegments(overlaySegments);

    console.log("✅ Matched Segments:", overlaySegments.length);
    if (overlaySegments.length) {
      console.log("🟢 First segment sample:", overlaySegments[0]);
    }

    console.log('drawnPoints:', drawnPoints);
    console.log('normalizedDrawn:', normalizedDrawn);
    console.log('chartPoints:', chartPoints);
    console.log('Raw matches:', matches);

    requestAnimationFrame(() => {
      close();
    });
  };



  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      const ctx = canvas.getContext('2d');
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#60A5FA';
      ctx.lineWidth = 2;
    }
  }, [isOpen]);

  const getContext = () => {
    const canvas = canvasRef.current;
    return canvas ? canvas.getContext('2d') : null;
  };

  const startDrawing = (e) => {
    const ctx = getContext();
    if (!ctx) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setDrawnPoints([[x, y]]);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const ctx = getContext();
    if (!ctx) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
    setDrawnPoints((prev) => [...prev, [x, y]]);
  };


  const endDrawing = () => {
    const ctx = getContext();
    if (!ctx) return;
    setIsDrawing(false);
    ctx.closePath();
  };

  const clearCanvas = () => {
    const ctx = getContext();
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const renderPattern = (patternName) => {
    const ctx = getContext();
    if (!ctx) return;
    clearCanvas();
    const pattern = predefinedPatterns[patternName];
    if (!pattern) return;

    ctx.beginPath();
    pattern.forEach(([x, y], index) => {
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
      <div className="bg-[#0e1629] text-white rounded-xl p-6  min-w-[40%]   relative">
        <button onClick={close} className="absolute top-4 right-4 hover:text-red-500">
          <X size={24} />
        </button>

        <h2 className="text-xl font-semibold mb-4 text-purple-400">Chart Pattern Finder</h2>

        <div className="flex justify-center">


          <div className="flex-1 px-4">
            <p className="text-gray-400 text-center mt-10 max-w-4xl">
              Draw your own pattern on the canvas
            </p>
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={endDrawing}
              onMouseLeave={endDrawing}
              className="mt-6 flex  h-72 bg-[#1e2a3f] rounded-md border border-gray-600"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-around">
          <div className="flex items-center space-x-2">
            <label htmlFor="accuracy" className="text-sm text-gray-300">Accuracy</label>
            <input
              id="accuracy"
              ref={accuracySliderRef}
              type="range"
              min="0.1"
              max="1"
              step="0.1"
              defaultValue="0.75"
              className="w-48"
            />
          </div>
          <button onClick={handleFindPatterns} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">Find Patterns</button>
          <button className=" bg-red-600 hover:bg-red-700 cursor-pointer px-4 py-2 rounded-md" onClick={clearCanvas}>
            Clear Canvas
          </button>
        </div>
      </div>
    </div>
  );
};

export default PatternFinderModal;

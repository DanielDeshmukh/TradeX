import React, { useRef, useEffect, useState } from 'react';
import { usePatternFinderStore } from '../store/usePatternFinderStore';
import { X } from 'lucide-react';

import mockData from '../DataCreation/mockData.js';
import { usePatternMatcher } from '../utils/usePatternMatcher';
const predefinedPatterns = {
  'Head & Shoulders': [[50, 150], [100, 50], [150, 150], [200, 100], [250, 150]],
  'Double Top': [[50, 150], [100, 50], [150, 150], [200, 50], [250, 150]],
  'Double Bottom': [[50, 50], [100, 150], [150, 50], [200, 150], [250, 50]],
  Triangle: [[50, 150], [150, 50], [250, 150]],
  Wedge: [[50, 150], [125, 100], [200, 130], [250, 100]],
  Flag: [[50, 150], [100, 100], [150, 150], [200, 100], [250, 150]],
  'Cup & Handle': [[50, 150], [100, 100], [150, 100], [200, 150], [230, 140], [250, 130]],
};

const PatternFinderModal = () => {
  const { setMatchedSegments } = usePatternFinderStore();
  const { isOpen, close } = usePatternFinderStore();
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawnPoints, setDrawnPoints] = useState([]);
  const [chartPoints] = useState(mockData); 
  const accuracySliderRef = useRef();

  const handleFindPatterns = () => {
    if (!drawnPoints.length || chartPoints.length) return;

    const accuracy = parseFloat(accuracySliderRef.current.value || 0.5);
    const matches = matchPattern(drawnPoints, chartPoints, accuracy, true);
     console.log("Raw matches: ", matches);

     const matchedSegments = matches.matchPattern(({start, end }) =>
      chartPoints.slice(start, end + 1 ));

    setMatchedSegments(matchedSegments);
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
      <div className="bg-[#0e1629] text-white rounded-xl p-6 w-[90%] max-w-5xl relative">
        <button onClick={close} className="absolute top-4 right-4 hover:text-red-500">
          <X size={24} />
        </button>

        <h2 className="text-xl font-semibold mb-4 text-purple-400">Chart Pattern Finder</h2>

        <div className="flex">
          <div className="w-1/4 pr-4 border-r border-gray-700">
            <h3 className="font-semibold text-lg mb-2">Pattern Library</h3>
            <ul className="space-y-2">
              {Object.keys(predefinedPatterns).map((pattern) => (
                <li
                  key={pattern}
                  className="hover:text-purple-400 cursor-pointer"
                  onClick={() => renderPattern(pattern)}
                >
                  {pattern}
                </li>
              ))}

            </ul>
          </div>

          <div className="flex-1 px-4">
            <p className="text-gray-400 text-center mt-10">
              Select a pattern from the library to begin<br />
              or draw your own pattern on the canvas
            </p>
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={endDrawing}
              onMouseLeave={endDrawing}
              className="mt-6 h-72 bg-[#1e2a3f] rounded-md border border-gray-600"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-between">
          <div className="flex items-center space-x-2">
    <label htmlFor="accuracy" className="text-sm text-gray-300">Accuracy</label>
    <input
      id="accuracy"
      ref={accuracySliderRef}
      type="range"
      min="0.1"
      max="1"
      step="0.1"
      defaultValue="0.5"
      className="w-48"
    />
  </div>
          <button onClick={handleFindPatterns} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">Find Patterns</button>
          <button className=" bg-red-600 hover:bg-red-700 cursor-pointer px-4 py-2 rounded-md" onClick={clearCanvas}>
            Clear Canvas
          </button>
          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md">Save</button>
        </div>
      </div>
    </div>
  );
};

export default PatternFinderModal;

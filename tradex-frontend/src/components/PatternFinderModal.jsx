import React, { useRef, useEffect, useState } from "react";
import { usePatternFinderStore } from "../store/usePatternFinderStore";
import { X } from "lucide-react";
import supabase from "../lib/supabase";

const PatternFinderModal = () => {
  const { isOpen, close, setMatchedSegments } = usePatternFinderStore();
  const canvasRef = useRef(null);
  const accuracySliderRef = useRef(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [drawnPoints, setDrawnPoints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sliderValue, setSliderValue] = useState(0.75); // live slider display

  const handleFindPatterns = async () => {
    if (!drawnPoints.length) return;

    const canvas = canvasRef.current;
    const canvasHeight = canvas.height;

    const normalizedDrawn = drawnPoints.map(([x, y], index) => {
      const relativeY = 1 - y / canvasHeight;
      return [index, relativeY];
    });

    let accuracy = parseFloat(sliderValue);
    if (accuracy < 0.625) accuracy = 0.5;
    else if (accuracy < 0.875) accuracy = 0.75;
    else accuracy = 1;

    try {
      setLoading(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) throw new Error("User not logged in");

      const res = await fetch(
        "https://pqrnxozftaccuamdaavi.supabase.co/functions/v1/pattern-matcher",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ pattern: normalizedDrawn, accuracy }),
        }
      );

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Request failed: ${res.status} ${errText}`);
      }

      const data = await res.json();

      const overlaySegments = (data.matches || []).map((m) => m.segment);
      setMatchedSegments(overlaySegments);

      console.log("Matched Segments:", overlaySegments.length);
      if (overlaySegments.length) {
        console.log("First segment sample:", overlaySegments[0]);
      }

      requestAnimationFrame(() => close());
    } catch (err) {
      console.error("Pattern matching error:", err);
      alert("Pattern matching failed. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      const ctx = canvas.getContext("2d");
      ctx.lineCap = "round";
      ctx.strokeStyle = "#60A5FA";
      ctx.lineWidth = 2;
    }
  }, [isOpen]);

  const getContext = () => {
    const canvas = canvasRef.current;
    return canvas ? canvas.getContext("2d") : null;
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
    setDrawnPoints([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
      <div className="bg-[#0e1629] text-white rounded-xl p-6 min-w-[40%] relative">
        <button
          onClick={close}
          className="absolute top-4 right-4 hover:text-red-500"
        >
          <X size={24} />
        </button>

        <h2 className="text-xl font-semibold mb-4 text-purple-400">
          Chart Pattern Finder
        </h2>

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
              className="mt-6 flex h-72 bg-[#1e2a3f] rounded-md border border-gray-600"
            />
          </div>
        </div>

        <div className="mt-6 flex flex-col items-center space-y-4">
          <div className="flex items-center space-x-2 w-full justify-center">
            <label htmlFor="accuracy" className="text-sm text-gray-300">
              Accuracy: {sliderValue.toFixed(2)}
            </label>
            <input
              id="accuracy"
              ref={accuracySliderRef}
              type="range"
              min="0.1"
              max="1"
              step="0.01"
              value={sliderValue}
              onChange={(e) => setSliderValue(parseFloat(e.target.value))}
              className="w-48"
            />
          </div>

          <div className="flex space-x-4">
            <button
              onClick={handleFindPatterns}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md disabled:opacity-50"
            >
              {loading ? "Finding..." : "Find Patterns"}
            </button>
            <button
              onClick={clearCanvas}
              className="bg-red-600 hover:bg-red-700 cursor-pointer px-4 py-2 rounded-md"
            >
              Clear Canvas
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatternFinderModal;

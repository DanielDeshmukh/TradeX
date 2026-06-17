import React, { useState, useRef, useEffect } from "react";

const TOOLS = [
  { id: "trendline", name: "Trend Line", icon: "📏", cursor: "crosshair" },
  { id: "horizontal", name: "Horizontal Line", icon: "➖", cursor: "crosshair" },
  { id: "vertical", name: "Vertical Line", icon: "┃", cursor: "crosshair" },
  { id: "fibonacci", name: "Fibonacci Retracement", icon: "🔢", cursor: "crosshair" },
  { id: "rectangle", name: "Rectangle", icon: "⬜", cursor: "crosshair" },
  { id: "parallel", name: "Parallel Channel", icon: "📐", cursor: "crosshair" },
];

const FIBONACCI_LEVELS = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1];

function DrawingTools({ onDrawingComplete, onClearDrawings }) {
  const [activeTool, setActiveTool] = useState(null);
  const [drawings, setDrawings] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawings.forEach((drawing) => {
      drawShape(ctx, drawing);
    });
  }, [drawings]);

  const drawShape = (ctx, drawing) => {
    ctx.strokeStyle = drawing.color || "#7F3DFF";
    ctx.lineWidth = 2;
    ctx.setLineDash(drawing.dashed ? [5, 5] : []);

    switch (drawing.type) {
      case "trendline":
        ctx.beginPath();
        ctx.moveTo(drawing.start.x, drawing.start.y);
        ctx.lineTo(drawing.end.x, drawing.end.y);
        ctx.stroke();
        break;
      case "horizontal":
        ctx.beginPath();
        ctx.moveTo(0, drawing.start.y);
        ctx.lineTo(ctx.canvas.width, drawing.start.y);
        ctx.stroke();
        break;
      case "vertical":
        ctx.beginPath();
        ctx.moveTo(drawing.start.x, 0);
        ctx.lineTo(drawing.start.x, ctx.canvas.height);
        ctx.stroke();
        break;
      case "fibonacci":
        const height = drawing.end.y - drawing.start.y;
        FIBONACCI_LEVELS.forEach((level) => {
          const y = drawing.start.y + height * level;
          ctx.beginPath();
          ctx.moveTo(drawing.start.x, y);
          ctx.lineTo(drawing.end.x, y);
          ctx.stroke();
          
          ctx.fillStyle = drawing.color || "#7F3DFF";
          ctx.font = "10px monospace";
          ctx.fillText(`${(level * 100).toFixed(1)}%`, drawing.start.x - 40, y + 4);
        });
        break;
      case "rectangle":
        ctx.strokeRect(
          drawing.start.x,
          drawing.start.y,
          drawing.end.x - drawing.start.x,
          drawing.end.y - drawing.start.y
        );
        break;
      case "parallel":
        const dx = drawing.end.x - drawing.start.x;
        const dy = drawing.end.y - drawing.start.y;
        ctx.beginPath();
        ctx.moveTo(drawing.start.x, drawing.start.y);
        ctx.lineTo(drawing.end.x, drawing.end.y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(drawing.start.x, drawing.start.y + 50);
        ctx.lineTo(drawing.end.x, drawing.end.y + 50);
        ctx.stroke();
        break;
    }
    ctx.setLineDash([]);
  };

  const handleCanvasMouseDown = (e) => {
    if (!activeTool) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const point = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    setStartPoint(point);
    setIsDrawing(true);
  };

  const handleCanvasMouseUp = (e) => {
    if (!isDrawing || !startPoint || !activeTool) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const endPoint = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    const newDrawing = {
      type: activeTool,
      start: startPoint,
      end: endPoint,
      color: "#7F3DFF",
      dashed: activeTool === "fibonacci",
    };

    setDrawings((prev) => [...prev, newDrawing]);
    setIsDrawing(false);
    setStartPoint(null);
    
    if (onDrawingComplete) {
      onDrawingComplete(newDrawing);
    }
  };

  const clearAll = () => {
    setDrawings([]);
    if (onClearDrawings) {
      onClearDrawings();
    }
  };

  const undoLast = () => {
    setDrawings((prev) => prev.slice(0, -1));
  };

  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-content-secondary">Drawing Tools</h3>
        <div className="flex gap-2">
          <button
            onClick={undoLast}
            className="px-2 py-1 text-xs bg-surface-input rounded hover:bg-surface transition-colors"
            disabled={drawings.length === 0}
          >
            Undo
          </button>
          <button
            onClick={clearAll}
            className="px-2 py-1 text-xs bg-bearish/20 text-bearish rounded hover:bg-bearish/30 transition-colors"
            disabled={drawings.length === 0}
          >
            Clear All
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        {TOOLS.map((tool) => (
          <button
            key={tool.id}
            onClick={() => setActiveTool(activeTool === tool.id ? null : tool.id)}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs rounded-lg transition-all ${
              activeTool === tool.id
                ? "bg-brand text-white shadow-brand"
                : "bg-surface-input text-content-secondary hover:bg-surface"
            }`}
            style={{ cursor: activeTool === tool.id ? "crosshair" : "pointer" }}
          >
            <span>{tool.icon}</span>
            <span>{tool.name}</span>
          </button>
        ))}
      </div>

      <div className="relative border border-white/10 rounded-lg overflow-hidden">
        <canvas
          ref={canvasRef}
          width={800}
          height={400}
          className="w-full bg-bg-secondary"
          style={{ cursor: activeTool ? "crosshair" : "default" }}
          onMouseDown={handleCanvasMouseDown}
          onMouseUp={handleCanvasMouseUp}
        />
        {!activeTool && (
          <div className="absolute inset-0 flex items-center justify-center text-content-muted text-sm">
            Select a drawing tool above to start
          </div>
        )}
      </div>

      {drawings.length > 0 && (
        <div className="mt-2 text-xs text-content-muted">
          {drawings.length} drawing(s) on chart
        </div>
      )}
    </div>
  );
}

export default DrawingTools;

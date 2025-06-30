import React, { useRef, useState, useEffect } from 'react';

const PatternCanvas = () => {
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [lines, setLines] = useState([]);
  const [currentLine, setCurrentLine] = useState([]);

  const startDrawing = (e) => {
    setDrawing(true);
    const rect = canvasRef.current.getBoundingClientRect();
    setCurrentLine([[e.clientX - rect.left, e.clientY - rect.top]]);
  };

  const draw = (e) => {
    if (!drawing) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const newPoint = [e.clientX - rect.left, e.clientY - rect.top];
    setCurrentLine((prev) => [...prev, newPoint]);
  };

  const endDrawing = () => {
    if (drawing) {
      setDrawing(false);
      setLines((prev) => [...prev, currentLine]);
      setCurrentLine([]);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#60A5FA';
    ctx.lineWidth = 2;
    lines.forEach((line) => {
      ctx.beginPath();
      line.forEach(([x, y], idx) => {
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    });

    if (currentLine.length > 0) {
      ctx.beginPath();
      currentLine.forEach(([x, y], idx) => {
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    }
  }, [lines, currentLine]);

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={300}
      className="w-full h-72 bg-[#f5f5f2] rounded-md border border-gray-600"
      onMouseDown={startDrawing}
      onMouseMove={draw}
      onMouseUp={endDrawing}
      onMouseLeave={endDrawing}
    />
  );
};

export default PatternCanvas;
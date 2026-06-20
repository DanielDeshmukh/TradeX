import React, { useState } from "react";

const TIMEFRAMES = [
  { value: "1m", label: "1 Min" },
  { value: "5m", label: "5 Min" },
  { value: "15m", label: "15 Min" },
  { value: "30m", label: "30 Min" },
  { value: "1h", label: "1 Hour" },
  { value: "4h", label: "4 Hour" },
  { value: "1D", label: "Daily" },
  { value: "1W", label: "Weekly" },
];

function MultiTimeframePanel({ onSelectTimeframe }) {
  const [selectedTimeframes, setSelectedTimeframes] = useState(["1m", "5m", "15m", "1D"]);
  const [activeTimeframe, setActiveTimeframe] = useState("1m");

  const handleTimeframeClick = (tf) => {
    setActiveTimeframe(tf);
    if (onSelectTimeframe) {
      onSelectTimeframe(tf);
    }
  };

  const toggleTimeframe = (tf) => {
    setSelectedTimeframes((prev) =>
      prev.includes(tf) ? prev.filter((t) => t !== tf) : [...prev, tf].slice(0, 6)
    );
  };

  return (
    <div className="glass-card p-4">
      <h3 className="text-sm font-semibold mb-3 text-content-secondary">Multi-Timeframe Analysis</h3>
      
      <div className="flex flex-wrap gap-2 mb-3">
        {TIMEFRAMES.map((tf) => (
          <button
            key={tf.value}
            onClick={() => handleTimeframeClick(tf.value)}
            className={`px-3 py-1.5 text-xs rounded-lg transition-all ${
              activeTimeframe === tf.value
                ? "bg-brand text-white shadow-brand"
                : "bg-surface-input text-content-secondary hover:bg-surface"
            }`}
          >
            {tf.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {selectedTimeframes.map((tf) => (
          <div
            key={tf}
            className={`p-2 rounded-lg border text-center cursor-pointer transition-all ${
              activeTimeframe === tf
                ? "border-brand bg-brand/10"
                : "border-white/10 hover:border-brand/50"
            }`}
            onClick={() => handleTimeframeClick(tf)}
          >
            <div className="text-xs text-content-secondary">
              {TIMEFRAMES.find((t) => t.value === tf)?.label || tf}
            </div>
            <div className="text-sm font-medium mt-1">--</div>
          </div>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-1">
        {TIMEFRAMES.map((tf) => (
          <button
            key={tf.value}
            onClick={() => toggleTimeframe(tf.value)}
            className={`px-2 py-1 text-xs rounded transition-all ${
              selectedTimeframes.includes(tf.value)
                ? "bg-brand/20 text-brand"
                : "bg-surface-input text-content-muted hover:text-content-secondary"
            }`}
          >
            {tf.value}
          </button>
        ))}
      </div>
    </div>
  );
}

export default MultiTimeframePanel;

import React, { useState } from 'react';
import Button from './ui/Button';

const TIMEFRAMES = [
  { label: '1m', value: '1' },
  { label: '5m', value: '5' },
  { label: '15m', value: '15' },
  { label: '30m', value: '30' },
  { label: '1h', value: '60' },
  { label: 'D', value: 'D' },
];

const INDICATOR_OPTIONS = [
  { key: 'sma20', label: 'SMA 20', color: '#f59e0b' },
  { key: 'ema12', label: 'EMA 12', color: '#8b5cf6' },
  { key: 'bollinger', label: 'Bollinger Bands', color: '#8b5cf6' },
  { key: 'vwap', label: 'VWAP', color: '#06b6d4' },
];

const CHART_TYPES = [
  { label: 'Candle', value: 'candlestick' },
  { label: 'Line', value: 'line' },
  { label: 'Area', value: 'area' },
];

export default function ChartControls({
  chartType,
  onChartTypeChange,
  timeframe,
  onTimeframeChange,
  indicators,
  onIndicatorToggle,
}) {
  const [showIndicators, setShowIndicators] = useState(false);

  return (
    <div className="flex items-center gap-4 flex-wrap">
      {/* Chart type selector */}
      <div className="flex items-center gap-1 bg-surface-secondary rounded-lg p-1">
        {CHART_TYPES.map((ct) => (
          <button
            key={ct.value}
            onClick={() => onChartTypeChange(ct.value)}
            className={`
              px-3 py-1 text-xs font-medium rounded-md transition-colors
              ${chartType === ct.value
                ? 'bg-brand text-white'
                : 'text-content-secondary hover:text-content'
              }
            `}
          >
            {ct.label}
          </button>
        ))}
      </div>

      {/* Timeframe selector */}
      <div className="flex items-center gap-1 bg-surface-secondary rounded-lg p-1">
        {TIMEFRAMES.map((tf) => (
          <button
            key={tf.value}
            onClick={() => onTimeframeChange(tf.value)}
            className={`
              px-2 py-1 text-xs font-medium rounded-md transition-colors
              ${timeframe === tf.value
                ? 'bg-brand text-white'
                : 'text-content-secondary hover:text-content'
              }
            `}
          >
            {tf.label}
          </button>
        ))}
      </div>

      {/* Indicator toggles */}
      <div className="relative">
        <button
          onClick={() => setShowIndicators(!showIndicators)}
          className="px-3 py-1 text-xs font-medium bg-surface-secondary rounded-lg text-content-secondary hover:text-content transition-colors"
        >
          Indicators {Object.values(indicators).some(Boolean) ? '(active)' : ''}
        </button>
        {showIndicators && (
          <div className="absolute top-full left-0 mt-1 bg-surface-secondary border border-border rounded-lg p-2 z-20 min-w-[160px] shadow-lg">
            {INDICATOR_OPTIONS.map((ind) => (
              <label
                key={ind.key}
                className="flex items-center gap-2 px-2 py-1.5 hover:bg-surface rounded cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={!!indicators[ind.key]}
                  onChange={() => onIndicatorToggle(ind.key)}
                  className="w-3 h-3 accent-brand"
                />
                <span className="flex items-center gap-1.5 text-sm text-content">
                  <span
                    className="w-3 h-0.5 rounded-full"
                    style={{ backgroundColor: ind.color }}
                  />
                  {ind.label}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import Badge from './ui/Badge';

const SIGNAL_CONFIG = {
  buy: {
    color: 'bg-bullish/20 text-bullish border-bullish/30',
    icon: '↑',
    label: 'BUY',
  },
  sell: {
    color: 'bg-bearish/20 text-bearish border-bearish/30',
    icon: '↓',
    label: 'SELL',
  },
  hold: {
    color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    icon: '—',
    label: 'HOLD',
  },
};

export default function SignalBadge({ signal, confidence, size = 'md' }) {
  const [animate, setAnimate] = useState(false);
  const config = SIGNAL_CONFIG[signal] || SIGNAL_CONFIG.hold;

  useEffect(() => {
    setAnimate(true);
    const t = setTimeout(() => setAnimate(false), 1000);
    return () => clearTimeout(t);
  }, [signal]);

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  };

  return (
    <div className="relative inline-flex items-center gap-1.5">
      <span
        className={`
          inline-flex items-center gap-1 rounded-full border font-medium
          ${config.color} ${sizeClasses[size]}
          ${animate ? 'scale-110' : 'scale-100'}
          transition-transform duration-300
        `}
      >
        <span className={`${animate ? 'animate-pulse' : ''}`}>{config.icon}</span>
        {config.label}
      </span>
      {confidence > 0 && (
        <span className="text-content-secondary text-xs">
          {Math.round(confidence * 100)}%
        </span>
      )}
    </div>
  );
}

export function SignalPanel({ signal, securityId }) {
  if (!signal) return null;

  return (
    <div className="bg-surface-secondary rounded-xl p-4 border border-border">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-content font-semibold">AI Signal</h3>
        <span className="text-content-tertiary text-xs">{signal.model_version}</span>
      </div>
      <div className="flex items-center gap-3 mb-3">
        <SignalBadge
          signal={signal.signal}
          confidence={signal.confidence}
          size="lg"
        />
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-content-secondary">Security</span>
          <span className="text-content">{securityId}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-content-secondary">Confidence</span>
          <span className="text-content">{Math.round(signal.confidence * 100)}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-content-secondary">Generated</span>
          <span className="text-content">
            {new Date(signal.timestamp).toLocaleTimeString()}
          </span>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-border">
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full"
            style={{
              backgroundColor:
                signal.signal === 'buy'
                  ? '#22c55e'
                  : signal.signal === 'sell'
                  ? '#ef4444'
                  : '#eab308',
            }}
          />
          <span className="text-content-secondary text-xs">
            {signal.signal === 'buy' && 'Consider buying — model detects upward momentum'}
            {signal.signal === 'sell' && 'Consider selling — model detects downward pressure'}
            {signal.signal === 'hold' && 'Hold current position — no clear direction'}
          </span>
        </div>
      </div>
    </div>
  );
}

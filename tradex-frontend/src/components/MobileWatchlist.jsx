import React from 'react';
import SignalBadge from './SignalBadge';

export default function MobileWatchlist({ items = [], onSelect, onRemove, signals = {} }) {
  if (!items.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-content-secondary">
        <svg className="w-12 h-12 mb-3 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
        <p className="text-sm">Your watchlist is empty</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item) => {
        const signal = signals[item.security_id];
        return (
          <div
            key={item.security_id}
            className="bg-surface-secondary rounded-xl p-3 border border-border active:bg-surface-secondary/80 transition-colors"
          >
            <div className="flex items-center justify-between">
              <button
                onClick={() => onSelect?.(item)}
                className="flex-1 text-left"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-content font-semibold text-sm">{item.name || item.security_id}</span>
                  {signal && (
                    <SignalBadge
                      signal={signal.signal}
                      confidence={signal.confidence}
                      size="sm"
                    />
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-content-secondary">{item.exchange}</span>
                  <span className="text-content font-medium">₹{item.last_price?.toFixed(2) || '--'}</span>
                  <span className={item.change >= 0 ? 'text-green-400' : 'text-red-400'}>
                    {item.change >= 0 ? '+' : ''}{item.change?.toFixed(2) || '0.00'}%
                  </span>
                </div>
              </button>
              {onRemove && (
                <button
                  onClick={() => onRemove(item.security_id)}
                  className="p-2 text-content-tertiary hover:text-red-400 transition-colors"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

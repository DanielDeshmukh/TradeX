import React from "react";

function toIST(date) {
  return new Date(date).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

function formatPrice(val) {
  if (val == null || isNaN(val)) return "--";
  return `₹${Number(val).toFixed(2)}`;
}

function formatVolume(val) {
  if (val == null || isNaN(val)) return "--";
  const n = Number(val);
  if (n >= 1e7) return (n / 1e7).toFixed(2) + "Cr";
  if (n >= 1e6) return (n / 1e6).toFixed(2) + "M";
  if (n >= 1e5) return (n / 1e5).toFixed(2) + "L";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return n.toString();
}

export default function CrosshairTooltip({ data, indicatorValues, visible }) {
  if (!visible || !data) return null;

  const {
    open,
    high,
    low,
    close,
    volume,
    time,
    x,
    y,
  } = data;

  const isBullish = close >= open;

  return (
    <div
      className="fixed z-50 pointer-events-none bg-surface-elevated/95 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl px-4 py-3 min-w-[200px]"
      style={{
        left: Math.min(x + 16, window.innerWidth - 260),
        top: Math.max(y - 120, 8),
      }}
    >
      <div className="text-[10px] text-content-muted mb-2 font-mono">
        {time ? toIST(time) : "--:--:--"} IST
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
        <span className="text-content-secondary">Open</span>
        <span className="text-content text-right font-mono">{formatPrice(open)}</span>

        <span className="text-content-secondary">High</span>
        <span className="text-content text-right font-mono">{formatPrice(high)}</span>

        <span className="text-content-secondary">Low</span>
        <span className="text-content text-right font-mono">{formatPrice(low)}</span>

        <span className="text-content-secondary">Close</span>
        <span className={`text-right font-mono font-medium ${isBullish ? "text-bullish" : "text-bearish"}`}>
          {formatPrice(close)}
        </span>

        <span className="text-content-secondary">Volume</span>
        <span className="text-content text-right font-mono">{formatVolume(volume)}</span>
      </div>

      {indicatorValues && Object.keys(indicatorValues).length > 0 && (
        <div className="mt-2 pt-2 border-t border-white/5">
          <div className="text-[10px] text-content-muted uppercase tracking-wider mb-1">Indicators</div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
            {Object.entries(indicatorValues).map(([key, val]) => (
              <React.Fragment key={key}>
                <span className="text-content-secondary">{key}</span>
                <span className="text-brand text-right font-mono">
                  {typeof val === "number" ? val.toFixed(2) : val}
                </span>
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

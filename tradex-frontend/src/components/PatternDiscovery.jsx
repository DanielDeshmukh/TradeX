import { useState, useEffect, useCallback } from "react";
import { FiTrendingUp, FiTrendingDown, FiMinimize2, FiRefreshCw } from "react-icons/fi";
import clsx from "clsx";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const PATTERN_ICONS = {
  uptrend: FiTrendingUp,
  downtrend: FiTrendingDown,
  "higher-highs-lows": FiTrendingUp,
  "lower-highs-lows": FiTrendingDown,
  consolidation: FiMinimize2,
};

const PATTERN_COLORS = {
  uptrend: "text-bullish",
  downtrend: "text-bearish",
  "higher-highs-lows": "text-bullish",
  "lower-highs-lows": "text-bearish",
  consolidation: "text-yellow-400",
};

export default function PatternDiscovery({ onSelectSymbol }) {
  const [patterns, setPatterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const fetchPatterns = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "30" });
      if (filter !== "all") params.set("pattern_type", filter);
      const res = await fetch(`${API_URL}/api/patterns?${params}`);
      if (!res.ok) throw new Error(`API ${res.status}`);
      const data = await res.json();
      setPatterns(data.patterns || []);
    } catch (err) {
      console.error("Pattern fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchPatterns();
  }, [fetchPatterns]);

  const grouped = patterns.reduce((acc, p) => {
    if (!acc[p.security_id]) acc[p.security_id] = [];
    acc[p.security_id].push(p);
    return acc;
  }, {});

  return (
    <div className="bg-[#12141C] border border-[#6C4FE0]/20 rounded-xl shadow-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#6C4FE0]/10">
        <h3 className="text-sm font-bold text-white tracking-wide">Pattern Discovery</h3>
        <div className="flex items-center gap-2">
          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="bg-[#1A1D25] border border-[#6C4FE0]/20 rounded px-2 py-1 text-[10px] text-white"
          >
            <option value="all">All</option>
            <option value="uptrend">Uptrend</option>
            <option value="downtrend">Downtrend</option>
            <option value="consolidation">Consolidation</option>
          </select>
          <button
            onClick={fetchPatterns}
            disabled={loading}
            className="p-1 rounded hover:bg-[#6C4FE0]/20 disabled:opacity-50"
          >
            <FiRefreshCw className={clsx("w-3 h-3 text-content-secondary", loading && "animate-spin")} />
          </button>
        </div>
      </div>

      <div className="max-h-[400px] overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-24 text-content-secondary text-xs">
            Scanning patterns...
          </div>
        ) : patterns.length === 0 ? (
          <div className="flex items-center justify-center h-24 text-content-muted text-xs">
            No patterns detected
          </div>
        ) : (
          Object.entries(grouped).map(([symbol, pats]) => (
            <div key={symbol} className="border-b border-[#6C4FE0]/5">
              <button
                onClick={() => onSelectSymbol?.(symbol)}
                className="w-full text-left px-4 py-2 hover:bg-[#6C4FE0]/5 transition-colors"
              >
                <span className="text-xs font-semibold text-white">{symbol}</span>
              </button>
              <div className="px-4 pb-2 space-y-1">
                {pats.map((p, i) => {
                  const Icon = PATTERN_ICONS[p.pattern_type] || FiMinimize2;
                  return (
                    <div key={i} className="flex items-center gap-2 text-[10px]">
                      <Icon className={clsx("w-3 h-3", PATTERN_COLORS[p.pattern_type] || "text-content-secondary")} />
                      <span className="text-content-secondary">{p.description}</span>
                      <span className="ml-auto text-content-muted">{Math.round(p.confidence * 100)}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const COMPARISON_COLORS = [
  "#7F3DFF",
  "#4ade80",
  "#f59e0b",
  "#ef4444",
  "#3b82f6",
  "#ec4899",
];

function ChartComparison({ onRemoveSymbol }) {
  const [symbols, setSymbols] = useState([]);
  const [compareSymbols, setCompareSymbols] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    const fetchSymbols = async () => {
      try {
        const res = await fetch(`${API_URL}/api/symbols`);
        const data = await res.json();
        setSymbols(data.symbols || []);
      } catch (err) {
        console.error("Failed to fetch symbols:", err);
      }
    };
    fetchSymbols();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(() => {
      const results = symbols.filter(
        (s) =>
          s.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.security_id?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(results.slice(0, 5));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, symbols]);

  const addSymbol = (symbol) => {
    if (compareSymbols.find((s) => s.security_id === symbol.security_id)) return;
    if (compareSymbols.length >= 5) return;
    
    setCompareSymbols((prev) => [
      ...prev,
      {
        ...symbol,
        color: COMPARISON_COLORS[prev.length % COMPARISON_COLORS.length],
      },
    ]);
    setSearchQuery("");
    setSearchResults([]);
  };

  const removeSymbol = (securityId) => {
    setCompareSymbols((prev) => prev.filter((s) => s.security_id !== securityId));
    if (onRemoveSymbol) {
      onRemoveSymbol(securityId);
    }
  };

  return (
    <div className="glass-card p-4">
      <h3 className="text-sm font-semibold mb-3 text-content-secondary">Compare Symbols</h3>

      <div className="relative mb-3">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search symbol to compare..."
          className="w-full bg-surface-input text-white px-3 py-2 rounded-lg border border-white/10 
                     focus:border-brand focus:outline-none text-sm"
        />
        {searchResults.length > 0 && (
          <ul className="absolute z-10 w-full mt-1 bg-surface-input border border-white/10 rounded-lg shadow-xl max-h-40 overflow-y-auto">
            {searchResults.map((s) => (
              <li
                key={s.security_id}
                onClick={() => addSymbol(s)}
                className="px-3 py-2 hover:bg-brand/20 cursor-pointer text-sm flex justify-between"
              >
                <span>{s.display_name}</span>
                <span className="text-content-muted text-xs">{s.security_id}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {compareSymbols.length > 0 ? (
        <div className="space-y-2">
          {compareSymbols.map((symbol) => (
            <div
              key={symbol.security_id}
              className="flex items-center justify-between p-2 rounded-lg border border-white/10"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: symbol.color }}
                />
                <span className="text-sm">{symbol.display_name}</span>
                <span className="text-xs text-content-muted">{symbol.security_id}</span>
              </div>
              <button
                onClick={() => removeSymbol(symbol.security_id)}
                className="text-bearish hover:text-bearish-muted text-sm"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4 text-content-muted text-sm">
          Add symbols to compare performance
        </div>
      )}

      {compareSymbols.length >= 5 && (
        <div className="mt-2 text-xs text-content-muted">
          Maximum 5 symbols for comparison
        </div>
      )}
    </div>
  );
}

export default ChartComparison;

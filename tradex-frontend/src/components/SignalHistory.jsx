import { useState, useEffect, useCallback } from "react";
import { FiFilter, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import SignalBadge from "./SignalBadge";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export default function SignalHistory({ onClose }) {
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, total_pages: 0 });
  const [filters, setFilters] = useState({
    symbol: "",
    signal_type: "",
    start_date: "",
    end_date: "",
  });

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", page);
      params.set("page_size", "20");
      if (filters.symbol) params.set("symbol", filters.symbol);
      if (filters.signal_type) params.set("signal_type", filters.signal_type);
      if (filters.start_date) params.set("start_date", filters.start_date);
      if (filters.end_date) params.set("end_date", filters.end_date);

      const res = await fetch(`${API_URL}/api/signals/history?${params}`);
      if (!res.ok) throw new Error(`API ${res.status}`);
      const data = await res.json();
      setSignals(data.signals || []);
      setPagination(data.pagination);
    } catch (err) {
      console.error("Signal history fetch error:", err);
      setSignals([]);
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  return (
    <div className="bg-[#12141C] border border-[#6C4FE0]/20 rounded-xl shadow-2xl p-5 w-[520px] max-h-[600px] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-white tracking-wide">Signal History</h3>
        <button onClick={onClose} className="text-content-secondary hover:text-white text-sm">✕</button>
      </div>

      <div className="flex gap-2 mb-3">
        <select
          value={filters.symbol}
          onChange={e => handleFilterChange("symbol", e.target.value)}
          className="bg-[#1A1D25] border border-[#6C4FE0]/20 rounded px-2 py-1 text-xs text-white flex-1"
        >
          <option value="">All Symbols</option>
          <option value="RELIANCE">RELIANCE</option>
          <option value="TCS">TCS</option>
          <option value="INFY">INFY</option>
          <option value="HDFCBANK">HDFCBANK</option>
          <option value="ICICIBANK">ICICIBANK</option>
        </select>
        <select
          value={filters.signal_type}
          onChange={e => handleFilterChange("signal_type", e.target.value)}
          className="bg-[#1A1D25] border border-[#6C4FE0]/20 rounded px-2 py-1 text-xs text-white"
        >
          <option value="">All Signals</option>
          <option value="buy">Buy</option>
          <option value="sell">Sell</option>
          <option value="hold">Hold</option>
        </select>
        <input
          type="date"
          value={filters.start_date}
          onChange={e => handleFilterChange("start_date", e.target.value)}
          className="bg-[#1A1D25] border border-[#6C4FE0]/20 rounded px-2 py-1 text-xs text-white"
        />
        <input
          type="date"
          value={filters.end_date}
          onChange={e => handleFilterChange("end_date", e.target.value)}
          className="bg-[#1A1D25] border border-[#6C4FE0]/20 rounded px-2 py-1 text-xs text-white"
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-32 text-content-secondary text-sm">
            Loading...
          </div>
        ) : signals.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-content-muted text-sm">
            No signals found
          </div>
        ) : (
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-[#12141C]">
              <tr className="text-content-secondary border-b border-[#6C4FE0]/10">
                <th className="text-left py-2 px-2">Symbol</th>
                <th className="text-center py-2 px-2">Signal</th>
                <th className="text-right py-2 px-2">Confidence</th>
                <th className="text-right py-2 px-2">Time</th>
              </tr>
            </thead>
            <tbody>
              {signals.map((s, i) => (
                <tr key={i} className="border-b border-[#6C4FE0]/5 hover:bg-[#1A1D25]/50">
                  <td className="py-2 px-2 text-white font-medium">{s.security_id}</td>
                  <td className="py-2 px-2 text-center">
                    <SignalBadge signal={s.signal} confidence={s.confidence} size="sm" />
                  </td>
                  <td className="py-2 px-2 text-right text-content-secondary">
                    {Math.round(s.confidence * 100)}%
                  </td>
                  <td className="py-2 px-2 text-right text-content-muted">
                    {new Date(s.created_at).toLocaleDateString()}{" "}
                    {new Date(s.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {pagination.total_pages > 1 && (
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#6C4FE0]/10">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-1 rounded hover:bg-[#6C4FE0]/20 disabled:opacity-30"
          >
            <FiChevronLeft className="w-4 h-4 text-white" />
          </button>
          <span className="text-xs text-content-secondary">
            Page {page} of {pagination.total_pages} ({pagination.total} total)
          </span>
          <button
            onClick={() => setPage(p => Math.min(pagination.total_pages, p + 1))}
            disabled={page === pagination.total_pages}
            className="p-1 rounded hover:bg-[#6C4FE0]/20 disabled:opacity-30"
          >
            <FiChevronRight className="w-4 h-4 text-white" />
          </button>
        </div>
      )}
    </div>
  );
}

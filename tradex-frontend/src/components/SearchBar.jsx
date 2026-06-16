import { useState, useEffect, useRef, useCallback } from "react";
import { FiSearch, FiX } from "react-icons/fi";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export default function SearchBar({ onSelect }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  const search = useCallback(async (q) => {
    if (!q || q.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/search?q=${encodeURIComponent(q)}&limit=8`);
      if (!res.ok) throw new Error(`API ${res.status}`);
      const data = await res.json();
      setResults(data.results || []);
      setOpen(true);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(query), 300);
    return () => clearTimeout(debounceRef.current);
  }, [query, search]);

  const handleSelect = (result) => {
    onSelect?.(result);
    setQuery("");
    setResults([]);
    setOpen(false);
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="flex items-center bg-[#1A1D25] border border-[#6C4FE0]/20 rounded-lg px-3 py-2 focus-within:border-[#6C4FE0]/50 transition-colors">
        <FiSearch className="w-4 h-4 text-content-secondary mr-2 shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Search symbols (e.g., RELIANCE, TCS)..."
          className="flex-1 bg-transparent text-sm text-white placeholder:text-content-muted outline-none"
        />
        {query && (
          <button onClick={() => { setQuery(""); setResults([]); setOpen(false); }}>
            <FiX className="w-4 h-4 text-content-secondary hover:text-white" />
          </button>
        )}
        {loading && (
          <div className="ml-2 w-4 h-4 border-2 border-[#6C4FE0] border-t-transparent rounded-full animate-spin" />
        )}
      </div>

      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-[#1A1D25] border border-[#6C4FE0]/20 rounded-lg shadow-xl z-50 overflow-hidden">
          {results.map((r, i) => (
            <button
              key={i}
              onClick={() => handleSelect(r)}
              className="w-full flex items-center justify-between px-3 py-2 hover:bg-[#6C4FE0]/10 transition-colors text-left"
            >
              <div>
                <span className="text-sm font-medium text-white">{r.security_id}</span>
                <span className="text-xs text-content-secondary ml-2">{r.exchange_segment}</span>
              </div>
              <span className="text-[10px] text-content-muted px-1.5 py-0.5 bg-[#0B0E15] rounded">
                {r.instrument_type}
              </span>
            </button>
          ))}
        </div>
      )}

      {open && query.length >= 2 && results.length === 0 && !loading && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-[#1A1D25] border border-[#6C4FE0]/20 rounded-lg shadow-xl z-50 p-3 text-center text-content-muted text-sm">
          No results for &quot;{query}&quot;
        </div>
      )}
    </div>
  );
}

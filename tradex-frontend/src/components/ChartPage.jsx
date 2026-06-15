// src/pages/ChartPage.jsx
import { useSearchParams } from "react-router-dom";
import { useEffect, useState, useCallback, useMemo } from "react";
import ChartContainer from "../components/ChartContainer";

const EXCHANGE_OPTIONS = [
  { label: "NSE", value: "NSE_EQ" },
  { label: "BSE", value: "BSE_EQ" },
];

function ChartPage() {
  const [searchParams] = useSearchParams();

  // Query params
  const securityId = searchParams.get("securityId");
  const exchangeSegment = searchParams.get("exchangeSegment") || "NSE_EQ";
  const displayName = searchParams.get("displayName") || securityId;

  const [exchange, setExchange] = useState(exchangeSegment);
  const [ohlcvData, setOhlcvData] = useState([]);
  const [loading, setLoading] = useState(true);

  const selectedAsset = useMemo(() => ({
    securityId,
    exchangeSegment: exchange,
    name: displayName,
    instrumentType: "EQUITY",
  }), [securityId, exchange, displayName]);

  const fetchOHLCV = useCallback(async (asset) => {
    if (!asset?.securityId || !asset?.exchangeSegment) return [];
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/live_feed`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          security_id: asset.securityId,
          exchange: asset.exchangeSegment,
          instrument_type: asset.instrumentType,
          symbolName: asset.name,
        }),
      });
      if (!res.ok) throw new Error(`Backend returned ${res.status}`);
      const data = await res.json();
      return data?.data?.length ? data.data : [];
    } catch (err) {
      console.error("fetchOHLCV Error:", err);
      return [];
    }
  }, []);

  useEffect(() => {
    if (!securityId || !exchange) return;

    let active = true;
    setLoading(true);
    setOhlcvData([]);

    const loadData = async () => {
      const data = await fetchOHLCV(selectedAsset);
      if (active) {
        setOhlcvData(data);
        setLoading(false);
      }
    };

    loadData();
    const interval = setInterval(loadData, 3000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [securityId, exchange, fetchOHLCV, selectedAsset]);

  const handleExchangeChange = (e) => setExchange(e.target.value);

  const lastCandle = ohlcvData.length ? ohlcvData[ohlcvData.length - 1] : null;

  const getColor = (type) => {
    if (!lastCandle) return "text-content-secondary";
    if (type === "close") return lastCandle.close >= lastCandle.open ? "text-bullish" : "text-bearish";
    return "text-content-secondary";
  };

  if (!securityId) return (
    <div className="flex items-center justify-center min-h-screen text-content-secondary">
      <p>No security selected. Go back to the main page.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0B0E15] text-white flex flex-col">
      {/* Header */}
      <div className="p-4 flex flex-col md:flex-row md:items-center justify-between border-b border-[#1E2233] bg-bg-secondary gap-3">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold tracking-wide">{displayName}</h1>
          {lastCandle && (
            <div className="flex flex-wrap gap-2 mt-1 text-xs font-mono">
              <span className={getColor("open")}>O: {lastCandle.open.toFixed(2)}</span>
              <span className={getColor("high")}>H: {lastCandle.high.toFixed(2)}</span>
              <span className={getColor("low")}>L: {lastCandle.low.toFixed(2)}</span>
              <span className={getColor("close")}>C: {lastCandle.close.toFixed(2)}</span>
              <span className="text-content-secondary">V: {lastCandle.volume.toLocaleString()}</span>
            </div>
          )}
        </div>
        <select
          value={exchange}
          onChange={handleExchangeChange}
          className="bg-surface border border-white/10 text-sm text-content-secondary px-3 py-1 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-hover"
        >
          {EXCHANGE_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Chart Container */}
      {loading ? (
        <div className="flex flex-col items-center justify-center mt-6">
          <div className="animate-pulse">
            <div className="h-8 w-32 bg-gray-700 rounded mb-4"></div>
            <div className="h-4 w-48 bg-gray-800 rounded"></div>
          </div>
          <p className="text-content-secondary mt-4 text-sm">Loading {displayName}...</p>
        </div>
      ) : (
        <div className="flex-1 overflow-hidden">
          <ChartContainer key={securityId} selectedAsset={selectedAsset} />
        </div>
      )}
    </div>
  );
}

export default ChartPage;

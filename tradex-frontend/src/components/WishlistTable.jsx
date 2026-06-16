// src/components/WishlistTable.jsx
import React, { useEffect, useState, useCallback, useRef } from "react";
import supabase from "../lib/supabase";
import SignalBadge from "./SignalBadge";
import { useSignals } from "../hooks/useSignals";

const AssetRow = React.memo(({ asset, flash, signal }) => {
  const handleClick = () => {
    const url = `/chart?securityId=${encodeURIComponent(asset.securityId)}&exchangeSegment=${encodeURIComponent(asset.exchangeSegment)}&displayName=${encodeURIComponent(asset.name)}`;
    window.open(url, "_blank");
  };

  return (
    <tr
      className="hover:bg-surface transition-colors cursor-pointer border-b border-[#6C4FE0]/10"
      onClick={handleClick}
    >
      <td className="px-4 py-3 font-medium text-content">{asset.name}</td>
      <td className="px-4 py-3 text-content-secondary text-xs">{asset.exchangeSegment}</td>
      <td className="px-4 py-3 text-content-secondary text-xs">{asset.instrumentType}</td>
      <td className={`px-4 py-3 text-right font-mono transition-colors duration-500 ${
        flash[asset.securityId] === "up"
          ? "bg-bullish/10 text-bullish-muted"
          : flash[asset.securityId] === "down"
          ? "bg-bearish/10 text-bearish-muted"
          : "text-content-secondary"
      }`}>
        {asset.price > 0 ? `₹${asset.price.toFixed(2)}` : <span className="text-content-muted text-xs">Loading...</span>}
      </td>
      <td className={`px-4 py-3 text-right font-medium font-mono ${asset.change >= 0 ? "text-bullish" : "text-bearish"}`}>
        {asset.price > 0 ? `${asset.change >= 0 ? "+" : ""}${asset.change.toFixed(2)}%` : <span className="text-content-muted text-xs">-</span>}
      </td>
      <td className="px-4 py-3 text-right text-content-muted text-xs font-mono">
        {asset.volume > 0 ? formatVolume(asset.volume) : <span className="text-content-muted">-</span>}
      </td>
      <td className="px-4 py-3 text-center">
        {signal && (
          <SignalBadge signal={signal.signal} confidence={signal.confidence} size="sm" />
        )}
      </td>
    </tr>
  );
});

function formatVolume(vol) {
  const n = Number(vol);
  if (n >= 1e7) return (n / 1e7).toFixed(2) + "Cr";
  if (n >= 1e6) return (n / 1e6).toFixed(2) + "M";
  if (n >= 1e5) return (n / 1e5).toFixed(2) + "L";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return n.toString();
}

function WishlistTable({ userId }) {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [flash, setFlash] = useState({});
  const [error, setError] = useState(null);
  const assetsRef = useRef({});
  const { signals } = useSignals();

  const triggerFlash = useCallback((securityId, oldPrice, newPrice) => {
    if (!oldPrice || oldPrice === newPrice) return;
    setFlash(prev => ({ ...prev, [securityId]: newPrice > oldPrice ? "up" : "down" }));
    setTimeout(() => setFlash(prev => ({ ...prev, [securityId]: null })), 800);
  }, []);

  const fetchLiveQuotes = useCallback(async (symbols) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;

      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/getQuote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ symbols }),
      });

      if (!res.ok) return null;
      return await res.json();
    } catch (err) {
      console.error("Error fetching quotes:", err);
      return null;
    }
  }, []);

  const fetchWatchlist = useCallback(async () => {
    if (!userId) {
      setAssets([]);
      setLoading(false);
      return;
    }

    try {
      const { data: wishlistData, error: dbError } = await supabase
        .from("wishlist")
        .select(`security_id, exchange_segment, instrument_type, symbol_name, display_name`)
        .eq("user_id", userId)
        .order("created_at", { ascending: true });

      if (dbError) throw dbError;

      const watchlist = wishlistData?.map(w => ({
        name: w.display_name || w.symbol_name || w.security_id,
        securityId: String(w.security_id),
        exchangeSegment: w.exchange_segment || "NSE_EQ",
        instrumentType: w.instrument_type || "EQ",
        price: assetsRef.current[w.security_id]?.price || 0,
        change: assetsRef.current[w.security_id]?.change || 0,
        volume: assetsRef.current[w.security_id]?.volume || 0,
      })) || [];

      const quotes = await fetchLiveQuotes(watchlist.map(w => ({ securityId: w.securityId, exchangeSegment: w.exchangeSegment })));

      const updatedAssets = watchlist.map(w => {
        const quoteResult = quotes?.find(q => String(q.securityId) === String(w.securityId));
        if (!quoteResult?.data?.data) return w;

        const q = quoteResult.data.data;
        const newPrice = q.last_price || q.LTP || q.ltp || 0;
        const open = q.open || q.open_price || 0;
        const volume = q.volume || q.vol || 0;
        const change = open ? ((newPrice - open) / open) * 100 : 0;

        const oldPrice = assetsRef.current[w.securityId]?.price || 0;
        if (oldPrice && newPrice !== oldPrice) triggerFlash(w.securityId, oldPrice, newPrice);

        const updated = { ...w, price: newPrice, change, volume };
        assetsRef.current[w.securityId] = updated;
        return updated;
      });

      setAssets(updatedAssets);
      setError(null);
    } catch (err) {
      console.error("Error fetching watchlist:", err);
      setError("Failed to update watchlist");
    } finally {
      setLoading(false);
    }
  }, [userId, fetchLiveQuotes, triggerFlash]);

  useEffect(() => {
    fetchWatchlist();
    const interval = setInterval(fetchWatchlist, 5000);
    return () => clearInterval(interval);
  }, [fetchWatchlist]);

  if (loading) return (
    <div className="w-full bg-bg-secondary/80 border border-[#6C4FE0]/20 rounded-lg shadow-lg p-8 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6C4FE0]"></div>
      <span className="ml-3 text-content-secondary">Loading watchlist...</span>
    </div>
  );

  if (!assets.length) return (
    <div className="w-full bg-bg-secondary/80 border border-[#6C4FE0]/20 rounded-lg shadow-lg p-8 text-center text-content-secondary">
      <p className="text-sm">No assets in watchlist</p>
      <p className="text-xs mt-2 text-content-muted">Add securities to start tracking</p>
    </div>
  );

  return (
    <div className="w-full bg-bg-secondary/80 border border-[#6C4FE0]/20 rounded-lg shadow-lg">
      <div className="px-4 py-3 border-b border-[#6C4FE0]/20 bg-[#12141C]/70 flex items-center justify-between">
        <h2 className="text-sm text-[#C1C1FF] uppercase tracking-wide font-semibold">Market Watch</h2>
        {error ? <span className="text-xs text-bearish">{error}</span> : <span className="text-xs text-content-muted font-mono">{assets.length} {assets.length === 1 ? "asset" : "assets"}</span>}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-content-secondary text-xs uppercase tracking-wider bg-[#141721]">
              <th className="text-left px-4 py-2 font-medium">Symbol</th>
              <th className="text-left px-4 py-2 font-medium">Market</th>
              <th className="text-left px-4 py-2 font-medium">Type</th>
              <th className="text-right px-4 py-2 font-medium">Price</th>
              <th className="text-right px-4 py-2 font-medium">Change</th>
              <th className="text-right px-4 py-2 font-medium">Volume</th>
              <th className="text-center px-4 py-2 font-medium">Signal</th>
            </tr>
          </thead>
          <tbody>
            {assets.map(asset => <AssetRow key={asset.securityId} asset={asset} flash={flash} signal={signals[asset.securityId]} />)}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default WishlistTable;

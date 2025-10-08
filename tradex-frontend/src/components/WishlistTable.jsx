// src/components/WishlistTable.jsx
import { useEffect, useState, useCallback, useRef } from "react";
import supabase from "../lib/supabase";
import React from "react";

// 🔹 Memoized single row to prevent re-rendering if unchanged
const AssetRow = React.memo(({ asset, onClick }) => {
  return (
    <tr
      className="hover:bg-[#1A1D29]/60 transition cursor-pointer"
      onClick={() => onClick(asset)}
    >
      <td className="px-4 py-3 font-medium text-gray-200">{asset.name}</td>
      <td className="px-4 py-3 text-gray-400">{asset.exchangeSegment}</td>
      <td className="px-4 py-3 text-gray-400">{asset.instrumentType}</td>
      <td className="px-4 py-3 text-right text-gray-300">₹{asset.price.toFixed(2)}</td>
      <td
        className={`px-4 py-3 text-right font-medium ${
          asset.isPositive ? "text-green-400" : "text-red-400"
        }`}
      >
        {asset.change >= 0 ? `+${asset.change.toFixed(2)}%` : `${asset.change.toFixed(2)}%`}
      </td>
      <td className="px-4 py-3 text-right text-gray-500">{asset.volume}</td>
    </tr>
  );
});

function WishlistTable({ userId, onAssetSelect }) {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const assetsRef = useRef({}); // store latest values for comparison

  const fetchWatchlist = useCallback(async () => {
    if (!userId) {
      setAssets([]);
      setLoading(false);
      return;
    }

    try {
      // 1️⃣ Fetch Watchlist metadata
      const { data: wishlistData, error } = await supabase
        .from("wishlist")
        .select(`
          security_id, 
          exchange_segment, 
          instrument_type,
          symbol_name,      
          display_name      
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching wishlist:", error);
        setAssets([]);
        return;
      }

      if (!wishlistData || wishlistData.length === 0) {
        setAssets([]);
        return;
      }

      const watchlist = wishlistData.map((w) => ({
        name: w.display_name ?? w.symbol_name ?? w.security_id,
        securityId: w.security_id,
        exchangeSegment: w.exchange_segment ?? "UNKNOWN",
        instrumentType: w.instrument_type ?? "NA",
      }));

      // 2️⃣ Fetch live quotes from Edge Function
      const symbolsToQuote = watchlist.map((w) => ({
        securityId: w.securityId,
        exchangeSegment: w.exchangeSegment,
      }));

      const { data: quotes, error: quoteError } = await supabase.functions.invoke(
        "getQuote",
        {
          method: "POST",
          body: { symbols: symbolsToQuote },
        }
      );

      // fallback if quote fetching fails
      if (quoteError || !quotes) {
        setAssets(
          watchlist.map((w) => ({
            ...w,
            price: 0,
            change: 0,
            volume: 0,
            isPositive: true,
          }))
        );
        return;
      }

      // 3️⃣ Map quotes to watchlist and update only changed values
      const updatedAssets = watchlist.map((w) => {
        const quote = quotes.find((q) => q.securityId === w.securityId);
        const data = quote?.data?.error ? {} : quote?.data || {};

        const price = data.lastPrice ?? 0;
        const change = data.changePercent ?? 0;
        const volume = data.volume ?? 0;
        const isPositive = change >= 0;

        // Check if value changed compared to previous ref
        const prev = assetsRef.current[w.securityId] || {};
        if (
          prev.price === price &&
          prev.change === change &&
          prev.volume === volume
        ) {
          return prev; // reuse old object to prevent re-render
        }

        const newAsset = { ...w, price, change, volume, isPositive };
        assetsRef.current[w.securityId] = newAsset;
        return newAsset;
      });

      setAssets(updatedAssets);
    } catch (err) {
      console.error("Error fetching watchlist/quotes:", err);
      setAssets([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Initial fetch + polling every 5s
  useEffect(() => {
    fetchWatchlist();
    const interval = setInterval(fetchWatchlist, 5000);
    return () => clearInterval(interval);
  }, [fetchWatchlist]);

  if (loading) return <div className="p-6 text-white">Loading watchlist...</div>;
  if (!assets.length) return <div className="p-6 text-gray-400">No assets in watchlist.</div>;

  return (
    <div className="mt-6 w-full bg-[#0F1117]/80 border border-[#6C4FE0]/20 rounded-2xl overflow-hidden shadow-lg">
      <div className="px-4 py-3 border-b border-[#6C4FE0]/20 bg-[#12141C]/70">
        <h2 className="text-sm text-[#C1C1FF] uppercase tracking-wide drop-shadow-md">
          Market Watch
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-400 text-xs uppercase tracking-wider bg-[#141721]">
              <th className="text-left px-4 py-2">Symbol</th>
              <th className="text-left px-4 py-2">Market</th>
              <th className="text-left px-4 py-2">Type</th>
              <th className="text-right px-4 py-2">Price</th>
              <th className="text-right px-4 py-2">Change</th>
              <th className="text-right px-4 py-2">Volume</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#6C4FE0]/10">
            {assets.map((asset) => (
              <AssetRow key={asset.securityId} asset={asset} onClick={onAssetSelect} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default WishlistTable;

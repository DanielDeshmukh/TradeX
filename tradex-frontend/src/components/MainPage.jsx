import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { HiArrowUp, HiArrowDown } from "react-icons/hi";
import clsx from "clsx";
import Header from "../components/Header";
import ChartContainer from "../components/ChartContainer";
import WishlistTable from "../components/WishlistTable";
import MainPageSkeleton from "./MainPageSkeleton";
import { useQuotes } from "../context/QuoteContext";
import { useSignals } from "../hooks/useSignals";
import SignalBadge from "./SignalBadge";

function MainPage({ userId: propUserId }) {
  const { wishlistSymbols: rawWishlistSymbols, getPrice, getChange, getVolume, loading, error } = useQuotes();
  const { signals } = useSignals();

  // Stabilize wishlistSymbols reference
  const wishlistSymbols = useMemo(
    () => rawWishlistSymbols.map(s => ({ ...s })),
    [rawWishlistSymbols.map(s => s.securityId).join(",")]
  );

  const [selectedAsset, setSelectedAsset] = useState(null);
  const [priceActionData, setPriceActionData] = useState([]);
  const [flash, setFlash] = useState({});
  const prevPricesRef = useRef({});

  const triggerFlash = useCallback((securityId, oldPrice, newPrice) => {
    if (oldPrice === newPrice) return;
    setFlash(prev => ({ ...prev, [securityId]: newPrice > oldPrice ? "up" : "down" }));
    setTimeout(() => setFlash(prev => ({ ...prev, [securityId]: null })), 800);
  }, []);

  const formatVolume = useCallback(vol => {
    if (vol >= 1e7) return (vol / 1e7).toFixed(2) + "Cr";
    if (vol >= 1e6) return (vol / 1e6).toFixed(2) + "M";
    if (vol >= 1e5) return (vol / 1e5).toFixed(2) + "L";
    if (vol >= 1e3) return (vol / 1e3).toFixed(1) + "K";
    return vol?.toString() || "0";
  }, []);

  const updatePriceAction = useCallback(() => {
    if (!wishlistSymbols?.length) return;

    const updatedData = wishlistSymbols.map(symbol => {
      const price = getPrice(symbol.securityId);
      const change = getChange(symbol.securityId);
      const vol = getVolume(symbol.securityId);
      const prevPrice = prevPricesRef.current[symbol.securityId] || 0;

      if (price !== prevPrice) triggerFlash(symbol.securityId, prevPrice, price);
      prevPricesRef.current[symbol.securityId] = price;

      return {
        securityId: symbol.securityId,
        displayName: symbol.name,
        exchangeSegment: symbol.exchangeSegment,
        instrumentType: symbol.instrumentType || "EQUITY",
        price,
        change,
        vol,
      };
    });

    setPriceActionData(prev => {
      const changed =
        prev.length !== updatedData.length ||
        updatedData.some((d, i) => d.price !== prev[i]?.price);
      return changed ? updatedData : prev;
    });
  }, [wishlistSymbols, getPrice, getChange, getVolume, triggerFlash]);

  // Select top asset once
  useEffect(() => {
    if (!wishlistSymbols?.length || selectedAsset) return;
    const topSymbol = wishlistSymbols[0];
    setSelectedAsset({
      securityId: topSymbol.securityId,
      exchangeSegment: topSymbol.exchangeSegment,
      name: topSymbol.name,
      instrumentType: topSymbol.instrumentType || "EQUITY",
    });
  }, [wishlistSymbols, selectedAsset]);

  // Update price action whenever quotes change
  useEffect(() => {
    if (wishlistSymbols?.length) {
      updatePriceAction();
    }
  }, [wishlistSymbols, updatePriceAction]);

  const handleAssetSelect = useCallback(asset => setSelectedAsset(asset), []);

  if (loading) return <MainPageSkeleton />;

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0E15] text-white">
      <Header />
      <div className="flex flex-1 gap-4 p-4 overflow-hidden">
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          <div className="h-[500px] rounded-xl bg-bg-secondary/90 border border-[#6C4FE0]/30 shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300">
            {selectedAsset ? (
              <ChartContainer selectedAsset={selectedAsset} />
            ) : (
              <div className="flex items-center justify-center h-full text-content-secondary">
                Loading asset data...
              </div>
            )}
          </div>

          <WishlistTable userId={propUserId} onAssetSelect={handleAssetSelect} />

          {error && (
            <div className="bg-bearish/20 border border-bearish/50 rounded-lg p-3 text-sm text-bearish-muted">
              <span className="font-semibold">Quote error:</span> {error}
            </div>
          )}
        </div>

        <div className="w-[400px] flex-shrink-0 flex flex-col bg-bg-secondary/90 border border-[#6C4FE0]/30 rounded-xl shadow-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#6C4FE0]/20">
            <h2 className="text-base font-bold tracking-wider text-[#6C4FE0]">PRICE ACTION</h2>
            {priceActionData.length > 0 && (
              <span className="text-xs text-content-secondary font-mono">
                {priceActionData.length} {priceActionData.length === 1 ? "symbol" : "symbols"}
              </span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
            {priceActionData.length === 0 ? (
              <div className="flex items-center justify-center h-full text-center text-content-muted px-4">
                <p className="text-sm">No securities in watchlist</p>
                <p className="text-xs mt-2 text-content-muted">Add securities to start tracking</p>
              </div>
            ) : (
              <table className="w-full text-[11px] font-mono">
                <thead className="sticky top-0 bg-bg-secondary z-10">
                  <tr className="border-b border-white/5 text-content-secondary">
                    <th className="text-left py-2 px-3 font-medium">SYMBOL</th>
                    <th className="text-right py-2 px-2 font-medium">LTP</th>
                    <th className="text-right py-2 px-2 font-medium">CHG%</th>
                    <th className="text-center py-2 px-2 font-medium">SIGNAL</th>
                    <th className="text-right py-2 px-2 font-medium">VOL</th>
                  </tr>
                </thead>
                <tbody>
                  {priceActionData.map((row, idx) => (
                    <tr
                      key={row.securityId}
                      onClick={() => handleAssetSelect({
                        securityId: row.securityId,
                        exchangeSegment: row.exchangeSegment,
                        name: row.displayName,
                      })}
                      className={clsx(
                        "border-b border-gray-800/30 hover:bg-[#1A1D25]/60 transition-colors cursor-pointer",
                        idx % 2 === 0 ? "bg-[#0A0C12]/40" : "bg-transparent"
                      )}
                    >
                      <td className="py-2.5 px-3 font-semibold text-white">
                        <div className="flex flex-col">
                          <span className="text-xs">{row.displayName}</span>
                          <span className="text-[9px] text-content-muted">{row.exchangeSegment}</span>
                        </div>
                      </td>
                      <td
                        className={clsx(
                          "text-right px-2 transition-colors duration-500",
                          flash[row.securityId] === "up"
                            ? "bg-bullish/10 text-bullish-muted"
                            : flash[row.securityId] === "down"
                            ? "bg-bearish/10 text-bearish-muted"
                            : "text-white"
                        )}
                      >
                        {row.price > 0 ? row.price.toFixed(2) : <span className="text-content-muted text-[10px]">Loading...</span>}
                      </td>
                      <td className={clsx("text-right px-2 font-semibold", row.change >= 0 ? "text-bullish" : "text-bearish")}>
                        {row.price > 0 ? (
                          <div className="flex items-center justify-end gap-0.5">
                            {row.change >= 0 ? <HiArrowUp className="w-3 h-3" /> : <HiArrowDown className="w-3 h-3" />}
                            <span className="text-[10px]">{Math.abs(row.change).toFixed(2)}%</span>
                          </div>
                        ) : <span className="text-content-muted text-[10px]">-</span>}
                      </td>
                      <td className="text-center px-2">
                        {signals[row.securityId] ? (
                          <SignalBadge
                            signal={signals[row.securityId].signal}
                            confidence={signals[row.securityId].confidence}
                            size="sm"
                          />
                        ) : (
                          <span className="text-content-muted text-[10px]">—</span>
                        )}
                      </td>
                      <td className="text-right px-2 text-yellow-400/80">
                        {row.price > 0 ? formatVolume(row.vol) : <span className="text-content-muted text-[10px]">-</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainPage;

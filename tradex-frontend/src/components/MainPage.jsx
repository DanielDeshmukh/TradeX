// src/components/MainPage.jsx
import { useEffect, useState } from "react";
import Header from "../components/Header";
import ChartContainer from "../components/ChartContainer";
import WishlistTable from "../components/WishlistTable";
import MainPageSkeleton from "./MainPageSkeleton";
import supabase from "../lib/supabase";

function MainPage({ userId: propUserId }) {
    const [currentUserId, setCurrentUserId] = useState(propUserId);
    const [symbols, setSymbols] = useState([]); 
    const [data, setData] = useState([]);
    const [flash, setFlash] = useState({});
    const [loading, setLoading] = useState(true);
    const [selectedAsset, setSelectedAsset] = useState(null); 

    const FALLBACK_SYMBOLS = ["NIFTY 50", "BANKNIFTY"];

    const initRow = (asset) => ({
        securityId: asset.security_id || asset.symbol,
        displayName: asset.symbol_name || asset.symbol,
        price: 0,
        change: 0,
        open: 0,
        high: 0,
        low: 0,
        vol: "0",
    });

    const triggerFlash = (symbol, oldPrice, newPrice) => {
        setFlash((prev) => ({
            ...prev,
            [symbol]: newPrice > oldPrice ? "up" : newPrice < oldPrice ? "down" : null,
        }));
        setTimeout(() => {
            setFlash((prev) => ({ ...prev, [symbol]: null }));
        }, 800);
    };

    const formatVolume = (vol) => {
        if (vol >= 1_000_000) return (vol / 1_000_000).toFixed(2) + "M";
        if (vol >= 1_000) return (vol / 1_000).toFixed(1) + "K";
        return vol.toString();
    };


    useEffect(() => {
        if (propUserId) {
            setCurrentUserId(propUserId);
            return;
        }

        const checkUserSession = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setCurrentUserId(user?.id ?? null); 
        };
        
        checkUserSession();
    }, [propUserId]); 


    useEffect(() => {
        if (currentUserId === undefined) {
             return; 
        }

        const fetchWishlist = async () => {
            if (!currentUserId) {
                console.log("MainPage: User not logged in, using fallback symbols.");
                setSymbols(FALLBACK_SYMBOLS);
                setData(FALLBACK_SYMBOLS.map(symbol => initRow({ symbol }))); 
                setLoading(false);
                return;
            }

            try {
                const { data: wishlistData, error } = await supabase
                    .from("wishlist")
                    .select("security_id, exchange_segment, symbol_name") 
                    .eq("user_id", currentUserId)
                    .order("created_at", { ascending: true });

                if (error) {
                    throw new Error(error.message);
                }

                const fetchedSymbols =
                    wishlistData?.map((w) => w.security_id).filter(Boolean) || 
                    FALLBACK_SYMBOLS;

                setSymbols(fetchedSymbols);
                
                setData(
                    wishlistData.map(asset => initRow({ 
                        security_id: asset.security_id, 
                        symbol_name: asset.symbol_name 
                    }))
                );
                
                if (wishlistData && wishlistData.length > 0 && !selectedAsset) {
                    setSelectedAsset({
                        securityId: wishlistData[0].security_id,
                        exchangeSegment: wishlistData[0].exchange_segment,
                        name: wishlistData[0].symbol_name, 
                    });
                }
            } catch (err) {
                console.error("Error fetching wishlist for MainPage:", err);
                setSymbols(FALLBACK_SYMBOLS);
                setData(FALLBACK_SYMBOLS.map(symbol => initRow({ symbol })));
            } finally {
                setLoading(false);
            }
        };

        fetchWishlist();
        
    }, [currentUserId]); 
    
    const handleAssetSelect = (asset) => {
        setSelectedAsset(asset);
        console.log("MainPage: Asset selected for chart:", asset.name);
    };


    if (loading) return <MainPageSkeleton />;

    return (
        <div className="min-h-screen flex flex-col bg-[#0B0E15] text-white">
            <Header />
            <div className="flex flex-1 overflow-hidden">
                <div className="flex-1 flex flex-col overflow-hidden">
                    <main className="flex-1 overflow-y-auto p-4 flex flex-col items-start">
                        <div className="w-full max-w-5xl space-y-6">
                            <div className="h-[500px] rounded-2xl bg-[#0F1117]/80 border border-[#6C4FE0]/20 shadow-lg overflow-hidden">
                                <ChartContainer selectedAsset={selectedAsset} />
                            </div>
                            
                            <WishlistTable 
                                userId={currentUserId} 
                                onAssetSelect={handleAssetSelect} 
                            /> 
                        </div>
                    </main>
                </div>

                <div className="w-1/3 bg-[#0A0C12] mt-4 border rounded-md border-[#6C4FE0]/40 p-4 overflow-y-auto shadow-xl">
                    <h2 className="text-lg font-bold mb-4 tracking-wider text-[#6C4FE0]">
                        PRICE ACTION
                    </h2>
                    <table className="w-full text-xs sm:text-sm font-mono">
                        <thead>
                            <tr className="border-b border-gray-700 text-gray-400">
                                <th className="text-left py-2">SYMBOL</th>
                                <th className="text-right">PRICE</th>
                                <th className="text-right">CHANGE</th>
                                <th className="text-right">OPEN</th>
                                <th className="text-right">HIGH</th>
                                <th className="text-right">LOW</th>
                                <th className="text-right">VOLUME</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((row, idx) => (
                                <tr
                                    key={row.securityId} 
                                    className={`border-b border-gray-800 ${
                                        idx % 2 === 0 ? "bg-[#10131A]/60" : "bg-transparent"
                                    } hover:bg-[#1A1D25] transition`}
                                >
                                    <td className="py-2 font-semibold">
                                        {row.displayName}
                                    </td> 
                                    <td
                                        className={`text-right transition-colors duration-500 ${
                                            flash[row.securityId] === "up" 
                                                ? "bg-green-900/40 text-green-300"
                                                : flash[row.securityId] === "down"
                                                ? "bg-red-900/40 text-red-300"
                                                : ""
                                        }`}
                                    >
                                        {row.price.toFixed(2)}
                                    </td>
                                    <td className={`text-right font-semibold ${row.change >= 0 ? "text-green-400" : "text-red-400"}`}>
                                        {row.change > 0 ? "▲" : "▼"} {Math.abs(row.change).toFixed(2)}%
                                    </td>
                                    <td className="text-right text-gray-300">{row.open.toFixed(2)}</td>
                                    <td className="text-right text-green-300">{row.high.toFixed(2)}</td>
                                    <td className="text-right text-red-300">{row.low.toFixed(2)}</td>
                                    <td className="text-right text-yellow-300">{formatVolume(row.vol)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default MainPage;
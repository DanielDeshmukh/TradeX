import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import supabase from "../lib/supabase";

const QuoteContext = createContext();

export function QuoteProvider({ children, userId }) {
  const [quotes, setQuotes] = useState({});
  const [wishlistSymbols, setWishlistSymbols] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const subscribedSymbolsRef = useRef(new Map());
  const fetchLockRef = useRef(false);

  // ────────────────────────────────
  // Fetch Wishlist
  // ────────────────────────────────
  const fetchWishlist = useCallback(async () => {
    if (!userId) {
      setWishlistSymbols([]);
      subscribedSymbolsRef.current.clear();
      return;
    }

    try {
      setLoading(true);
      const { data, error: dbError } = await supabase
        .from("wishlist")
        .select(
          "security_id, exchange_segment, instrument_type, symbol_name, display_name"
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: true });

      if (dbError) throw dbError;

      const formatted = (data || []).map((w) => ({
        name: w.display_name || w.symbol_name || w.security_id,
        securityId: String(w.security_id),
        exchangeSegment: w.exchange_segment || "NSE",
        instrumentType: w.instrument_type || "EQUITY",
      }));

      setWishlistSymbols(formatted);
      subscribedSymbolsRef.current.clear();
      formatted.forEach((s) => {
        subscribedSymbolsRef.current.set(s.securityId, {
          securityId: s.securityId,
          exchangeSegment: s.exchangeSegment,
        });
      });
      setError(null);
    } catch (err) {
      setError("Failed to load wishlist");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // ────────────────────────────────
  // Fetch Quotes
  // ────────────────────────────────
  const fetchQuotes = useCallback(async () => {
    if (fetchLockRef.current) return;

    const subscribed = Array.from(subscribedSymbolsRef.current.values());
    if (!subscribed.length) return;

    fetchLockRef.current = true;
    setLoading(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("No active Supabase session");

      const accessToken = session.access_token;
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/getQuote`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ symbols: subscribed }),
        }
      );

      if (!res.ok) throw new Error(`Quote API error ${res.status}`);

      const data = await res.json();
      const newQuotes = {};
      data.forEach((r) => {
        newQuotes[String(r.securityId)] = r.error
          ? { error: true, data: null }
          : { error: false, data: r.data.data, timestamp: Date.now() };
      });

      setQuotes(newQuotes);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to fetch quotes");
    } finally {
      setLoading(false);
      fetchLockRef.current = false;
    }
  }, []);

  // ────────────────────────────────
  // Effects (only when user changes)
  // ────────────────────────────────
  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  // ────────────────────────────────
  // Utilities
  // ────────────────────────────────
  const subscribeToSymbol = useCallback((symbol) => {
    const key = String(symbol.securityId);
    if (!subscribedSymbolsRef.current.has(key)) {
      subscribedSymbolsRef.current.set(key, {
        securityId: key,
        exchangeSegment: symbol.exchangeSegment || "NSE",
      });
    }
  }, []);

  const unsubscribeFromSymbol = useCallback((id) => {
    subscribedSymbolsRef.current.delete(String(id));
  }, []);

  const clearSubscriptions = useCallback(() => {
    subscribedSymbolsRef.current.clear();
    setQuotes({});
  }, []);

  const getQuote = useCallback((id) => quotes[String(id)] || null, [quotes]);
  const getPrice = useCallback(
    (id) => getQuote(id)?.data?.last_price || 0,
    [getQuote]
  );
  const getChange = useCallback(
    (id) => {
      const q = getQuote(id)?.data;
      if (!q) return 0;
      const { last_price, open } = q;
      return open ? ((last_price - open) / open) * 100 : 0;
    },
    [getQuote]
  );
  const getVolume = useCallback(
    (id) => getQuote(id)?.data?.volume || 0,
    [getQuote]
  );
  const isSubscribed = useCallback(
    (id) => subscribedSymbolsRef.current.has(String(id)),
    []
  );

  // ────────────────────────────────
  // Context
  // ────────────────────────────────
  const contextValue = useMemo(
    () => ({
      quotes,
      loading,
      error,
      wishlistSymbols,
      fetchWishlist,
      fetchQuotes,
      subscribeToSymbol,
      unsubscribeFromSymbol,
      clearSubscriptions,
      getQuote,
      getPrice,
      getChange,
      getVolume,
      isSubscribed,
    }),
    [
      quotes,
      loading,
      error,
      wishlistSymbols,
      fetchWishlist,
      fetchQuotes,
      subscribeToSymbol,
      unsubscribeFromSymbol,
      clearSubscriptions,
      getQuote,
      getPrice,
      getChange,
      getVolume,
      isSubscribed,
    ]
  );

  return (
    <QuoteContext.Provider value={contextValue}>
      {children}
    </QuoteContext.Provider>
  );
}

export function useQuotes() {
  const context = useContext(QuoteContext);
  if (!context) throw new Error("useQuotes must be used within a QuoteProvider");
  return context;
}

// hooks/useCandles.js
import { useEffect, useState } from "react";
import supabase from "../lib/supabase";



export default function useCandles(limit = 500) {
  const [candles, setCandles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCandles = async () => {
      try {
        const { data, error } = await supabase
          .from("mock_ohlcv")
          .select("time, open, high, low, close")
          .order("time", { ascending: true })
          .limit(limit);

        if (error) throw error;
        setCandles(data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCandles();
  }, [limit]);

  return { candles, loading, error };
}

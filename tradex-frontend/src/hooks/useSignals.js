import { useState, useEffect, useCallback } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export function useSignals() {
  const [signals, setSignals] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSignals = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/signals/all`);
      if (!res.ok) throw new Error(`API returned ${res.status}`);
      const data = await res.json();

      const signalMap = {};
      for (const s of data.signals || []) {
        signalMap[s.security_id] = {
          signal: s.signal,
          confidence: s.confidence,
          model_version: s.model_version,
          created_at: s.created_at,
        };
      }
      setSignals(signalMap);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch signals:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSignals();
    const interval = setInterval(fetchSignals, 60000);
    return () => clearInterval(interval);
  }, [fetchSignals]);

  return { signals, loading, error, refetch: fetchSignals };
}

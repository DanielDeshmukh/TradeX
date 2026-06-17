import { useState, useEffect, useCallback } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export function useWatchlist(userId) {
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWatchlist = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/watchlist/${userId}`);
      const data = await res.json();
      setWatchlist(data.watchlist || []);
    } catch (err) {
      console.error("Failed to fetch watchlist:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const addToWatchlist = useCallback(async (item) => {
    if (!userId) return;
    try {
      const res = await fetch(`${API_URL}/api/watchlist/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
      const data = await res.json();
      if (res.ok) {
        await fetchWatchlist();
        return data.item;
      } else {
        throw new Error(data.detail || "Failed to add");
      }
    } catch (err) {
      console.error("Failed to add to watchlist:", err);
      setError(err.message);
      throw err;
    }
  }, [userId, fetchWatchlist]);

  const removeFromWatchlist = useCallback(async (securityId) => {
    if (!userId) return;
    try {
      const res = await fetch(`${API_URL}/api/watchlist/${userId}/${securityId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        await fetchWatchlist();
      }
    } catch (err) {
      console.error("Failed to remove from watchlist:", err);
      setError(err.message);
      throw err;
    }
  }, [userId, fetchWatchlist]);

  const reorderWatchlist = useCallback(async (items) => {
    if (!userId) return;
    try {
      await fetch(`${API_URL}/api/watchlist/${userId}/reorder`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      await fetchWatchlist();
    } catch (err) {
      console.error("Failed to reorder watchlist:", err);
      setError(err.message);
      throw err;
    }
  }, [userId, fetchWatchlist]);

  const searchWatchlist = useCallback(async (query) => {
    if (!userId || !query) return [];
    try {
      const res = await fetch(`${API_URL}/api/watchlist/${userId}/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      return data.watchlist || [];
    } catch (err) {
      console.error("Failed to search watchlist:", err);
      return [];
    }
  }, [userId]);

  useEffect(() => {
    fetchWatchlist();
  }, [fetchWatchlist]);

  return {
    watchlist,
    loading,
    error,
    addToWatchlist,
    removeFromWatchlist,
    reorderWatchlist,
    searchWatchlist,
    refresh: fetchWatchlist,
  };
}

import { useState, useEffect, useCallback } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export function useLeaderboard(userId) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLeaderboard = useCallback(async (limit = 50) => {
    try {
      const res = await fetch(`${API_URL}/api/leaderboard?limit=${limit}`);
      const data = await res.json();
      setLeaderboard(data.leaderboard || []);
    } catch (err) {
      console.error("Failed to fetch leaderboard:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUserRank = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await fetch(`${API_URL}/api/leaderboard/${userId}`);
      const data = await res.json();
      setUserRank(data);
    } catch (err) {
      console.error("Failed to fetch user rank:", err);
    }
  }, [userId]);

  const fetchAchievements = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await fetch(`${API_URL}/api/achievements/${userId}`);
      const data = await res.json();
      setAchievements(data.achievements || []);
    } catch (err) {
      console.error("Failed to fetch achievements:", err);
    }
  }, [userId]);

  const updateStats = useCallback(async (stats) => {
    if (!userId) return;
    try {
      const res = await fetch(`${API_URL}/api/leaderboard/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(stats),
      });
      const data = await res.json();
      await fetchUserRank();
      await fetchLeaderboard();
      return data.stats;
    } catch (err) {
      console.error("Failed to update stats:", err);
      setError(err.message);
      throw err;
    }
  }, [userId, fetchUserRank, fetchLeaderboard]);

  const addAchievement = useCallback(async (achievement) => {
    if (!userId) return;
    try {
      const res = await fetch(`${API_URL}/api/achievements/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(achievement),
      });
      const data = await res.json();
      await fetchAchievements();
      return data.achievement;
    } catch (err) {
      console.error("Failed to add achievement:", err);
      setError(err.message);
      throw err;
    }
  }, [userId, fetchAchievements]);

  useEffect(() => {
    fetchLeaderboard();
    if (userId) {
      fetchUserRank();
      fetchAchievements();
    }
  }, [fetchLeaderboard, fetchUserRank, fetchAchievements, userId]);

  return {
    leaderboard,
    userRank,
    achievements,
    loading,
    error,
    updateStats,
    addAchievement,
    refresh: () => Promise.all([fetchLeaderboard(), fetchUserRank(), fetchAchievements()]),
  };
}

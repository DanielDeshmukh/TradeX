import { useState, useEffect, useCallback } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export function useUserSettings(userId) {
  const [settings, setSettings] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSettings = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/user-settings/${userId}`);
      const data = await res.json();
      setSettings(data.settings);
    } catch (err) {
      console.error("Failed to fetch settings:", err);
      setError(err.message);
    }
  }, [userId]);

  const fetchProfile = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await fetch(`${API_URL}/api/user-profile/${userId}`);
      const data = await res.json();
      setProfile(data.profile);
    } catch (err) {
      console.error("Failed to fetch profile:", err);
      setError(err.message);
    }
  }, [userId]);

  const updateSettings = useCallback(async (updates) => {
    if (!userId) return;
    try {
      const res = await fetch(`${API_URL}/api/user-settings/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      setSettings(data.settings);
      return data.settings;
    } catch (err) {
      console.error("Failed to update settings:", err);
      setError(err.message);
      throw err;
    }
  }, [userId]);

  const updateProfile = useCallback(async (updates) => {
    if (!userId) return;
    try {
      const res = await fetch(`${API_URL}/api/user-profile/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      setProfile(data.profile);
      return data.profile;
    } catch (err) {
      console.error("Failed to update profile:", err);
      setError(err.message);
      throw err;
    }
  }, [userId]);

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([fetchSettings(), fetchProfile()]);
      setLoading(false);
    };
    loadAll();
  }, [fetchSettings, fetchProfile]);

  return {
    settings,
    profile,
    loading,
    error,
    updateSettings,
    updateProfile,
    refresh: () => Promise.all([fetchSettings(), fetchProfile()]),
  };
}

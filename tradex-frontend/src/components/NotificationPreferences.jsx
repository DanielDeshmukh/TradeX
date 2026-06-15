import React, { useState, useEffect, useCallback } from "react";
import supabase from "../lib/supabase";

const NOTIFICATION_TYPES = [
  { key: "price_alerts", label: "Price Alerts", description: "Get notified when your price targets are hit" },
  { key: "ai_signals", label: "AI Signals", description: "Receive AI-generated buy/sell signal notifications" },
  { key: "portfolio_updates", label: "Portfolio Updates", description: "Daily portfolio summary and performance" },
  { key: "news_alerts", label: "News Alerts", description: "Breaking market news and events" },
  { key: "system_updates", label: "System Updates", description: "Platform updates and maintenance notices" },
  { key: "email_digest", label: "Email Digest", description: "Weekly email summary of your activity" },
];

export default function NotificationPreferences() {
  const [userId, setUserId] = useState(null);
  const [preferences, setPreferences] = useState(() => {
    const init = {};
    NOTIFICATION_TYPES.forEach((t) => (init[t.key] = true));
    return init;
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      const uid = data?.user?.id;
      setUserId(uid);
      if (uid) {
        try {
          const res = await supabase.functions.invoke("user-settings", {
            body: { action: "fetch" },
          });
          const notifPrefs = res?.data?.data?.notification_preferences;
          if (notifPrefs && typeof notifPrefs === "object") {
            setPreferences((prev) => ({ ...prev, ...notifPrefs }));
          }
        } catch {}
      }
      setLoading(false);
    })();
  }, []);

  const save = useCallback(async () => {
    if (!userId) return;
    setSaving(true);
    try {
      await supabase.functions.invoke("user-settings", {
        body: {
          user_id: userId,
          notification_preferences: preferences,
        },
      });
    } catch {} finally {
      setSaving(false);
    }
  }, [userId, preferences]);

  useEffect(() => {
    if (!userId || loading) return;
    const t = setTimeout(save, 1000);
    return () => clearTimeout(t);
  }, [preferences, userId, loading, save]);

  const toggle = (key) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-content">Notification Preferences</h2>
        {saving && <span className="text-xs text-content-muted">Saving...</span>}
      </div>

      <div className="space-y-2">
        {NOTIFICATION_TYPES.map((type) => (
          <div
            key={type.key}
            className="bg-surface rounded-xl p-4 border border-white/5 flex items-center justify-between"
          >
            <div>
              <div className="text-sm font-medium text-content">{type.label}</div>
              <div className="text-xs text-content-secondary mt-0.5">{type.description}</div>
            </div>
            <button
              onClick={() => toggle(type.key)}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                preferences[type.key] ? "bg-brand" : "bg-surface-input"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                  preferences[type.key] ? "translate-x-5" : ""
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

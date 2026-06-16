import React, { useState, useCallback, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import supabase from "../lib/supabase";

export default function MobileSettings() {
  const { theme, setTheme, themes } = useTheme();
  const [userId, setUserId] = useState(null);
  const [settings, setSettings] = useState({
    chartType: "candlestick",
    chartInterval: "5m",
    notificationsEnabled: false,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      setUserId(data?.user?.id || null);
    })();
  }, []);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      try {
        const res = await supabase.functions.invoke("user-settings", {
          body: { action: "fetch" },
        });
        const d = res?.data?.data;
        if (d) {
          setSettings({
            chartType: d.chart_type || "candlestick",
            chartInterval: d.chart_interval || "5m",
            notificationsEnabled: d.notification_permission || false,
          });
        }
      } catch {
        // Silently handle settings fetch errors
      }
    })();
  }, [userId]);

  const save = useCallback(async () => {
    if (!userId) return;
    setSaving(true);
    try {
      await supabase.functions.invoke("user-settings", {
        body: {
          user_id: userId,
          chart_type: settings.chartType,
          chart_interval: settings.chartInterval,
          notification_permission: settings.notificationsEnabled,
          refresh_rate: 30,
        },
      });
    } catch {
      // Silently handle save errors
    } finally {
      setSaving(false);
    }
  }, [userId, settings]);

  useEffect(() => {
    if (!userId) return;
    const t = setTimeout(save, 1500);
    return () => clearTimeout(t);
  }, [settings, userId, save]);

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-lg font-bold text-content">Settings</h1>

      {/* Theme */}
      <div className="bg-surface rounded-xl p-4 border border-white/5">
        <label className="block text-sm font-semibold text-content mb-3">Theme</label>
        <div className="grid grid-cols-2 gap-2">
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={`p-3 rounded-lg border text-left text-xs transition-all ${
                theme === t.id
                  ? "border-brand bg-brand/10"
                  : "border-white/10 bg-surface-input"
              }`}
            >
              <span className="font-medium text-content">{t.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chart Type */}
      <div className="bg-surface rounded-xl p-4 border border-white/5">
        <label className="block text-sm font-semibold text-content mb-2">Chart Type</label>
        <select
          value={settings.chartType}
          onChange={(e) => setSettings((p) => ({ ...p, chartType: e.target.value }))}
          className="w-full bg-surface-input text-content px-3 py-2 rounded-lg border border-white/10 text-sm"
        >
          <option value="candlestick">Candlestick</option>
          <option value="line">Line</option>
          <option value="area">Area</option>
        </select>
      </div>

      {/* Chart Interval */}
      <div className="bg-surface rounded-xl p-4 border border-white/5">
        <label className="block text-sm font-semibold text-content mb-2">Chart Interval</label>
        <select
          value={settings.chartInterval}
          onChange={(e) => setSettings((p) => ({ ...p, chartInterval: e.target.value }))}
          className="w-full bg-surface-input text-content px-3 py-2 rounded-lg border border-white/10 text-sm"
        >
          <option value="1m">1 Minute</option>
          <option value="5m">5 Minutes</option>
          <option value="15m">15 Minutes</option>
          <option value="25m">25 Minutes</option>
          <option value="1h">1 Hour</option>
        </select>
      </div>

      {/* Notifications */}
      <div className="bg-surface rounded-xl p-4 border border-white/5">
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-sm font-semibold text-content">Notifications</span>
          <input
            type="checkbox"
            checked={settings.notificationsEnabled}
            onChange={(e) => setSettings((p) => ({ ...p, notificationsEnabled: e.target.checked }))}
            className="w-5 h-5 accent-purple-600"
          />
        </label>
      </div>

      {saving && (
        <p className="text-xs text-content-muted text-center">Saving...</p>
      )}
    </div>
  );
}

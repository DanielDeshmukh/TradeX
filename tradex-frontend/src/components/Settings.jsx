import React, { useEffect, useState, useCallback } from "react";
import Header from "./Header";
import supabase from "../lib/supabase";
import { ToastContainer, toast } from "react-toastify";

const ActionCard = ({ label, onClick }) => (
  <div
    onClick={onClick}
    className="cursor-pointer bg-[#1e1e1e] hover:bg-[#2a2a2a] rounded-xl shadow-md p-6 flex-1 text-center transition-colors duration-200 border border-[#2D2F36]"
  >
    <span className="text-white font-semibold text-lg">{label}</span>
  </div>
);

const Settings = () => {
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  const [settings, setSettings] = useState({
    chartType: "candlestick",
    chartInterval: "15m",
    notificationsEnabled: false,
  });

  const fetchUser = useCallback(async () => {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      setErrorMsg("Unable to fetch user session.");
      setLoading(false);
      return;
    }
    setUserId(user.id);
  }, []);

  const fetchSettings = useCallback(async (uid) => {
    const toastId = toast.loading("Fetching settings...", {
      style: { background: "#1e1e1e", color: "#fff" },
    });

    const { data, error } = await supabase
      .from("profiles")
      .select("chart_type, chart_interval")
      .eq("id", uid)
      .single();

    toast.dismiss(toastId);

    if (error) {
      console.error("Error fetching settings:", error);
      setErrorMsg("Failed to load settings.");
      toast.error("Failed to load settings.", {
        style: { background: "#ff4444", color: "#fff" },
      });
    } else if (data) {
      setSettings({
        chartType: data.chart_type || "candlestick",
        chartInterval: data.chart_interval || "15m",
        notificationsEnabled: false, 
      });
      toast.success("Settings loaded.", {
        style: { background: "#222", color: "#0f0" },
      });
    }
    setLoading(false);
  }, []);

  const saveSettings = async () => {
    if (!userId) return;

    const toastId = toast.loading("Saving settings...", {
      style: { background: "#1e1e1e", color: "#fff" },
    });

    const { error } = await supabase
      .from("profiles")
      .update({
        chart_type: settings.chartType,
        chart_interval: settings.chartInterval,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    toast.dismiss(toastId);

    if (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings.", {
        style: { background: "#ff4444", color: "#fff" },
      });
    } else {
      toast.success("Settings saved successfully!", {
        style: { background: "#222", color: "#0f0" },
      });
    }
  };

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (userId) fetchSettings(userId);
  }, [userId, fetchSettings]);

  if (loading) return <div className="p-6 text-white">Loading settings...</div>;
  if (errorMsg) return <div className="p-6 text-red-400">{errorMsg}</div>;

  return (
    <div className="p-4 sm:p-6 bg-[#0F1117] text-white min-h-screen">
      <Header />
      <div className="w-full max-w-6xl mx-auto rounded-xl shadow-lg bg-[#0F1117] p-4 sm:p-8 space-y-6 sm:space-y-8">
        
        <div className="bg-[#232323] rounded-xl shadow-md p-4 sm:p-6 border border-[#2D2F36]">
          <label htmlFor="chartType" className="block text-lg font-medium mb-2">
            Default Chart Type
          </label>
          <select
            id="chartType"
            value={settings.chartType}
            onChange={(e) =>
              setSettings((prev) => ({ ...prev, chartType: e.target.value }))
            }
            className="w-full bg-[#1a1a1a] text-white px-4 py-2 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="candlestick">Candlestick</option>
            <option value="line">Line</option>
            <option value="area">Area</option>
          </select>
        </div>

        <div className="bg-[#232323] rounded-xl shadow-md p-4 sm:p-6 border border-[#2D2F36]">
          <label htmlFor="chartInterval" className="block text-lg font-medium mb-2">
            Default Chart Interval
          </label>
          <select
            id="chartInterval"
            value={settings.chartInterval}
            onChange={(e) =>
              setSettings((prev) => ({ ...prev, chartInterval: e.target.value }))
            }
            className="w-full bg-[#1a1a1a] text-white px-4 py-2 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="1m">1 Minute</option>
            <option value="5m">5 Minutes</option>
            <option value="15m">15 Minutes</option>
            <option value="1h">1 Hour</option>
            <option value="1d">1 Day</option>
          </select>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="flex flex-1 flex-col sm:flex-row gap-4">
            <ActionCard label="View Bill" onClick={() => toast.info("📄 View Bill clicked", { style: { background: "#333", color: "#fff" } })} />
            <ActionCard
              label="Receipt Records"
              onClick={() => toast.info("🧾 Receipt Records clicked", { style: { background: "#333", color: "#fff" } })}
            />
            <ActionCard label="Pay Bill" onClick={() => toast.info("💳 Pay Bill clicked", { style: { background: "#333", color: "#fff" } })} />
          </div>
          <button
            onClick={saveSettings}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold w-full sm:w-auto transition"
          >
            Save Settings
          </button>
        </div>
      </div>

      <ToastContainer
        position="top-right"
        autoClose={2500}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        draggable
      />
    </div>
  );
};

export default Settings;

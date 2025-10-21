import React, { useEffect, useState, useCallback, useRef } from "react";
import Header from "./Header";
import supabase from "../lib/supabase";
import { ToastContainer, toast } from "react-toastify";
import SettingsSkeleton from "./SettingsSkeleton";
import "react-toastify/dist/ReactToastify.css";

const chartTypeOptions = [
  { value: "candlestick", label: "Candlestick" },
  { value: "line", label: "Line" },
  { value: "area", label: "Area" },
];

const chartIntervalOptions = [
  { value: "1m", label: "1 Minute" },
  { value: "5m", label: "5 Minutes" },
  { value: "15m", label: "15 Minutes" },
  { value: "25m", label: "25 Minutes" },
  { value: "1h", label: "1 Hour" },
];

const exchangeOptions = [
  { value: "NSE", label: "NSE" },
  { value: "BSE", label: "BSE" },
  { value: "MCX", label: "MCX" },
];

const instrumentOptions = [
  { value: "EQ", label: "Equity" },
  { value: "FUT", label: "Futures" },
  { value: "OPT", label: "Options" },
];

function normalizeInvokeResponse(res) {
  if (!res) return null;
  if (res.data !== undefined && res.data !== null) return res.data;
  return res;
}

const Settings = () => {

  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [symbolSuggestions, setSymbolSuggestions] = useState({});
  const [searchForm, setSearchForm] = useState({ keyword: "", exchange_id: "", instrument: "", security_id: "" });
  const [settings, setSettings] = useState({ chartType: "candlestick", chartInterval: "5m", notificationsEnabled: false, wishlist: [] });

  const searchTimeout = useRef(null);

  const fetchUser = useCallback(async () => {
    try {
      const { data } = await supabase.auth.getUser();
      setUserId(data?.user?.id || null);
    } catch {
      setUserId(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveSettings = useCallback(async () => {
    if (!userId) return;
    const toastId = toast.loading("Saving settings...");
    try {
      const response = await supabase.functions.invoke("user-settings", {
        body: { 
          user_id: userId, 
          chart_type: settings.chartType, 
          chart_interval: settings.chartInterval, 
          notification_permission: settings.notificationsEnabled, 
          refresh_rate: 30,
        }
      });
      
      if (response.error || response.data?.error) {
        throw new Error(response.error?.message || response.data?.error || "Unknown error occurred.");
      }

      toast.success("Settings saved successfully");
    } catch (error) {
      console.error("Save settings error:", error);
      toast.error(`Error saving settings: ${error.message || "Check console"}`);
    } finally {
      toast.dismiss(toastId);
    }
  }, [userId, settings.chartType, settings.chartInterval, settings.notificationsEnabled]);

  useEffect(() => { fetchUser(); }, [fetchUser]);

  useEffect(() => {
    if (!userId) return;
    const loadSettings = async () => {
      const toastId = toast.loading("Loading settings...");
      try {
        const settingsRes = normalizeInvokeResponse(await supabase.functions.invoke("user-settings", { 
          body: { action: "fetch" } 
        }));
        
        const wishlistRes = normalizeInvokeResponse(await supabase.functions.invoke("wishlist", { body: { user_id: userId, action: "fetch" } }));
        const wishlistArray = wishlistRes?.wishlist || [];

        setSettings({
          chartType: settingsRes?.data?.chart_type || "candlestick",
          chartInterval: settingsRes?.data?.chart_interval || "5m",
          notificationsEnabled: settingsRes?.data?.notification_permission || false,
          wishlist: Array.isArray(wishlistArray) ? wishlistArray : [],
        });
        toast.success("Settings loaded successfully");
      } catch (error) {
        console.error("Load settings error:", error);
        toast.error("Failed to load settings");
      } finally {
        toast.dismiss(toastId);
      }
    };
    loadSettings();
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    const handler = setTimeout(saveSettings, 1500);
    return () => clearTimeout(handler);
  }, [settings.chartType, settings.chartInterval, settings.notificationsEnabled, saveSettings]);

  const addSymbol = async (symbol) => {
    if (!userId) return toast.error("User not logged in");
    if (!symbol?.security_id || !symbol.display_name) return toast.error("Invalid symbol data");
    
    const payload = { 
      user_id: userId, 
      security_id: String(symbol.security_id), 
      exchange_id: symbol.exchange_segment || "", 
      instrument: symbol.instrument_type || "", 
      symbol_name: symbol.symbol_name || "", 
      display_name: symbol.display_name || "", 
      action: "add" 
    };
    
    const toastId = toast.loading(`Adding ${symbol.display_name}...`);
    try {
      const res = normalizeInvokeResponse(await supabase.functions.invoke("wishlist", { body: payload }));
      if (res?.wishlist) {
        setSettings((prev) => ({ ...prev, wishlist: res.wishlist }));
        toast.success(`${symbol.display_name} added successfully`);
      }
      else toast.error(res?.error || "Failed to add symbol");
    } catch (err) {
      toast.error("Error adding symbol");
    } finally { toast.dismiss(toastId); }
  };

  const removeSymbol = async (security_id, displayName) => {
    if (!userId) return toast.error("User not logged in");
    const toastId = toast.loading("Removing symbol...");
    try {
      const res = normalizeInvokeResponse(await supabase.functions.invoke("wishlist", { body: { user_id: userId, security_id: String(security_id), action: "remove" } }));
      if (res?.wishlist) { 
        setSettings((prev) => ({ ...prev, wishlist: res.wishlist })); 
        toast.success(`${displayName || "Symbol"} removed`); 
      }
      else toast.error(res?.error || "Failed to remove symbol");
    } catch {
      toast.error("Error removing symbol");
    } finally { toast.dismiss(toastId); }
  };

  const handleFormChange = (e) => { 
    const { name, value } = e.target; 
    setSearchForm((prev) => ({ ...prev, [name]: value })); 
  };

  const searchSymbols = useCallback(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = normalizeInvokeResponse(await supabase.functions.invoke("symbols", { body: { action: "fetchSymbolDetails", symbol_name: searchForm.keyword, exchange_id: searchForm.exchange_id, instrument: searchForm.instrument, security_id: searchForm.security_id } }));
        const instruments = res?.instruments || [];
        const filtered = instruments.filter((s) => !settings.wishlist.some((w) => String(w.security_id) === String(s.security_id)));
        const grouped = filtered.reduce((acc, row) => { 
          const name = row.display_name || "Unknown"; 
          if (!acc[name]) acc[name] = []; 
          acc[name].push(row); 
          return acc; 
        }, {});
        setSymbolSuggestions(grouped);
      } catch { 
        setSymbolSuggestions({}); 
      } finally { 
        setIsSearching(false); 
      }
    }, 500);
  }, [searchForm, settings.wishlist]);

  useEffect(() => {
    if (searchForm.keyword.trim() || searchForm.exchange_id.trim() || searchForm.instrument.trim() || searchForm.security_id.trim()) searchSymbols();
    else setSymbolSuggestions({});
  }, [searchForm, searchSymbols]);

  if (loading) return <SettingsSkeleton />;
  
  if (!userId) return (
    <div className="p-6 bg-[#0B0E15] text-white min-h-screen">
      <Header />
      <div className="flex flex-col items-center justify-center mt-20 text-center text-gray-400">
        <p className="text-red-400 text-xl mb-2">User not logged in</p>
        <p>Please log in to access settings</p>
      </div>
    </div>
  );

  return (
    <div className="p-4 sm:p-6 bg-[#0B0E15] text-white min-h-screen">
      <Header />
      <div className="w-full max-w-6xl mx-auto space-y-6 mt-6 sm:space-y-8">
        <div className="bg-[#0F1117]/70 p-6 rounded-2xl border border-[#2D2F36]">
          <label className="block text-lg font-semibold mb-2">Default Chart Type</label>
          <select 
            value={settings.chartType} 
            onChange={(e) => setSettings((p) => ({ ...p, chartType: e.target.value }))} 
            className="w-full bg-[#1a1a1a] text-white px-4 py-2 rounded-xl border border-gray-600 hover:border-purple-500 transition-all"
          >
            {chartTypeOptions.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
          </select>
        </div>
        
        <div className="bg-[#0F1117]/70 p-6 rounded-2xl border border-[#2D2F36]">
          <label className="block text-lg font-semibold mb-2">Default Chart Interval</label>
          <select 
            value={settings.chartInterval} 
            onChange={(e) => setSettings((p) => ({ ...p, chartInterval: e.target.value }))} 
            className="w-full bg-[#1a1a1a] text-white px-4 py-2 rounded-xl border border-gray-600 hover:border-purple-500 transition-all"
          >
            {chartIntervalOptions.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
          </select>
        </div>
        
        <div className="bg-[#0F1117]/70 p-6 rounded-2xl border border-[#2D2F36]">
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-lg font-semibold">Enable Notifications</span>
            <input 
              type="checkbox" 
              checked={settings.notificationsEnabled} 
              onChange={(e) => setSettings((p) => ({ ...p, notificationsEnabled: e.target.checked }))} 
              className="w-5 h-5 accent-purple-600 cursor-pointer"
            />
          </label>
        </div>
        
        <div className="bg-[#0F1117]/70 p-6 rounded-2xl border border-[#2D2F36] relative">
          <label className="block text-lg font-semibold mb-4">Wishlist</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            <input type="text" name="keyword" value={searchForm.keyword} onChange={handleFormChange} placeholder="Symbol / Display Name" className="bg-[#1a1a1a] text-white px-3 py-2 rounded-xl border border-gray-600 hover:border-purple-500 transition-all"/>
            <select name="exchange_id" value={searchForm.exchange_id} onChange={handleFormChange} className="bg-[#1a1a1a] text-white px-3 py-2 rounded-xl border border-gray-600 hover:border-purple-500 transition-all">
              <option value="">Select Exchange</option>
              {exchangeOptions.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
            </select>
            <select name="instrument" value={searchForm.instrument} onChange={handleFormChange} className="bg-[#1a1a1a] text-white px-3 py-2 rounded-xl border border-gray-600 hover:border-purple-500 transition-all">
              <option value="">Select Instrument</option>
              {instrumentOptions.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
            </select>
            <input type="text" name="security_id" value={searchForm.security_id} onChange={handleFormChange} placeholder="Security ID" className="bg-[#1a1a1a] text-white px-3 py-2 rounded-xl border border-gray-600 hover:border-purple-500 transition-all"/>
          </div>
          
          {isSearching && <div className="text-gray-400 mb-2">Searching...</div>}
          
          {Object.keys(symbolSuggestions).length > 0 && (
            <ul className="bg-[#1a1a1a] border border-gray-600 rounded-xl max-h-60 overflow-y-auto shadow-2xl mb-4">
              {Object.entries(symbolSuggestions).map(([name, variants]) => (
                <li key={name} className="border-b border-gray-700 last:border-b-0">
                  <div className="px-4 py-2 font-semibold text-purple-300 bg-[#0F1117]">{name}</div>
                  <ul>
                    {variants.map((s) => (
                      <li 
                        key={s.security_id} 
                        onClick={() => addSymbol(s)} 
                        className="px-6 py-2 hover:bg-purple-700 cursor-pointer text-sm text-gray-300 transition-colors flex justify-between"
                      >
                        <span>{s.exchange_segment}</span>
                        <span className="text-xs text-gray-500">{s.instrument_type}</span>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          )}
          
          {settings.wishlist.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p>Your wishlist is empty</p>
              <p className="text-sm mt-2">Search and add symbols above</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {settings.wishlist.map((s) => (
                <div key={s.security_id} className="flex items-center gap-2 bg-purple-700 px-3 py-1.5 rounded-full hover:bg-purple-600 transition-colors">
                  <span className="text-sm">{s.display_name} ({s.exchange_segment})</span>
                  <button 
                    onClick={() => removeSymbol(s.security_id, s.display_name)} 
                    className="text-white font-bold hover:text-red-300 transition-colors w-5 h-5 flex items-center justify-center" 
                    aria-label={`Remove ${s.display_name}`}
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="mt-4 flex justify-end">
          <button 
            onClick={saveSettings} 
            className="px-6 py-3 bg-gradient-to-r from-[#7F3DFF] to-[#5A18E9] rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all"
          >
            Save Settings
          </button>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={2500} theme="dark"/>
    </div>
  );
};

export default Settings;
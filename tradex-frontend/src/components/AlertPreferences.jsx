import { useState, useEffect, useCallback } from "react";
import { FiBell, FiBellOff, FiVolume2, FiVolumeX, FiTrendingUp, FiTrendingDown } from "react-icons/fi";

const DEFAULT_PREFS = {
  priceAlerts: true,
  volumeAlerts: true,
  signalChangeAlerts: true,
  priceThreshold: 2.0,
  volumeThreshold: 50,
  signalChangeThreshold: 10,
  soundEnabled: false,
};

function loadPrefs() {
  try {
    const stored = localStorage.getItem("tradex-alert-prefs");
    return stored ? { ...DEFAULT_PREFS, ...JSON.parse(stored) } : DEFAULT_PREFS;
  } catch {
    return DEFAULT_PREFS;
  }
}

function savePrefs(prefs) {
  try {
    localStorage.setItem("tradex-alert-prefs", JSON.stringify(prefs));
  } catch {
    // Storage quota exceeded or unavailable
  }
}

function Toggle({ checked, onChange, label, icon: Icon }) {
  return (
    <label className="flex items-center justify-between py-2 cursor-pointer group">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 text-[#6C4FE0]" />}
        <span className="text-sm text-white/80 group-hover:text-white transition-colors">{label}</span>
      </div>
      <div
        className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${
          checked ? "bg-[#6C4FE0]" : "bg-gray-600"
        }`}
        onClick={onChange}
      >
        <div
          className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </div>
    </label>
  );
}

function NumberInput({ value, onChange, min, max, step, unit }) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        min={min}
        max={max}
        step={step}
        className="w-20 bg-[#1A1D25] border border-[#6C4FE0]/20 rounded px-2 py-1 text-sm text-white text-center focus:outline-none focus:border-[#6C4FE0]/50"
      />
      <span className="text-xs text-content-secondary">{unit}</span>
    </div>
  );
}

export default function AlertPreferences({ onClose }) {
  const [prefs, setPrefs] = useState(loadPrefs);
  const [saved, setSaved] = useState(false);

  const update = useCallback((key, value) => {
    setPrefs(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  }, []);

  useEffect(() => {
    savePrefs(prefs);
    setSaved(true);
    const t = setTimeout(() => setSaved(false), 1500);
    return () => clearTimeout(t);
  }, [prefs]);

  return (
    <div className="bg-[#12141C] border border-[#6C4FE0]/20 rounded-xl shadow-2xl p-5 w-[380px]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FiBell className="w-5 h-5 text-[#6C4FE0]" />
          <h3 className="text-base font-bold text-white tracking-wide">Alert Preferences</h3>
        </div>
        <button
          onClick={onClose}
          className="text-content-secondary hover:text-white text-sm transition-colors"
        >
          ✕
        </button>
      </div>

      <div className="space-y-1 border-t border-[#6C4FE0]/10 pt-3">
        <Toggle
          checked={prefs.priceAlerts}
          onChange={() => update("priceAlerts", !prefs.priceAlerts)}
          label="Price Movement Alerts"
          icon={FiTrendingUp}
        />
        {prefs.priceAlerts && (
          <div className="pl-6 pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-content-secondary">Threshold</span>
              <NumberInput
                value={prefs.priceThreshold}
                onChange={v => update("priceThreshold", v)}
                min={0.5}
                max={20}
                step={0.5}
                unit="% change"
              />
            </div>
          </div>
        )}

        <Toggle
          checked={prefs.volumeAlerts}
          onChange={() => update("volumeAlerts", !prefs.volumeAlerts)}
          label="Volume Spike Alerts"
          icon={FiVolume2}
        />
        {prefs.volumeAlerts && (
          <div className="pl-6 pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-content-secondary">Threshold</span>
              <NumberInput
                value={prefs.volumeThreshold}
                onChange={v => update("volumeThreshold", v)}
                min={10}
                max={500}
                step={10}
                unit="% above avg"
              />
            </div>
          </div>
        )}

        <Toggle
          checked={prefs.signalChangeAlerts}
          onChange={() => update("signalChangeAlerts", !prefs.signalChangeAlerts)}
          label="Signal Change Alerts"
          icon={FiTrendingDown}
        />
        {prefs.signalChangeAlerts && (
          <div className="pl-6 pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-content-secondary">Min confidence change</span>
              <NumberInput
                value={prefs.signalChangeThreshold}
                onChange={v => update("signalChangeThreshold", v)}
                min={5}
                max={50}
                step={5}
                unit="%"
              />
            </div>
          </div>
        )}

        <div className="border-t border-[#6C4FE0]/10 pt-2 mt-2">
          <Toggle
            checked={prefs.soundEnabled}
            onChange={() => update("soundEnabled", !prefs.soundEnabled)}
            label="Sound Notifications"
            icon={prefs.soundEnabled ? FiVolume2 : FiVolumeX}
          />
        </div>
      </div>

      {saved && (
        <div className="mt-3 text-center text-xs text-[#6C4FE0] animate-pulse">
          Saved to localStorage
        </div>
      )}
    </div>
  );
}

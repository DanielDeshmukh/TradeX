import { useState, useEffect, useCallback } from "react";

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

export function useAlertPrefs() {
  const [prefs, setPrefs] = useState(loadPrefs);

  useEffect(() => {
    const handler = () => setPrefs(loadPrefs());
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const shouldAlert = useCallback(
    (type, value) => {
      if (type === "price" && prefs.priceAlerts) {
        return Math.abs(value) >= prefs.priceThreshold;
      }
      if (type === "volume" && prefs.volumeAlerts) {
        return value >= prefs.volumeThreshold;
      }
      if (type === "signal" && prefs.signalChangeAlerts) {
        return Math.abs(value) >= prefs.signalChangeThreshold;
      }
      return false;
    },
    [prefs]
  );

  return { prefs, shouldAlert };
}

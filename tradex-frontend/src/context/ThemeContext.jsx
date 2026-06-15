import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext(null);

const THEMES = [
  { id: "tradex", name: "TradeX", description: "Purple accent, deep dark" },
  { id: "claude", name: "Claude", description: "Warm coral, charcoal dark" },
  { id: "nvidia", name: "Nvidia", description: "Green accent, pure black" },
  { id: "ollama", name: "Ollama", description: "Minimal white, neutral dark" },
];

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    return localStorage.getItem("tradex-theme") || "tradex";
  });

  const setTheme = (themeId) => {
    setThemeState(themeId);
    localStorage.setItem("tradex-theme", themeId);
  };

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}

import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Settings from "../components/Settings";

const mockUpdateSettings = vi.fn();
const mockUpdateProfile = vi.fn();

vi.mock("../hooks/useUserSettings", () => ({
  useUserSettings: () => ({
    settings: {
      theme: "tradex",
      chart_type: "candlestick",
      default_timeframe: "1D",
      notifications_enabled: true,
    },
    profile: { display_name: "Demo Trader", email: "demo@tradex.dev" },
    loading: false,
    updateSettings: mockUpdateSettings,
    updateProfile: mockUpdateProfile,
  }),
}));

vi.mock("../hooks/useWatchlist", () => ({
  useWatchlist: () => ({
    watchlist: [],
    loading: false,
    addToWatchlist: vi.fn(),
    removeFromWatchlist: vi.fn(),
  }),
}));

vi.mock("../context/ThemeContext", () => ({
  useTheme: () => ({
    theme: "tradex",
    setTheme: vi.fn(),
    themes: [
      { id: "tradex", name: "TradeX", description: "Default theme" },
      { id: "claude", name: "Claude", description: "Anthropic theme" },
    ],
  }),
}));

vi.mock("../lib/supabase", () => ({
  default: { auth: { getUser: vi.fn() } },
}));

describe("Settings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders theme selection", () => {
    render(<Settings />);
    expect(screen.getByText("Theme")).toBeInTheDocument();
    expect(screen.getByText("TradeX")).toBeInTheDocument();
    expect(screen.getByText("Claude")).toBeInTheDocument();
  });

  it("renders chart type selection", () => {
    render(<Settings />);
    expect(screen.getByText("Default Chart Type")).toBeInTheDocument();
    expect(screen.getByText("Candlestick")).toBeInTheDocument();
  });

  it("renders chart interval selection", () => {
    render(<Settings />);
    expect(screen.getByText("Default Chart Interval")).toBeInTheDocument();
  });

  it("renders notifications toggle", () => {
    render(<Settings />);
    expect(screen.getByText("Enable Notifications")).toBeInTheDocument();
  });

  it("renders wishlist section", () => {
    render(<Settings />);
    expect(screen.getByText("Wishlist")).toBeInTheDocument();
    expect(screen.getByText("Your wishlist is empty")).toBeInTheDocument();
  });

  it("renders save button", () => {
    render(<Settings />);
    expect(screen.getByText("Save Settings")).toBeInTheDocument();
  });
});

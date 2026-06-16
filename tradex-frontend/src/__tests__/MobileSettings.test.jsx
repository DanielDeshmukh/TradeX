import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import MobileSettings from "../components/MobileSettings";

const mockSetTheme = vi.fn();
const mockThemes = [
  { id: "dark", name: "Dark" },
  { id: "light", name: "Light" },
  { id: "midnight", name: "Midnight" },
];

vi.mock("../context/ThemeContext", () => ({
  useTheme: () => ({
    theme: "dark",
    setTheme: mockSetTheme,
    themes: mockThemes,
  }),
}));

vi.mock("../lib/supabase", () => ({
  default: {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user-1" } } }),
    },
    functions: {
      invoke: vi.fn().mockResolvedValue({ data: { data: null } }),
    },
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("MobileSettings", () => {
  it("renders Settings heading", async () => {
    render(<MobileSettings />);
    expect(await screen.findByText("Settings")).toBeInTheDocument();
  });

  it("renders theme selector with all themes", async () => {
    render(<MobileSettings />);
    expect(await screen.findByText("Theme")).toBeInTheDocument();
    expect(screen.getByText("Dark")).toBeInTheDocument();
    expect(screen.getByText("Light")).toBeInTheDocument();
    expect(screen.getByText("Midnight")).toBeInTheDocument();
  });

  it("renders chart type selector", async () => {
    render(<MobileSettings />);
    expect(await screen.findByText("Chart Type")).toBeInTheDocument();
    expect(screen.getByText("Candlestick")).toBeInTheDocument();
    expect(screen.getByText("Line")).toBeInTheDocument();
    expect(screen.getByText("Area")).toBeInTheDocument();
  });

  it("renders chart interval selector", async () => {
    render(<MobileSettings />);
    expect(await screen.findByText("Chart Interval")).toBeInTheDocument();
    expect(screen.getByText("1 Minute")).toBeInTheDocument();
    expect(screen.getByText("5 Minutes")).toBeInTheDocument();
    expect(screen.getByText("15 Minutes")).toBeInTheDocument();
  });

  it("renders notifications toggle", async () => {
    render(<MobileSettings />);
    expect(await screen.findByText("Notifications")).toBeInTheDocument();
  });

  it("calls setTheme when theme button is clicked", async () => {
    render(<MobileSettings />);
    await screen.findByText("Settings");
    fireEvent.click(screen.getByText("Light"));
    expect(mockSetTheme).toHaveBeenCalledWith("light");
  });
});

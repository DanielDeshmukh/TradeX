import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import TradingGlossary from "../components/TradingGlossary";

vi.mock("../lib/supabase", () => ({
  default: { auth: { getUser: vi.fn() } },
}));

describe("TradingGlossary", () => {
  it("renders the glossary header", () => {
    render(<TradingGlossary />);
    expect(screen.getByText("Trading Glossary")).toBeInTheDocument();
  });

  it("renders search input", () => {
    render(<TradingGlossary />);
    expect(screen.getByPlaceholderText(/search terms/i)).toBeInTheDocument();
  });

  it("renders trading terms", () => {
    render(<TradingGlossary />);
    expect(screen.getByText("Bull Market")).toBeInTheDocument();
    expect(screen.getByText("Bear Market")).toBeInTheDocument();
    expect(screen.getByText("Dividend")).toBeInTheDocument();
  });

  it("filters terms on search", () => {
    render(<TradingGlossary />);
    const input = screen.getByPlaceholderText(/search terms/i);
    fireEvent.change(input, { target: { value: "bull" } });
    expect(screen.getByText("Bull Market")).toBeInTheDocument();
  });

  it("shows term definitions", () => {
    render(<TradingGlossary />);
    expect(screen.getByText(/market where prices are rising/i)).toBeInTheDocument();
  });
});

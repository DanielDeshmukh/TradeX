import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ProfileStats from "../components/ProfileStats";

describe("ProfileStats", () => {
  const fullStats = {
    totalTrades: 150,
    winRate: 62.5,
    portfolioValue: 250000,
    totalReturn: 12.3,
    joinDate: "2025-01-15",
    plan: "pro",
    streak: 5,
  };

  it("renders plan badge", () => {
    render(<ProfileStats stats={fullStats} />);
    expect(screen.getByText("Pro")).toBeDefined();
  });

  it("renders streak", () => {
    render(<ProfileStats stats={fullStats} />);
    expect(screen.getByText(/5 day streak/)).toBeDefined();
  });

  it("renders join date", () => {
    render(<ProfileStats stats={fullStats} />);
    expect(screen.getByText(/Joined/)).toBeDefined();
  });

  it("renders portfolio value", () => {
    render(<ProfileStats stats={fullStats} />);
    expect(screen.getByText(/2,50,000/)).toBeDefined();
  });

  it("renders total return with + prefix", () => {
    render(<ProfileStats stats={fullStats} />);
    expect(screen.getByText("+12.3%")).toBeDefined();
  });

  it("renders total trades", () => {
    render(<ProfileStats stats={fullStats} />);
    expect(screen.getByText("150")).toBeDefined();
  });

  it("renders win rate", () => {
    render(<ProfileStats stats={fullStats} />);
    expect(screen.getByText("62.5%")).toBeDefined();
  });

  it("renders free plan badge by default", () => {
    render(<ProfileStats stats={{}} />);
    expect(screen.getByText("Free")).toBeDefined();
  });

  it("renders negative return with bearish color", () => {
    render(<ProfileStats stats={{ totalReturn: -5.2 }} />);
    expect(screen.getByText("-5.2%")).toBeDefined();
  });

  it("does not render streak when 0", () => {
    render(<ProfileStats stats={{ streak: 0 }} />);
    expect(screen.queryByText(/streak/)).toBeNull();
  });
});

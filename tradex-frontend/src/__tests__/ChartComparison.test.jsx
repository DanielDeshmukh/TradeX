import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import ChartComparison from "../components/ChartComparison";

vi.mock("../lib/supabase", () => ({
  default: { auth: { getUser: vi.fn() } },
}));

describe("ChartComparison", () => {
  it("renders the component header", () => {
    render(<ChartComparison currentSymbol="RELIANCE" />);
    expect(screen.getByText("Compare Symbols")).toBeInTheDocument();
  });

  it("renders search input", () => {
    render(<ChartComparison currentSymbol="RELIANCE" />);
    expect(screen.getByPlaceholderText("Search symbol to compare...")).toBeInTheDocument();
  });

  it("shows empty state when no symbols added", () => {
    render(<ChartComparison currentSymbol="RELIANCE" />);
    expect(screen.getByText("Add symbols to compare performance")).toBeInTheDocument();
  });

  it("allows typing in search input", () => {
    render(<ChartComparison currentSymbol="RELIANCE" />);
    const input = screen.getByPlaceholderText("Search symbol to compare...");
    fireEvent.change(input, { target: { value: "TCS" } });
    expect(input.value).toBe("TCS");
  });
});

import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import SignalBadge from "../components/SignalBadge";

describe("SignalBadge", () => {
  it("renders BUY signal with correct label", () => {
    render(<SignalBadge signal="buy" confidence={0.85} />);
    expect(screen.getByText("BUY")).toBeInTheDocument();
    expect(screen.getByText("85%")).toBeInTheDocument();
  });

  it("renders SELL signal with correct label", () => {
    render(<SignalBadge signal="sell" confidence={0.72} />);
    expect(screen.getByText("SELL")).toBeInTheDocument();
    expect(screen.getByText("72%")).toBeInTheDocument();
  });

  it("renders HOLD signal with correct label", () => {
    render(<SignalBadge signal="hold" confidence={0.6} />);
    expect(screen.getByText("HOLD")).toBeInTheDocument();
    expect(screen.getByText("60%")).toBeInTheDocument();
  });

  it("defaults to HOLD for unknown signal", () => {
    render(<SignalBadge signal="unknown" confidence={0.5} />);
    expect(screen.getByText("HOLD")).toBeInTheDocument();
  });

  it("hides confidence when 0", () => {
    render(<SignalBadge signal="buy" confidence={0} />);
    expect(screen.queryByText("0%")).not.toBeInTheDocument();
  });

  it("applies size classes correctly", () => {
    const { rerender } = render(<SignalBadge signal="buy" confidence={0.8} size="sm" />);
    expect(screen.getByText("BUY").closest("span")).toHaveClass("text-xs");

    rerender(<SignalBadge signal="buy" confidence={0.8} size="lg" />);
    expect(screen.getByText("BUY").closest("span")).toHaveClass("text-base");
  });
});

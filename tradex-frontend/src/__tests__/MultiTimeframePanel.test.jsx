import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import MultiTimeframePanel from "../components/MultiTimeframePanel";

vi.mock("../lib/supabase", () => ({
  default: { auth: { getUser: vi.fn() } },
}));

describe("MultiTimeframePanel", () => {
  it("renders the component header", () => {
    render(<MultiTimeframePanel symbol="RELIANCE" />);
    expect(screen.getByText("Multi-Timeframe Analysis")).toBeInTheDocument();
  });

  it("renders all timeframe buttons", () => {
    render(<MultiTimeframePanel symbol="RELIANCE" />);
    expect(screen.getByText("1 Min")).toBeInTheDocument();
    expect(screen.getByText("5 Min")).toBeInTheDocument();
    expect(screen.getByText("15 Min")).toBeInTheDocument();
    expect(screen.getByText("30 Min")).toBeInTheDocument();
    expect(screen.getByText("1 Hour")).toBeInTheDocument();
    expect(screen.getByText("4 Hour")).toBeInTheDocument();
    expect(screen.getByText("Daily")).toBeInTheDocument();
    expect(screen.getByText("Weekly")).toBeInTheDocument();
  });

  it("calls onSelectTimeframe when timeframe clicked", () => {
    const onSelect = vi.fn();
    render(<MultiTimeframePanel symbol="RELIANCE" onSelectTimeframe={onSelect} />);
    fireEvent.click(screen.getByText("5 Min"));
    expect(onSelect).toHaveBeenCalledWith("5m");
  });

  it("highlights active timeframe", () => {
    render(<MultiTimeframePanel symbol="RELIANCE" />);
    const btn1m = screen.getByText("1 Min");
    expect(btn1m).toHaveClass("bg-brand");
  });

  it("renders timeframe grid with default selections", () => {
    render(<MultiTimeframePanel symbol="RELIANCE" />);
    expect(screen.getByText("1 Min")).toBeInTheDocument();
    expect(screen.getByText("5 Min")).toBeInTheDocument();
    expect(screen.getByText("15 Min")).toBeInTheDocument();
    expect(screen.getByText("Daily")).toBeInTheDocument();
  });
});

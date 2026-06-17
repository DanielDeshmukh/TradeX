import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import TimeFrameModal from "../components/TimeFrameModal";

describe("TimeFrameModal", () => {
  it("renders timeframe options", () => {
    render(<TimeFrameModal onSelect={vi.fn()} onClose={vi.fn()} />);
    expect(screen.getByText("1m")).toBeInTheDocument();
    expect(screen.getByText("5m")).toBeInTheDocument();
    expect(screen.getByText("15m")).toBeInTheDocument();
    expect(screen.getByText("1h")).toBeInTheDocument();
  });

  it("calls onSelect with timeframe", () => {
    const onSelect = vi.fn();
    render(<TimeFrameModal onSelect={onSelect} onClose={vi.fn()} />);
    fireEvent.click(screen.getByText("5m"));
    expect(onSelect).toHaveBeenCalledWith("5m");
  });

  it("calls onClose when timeframe selected", () => {
    const onClose = vi.fn();
    render(<TimeFrameModal onSelect={vi.fn()} onClose={onClose} />);
    fireEvent.click(screen.getByText("15m"));
    expect(onClose).toHaveBeenCalled();
  });

  it("highlights current selection", () => {
    render(<TimeFrameModal currentTimeframe="1h" onSelect={vi.fn()} onClose={vi.fn()} />);
    expect(screen.getByText("1h")).toHaveClass("bg-brand");
  });
});

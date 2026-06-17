import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import ChartTypeModal from "../components/ChartTypeModal";

describe("ChartTypeModal", () => {
  it("renders chart type options", () => {
    render(<ChartTypeModal onSelect={vi.fn()} onClose={vi.fn()} />);
    expect(screen.getByText("Candlestick")).toBeInTheDocument();
    expect(screen.getByText("Line")).toBeInTheDocument();
    expect(screen.getByText("Area")).toBeInTheDocument();
  });

  it("calls onSelect with chart type", () => {
    const onSelect = vi.fn();
    render(<ChartTypeModal onSelect={onSelect} onClose={vi.fn()} />);
    fireEvent.click(screen.getByText("Line"));
    expect(onSelect).toHaveBeenCalledWith("line");
  });

  it("calls onClose when close button clicked", () => {
    const onClose = vi.fn();
    render(<ChartTypeModal onSelect={vi.fn()} onClose={onClose} />);
    fireEvent.click(screen.getByText("Candlestick"));
    expect(onClose).toHaveBeenCalled();
  });

  it("highlights current selection", () => {
    render(<ChartTypeModal currentType="area" onSelect={vi.fn()} onClose={vi.fn()} />);
    expect(screen.getByText("Area")).toHaveClass("bg-brand");
  });
});

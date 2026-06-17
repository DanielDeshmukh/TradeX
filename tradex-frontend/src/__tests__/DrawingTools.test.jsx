import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import DrawingTools from "../components/DrawingTools";

vi.mock("../lib/supabase", () => ({
  default: { auth: { getUser: vi.fn() } },
}));

describe("DrawingTools", () => {
  it("renders drawing tools header", () => {
    render(<DrawingTools />);
    expect(screen.getByText("Drawing Tools")).toBeInTheDocument();
  });

  it("renders all drawing tool buttons", () => {
    render(<DrawingTools />);
    expect(screen.getByText("Trend Line")).toBeInTheDocument();
    expect(screen.getByText("Horizontal Line")).toBeInTheDocument();
    expect(screen.getByText("Vertical Line")).toBeInTheDocument();
    expect(screen.getByText("Fibonacci Retracement")).toBeInTheDocument();
    expect(screen.getByText("Rectangle")).toBeInTheDocument();
    expect(screen.getByText("Parallel Channel")).toBeInTheDocument();
  });

  it("selects a drawing tool on click", () => {
    render(<DrawingTools />);
    const trendLineBtn = screen.getByText("Trend Line");
    fireEvent.click(trendLineBtn);
    expect(trendLineBtn).toHaveClass("bg-brand");
  });

  it("deselects tool when clicked again", () => {
    render(<DrawingTools />);
    const trendLineBtn = screen.getByText("Trend Line");
    fireEvent.click(trendLineBtn);
    fireEvent.click(trendLineBtn);
    expect(trendLineBtn).not.toHaveClass("bg-brand");
  });

  it("renders undo and clear buttons", () => {
    render(<DrawingTools />);
    expect(screen.getByText("Undo")).toBeInTheDocument();
    expect(screen.getByText("Clear All")).toBeInTheDocument();
  });

  it("disables undo and clear when no drawings", () => {
    render(<DrawingTools />);
    expect(screen.getByText("Undo")).toBeDisabled();
    expect(screen.getByText("Clear All")).toBeDisabled();
  });

  it("renders canvas element", () => {
    render(<DrawingTools />);
    expect(screen.getByRole("canvas")).toBeInTheDocument();
  });

  it("shows instruction text when no tool selected", () => {
    render(<DrawingTools />);
    expect(screen.getByText("Select a drawing tool above to start")).toBeInTheDocument();
  });
});

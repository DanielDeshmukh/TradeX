import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import ChartExport from "../components/ChartExport";

vi.mock("../lib/supabase", () => ({
  default: { auth: { getUser: vi.fn() } },
}));

describe("ChartExport", () => {
  it("renders the component header", () => {
    render(<ChartExport chartRef={{ current: null }} />);
    expect(screen.getByText("Export Chart")).toBeInTheDocument();
  });

  it("renders format selection buttons", () => {
    render(<ChartExport chartRef={{ current: null }} />);
    expect(screen.getByText("PNG")).toBeInTheDocument();
    expect(screen.getByText("JPEG")).toBeInTheDocument();
  });

  it("selects PNG format by default", () => {
    render(<ChartExport chartRef={{ current: null }} />);
    const pngBtn = screen.getByText("PNG");
    expect(pngBtn).toHaveClass("bg-brand");
  });

  it("switches to JPEG format on click", () => {
    render(<ChartExport chartRef={{ current: null }} />);
    fireEvent.click(screen.getByText("JPEG"));
    expect(screen.getByText("JPEG")).toHaveClass("bg-brand");
  });

  it("renders download and copy buttons", () => {
    render(<ChartExport chartRef={{ current: null }} />);
    expect(screen.getByText("Download PNG")).toBeInTheDocument();
    expect(screen.getByText("Copy")).toBeInTheDocument();
  });

  it("updates download button text when format changes", () => {
    render(<ChartExport chartRef={{ current: null }} />);
    fireEvent.click(screen.getByText("JPEG"));
    expect(screen.getByText("Download JPEG")).toBeInTheDocument();
  });
});

import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Badge from "../components/ui/Badge";

describe("Badge", () => {
  it("renders children text", () => {
    render(<Badge>Active</Badge>);
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("applies default variant classes", () => {
    render(<Badge>Test</Badge>);
    const badge = screen.getByText("Test").closest("span");
    expect(badge).toHaveClass("bg-white/10");
  });

  it("applies brand variant classes", () => {
    render(<Badge variant="brand">Brand</Badge>);
    const badge = screen.getByText("Brand").closest("span");
    expect(badge).toHaveClass("bg-brand/10");
  });

  it("applies success variant classes", () => {
    render(<Badge variant="success">Success</Badge>);
    const badge = screen.getByText("Success").closest("span");
    expect(badge).toHaveClass("bg-bullish/10");
  });

  it("applies danger variant classes", () => {
    render(<Badge variant="danger">Danger</Badge>);
    const badge = screen.getByText("Danger").closest("span");
    expect(badge).toHaveClass("bg-bearish/10");
  });

  it("applies warning variant classes", () => {
    render(<Badge variant="warning">Warning</Badge>);
    const badge = screen.getByText("Warning").closest("span");
    expect(badge).toHaveClass("bg-yellow-500/10");
  });

  it("applies size classes correctly", () => {
    const { rerender } = render(<Badge size="sm">Small</Badge>);
    expect(screen.getByText("Small").closest("span")).toHaveClass("text-xs");

    rerender(<Badge size="lg">Large</Badge>);
    expect(screen.getByText("Large").closest("span")).toHaveClass("text-sm");
  });

  it("renders dot when dot prop is true", () => {
    render(<Badge dot>With Dot</Badge>);
    const badge = screen.getByText("With Dot").closest("span");
    const dot = badge.querySelector(".rounded-full");
    expect(dot).toBeInTheDocument();
  });

  it("does not render dot by default", () => {
    render(<Badge>No Dot</Badge>);
    const badge = screen.getByText("No Dot").closest("span");
    const dots = badge.querySelectorAll(".w-1\\.5");
    expect(dots.length).toBe(0);
  });
});

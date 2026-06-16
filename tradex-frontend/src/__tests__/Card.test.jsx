import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Card from "../components/ui/Card";

describe("Card", () => {
  it("renders children", () => {
    render(<Card>Test content</Card>);
    expect(screen.getByText("Test content")).toBeInTheDocument();
  });

  it("applies default classes", () => {
    render(<Card>Content</Card>);
    const card = screen.getByText("Content").closest("div");
    expect(card).toHaveClass("bg-surface/70");
    expect(card).toHaveClass("rounded-xl");
    expect(card).toHaveClass("border");
  });

  it("applies custom className", () => {
    render(<Card className="custom-class">Content</Card>);
    const card = screen.getByText("Content").closest("div");
    expect(card).toHaveClass("custom-class");
  });

  it("renders with hover effect when specified", () => {
    render(<Card hover>Content</Card>);
    const card = screen.getByText("Content").closest("div");
    expect(card).toHaveClass("hover:border-brand/20");
  });

  it("renders with glow effect when specified", () => {
    render(<Card glow>Content</Card>);
    const card = screen.getByText("Content").closest("div");
    expect(card).toHaveClass("shadow-brand");
    expect(card).toHaveClass("border-brand/20");
  });

  it("applies shadow-lg by default (no glow)", () => {
    render(<Card>Content</Card>);
    const card = screen.getByText("Content").closest("div");
    expect(card).toHaveClass("shadow-lg");
  });
});

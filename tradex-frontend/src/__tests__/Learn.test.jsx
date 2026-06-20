import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Learn from "../components/Learn";

vi.mock("../lib/supabase", () => ({
  default: { auth: { getUser: vi.fn() } },
}));

describe("Learn", () => {
  it("renders the learn header", () => {
    render(<Learn />);
    expect(screen.getByText("Learn Trading")).toBeInTheDocument();
  });

  it("renders course chapters", () => {
    render(<Learn />);
    expect(screen.getByText("Introduction to Trading")).toBeInTheDocument();
    expect(screen.getByText("Understanding Markets")).toBeInTheDocument();
  });

  it("renders progress bar", () => {
    render(<Learn />);
    expect(screen.getByText(/progress/i)).toBeInTheDocument();
  });

  it("renders navigation buttons", () => {
    render(<Learn />);
    expect(screen.getByText("Next")).toBeInTheDocument();
    expect(screen.getByText("Previous")).toBeInTheDocument();
  });

  it("renders chapter content", () => {
    render(<Learn />);
    expect(screen.getByText(/chapter/i)).toBeInTheDocument();
  });
});

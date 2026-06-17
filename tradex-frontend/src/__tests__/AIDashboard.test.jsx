import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import AIDashboard from "../components/AIDashboard";

vi.mock("../lib/supabase", () => ({
  default: { auth: { getUser: vi.fn() } },
}));

vi.mock("../hooks/useSignals", () => ({
  useSignals: () => ({
    signals: [],
    loading: false,
    error: null,
  }),
}));

describe("AIDashboard", () => {
  it("renders the dashboard header", () => {
    render(<AIDashboard />);
    expect(screen.getByText(/ai dashboard/i)).toBeInTheDocument();
  });

  it("renders signal stats section", () => {
    render(<AIDashboard />);
    expect(screen.getByText(/signals/i)).toBeInTheDocument();
  });

  it("renders signal list section", () => {
    render(<AIDashboard />);
    expect(screen.getByText(/recent signals/i)).toBeInTheDocument();
  });
});

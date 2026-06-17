import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Leaderboard from "../components/Leaderboard";

vi.mock("../lib/supabase", () => ({
  default: { auth: { getUser: vi.fn() } },
}));

describe("Leaderboard", () => {
  it("renders the leaderboard header", () => {
    render(<Leaderboard />);
    expect(screen.getByText("Leaderboard")).toBeInTheDocument();
  });

  it("renders ranked traders", () => {
    render(<Leaderboard />);
    expect(screen.getByText(/trader/i)).toBeInTheDocument();
  });

  it("renders ranking columns", () => {
    render(<Leaderboard />);
    expect(screen.getByText(/rank/i)).toBeInTheDocument();
    expect(screen.getByText(/win rate/i)).toBeInTheDocument();
  });

  it("renders achievements section", () => {
    render(<Leaderboard />);
    expect(screen.getByText(/achievements/i)).toBeInTheDocument();
  });
});

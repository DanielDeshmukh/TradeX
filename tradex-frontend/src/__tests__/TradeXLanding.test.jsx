import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import TradeXLanding from "../components/TradeXLanding";

vi.mock("../lib/supabase", () => ({
  default: { auth: { getUser: vi.fn() } },
}));

describe("TradeXLanding", () => {
  it("renders the landing page", () => {
    render(
      <MemoryRouter>
        <TradeXLanding />
      </MemoryRouter>
    );
    expect(screen.getByText(/tradex/i)).toBeInTheDocument();
  });

  it("renders hero section", () => {
    render(
      <MemoryRouter>
        <TradeXLanding />
      </MemoryRouter>
    );
    expect(screen.getByText(/ai-powered/i) || screen.getByText(/trading/i)).toBeInTheDocument();
  });

  it("renders sign up button", () => {
    render(
      <MemoryRouter>
        <TradeXLanding />
      </MemoryRouter>
    );
    expect(screen.getByText(/sign up/i) || screen.getByText(/get started/i)).toBeInTheDocument();
  });

  it("renders features section", () => {
    render(
      <MemoryRouter>
        <TradeXLanding />
      </MemoryRouter>
    );
    expect(screen.getByText(/features/i) || screen.getByText(/why/i)).toBeInTheDocument();
  });
});

import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import PriceAlerts from "../components/PriceAlerts";

vi.mock("../lib/supabase", () => ({
  default: { auth: { getUser: vi.fn() } },
}));

describe("PriceAlerts", () => {
  it("renders the alerts header", () => {
    render(<PriceAlerts />);
    expect(screen.getByText(/price alerts/i)).toBeInTheDocument();
  });

  it("renders alert creation form", () => {
    render(<PriceAlerts />);
    expect(screen.getByText(/create alert/i)).toBeInTheDocument();
  });

  it("renders alert list", () => {
    render(<PriceAlerts />);
    expect(screen.getByText(/your alerts/i)).toBeInTheDocument();
  });
});

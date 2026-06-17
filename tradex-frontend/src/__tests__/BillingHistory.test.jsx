import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import BillingHistory from "../components/BillingHistory";

vi.mock("../lib/supabase", () => ({
  default: { auth: { getUser: vi.fn() } },
}));

describe("BillingHistory", () => {
  it("renders the billing header", () => {
    render(<BillingHistory />);
    expect(screen.getByText(/billing history/i)).toBeInTheDocument();
  });

  it("renders payment table headers", () => {
    render(<BillingHistory />);
    expect(screen.getByText(/date/i)).toBeInTheDocument();
    expect(screen.getByText(/amount/i)).toBeInTheDocument();
    expect(screen.getByText(/status/i)).toBeInTheDocument();
  });

  it("renders empty state when no payments", () => {
    render(<BillingHistory />);
    expect(screen.getByText(/no payment history/i)).toBeInTheDocument();
  });
});

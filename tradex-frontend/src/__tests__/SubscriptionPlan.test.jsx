import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import SubscriptionPlan from "../components/SubscriptionPlan";

vi.mock("../lib/supabase", () => ({
  default: { auth: { getUser: vi.fn() } },
}));

describe("SubscriptionPlan", () => {
  it("renders subscription plans", () => {
    render(<SubscriptionPlan user={{ id: "demo-user" }} />);
    expect(screen.getByText(/free/i)).toBeInTheDocument();
    expect(screen.getByText(/pro/i)).toBeInTheDocument();
    expect(screen.getByText(/enterprise/i)).toBeInTheDocument();
  });

  it("renders plan prices", () => {
    render(<SubscriptionPlan user={{ id: "demo-user" }} />);
    expect(screen.getByText(/₹0/)).toBeInTheDocument();
    expect(screen.getByText(/₹499/)).toBeInTheDocument();
    expect(screen.getByText(/₹1999/)).toBeInTheDocument();
  });

  it("renders plan features", () => {
    render(<SubscriptionPlan user={{ id: "demo-user" }} />);
    expect(screen.getByText(/symbols/i)).toBeInTheDocument();
  });

  it("renders subscribe buttons", () => {
    render(<SubscriptionPlan user={{ id: "demo-user" }} />);
    expect(screen.getAllByText(/subscribe/i).length).toBeGreaterThan(0);
  });
});

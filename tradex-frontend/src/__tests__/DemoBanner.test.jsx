import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("../lib/supabase", () => ({
  isDemoMode: true,
}));

import DemoBanner from "../components/DemoBanner";

describe("DemoBanner", () => {
  it("renders in demo mode", () => {
    render(<DemoBanner />);
    expect(screen.getByText(/Demo Mode/)).toBeDefined();
  });

  it("shows warning about mock data", () => {
    render(<DemoBanner />);
    expect(screen.getByText(/mock data/)).toBeDefined();
  });

  it("shows configure Supabase hint", () => {
    render(<DemoBanner />);
    expect(screen.getByText(/Configure Supabase/)).toBeDefined();
  });
});

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("../lib/supabase", () => ({
  isDemoMode: false,
}));

import DemoBanner from "../components/DemoBanner";

describe("DemoBanner", () => {
  it("returns null when not in demo mode", () => {
    const { container } = render(<DemoBanner />);
    expect(container.innerHTML).toBe("");
  });
});

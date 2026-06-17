import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import ActivityHeatmap from "../components/ActivityHeatmap";

vi.mock("../lib/supabase", () => ({
  default: { auth: { getUser: vi.fn() } },
}));

describe("ActivityHeatmap", () => {
  it("renders the heatmap header", () => {
    render(<ActivityHeatmap user={{ id: "demo-user" }} />);
    expect(screen.getByText(/activity/i)).toBeInTheDocument();
  });

  it("renders heatmap grid", () => {
    render(<ActivityHeatmap user={{ id: "demo-user" }} />);
    expect(screen.getByTestId("heatmap-grid") || screen.getByText(/trading activity/i)).toBeInTheDocument();
  });

  it("renders with user prop", () => {
    render(<ActivityHeatmap user={{ id: "test-user" }} />);
    expect(screen.getByText(/activity/i)).toBeInTheDocument();
  });
});

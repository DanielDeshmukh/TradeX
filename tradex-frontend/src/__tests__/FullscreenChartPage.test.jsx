import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import FullscreenChartPage from "../components/FullscreenChartPage";

vi.mock("../lib/supabase", () => ({
  default: { 
    auth: { getUser: vi.fn() },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          gte: vi.fn(() => ({
            lte: vi.fn(() => ({
              order: vi.fn(() => ({
                data: [],
                error: null,
              })),
            })),
          })),
        })),
      })),
    })),
  },
}));

describe("FullscreenChartPage", () => {
  it("renders the fullscreen chart page", () => {
    render(
      <MemoryRouter initialEntries={[{ pathname: "/fullscreen-chart", search: "?assetId=RELIANCE&assetName=Reliance" }]}>
        <FullscreenChartPage />
      </MemoryRouter>
    );
    expect(screen.getByText(/fullscreen chart/i) || screen.getByText(/reliance/i)).toBeInTheDocument();
  });

  it("renders exit button", () => {
    render(
      <MemoryRouter initialEntries={[{ pathname: "/fullscreen-chart", search: "?assetId=RELIANCE" }]}>
        <FullscreenChartPage />
      </MemoryRouter>
    );
    expect(screen.getByText(/exit/i) || screen.getByText(/close/i)).toBeInTheDocument();
  });
});

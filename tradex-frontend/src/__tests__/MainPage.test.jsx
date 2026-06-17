import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import MainPage from "../components/MainPage";

vi.mock("../lib/supabase", () => ({
  default: { auth: { getUser: vi.fn() } },
}));

vi.mock("../context/QuoteContext", () => ({
  QuoteProvider: ({ children }) => children,
  useQuote: () => ({
    quotes: {},
    wishlistSymbols: [],
  }),
}));

vi.mock("../hooks/useSignals", () => ({
  useSignals: () => ({
    signals: [],
    loading: false,
  }),
}));

vi.mock("../components/ChartContainer", () => ({
  default: () => <div data-testid="chart-container">ChartContainer</div>,
}));

vi.mock("../components/WishlistTable", () => ({
  default: () => <div data-testid="wishlist-table">WishlistTable</div>,
}));

vi.mock("../components/Header", () => ({
  default: () => <div data-testid="header">Header</div>,
}));

describe("MainPage", () => {
  it("renders the main page", () => {
    render(
      <MemoryRouter>
        <MainPage />
      </MemoryRouter>
    );
    expect(screen.getByTestId("chart-container")).toBeInTheDocument();
  });

  it("renders wishlist table", () => {
    render(
      <MemoryRouter>
        <MainPage />
      </MemoryRouter>
    );
    expect(screen.getByTestId("wishlist-table")).toBeInTheDocument();
  });

  it("renders header", () => {
    render(
      <MemoryRouter>
        <MainPage />
      </MemoryRouter>
    );
    expect(screen.getByTestId("header")).toBeInTheDocument();
  });
});

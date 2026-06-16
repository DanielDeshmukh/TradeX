import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import NetworkErrorPage from "../components/NetworkErrorPage";

const renderWithRouter = (component) => {
  return render(<MemoryRouter>{component}</MemoryRouter>);
};

describe("NetworkErrorPage", () => {
  it("renders network error heading", () => {
    renderWithRouter(<NetworkErrorPage onRetry={() => {}} />);
    expect(screen.getByText("Network Error")).toBeInTheDocument();
  });

  it("renders descriptive message", () => {
    renderWithRouter(<NetworkErrorPage onRetry={() => {}} />);
    expect(screen.getByText(/Unable to connect to the server/)).toBeInTheDocument();
  });

  it("renders Retry button", () => {
    renderWithRouter(<NetworkErrorPage onRetry={() => {}} />);
    expect(screen.getByText("Retry")).toBeInTheDocument();
  });

  it("renders Go to Dashboard button", () => {
    renderWithRouter(<NetworkErrorPage onRetry={() => {}} />);
    expect(screen.getByText("Go to Dashboard")).toBeInTheDocument();
  });

  it("calls onRetry when Retry is clicked", () => {
    const onRetry = vi.fn();
    renderWithRouter(<NetworkErrorPage onRetry={onRetry} />);
    screen.getByText("Retry").click();
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});

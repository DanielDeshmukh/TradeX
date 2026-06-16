import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { MemoryRouter } from "react-router-dom";
import NotFoundPage from "../components/NotFoundPage";

const renderWithRouter = (component) => {
  return render(<MemoryRouter>{component}</MemoryRouter>);
};

describe("NotFoundPage", () => {
  it("renders 404 text", () => {
    renderWithRouter(<NotFoundPage />);
    expect(screen.getByText("404")).toBeInTheDocument();
  });

  it("renders page not found heading", () => {
    renderWithRouter(<NotFoundPage />);
    expect(screen.getByText("Page Not Found")).toBeInTheDocument();
  });

  it("renders descriptive message", () => {
    renderWithRouter(<NotFoundPage />);
    expect(screen.getByText(/doesn't exist or has been moved/)).toBeInTheDocument();
  });

  it("renders Go Back button", () => {
    renderWithRouter(<NotFoundPage />);
    expect(screen.getByText("Go Back")).toBeInTheDocument();
  });

  it("renders Go to Dashboard button", () => {
    renderWithRouter(<NotFoundPage />);
    expect(screen.getByText("Go to Dashboard")).toBeInTheDocument();
  });
});

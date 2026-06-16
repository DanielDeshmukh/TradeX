import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { MemoryRouter } from "react-router-dom";
import AuthErrorPage from "../components/AuthErrorPage";

const renderWithRouter = (component) => {
  return render(<MemoryRouter>{component}</MemoryRouter>);
};

describe("AuthErrorPage", () => {
  it("renders authentication error heading", () => {
    renderWithRouter(<AuthErrorPage />);
    expect(screen.getByText("Authentication Error")).toBeInTheDocument();
  });

  it("renders default message when no message prop", () => {
    renderWithRouter(<AuthErrorPage />);
    expect(screen.getByText(/session has expired/)).toBeInTheDocument();
  });

  it("renders custom message when provided", () => {
    renderWithRouter(<AuthErrorPage message="Custom error message" />);
    expect(screen.getByText("Custom error message")).toBeInTheDocument();
  });

  it("renders Sign In button", () => {
    renderWithRouter(<AuthErrorPage />);
    expect(screen.getByText("Sign In")).toBeInTheDocument();
  });

  it("renders Go to Landing Page button", () => {
    renderWithRouter(<AuthErrorPage />);
    expect(screen.getByText("Go to Landing Page")).toBeInTheDocument();
  });
});

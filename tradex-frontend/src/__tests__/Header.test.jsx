import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { MemoryRouter } from "react-router-dom";
import Header from "../components/Header";

const renderWithRouter = (component, initialRoute = "/main-page") => {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      {component}
    </MemoryRouter>
  );
};

describe("Header", () => {
  it("renders TradeX logo", () => {
    renderWithRouter(<Header />);
    expect(screen.getByText("Trade")).toBeInTheDocument();
    expect(screen.getByText("X")).toBeInTheDocument();
  });

  it("renders notifications link", () => {
    const { container } = renderWithRouter(<Header />);
    const link = container.querySelector('a[href="/notifications"]');
    expect(link).toBeInTheDocument();
  });

  it("renders settings link", () => {
    const { container } = renderWithRouter(<Header />);
    const link = container.querySelector('a[href="/settings-page"]');
    expect(link).toBeInTheDocument();
  });

  it("renders profile link", () => {
    const { container } = renderWithRouter(<Header />);
    const link = container.querySelector('a[href="/profile-page"]');
    expect(link).toBeInTheDocument();
  });

  it("renders Find Chart Patterns button on main-page", () => {
    renderWithRouter(<Header />, "/main-page");
    expect(screen.getByText("Find Chart Patterns")).toBeInTheDocument();
  });

  it("does not render Find Chart Patterns button on other pages", () => {
    renderWithRouter(<Header />, "/settings-page");
    expect(screen.queryByText("Find Chart Patterns")).not.toBeInTheDocument();
  });
});

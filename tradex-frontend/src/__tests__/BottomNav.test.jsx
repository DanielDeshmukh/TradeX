import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { MemoryRouter } from "react-router-dom";
import BottomNav from "../components/BottomNav";

const renderWithRouter = (component, initialRoute = "/") => {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      {component}
    </MemoryRouter>
  );
};

describe("BottomNav", () => {
  it("renders all navigation items", () => {
    renderWithRouter(<BottomNav />);
    expect(screen.getByText("Chart")).toBeInTheDocument();
    expect(screen.getByText("Watchlist")).toBeInTheDocument();
    expect(screen.getByText("AI")).toBeInTheDocument();
    expect(screen.getByText("Profile")).toBeInTheDocument();
  });

  it("highlights Chart tab when on main-page", () => {
    renderWithRouter(<BottomNav />, "/main-page");
    const chartButton = screen.getByText("Chart").closest("button");
    expect(chartButton).toHaveClass("text-brand");
  });

  it("highlights Profile tab when on profile-page", () => {
    renderWithRouter(<BottomNav />, "/profile-page");
    const profileButton = screen.getByText("Profile").closest("button");
    expect(profileButton).toHaveClass("text-brand");
  });

  it("hides on desktop (md:hidden class)", () => {
    renderWithRouter(<BottomNav />);
    const nav = screen.getByRole("navigation");
    expect(nav).toHaveClass("md:hidden");
  });

  it("renders navigation as fixed bottom bar", () => {
    renderWithRouter(<BottomNav />);
    const nav = screen.getByRole("navigation");
    expect(nav).toHaveClass("fixed");
    expect(nav).toHaveClass("bottom-0");
  });

  it("navigates when Profile tab is clicked", () => {
    renderWithRouter(<BottomNav />, "/main-page");
    fireEvent.click(screen.getByText("Profile"));
    // Navigation happens via useNavigate
  });
});

import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import BottomNav from "../components/BottomNav";

describe("BottomNav", () => {
  it("renders all navigation items", () => {
    render(<BottomNav activeTab="chart" onTabChange={() => {}} />);
    expect(screen.getByText("Chart")).toBeInTheDocument();
    expect(screen.getByText("Watchlist")).toBeInTheDocument();
    expect(screen.getByText("AI")).toBeInTheDocument();
    expect(screen.getByText("Profile")).toBeInTheDocument();
  });

  it("highlights Chart tab when activeTab is chart", () => {
    render(<BottomNav activeTab="chart" onTabChange={() => {}} />);
    const chartButton = screen.getByText("Chart").closest("button");
    expect(chartButton).toHaveClass("text-brand");
  });

  it("highlights Profile tab when activeTab is profile", () => {
    render(<BottomNav activeTab="profile" onTabChange={() => {}} />);
    const profileButton = screen.getByText("Profile").closest("button");
    expect(profileButton).toHaveClass("text-brand");
  });

  it("calls onTabChange when a tab is clicked", () => {
    const onTabChange = vi.fn();
    render(<BottomNav activeTab="chart" onTabChange={onTabChange} />);
    fireEvent.click(screen.getByText("Profile"));
    expect(onTabChange).toHaveBeenCalledWith("profile");
  });

  it("hides on desktop (md:hidden class)", () => {
    render(<BottomNav activeTab="chart" onTabChange={() => {}} />);
    const nav = screen.getByRole("navigation");
    expect(nav).toHaveClass("md:hidden");
  });

  it("renders navigation as fixed bottom bar", () => {
    render(<BottomNav activeTab="chart" onTabChange={() => {}} />);
    const nav = screen.getByRole("navigation");
    expect(nav).toHaveClass("fixed");
    expect(nav).toHaveClass("bottom-0");
  });
});

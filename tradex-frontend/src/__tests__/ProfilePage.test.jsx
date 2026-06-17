import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import ProfilePage from "../components/ProfilePage";

vi.mock("../hooks/useUserSettings", () => ({
  useUserSettings: () => ({
    profile: {
      display_name: "Demo Trader",
      email: "demo@tradex.dev",
    },
    loading: false,
  }),
}));

vi.mock("../lib/supabase", () => ({
  default: { auth: { getUser: vi.fn() } },
}));

vi.mock("../components/Header", () => ({
  default: () => <div data-testid="header">Header</div>,
}));

vi.mock("../components/ProfileHeader", () => ({
  default: () => <div data-testid="profile-header">ProfileHeader</div>,
}));

vi.mock("../components/ContactInfo", () => ({
  default: () => <div data-testid="contact-info">ContactInfo</div>,
}));

vi.mock("../components/SubscriptionPlan", () => ({
  default: () => <div data-testid="subscription-plan">SubscriptionPlan</div>,
}));

vi.mock("../components/ReferralCode", () => ({
  default: () => <div data-testid="referral-code">ReferralCode</div>,
}));

vi.mock("../components/ActivityHeatmap", () => ({
  default: () => <div data-testid="activity-heatmap">ActivityHeatmap</div>,
}));

describe("ProfilePage", () => {
  it("renders profile page with all sections", () => {
    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>
    );
    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByTestId("profile-header")).toBeInTheDocument();
    expect(screen.getByTestId("contact-info")).toBeInTheDocument();
    expect(screen.getByTestId("subscription-plan")).toBeInTheDocument();
    expect(screen.getByTestId("referral-code")).toBeInTheDocument();
    expect(screen.getByTestId("activity-heatmap")).toBeInTheDocument();
  });

  it("renders logout button", () => {
    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>
    );
    expect(screen.getByText("Logout")).toBeInTheDocument();
  });
});

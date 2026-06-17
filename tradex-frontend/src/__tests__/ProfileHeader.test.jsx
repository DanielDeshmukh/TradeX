import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import ProfileHeader from "../components/ProfileHeader";

const mockUpdateProfile = vi.fn();

vi.mock("../hooks/useUserSettings", () => ({
  useUserSettings: () => ({
    profile: {
      display_name: "Demo Trader",
      email: "demo@tradex.dev",
      avatar_url: null,
    },
    loading: false,
    updateProfile: mockUpdateProfile,
  }),
}));

vi.mock("../lib/supabase", () => ({
  default: { auth: { getUser: vi.fn() } },
}));

describe("ProfileHeader", () => {
  it("renders user display name", () => {
    render(<ProfileHeader />);
    expect(screen.getByText("Demo Trader")).toBeInTheDocument();
  });

  it("renders user email", () => {
    render(<ProfileHeader />);
    expect(screen.getByText("demo@tradex.dev")).toBeInTheDocument();
  });

  it("renders edit profile button", () => {
    render(<ProfileHeader />);
    expect(screen.getByText("Edit Profile")).toBeInTheDocument();
  });

  it("shows edit form when edit button clicked", () => {
    render(<ProfileHeader />);
    fireEvent.click(screen.getByText("Edit Profile"));
    expect(screen.getByPlaceholderText("Enter your username")).toBeInTheDocument();
    expect(screen.getByText("Save")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });

  it("hides edit form when cancel clicked", () => {
    render(<ProfileHeader />);
    fireEvent.click(screen.getByText("Edit Profile"));
    fireEvent.click(screen.getByText("Cancel"));
    expect(screen.queryByPlaceholderText("Enter your username")).not.toBeInTheDocument();
  });

  it("renders user avatar", () => {
    render(<ProfileHeader />);
    const avatar = screen.getByAltText("User Avatar");
    expect(avatar).toBeInTheDocument();
  });
});

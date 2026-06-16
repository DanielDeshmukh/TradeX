import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

vi.mock("react-icons/ri", () => ({
  RiHome4Line: () => <span data-testid="icon" />,
  RiBarChartBoxLine: () => <span data-testid="icon" />,
  RiBookOpenLine: () => <span data-testid="icon" />,
  RiUserLine: () => <span data-testid="icon" />,
  RiSettings3Line: () => <span data-testid="icon" />,
  RiMenuLine: () => <span data-testid="icon" />,
  RiNotification3Line: () => <span data-testid="icon" />,
}));

import PrivacyPolicy from "../components/PrivacyPolicy";

describe("PrivacyPolicy", () => {
  it("renders heading", () => {
    render(<MemoryRouter><PrivacyPolicy /></MemoryRouter>);
    expect(screen.getByText("Privacy Policy")).toBeDefined();
  });

  it("shows last updated date", () => {
    render(<MemoryRouter><PrivacyPolicy /></MemoryRouter>);
    expect(screen.getByText(/Last updated/)).toBeDefined();
  });

  it("renders all 8 sections", () => {
    render(<MemoryRouter><PrivacyPolicy /></MemoryRouter>);
    expect(screen.getByText(/1\. Information We Collect/)).toBeDefined();
    expect(screen.getByText(/2\. How We Use Your Information/)).toBeDefined();
    expect(screen.getByText(/3\. Data Security/)).toBeDefined();
    expect(screen.getByText(/4\. Cookies & Tracking/)).toBeDefined();
    expect(screen.getByText(/5\. Third-Party Services/)).toBeDefined();
    expect(screen.getByText(/6\. Your Rights/)).toBeDefined();
    expect(screen.getByText(/7\. Changes to This Policy/)).toBeDefined();
    expect(screen.getByText(/8\. Contact Us/)).toBeDefined();
  });
});

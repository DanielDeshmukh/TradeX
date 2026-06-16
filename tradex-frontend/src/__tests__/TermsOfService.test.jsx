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

import TermsOfService from "../components/TermsOfService";

describe("TermsOfService", () => {
  it("renders heading", () => {
    render(<MemoryRouter><TermsOfService /></MemoryRouter>);
    expect(screen.getByText("Terms of Service")).toBeDefined();
  });

  it("shows last updated date", () => {
    render(<MemoryRouter><TermsOfService /></MemoryRouter>);
    expect(screen.getByText(/Last updated/)).toBeDefined();
  });

  it("renders all 9 sections", () => {
    render(<MemoryRouter><TermsOfService /></MemoryRouter>);
    expect(screen.getByText(/1\. Acceptance of Terms/)).toBeDefined();
    expect(screen.getByText(/2\. Account Registration/)).toBeDefined();
    expect(screen.getByText(/3\. Subscriptions & Billing/)).toBeDefined();
    expect(screen.getByText(/4\. AI Signals Disclaimer/)).toBeDefined();
    expect(screen.getByText(/5\. Acceptable Use/)).toBeDefined();
    expect(screen.getByText(/6\. Intellectual Property/)).toBeDefined();
    expect(screen.getByText(/7\. Limitation of Liability/)).toBeDefined();
    expect(screen.getByText(/8\. Termination/)).toBeDefined();
    expect(screen.getByText(/9\. Governing Law/)).toBeDefined();
  });
});

import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import ForgotPassword from "../components/ForgotPassword";

vi.mock("../lib/supabase", () => ({
  default: { auth: { resetPasswordForEmail: vi.fn() } },
}));

describe("ForgotPassword", () => {
  it("renders forgot password form", () => {
    render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    );
    expect(screen.getByText(/forgot password/i)).toBeInTheDocument();
  });

  it("renders email input", () => {
    render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    );
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
  });

  it("renders submit button", () => {
    render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    );
    expect(screen.getByText(/send reset link/i) || screen.getByText(/submit/i)).toBeInTheDocument();
  });

  it("renders back to login link", () => {
    render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    );
    expect(screen.getByText(/back to login/i) || screen.getByText(/sign in/i)).toBeInTheDocument();
  });
});

import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import UpdatePassword from "../components/UpdatePassword";

vi.mock("../lib/supabase", () => ({
  default: { auth: { updateUser: vi.fn() } },
}));

describe("UpdatePassword", () => {
  it("renders update password form", () => {
    render(
      <MemoryRouter>
        <UpdatePassword />
      </MemoryRouter>
    );
    expect(screen.getByText(/update password/i) || screen.getByText(/new password/i)).toBeInTheDocument();
  });

  it("renders new password input", () => {
    render(
      <MemoryRouter>
        <UpdatePassword />
      </MemoryRouter>
    );
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
  });

  it("renders submit button", () => {
    render(
      <MemoryRouter>
        <UpdatePassword />
      </MemoryRouter>
    );
    expect(screen.getByText(/update/i) || screen.getByText(/save/i)).toBeInTheDocument();
  });
});

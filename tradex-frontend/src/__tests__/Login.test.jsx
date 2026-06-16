import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import Login from "../components/Login";

vi.mock("../lib/supabase", () => ({
  default: { auth: { signInWithPassword: vi.fn() } },
  isDemoMode: false,
}));

vi.mock("react-toastify", () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

const renderWithRouter = (component) => {
  return render(<MemoryRouter>{component}</MemoryRouter>);
};

describe("Login", () => {
  it("renders Login heading", () => {
    renderWithRouter(<Login />);
    expect(screen.getByText("Login")).toBeInTheDocument();
  });

  it("renders email and password inputs", () => {
    renderWithRouter(<Login />);
    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
  });

  it("renders Sign In button", () => {
    renderWithRouter(<Login />);
    expect(screen.getByText("Sign In")).toBeInTheDocument();
  });

  it("renders register link", () => {
    renderWithRouter(<Login />);
    expect(screen.getByText("Don't have an account?")).toHaveAttribute("href", "/register");
  });

  it("renders forgot password link", () => {
    renderWithRouter(<Login />);
    expect(screen.getByText("Forgot Password?")).toHaveAttribute("href", "/forgot-password");
  });

  it("toggles password visibility", () => {
    renderWithRouter(<Login />);
    const passwordInput = screen.getByPlaceholderText("Password");
    expect(passwordInput).toHaveAttribute("type", "password");
    fireEvent.click(screen.getByRole("button", { name: "" }));
    expect(passwordInput).toHaveAttribute("type", "text");
  });

  it("updates email input", () => {
    renderWithRouter(<Login />);
    const emailInput = screen.getByPlaceholderText("Email");
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    expect(emailInput).toHaveValue("test@example.com");
  });

  it("updates password input", () => {
    renderWithRouter(<Login />);
    const passwordInput = screen.getByPlaceholderText("Password");
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    expect(passwordInput).toHaveValue("password123");
  });
});

import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import Register from "../components/Register";

vi.mock("../lib/supabase", () => ({
  default: { auth: { signUp: vi.fn(), signInWithOAuth: vi.fn() } },
}));

vi.mock("react-toastify", () => ({
  toast: { error: vi.fn(), success: vi.fn(), info: vi.fn() },
}));

const renderWithRouter = (component) => {
  return render(<MemoryRouter>{component}</MemoryRouter>);
};

describe("Register", () => {
  it("renders Create Account heading", () => {
    renderWithRouter(<Register />);
    expect(screen.getByText("Create Account")).toBeInTheDocument();
  });

  it("renders email and password inputs", () => {
    renderWithRouter(<Register />);
    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Create Password")).toBeInTheDocument();
  });

  it("renders Sign Up button", () => {
    renderWithRouter(<Register />);
    expect(screen.getByText("Sign Up")).toBeInTheDocument();
  });

  it("renders Google sign-in button", () => {
    renderWithRouter(<Register />);
    expect(screen.getByText("Sign in with Google")).toBeInTheDocument();
  });

  it("renders login link", () => {
    renderWithRouter(<Register />);
    expect(screen.getByText("Already have an account?")).toHaveAttribute("href", "/login");
  });

  it("toggles password visibility", () => {
    renderWithRouter(<Register />);
    const passwordInput = screen.getByPlaceholderText("Create Password");
    expect(passwordInput).toHaveAttribute("type", "password");
    fireEvent.click(screen.getByRole("button", { name: "" }));
    expect(passwordInput).toHaveAttribute("type", "text");
  });

  it("updates email input", () => {
    renderWithRouter(<Register />);
    const emailInput = screen.getByPlaceholderText("Email");
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    expect(emailInput).toHaveValue("test@example.com");
  });

  it("updates password input", () => {
    renderWithRouter(<Register />);
    const passwordInput = screen.getByPlaceholderText("Create Password");
    fireEvent.change(passwordInput, { target: { value: "Password1!" } });
    expect(passwordInput).toHaveValue("Password1!");
  });
});

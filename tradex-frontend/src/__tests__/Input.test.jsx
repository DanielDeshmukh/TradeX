import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Input from "../components/ui/Input";

describe("Input", () => {
  it("renders input element", () => {
    render(<Input />);
    expect(screen.getByRole("textbox")).toBeDefined();
  });

  it("renders with label", () => {
    render(<Input label="Email" />);
    expect(screen.getByText("Email")).toBeDefined();
  });

  it("displays error message", () => {
    render(<Input error="Required field" />);
    expect(screen.getByText("Required field")).toBeDefined();
  });

  it("applies error styling", () => {
    render(<Input error="Error" />);
    const input = screen.getByRole("textbox");
    expect(input.className).toContain("border-bearish");
  });

  it("applies custom className", () => {
    render(<Input className="custom-class" />);
    const input = screen.getByRole("textbox");
    expect(input.className).toContain("custom-class");
  });

  it("forwards ref", () => {
    const ref = { current: null };
    render(<Input ref={ref} />);
    expect(ref.current).not.toBeNull();
  });

  it("passes props to input", () => {
    render(<Input placeholder="Enter email" type="email" />);
    const input = screen.getByPlaceholderText("Enter email");
    expect(input.type).toBe("email");
  });
});

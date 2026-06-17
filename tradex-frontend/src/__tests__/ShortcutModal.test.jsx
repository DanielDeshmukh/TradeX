import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import ShortcutModal from "../components/ShortcutModal";

describe("ShortcutModal", () => {
  it("renders shortcuts header", () => {
    render(<ShortcutModal onClose={vi.fn()} />);
    expect(screen.getByText(/keyboard shortcuts/i)).toBeInTheDocument();
  });

  it("renders shortcut list", () => {
    render(<ShortcutModal onClose={vi.fn()} />);
    expect(screen.getByText(/zoom/i)).toBeInTheDocument();
    expect(screen.getByText(/scroll/i)).toBeInTheDocument();
    expect(screen.getByText(/reset/i)).toBeInTheDocument();
  });

  it("renders close button", () => {
    render(<ShortcutModal onClose={vi.fn()} />);
    expect(screen.getByText(/close/i) || screen.getByText("×")).toBeInTheDocument();
  });

  it("calls onClose when close clicked", () => {
    const onClose = vi.fn();
    render(<ShortcutModal onClose={onClose} />);
    fireEvent.click(screen.getByText(/close/i) || screen.getByText("×"));
    expect(onClose).toHaveBeenCalled();
  });
});

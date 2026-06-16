import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Footer from "../components/Footer";

describe("Footer", () => {
  it("renders copyright text", () => {
    render(<Footer />);
    expect(screen.getByText(/© 2025 TradeX/)).toBeDefined();
  });

  it("shows Powered by Dhan", () => {
    render(<Footer />);
    expect(screen.getByText("Powered by")).toBeDefined();
  });

  it("renders Dhan logo image", () => {
    render(<Footer />);
    const img = screen.getByAltText("dhan");
    expect(img).toBeDefined();
  });
});

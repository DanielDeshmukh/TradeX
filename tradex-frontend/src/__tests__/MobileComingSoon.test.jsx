import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import MobileComingSoon from "../components/MobileComingSoon";

describe("MobileComingSoon", () => {
  it("renders children when provided", () => {
    render(
      <MobileComingSoon>
        <div>Child content</div>
      </MobileComingSoon>
    );
    expect(screen.getByText("Child content")).toBeDefined();
  });

  it("returns null when no children", () => {
    const { container } = render(<MobileComingSoon />);
    expect(container.innerHTML).toBe("");
  });

  it("renders multiple children", () => {
    const { container } = render(
      <MobileComingSoon>
        <span>First</span>
        <span>Second</span>
      </MobileComingSoon>
    );
    expect(container.textContent).toContain("First");
    expect(container.textContent).toContain("Second");
  });
});

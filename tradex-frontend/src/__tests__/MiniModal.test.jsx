import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import MiniModal from "../components/MiniModal";

describe("MiniModal", () => {
  it("renders children", () => {
    const { container } = render(
      <MiniModal>
        <span>Modal content</span>
      </MiniModal>
    );
    expect(container.textContent).toContain("Modal content");
  });

  it("applies correct classes", () => {
    const { container } = render(<MiniModal />);
    const div = container.firstChild;
    expect(div.className).toContain("z-50");
    expect(div.className).toContain("rounded-lg");
  });

  it("forwards modalRef", () => {
    const ref = { current: null };
    render(<MiniModal modalRef={ref} />);
    expect(ref.current).not.toBeNull();
  });
});

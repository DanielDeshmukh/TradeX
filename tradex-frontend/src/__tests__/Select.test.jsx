import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Select from "../components/ui/Select";

describe("Select", () => {
  it("renders select element", () => {
    render(<Select />);
    expect(screen.getByRole("combobox")).toBeDefined();
  });

  it("renders with label", () => {
    render(<Select label="Timeframe" />);
    expect(screen.getByText("Timeframe")).toBeDefined();
  });

  it("renders options", () => {
    render(<Select options={["1min", "5min", "15min"]} />);
    expect(screen.getByText("1min")).toBeDefined();
    expect(screen.getByText("5min")).toBeDefined();
    expect(screen.getByText("15min")).toBeDefined();
  });

  it("renders object options", () => {
    render(
      <Select options={[{ value: "1m", label: "1 Minute" }, { value: "5m", label: "5 Minute" }]} />
    );
    expect(screen.getByText("1 Minute")).toBeDefined();
    expect(screen.getByText("5 Minute")).toBeDefined();
  });

  it("renders placeholder", () => {
    render(<Select placeholder="Select interval" />);
    expect(screen.getByText("Select interval")).toBeDefined();
  });

  it("displays error message", () => {
    render(<Select error="Required" />);
    expect(screen.getByText("Required")).toBeDefined();
  });

  it("forwards ref", () => {
    const ref = { current: null };
    render(<Select ref={ref} />);
    expect(ref.current).not.toBeNull();
  });
});

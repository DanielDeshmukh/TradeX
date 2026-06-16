import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, act } from "@testing-library/react";

vi.mock("../assets/tab-icon.png", () => ({ default: "mock-banner.png" }));

import SplashScreen from "../components/SplashScreen";

describe("SplashScreen", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders logo image", () => {
    const { getByAltText } = render(<SplashScreen />);
    expect(getByAltText("Logo")).toBeDefined();
  });

  it("starts with 0% progress", () => {
    render(<SplashScreen />);
    const bar = document.querySelector(".bg-purple-600");
    expect(bar.style.width).toBe("0%");
  });

  it("increments progress over time", () => {
    render(<SplashScreen />);
    act(() => {
      vi.advanceTimersByTime(600);
    });
    const bar = document.querySelector(".bg-purple-600");
    expect(bar.style.width).not.toBe("0%");
  });

  it("reaches 100% after all steps", () => {
    render(<SplashScreen />);
    act(() => {
      vi.advanceTimersByTime(1200);
    });
    const bar = document.querySelector(".bg-purple-600");
    expect(bar.style.width).toBe("100%");
  });
});

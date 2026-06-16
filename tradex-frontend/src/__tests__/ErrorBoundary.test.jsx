import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ErrorBoundary from "../components/ErrorBoundary";

function Bomb() {
  throw new Error("Test error");
}

function GoodChild() {
  return <div>All good</div>;
}

describe("ErrorBoundary", () => {
  it("renders children when no error", () => {
    render(
      <ErrorBoundary>
        <GoodChild />
      </ErrorBoundary>
    );
    expect(screen.getByText("All good")).toBeDefined();
  });

  it("renders error UI when child throws", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>
    );
    expect(screen.getByText("Something went wrong")).toBeDefined();
    consoleSpy.mockRestore();
  });

  it("shows Try Again button", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>
    );
    expect(screen.getByText("Try Again")).toBeDefined();
    consoleSpy.mockRestore();
  });

  it("shows Go to Dashboard button", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>
    );
    expect(screen.getByText("Go to Dashboard")).toBeDefined();
    consoleSpy.mockRestore();
  });

  it("renders custom fallback when provided", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const fallback = ({ error, reset }) => (
      <div>
        <span>Custom error: {error.message}</span>
        <button onClick={reset}>Custom reset</button>
      </div>
    );
    render(
      <ErrorBoundary fallback={fallback}>
        <Bomb />
      </ErrorBoundary>
    );
    expect(screen.getByText(/Custom error/)).toBeDefined();
    consoleSpy.mockRestore();
  });
});

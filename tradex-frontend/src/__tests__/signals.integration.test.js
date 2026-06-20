/* eslint-disable no-undef */
import { describe, it, expect } from "vitest";

describe("Signal Generation Pipeline Integration", () => {
  const API_URL = process.env.VITE_API_URL || "http://localhost:8000";

  it("should fetch signals from API", async () => {
    const res = await fetch(`${API_URL}/api/signals/all`);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.signals).toBeDefined();
    expect(Array.isArray(data.signals)).toBe(true);
  });

  it("should fetch signal history for a symbol", async () => {
    const res = await fetch(`${API_URL}/api/signals/history?security_id=RELIANCE&limit=10`);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data).toHaveProperty("signals");
  });

  it("should fetch latest signal for a symbol", async () => {
    const res = await fetch(`${API_URL}/api/signals/latest?security_id=RELIANCE`);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data).toHaveProperty("signal");
  });

  it("should fetch features for ML pipeline", async () => {
    const res = await fetch(`${API_URL}/api/features?security_id=RELIANCE&limit=5`);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data).toHaveProperty("features");
  });
});

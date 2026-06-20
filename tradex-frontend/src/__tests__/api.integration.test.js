/* eslint-disable no-undef */
import { describe, it, expect } from "vitest";

const API_URL = process.env.VITE_API_URL || "http://localhost:8000";

describe("API Integration Tests", () => {
  describe("Health Check", () => {
    it("GET /health returns healthy status", async () => {
      const res = await fetch(`${API_URL}/health`);
      const data = await res.json();
      expect(res.status).toBe(200);
      expect(data.status).toBe("healthy");
    });
  });

  describe("Candles API", () => {
    it("GET /api/candles returns candle data", async () => {
      const res = await fetch(`${API_URL}/api/candles?security_id=RELIANCE&timeframe=1D&limit=10`);
      const data = await res.json();
      expect(res.status).toBe(200);
      expect(data).toHaveProperty("candles");
    });
  });

  describe("Symbols API", () => {
    it("GET /api/symbols returns symbol list", async () => {
      const res = await fetch(`${API_URL}/api/symbols`);
      const data = await res.json();
      expect(res.status).toBe(200);
      expect(data).toHaveProperty("symbols");
      expect(Array.isArray(data.symbols)).toBe(true);
    });
  });

  describe("Signals API", () => {
    it("GET /api/signals/all returns signals", async () => {
      const res = await fetch(`${API_URL}/api/signals/all`);
      const data = await res.json();
      expect(res.status).toBe(200);
      expect(data).toHaveProperty("signals");
    });
  });

  describe("Search API", () => {
    it("GET /api/search returns search results", async () => {
      const res = await fetch(`${API_URL}/api/search?q=REL`);
      const data = await res.json();
      expect(res.status).toBe(200);
      expect(data).toHaveProperty("results");
    });
  });

  describe("User Settings API", () => {
    const testUserId = "integration-test-user";

    it("GET /api/user-settings creates default settings", async () => {
      const res = await fetch(`${API_URL}/api/user-settings/${testUserId}`);
      const data = await res.json();
      expect(res.status).toBe(200);
      expect(data).toHaveProperty("settings");
      expect(data.settings.theme).toBe("tradex");
    });

    it("PUT /api/user-settings updates settings", async () => {
      const res = await fetch(`${API_URL}/api/user-settings/${testUserId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme: "claude" }),
      });
      const data = await res.json();
      expect(res.status).toBe(200);
      expect(data.settings.theme).toBe("claude");
    });
  });

  describe("Watchlist API", () => {
    const testUserId = "integration-test-user";

    it("POST /api/watchlist adds item", async () => {
      const res = await fetch(`${API_URL}/api/watchlist/${testUserId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          security_id: "RELIANCE",
          display_name: "Reliance Industries",
          exchange_id: "NSE",
        }),
      });
      const data = await res.json();
      expect(res.status).toBe(200);
      expect(data).toHaveProperty("item");
    });

    it("GET /api/watchlist returns watchlist", async () => {
      const res = await fetch(`${API_URL}/api/watchlist/${testUserId}`);
      const data = await res.json();
      expect(res.status).toBe(200);
      expect(data).toHaveProperty("watchlist");
      expect(Array.isArray(data.watchlist)).toBe(true);
    });

    it("DELETE /api/watchlist removes item", async () => {
      const res = await fetch(`${API_URL}/api/watchlist/${testUserId}/RELIANCE`, {
        method: "DELETE",
      });
      const data = await res.json();
      expect(res.status).toBe(200);
      expect(data).toHaveProperty("message");
    });
  });

  describe("Leaderboard API", () => {
    it("GET /api/leaderboard returns rankings", async () => {
      const res = await fetch(`${API_URL}/api/leaderboard`);
      const data = await res.json();
      expect(res.status).toBe(200);
      expect(data).toHaveProperty("leaderboard");
    });

    it("POST /api/seed-leaderboard seeds demo data", async () => {
      const res = await fetch(`${API_URL}/api/seed-leaderboard`, {
        method: "POST",
      });
      const data = await res.json();
      expect(res.status).toBe(200);
      expect(data).toHaveProperty("message");
    });
  });

  describe("Learning API", () => {
    it("GET /api/courses returns course list", async () => {
      const res = await fetch(`${API_URL}/api/courses`);
      const data = await res.json();
      expect(res.status).toBe(200);
      expect(data).toHaveProperty("courses");
      expect(Array.isArray(data.courses)).toBe(true);
      expect(data.courses.length).toBeGreaterThan(0);
    });

    it("GET /api/courses/trading-basics returns specific course", async () => {
      const res = await fetch(`${API_URL}/api/courses/trading-basics`);
      const data = await res.json();
      expect(res.status).toBe(200);
      expect(data).toHaveProperty("course");
      expect(data.course.id).toBe("trading-basics");
    });
  });
});

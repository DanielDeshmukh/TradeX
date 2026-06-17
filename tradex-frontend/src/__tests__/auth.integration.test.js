import { describe, it, expect } from "vitest";

describe("Auth Flow Integration", () => {
  it("should handle demo user authentication flow", async () => {
    const API_URL = process.env.VITE_API_URL || "http://localhost:8000";
    
    // Step 1: Check health
    const healthRes = await fetch(`${API_URL}/health`);
    expect(healthRes.status).toBe(200);
    
    // Step 2: Get or create user settings
    const settingsRes = await fetch(`${API_URL}/api/user-settings/demo-user`);
    const settingsData = await settingsRes.json();
    expect(settingsData.settings).toBeDefined();
    
    // Step 3: Get or create user profile
    const profileRes = await fetch(`${API_URL}/api/user-profile/demo-user`);
    const profileData = await profileRes.json();
    expect(profileData).toHaveProperty("profile");
  });

  it("should handle user settings persistence", async () => {
    const API_URL = process.env.VITE_API_URL || "http://localhost:8000";
    const userId = "auth-test-user";
    
    // Create settings
    await fetch(`${API_URL}/api/user-settings/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ theme: "nvidia" }),
    });
    
    // Verify settings persisted
    const res = await fetch(`${API_URL}/api/user-settings/${userId}`);
    const data = await res.json();
    expect(data.settings.theme).toBe("nvidia");
  });

  it("should handle profile updates", async () => {
    const API_URL = process.env.VITE_API_URL || "http://localhost:8000";
    const userId = "auth-test-user";
    
    // Update profile
    await fetch(`${API_URL}/api/user-profile/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ display_name: "Test User" }),
    });
    
    // Verify profile persisted
    const res = await fetch(`${API_URL}/api/user-profile/${userId}`);
    const data = await res.json();
    expect(data.profile.display_name).toBe("Test User");
  });
});

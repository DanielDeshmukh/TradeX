import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useUserSettings } from "../hooks/useUserSettings";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

function ProfileHeader() {
  const [userId, setUserId] = useState(null);
  const { profile, updateProfile, loading: hookLoading } = useUserSettings(userId);
  const [username, setUsername] = useState(null);
  const [profilePic, setProfilePic] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setUserId("demo-user");
  }, []);

  useEffect(() => {
    if (profile) {
      setUsername(profile.display_name || "");
      setProfilePic(profile.avatar_url || null);
    }
  }, [profile]);

  const handleSave = async () => {
    if (!userId) return;
    setLoading(true);

    try {
      await updateProfile({
        display_name: username?.trim() || null,
        avatar_url: profilePic,
      });

      toast.success("Profile updated successfully!", {
        style: { background: "#1f1f1f", color: "#4ade80" },
      });
      setIsEditing(false);
    } catch (err) {
      console.error(err.message);
      toast.error("Failed to update profile.", {
        style: { background: "#1f1f1f", color: "#ff6b6b" },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    if (!userId) return;

    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);

    try {
      // For now, use a placeholder URL since we removed Supabase storage
      // In production, this would upload to a file storage service
      const placeholderUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${userId}`;
      setProfilePic(placeholderUrl);

      await updateProfile({ avatar_url: placeholderUrl });

      toast.success("Profile picture updated!", {
        style: { background: "#1f1f1f", color: "#4ade80" },
      });
    } catch (err) {
      console.error(err.message);
      toast.error("Failed to update profile picture.", {
        style: { background: "#1f1f1f", color: "#ff6b6b" },
      });
    } finally {
      setLoading(false);
    }
  };

  const displayName =
    username && username.trim() !== "" ? username : "Set your username";
  const avatarUrl =
    profilePic || "https://api.dicebear.com/7.x/bottts/svg?seed=defaultUser";

  return (
    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
      <div className="relative">
        <img
          src={avatarUrl}
          alt="User Avatar"
          className="w-20 h-20 rounded-full border-4 border-brand object-cover shadow-brand"
        />
        {isEditing && (
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="mt-2 text-sm w-full text-white"
            disabled={loading}
          />
        )}
      </div>

      <div className="text-center sm:text-left w-full sm:w-auto">
        {isEditing ? (
          <div className="flex flex-col sm:flex-row gap-2 glass p-3 rounded-xl">
            <input
              type="text"
              value={username || ""}
              onChange={(e) => setUsername(e.target.value)}
              className="px-3 py-2 rounded-md bg-surface-input text-white border border-brand focus:ring-2 focus:ring-brand/20 focus:outline-none"
              disabled={loading}
              placeholder="Enter your username"
            />
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-4 py-2 btn-primary rounded-md font-medium shadow-lg"
            >
              {loading ? "Saving..." : "Save"}
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-800 rounded-md text-white font-medium"
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-xl sm:text-2xl font-semibold break-all">
              {displayName}
            </h2>
            <p className="text-sm text-content-secondary">
              {profile?.email || "demo@tradex.dev"}
            </p>
            <button
              onClick={() => setIsEditing(true)}
              className="mt-2 px-4 py-1 btn-primary hover:opacity-90 rounded-md font-medium w-full sm:w-auto shadow-md"
            >
              Edit Profile
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default ProfileHeader;

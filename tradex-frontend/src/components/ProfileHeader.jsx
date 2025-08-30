import React, { useState, useEffect } from "react";
import supabase from "../lib/supabase";

function ProfileHeader() {
  const [session, setSession] = useState(null);
  const [username, setUsername] = useState(null);
  const [profilePic, setProfilePic] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);

      if (session?.user) {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("username, profile_pic")
          .eq("id", session.user.id)
          .single();

        if (error) {
          console.warn("No profile row yet:", error.message);
        } else {
          setUsername(profile?.username || "");
          setProfilePic(profile?.profile_pic || null);
        }
      }
    };

    fetchUser();
  }, []);

  const handleSave = async () => {
    if (!session?.user) return;
    setLoading(true);

    try {
      if (username) {
        const { data: existingUser, error: checkError } = await supabase
          .from("profiles")
          .select("id")
          .eq("username", username)
          .neq("id", session.user.id)
          .maybeSingle();

        if (checkError) throw checkError;
        if (existingUser) {
          alert("Username already taken. Please choose another.");
          setLoading(false);
          return;
        }
      }
      const { error } = await supabase.from("profiles").upsert({
        id: session.user.id,
        username: username?.trim() || null,
        profile_pic: profilePic,
      });

      if (error) throw error;

      alert("Profile updated successfully.");
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating profile:", err.message);
      alert("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

 const handleUpload = async (e) => {
  if (!session?.user) return;

  const file = e.target.files[0];
  if (!file) return;

  setLoading(true);

  try {
    const filePath = `${session.user.id}/${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
    setProfilePic(data.publicUrl);

    await supabase.from("profiles").update({
      id: session.user.id,
      profile_pic: data.publicUrl
    }).eq("id", session.user.id);

  } catch (err) {
    console.error("Error uploading file:", err.message);
    alert("Failed to upload profile picture.");
  } finally {
    setLoading(false);
  }
};


  const displayName =
    username && username.trim() !== ""
      ? username
      : "Set your username";

  const avatarUrl =
    profilePic ||
    "https://api.dicebear.com/7.x/bottts/svg?seed=defaultUser";

  return (
    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
      <div className="relative">
        <img
          src={avatarUrl}
          alt="User Avatar"
          className="w-20 h-20 rounded-full border-4 border-purple-600 object-cover"
        />
        {isEditing && (
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="mt-2 text-sm"
            disabled={loading}
          />
        )}
      </div>

      <div className="text-center sm:text-left w-full sm:w-auto">
        {isEditing ? (
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={username || ""}
              onChange={(e) => setUsername(e.target.value)}
              className="px-3 py-2 rounded-md bg-[#1a1a1a] text-white border border-purple-500 flex-1"
              disabled={loading}
              placeholder="Enter your username"
            />
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-md text-sm font-medium text-white disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save"}
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-800 rounded-md text-sm font-medium text-white"
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
            <p className="text-sm text-gray-400">
              {session?.user?.email || "Not logged in"}
            </p>
            <button
              onClick={() => setIsEditing(true)}
              className="mt-2 px-4 py-1 bg-purple-700 hover:bg-purple-800 rounded-md text-sm font-medium w-full sm:w-auto"
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

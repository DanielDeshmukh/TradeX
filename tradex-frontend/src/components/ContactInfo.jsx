import React, { useState, useEffect } from "react";
import supabase from "../lib/supabase";
import { toast, ToastContainer } from "react-toastify";

function ContactInfo() {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        setEmail(session.user.email);

        const { data: userRow, error } = await supabase
          .from("profiles")
          .select("phone")
          .eq("id", session.user.id)
          .single();

        if (error) console.warn("No profile row found yet:", error.message);
        if (userRow?.phone) setPhone(userRow.phone);
      }
    };

    fetchUserData();
  }, []);

  const handleSave = async () => {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error("User not authenticated.", {
        style: { background: "#1f1f1f", color: "#ff6b6b" },
      });
      setLoading(false);
      return;
    }

    try {
      if (email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({ email });
        if (emailError) throw emailError;
        toast.info("Verification email sent. Please confirm to update your email.", {
          style: { background: "#1f1f1f", color: "#facc15" },
        });
      }

      const { data: upsertData, error: phoneError } = await supabase
        .from("profiles")
        .upsert({ id: user.id, phone })
        .select();

      if (phoneError) throw phoneError;

      toast.success("Contact information updated successfully!", {
        style: { background: "#1f1f1f", color: "#4ade80" },
      });
      setIsEditing(false);
    } catch (err) {
      console.error("Error saving contact info:", err.message);
      toast.error("Failed to save contact info. See console for details.", {
        style: { background: "#1f1f1f", color: "#ff6b6b" },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#232323] p-6 rounded-xl shadow-md">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar
        newestOnTop
        closeOnClick
        draggable
        pauseOnHover
        theme="dark"
      />

      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white">Contact Information</h3>
        <button
          className="text-sm text-purple-400 hover:text-purple-300"
          onClick={() => setIsEditing(!isEditing)}
          disabled={loading}
        >
          {isEditing ? "Cancel" : "Edit"}
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Email</label>
          <input
            type="email"
            disabled={!isEditing || loading}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full px-3 py-2 rounded-md bg-[#1a1a1a] text-white border ${
              isEditing ? "border-purple-500" : "border-transparent"
            }`}
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Phone</label>
          <input
            type="text"
            disabled={!isEditing || loading}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={`w-full px-3 py-2 rounded-md bg-[#1a1a1a] text-white border ${
              isEditing ? "border-purple-500" : "border-transparent"
            }`}
          />
        </div>

        {isEditing && (
          <button
            onClick={handleSave}
            disabled={loading}
            className="mt-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        )}
      </div>
    </div>
  );
}

export default ContactInfo;

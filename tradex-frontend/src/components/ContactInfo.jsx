import React, { useState, useEffect } from "react";
import supabase from "../lib/supabase";
import { RiCloseLargeLine } from "react-icons/ri";
import { toast } from "react-toastify";

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
        toast.info("Verification email sent. Confirm to update your email.", {
          style: { background: "#1f1f1f", color: "#facc15" },
        });
      }

      const { error: phoneError } = await supabase
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
      toast.error("Failed to save contact info.", {
        style: { background: "#1f1f1f", color: "#ff6b6b" },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#0F1117]/70 backdrop-blur-md p-6 rounded-xl shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white">Contact Information</h3>
        <button
          className="text-sm text-purple-400 hover:text-purple-300 transition"
          onClick={() => setIsEditing(!isEditing)}
          disabled={loading}
        >
          {isEditing ? <RiCloseLargeLine className="scale-150" /> : "Edit"}
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
              isEditing ? "border-purple-500 focus:ring-2 focus:ring-purple-500" : "border-transparent"
            } focus:outline-none transition`}
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
              isEditing ? "border-purple-500 focus:ring-2 focus:ring-purple-500" : "border-transparent"
            } focus:outline-none transition`}
          />
        </div>

        {isEditing && (
          <button
            onClick={handleSave}
            disabled={loading}
            className="mt-2 w-full sm:w-auto bg-gradient-to-r from-[#7F3DFF] to-[#5A18E9] hover:opacity-90 text-white px-4 py-2 rounded-lg font-medium shadow-lg transition disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        )}
      </div>
    </div>
  );
}

export default ContactInfo;

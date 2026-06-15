import React, { useState } from "react";
import supabase from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const UpdatePassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleUpdatePassword = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      return toast.error("Passwords do not match.", {
        style: { background: "#1f1f1f", color: "#ff6b6b" },
      });
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        toast.error(error.message, {
          style: { background: "#1f1f1f", color: "#ff6b6b" },
        });
      } else {
        toast.success("Password updated successfully!", {
          style: { background: "#1f1f1f", color: "#4ade80" },
        });
        setTimeout(() => navigate("/login"), 2000);
      }
    } catch (err) {
      toast.error("An unexpected error occurred. Please try again.", {
        style: { background: "#1f1f1f", color: "#ff6b6b" },
      });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-bg text-white px-4">
      <form
        onSubmit={handleUpdatePassword}
        className="bg-surface-elevated p-8 rounded-xl shadow-lg w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-6">Update Password</h2>

        <input
          type="password"
          value={newPassword}
          placeholder="New Password"
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full p-3 mb-4 rounded-xl bg-surface-input text-white"
          required
        />

        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full p-3 mb-4 rounded-xl bg-surface-input text-white"
          required
        />

        <button
          type="submit"
          className="w-full bg-brand text-white p-3 rounded-xl hover:opacity-90"
          disabled={loading}
        >
          {loading ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  );
};

export default UpdatePassword;

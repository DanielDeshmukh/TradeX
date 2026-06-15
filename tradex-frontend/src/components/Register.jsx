import { useState } from "react";
import { FaGoogle, FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import supabase from "../lib/supabase";
import { toast } from "react-toastify";

function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const isStrongPassword = (password) => {
    const strongPassword =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    return strongPassword.test(password);
  };

  const signupWithGoogle = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: import.meta.env.VITE_APP_URL },
      });

      if (error) {
        toast.error(error.message, {
          style: { background: "#1f1f1f", color: "#ff6b6b" },
        });
      } else {
        toast.info("Redirecting to Google sign-in...", {
          style: { background: "#1f1f1f", color: "#4ade80" },
        });
      }
    } catch (err) {
      console.error("Error during Google sign-in:", err);
      toast.error("An error occurred. Please try again.", {
        style: { background: "#1f1f1f", color: "#ff6b6b" },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!isStrongPassword(form.password)) {
      toast.error(
        "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.",
        { style: { background: "#1f1f1f", color: "#ff6b6b" } }
      );
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: { emailRedirectTo: import.meta.env.VITE_APP_URL },
      });

      if (error) {
        toast.error(error.message, {
          style: { background: "#1f1f1f", color: "#ff6b6b" },
        });
      } else {
        toast.success("Check your email to confirm sign-up.", {
          style: { background: "#1f1f1f", color: "#4ade80" },
        });
      }
    } catch (err) {
      console.error("Error during sign-up:", err);
      toast.error("An error occurred. Please try again.", {
        style: { background: "#1f1f1f", color: "#ff6b6b" },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg">
      <form
        onSubmit={handleRegister}
        className="bg-surface-elevated mx-4 p-8 rounded-2xl shadow-lg w-full max-w-md"
      >
        <h2 className="text-2xl text-white font-bold mb-6">Create Account</h2>

        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full p-3 mb-4 rounded-xl bg-surface-input text-white"
          required
        />

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Create Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full p-3 mb-4 rounded-xl bg-surface-input text-white"
            required
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="text-brand absolute top-4 right-4"
          >
            {showPassword ? <FaEye /> : <FaEyeSlash />}
          </button>
        </div>

        <button
          type="submit"
          className="w-full bg-brand text-white p-3 rounded-xl hover:opacity-90"
          disabled={loading}
        >
          {loading ? "Signing Up..." : "Sign Up"}
        </button>

        <div>
          <hr className="my-5" />
          <button
            onClick={signupWithGoogle}
            type="button"
            className="w-full my-2 bg-brand text-white p-3 rounded-xl hover:opacity-90 flex items-center justify-center space-x-2"
            disabled={loading}
          >
            <FaGoogle className="text-white" />
            <span>Sign in with Google</span>
          </button>
        </div>

        <div className="mt-6 text-content-secondary text-sm flex justify-between">
          <Link to="/login">Already have an account?</Link>
        </div>
      </form>
    </div>
  );
}

export default Register;

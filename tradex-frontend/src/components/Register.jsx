import { useState } from "react";
import { FaGoogle, FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import supabase from "../lib/supabase";

function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const isStrongPassword = (password) => {
    const strongPassword =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    return strongPassword.test(password);
  };

  const signup = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: "http://localhost:5173/" },
      });
      setMessage(error ? error.message : "Redirecting to Google sign-in...");
    } catch (err) {
      console.error("Error during Google sign-in:", err);
      setMessage("An error occurred. Please try again.");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!isStrongPassword(form.password)) {
      setMessage(
        "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character."
      );
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: { emailRedirectTo: "http://localhost:5173/" },
      });

      setMessage(error ? error.message : "Check your email to confirm sign-up.");
    } catch (err) {
      console.error("Error during sign-up:", err);
      setMessage("An error occurred. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0D0E11]">
      <form
        onSubmit={handleRegister}
        className="bg-[#1C1C1C] mx-4 p-8 rounded-2xl shadow-lg w-full max-w-md"
      >
        <h2 className="text-2xl text-white font-bold mb-6">Create Account</h2>

        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full p-3 mb-4 rounded-xl bg-[#2B2B2B] text-white"
          required
        />

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Create Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full p-3 mb-4 rounded-xl bg-[#2B2B2B] text-white"
            required
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="text-[#A24EFF] absolute top-4 right-4"
          >
            {showPassword ? <FaEye /> : <FaEyeSlash />}
          </button>
        </div>

        <button
          type="submit"
          className="w-full bg-[#A24EFF] text-white p-3 rounded-xl hover:opacity-90"
        >
          Sign Up
        </button>

        <div>
          <hr className="my-5" />
          <button
            onClick={signup}
            type="button"
            className="w-full my-2 bg-[#A24EFF] text-white p-3 rounded-xl hover:opacity-90 flex items-center justify-center space-x-2"
          >
            <FaGoogle className="text-white" />
            <span>Sign in with Google</span>
          </button>
        </div>

        <p className="mt-4 text-sm text-purple-400">{message}</p>

        <div className="mt-6 text-gray-400 text-sm flex justify-between">
          <Link to="/login">Already have an account?</Link>
        </div>
      </form>
    </div>
  );
}

export default Register;

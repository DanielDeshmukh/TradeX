import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import supabase from '../lib/supabase';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { toast } from 'react-toastify';

function Login() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const togglePasswordVisibility = () => setShowPassword(!showPassword);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email: form.email,
                password: form.password
            });

            if (error) {
                toast.error(error.message, {
                    style: { background: '#1f1f1f', color: '#ff6b6b' },
                });
            } else {
                toast.success("Logged in successfully!", {
                    style: { background: '#1f1f1f', color: '#4ade80' },
                });
                setTimeout(() => {
                    navigate("/main-page");
                }, 1000);
            }
        } catch (err) {
            console.error("Login error:", err);
            toast.error("An unexpected error occurred. Please try again.", {
                style: { background: '#1f1f1f', color: '#ff6b6b' },
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-bg">
            <form onSubmit={handleLogin} className="bg-surface-elevated p-8 mx-4 rounded-2xl shadow-lg w-full max-w-md">
                <h2 className="text-2xl text-white font-bold mb-6">Login</h2>

                <input
                    type="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full p-3 mb-4 rounded-xl bg-surface-input text-white"
                    required
                />

                <div className='relative'>
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        className="w-full p-3 mb-4 rounded-xl bg-surface-input text-white"
                        required
                    />
                    <button
                        type='button'
                        onClick={togglePasswordVisibility}
                        className='text-brand absolute top-4 right-4'
                    >
                        {showPassword ? <FaEye /> : <FaEyeSlash />}
                    </button>
                </div>

                <button
                    type="submit"
                    className="w-full bg-brand text-white p-3 rounded-xl hover:opacity-90"
                    disabled={loading}
                >
                    {loading ? "Signing In..." : "Sign In"}
                </button>

                <div className="mt-6 text-content-secondary text-sm flex justify-between">
                    <Link to="/register">Don't have an account?</Link>
                    <Link to="/forgot-password">Forgot Password?</Link>
                </div>
            </form>
        </div>
    );
}

export default Login;

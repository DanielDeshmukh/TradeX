import { useState } from 'react';
import { Link } from 'react-router-dom';
import supabase from '../lib/supabase';
import { toast } from 'react-toastify';

function MagicLink() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleMagicLink = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    emailRedirectTo: import.meta.env.VITE_APP_URL
                }
            });

            if (error) {
                toast.error(error.message, {
                    style: { background: '#1f1f1f', color: '#ff6b6b' },
                });
            } else {
                toast.success('Check your email for the login link.', {
                    style: { background: '#1f1f1f', color: '#4ade80' },
                });
            }
        } catch (err) {
            console.error("Error sending magic link:", err);
            toast.error("An unexpected error occurred. Please try again.", {
                style: { background: '#1f1f1f', color: '#ff6b6b' },
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0D0E11]">
            <form onSubmit={handleMagicLink} className="bg-[#1C1C1C] p-8 rounded-2xl shadow-lg w-full max-w-md">
                <h2 className="text-2xl text-white font-bold mb-6">One Tap Login</h2>

                <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-3 mb-4 rounded-xl bg-[#2B2B2B] text-white"
                    required
                />

                <button
                    type="submit"
                    className="w-full bg-[#A24EFF] text-white p-3 rounded-xl hover:opacity-90"
                    disabled={loading}
                >
                    {loading ? "Sending..." : "Send Link"}
                </button>

                <div className="mt-6 text-gray-400 text-sm">
                    <Link to="/login">Back to Login</Link>
                </div>
            </form>
        </div>
    );
}

export default MagicLink;

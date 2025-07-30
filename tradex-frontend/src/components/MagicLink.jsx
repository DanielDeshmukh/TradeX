import { useState } from 'react';
import { Link } from 'react-router-dom';
import supabase from '../lib/supabase';

function MagicLink() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const handleMagicLink = async (e) => {
        e.preventDefault();
        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: 'http://localhost:5173/'
            }
        });
        setMessage(error ? error.message : 'Check your email for the login link.');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0D0E11]">
            <form onSubmit={handleMagicLink} className="bg-[#1C1C1C] p-8 rounded-2xl shadow-lg w-full max-w-md">
                <h2 className="text-2xl text-white font-bold mb-6">One Tap Login</h2>
                <input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 mb-4 rounded-xl bg-[#2B2B2B] text-white" required />
                <button type="submit" className="w-full bg-[#A24EFF] text-white p-3 rounded-xl hover:opacity-90">Send Link</button>
                <p className="mt-4 text-sm text-purple-400">{message}</p>
                <div className="mt-6 text-gray-400 text-sm">
                    <Link to="/login">Back to Login</Link>
                </div>
            </form>
        </div>
    );
}

export default MagicLink;
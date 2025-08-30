import { useState } from 'react';
import { Link } from 'react-router-dom';
import supabase from '../lib/supabase';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

function Login() {
    const [form, setForm] = useState({ email: '', password: '' });
    const [message, setMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);


    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        const { error } = await supabase.auth.signInWithPassword({
            email: form.email,
            password: form.password
        });
        if (error) return setMessage(error.message);
        window.location.href = '/';
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0D0E11]">
            <form onSubmit={handleLogin} className="bg-[#1C1C1C] p-8 mx-4 rounded-2xl shadow-lg w-full max-w-md">
                <h2 className="text-2xl text-white font-bold mb-6">Login</h2>

                <div>

                    <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full p-3 mb-4 rounded-xl bg-[#2B2B2B] text-white" required />
                </div>
                <div className='relative'>

                    <input type={showPassword ? "text" : "password"} placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full p-3 mb-4 rounded-xl bg-[#2B2B2B] text-white" required />
                    <button type='button' onClick={togglePasswordVisibility} className='text-[#A24EFF] absolute top-4 right-4'>{showPassword ? <FaEye /> : <FaEyeSlash />}</button>
                </div>

                <button type="submit" className="w-full bg-[#A24EFF] text-white p-3 rounded-xl hover:opacity-90">Sign In</button>
                <p className="mt-4 text-sm text-purple-400">{message}</p>
                <div className="mt-6 text-gray-400 text-sm flex justify-between">
                    <Link to="/register">Don't have an account?</Link>
                    <Link to="/forgot-password">Forgot Password?</Link>
                </div>
            </form>
        </div>
    );
}

export default Login;

import { useState } from 'react';
import { Link } from 'react-router-dom';
import  supabase  from '../lib/supabase';

function Register() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password
    });
    setMessage(error ? error.message : 'Check your email to confirm sign-up!');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0D0E11]">
      <form onSubmit={handleRegister} className="bg-[#1C1C1C] p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl text-white font-bold mb-6">Create Account</h2>
        <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full p-3 mb-4 rounded-xl bg-[#2B2B2B] text-white" required />
        <input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full p-3 mb-4 rounded-xl bg-[#2B2B2B] text-white" required />
        <button type="submit" className="w-full bg-[#A24EFF] text-white p-3 rounded-xl hover:opacity-90">Sign Up</button>
        <p className="mt-4 text-sm text-purple-400">{message}</p>
        <div className="mt-6 text-gray-400 text-sm flex justify-between">
          <Link to="/login">Already have an account?</Link>
          <Link to="/magic-link">One Tap Login</Link>
        </div>
      </form>
    </div>
  );
}

export default Register;

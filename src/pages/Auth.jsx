import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { motion } from 'framer-motion';

export default function Auth() {
  const { role = 'user' } = useParams();
  const navigate = useNavigate();
  const { loginUser, showToast } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const res = loginUser(email, password, role);
    if (res?.success) navigate(role === 'admin' ? '/admin' : '/user/home');
    else showToast(res?.msg || "Login failed");
  };

  const inputClass = "w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-purple-500 focus:bg-white transition-all font-black text-slate-800 placeholder:text-slate-400 text-lg shadow-inner";

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4 font-sans">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md bg-white p-10 md:p-12 rounded-[3rem] shadow-[0_20px_60px_rgba(0,0,0,0.05)] border border-slate-100">
        
        <div className="text-center mb-10">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130 40" width="120" height="35" className="mx-auto mb-6">
            <defs><linearGradient id="z" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#8b5cf6" /><stop offset="100%" stopColor="#d946ef" /></linearGradient></defs>
            <path d="M102,14 C102,8 110,8 110,8 C110,14 102,14 102,14 Z" fill="#10b981" />
            <text x="0" y="32" fontFamily="system-ui, sans-serif" fontSize="32" fontWeight="900" fill="url(#z)" letterSpacing="-1.5">zesty</text>
          </svg>
          <h2 className="text-3xl font-black text-slate-900 mb-1 tracking-tight">Welcome Back</h2>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">{role} Login</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input type="email" required placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} className={inputClass} />
          <input type="password" required placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className={inputClass} />
          <motion.button whileTap={{ scale: 0.95 }} type="submit" className="w-full py-5 mt-4 bg-slate-900 text-white font-black text-xl rounded-2xl shadow-[0_10px_20px_rgba(0,0,0,0.2)] hover:bg-purple-600 transition-colors">
            Login Securely
          </motion.button>
        </form>

        <div className="mt-10 text-center border-t border-slate-100 pt-8">
          <p className="text-xs font-black text-slate-400 mb-4 uppercase tracking-widest">Or login as</p>
          <div className="flex justify-center gap-3">
             {['user', 'admin', 'delivery'].filter(r => r !== role).map(r => (
               <button key={r} type="button" onClick={() => navigate(`/login/${r}`)} className="px-5 py-2.5 bg-slate-100 text-slate-600 font-bold rounded-xl text-xs hover:bg-slate-200 capitalize transition-colors">{r}</button>
             ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
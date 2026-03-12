import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useStore } from '../context/StoreContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, user } = useStore();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) navigate('/');
  }, [user, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    login(email, password); // Saves to LocalStorage via Context
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 to-emerald-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-white/80 backdrop-blur-xl p-8 rounded-[2rem] shadow-2xl border border-white max-w-md w-full"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-slate-900 mb-2">Welcome Back 🌿</h1>
          <p className="text-slate-500">Sign in to your organic store</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input 
              type="email" required placeholder="Email Address" 
              value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-green-500 transition-colors"
            />
          </div>
          <div>
            <input 
              type="password" required placeholder="Password" 
              value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-green-500 transition-colors"
            />
          </div>
          
          <motion.button 
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            type="submit" 
            className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl shadow-xl hover:bg-green-600 transition-colors"
          >
            Login
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
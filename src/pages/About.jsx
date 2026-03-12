import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useStore } from '../context/StoreContext'
import { ShoppingBag, User } from 'lucide-react'

export default function About() {
  const { currentUser, cart, logout } = useStore()
  const navigate = useNavigate()
  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 font-sans text-slate-800">
      
      <header className="hidden md:flex fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200 px-8 py-4 justify-between items-center shadow-sm">
        <div className="flex items-center gap-12">
          <Link to="/user/home" className="flex items-center gap-2 group">
            <span className="text-3xl">🌿</span>
            <h1 className="text-3xl font-black text-slate-900 italic tracking-tighter group-hover:text-violet-700 transition-colors">Zesty</h1>
          </Link>
          <nav className="flex gap-6">
            {['Fruits', 'Vegetables', 'Pulses', 'About'].map(item => (
              <Link key={item} to={`/user/${item.toLowerCase()}`} className="font-bold text-slate-500 hover:text-violet-700 transition-colors text-sm uppercase tracking-wide">{item}</Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-6">
          <Link to="/user/cart" className="relative p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ShoppingBag size={24} className="text-slate-700" />
            {cart.length > 0 && <span className="absolute top-0 right-0 w-5 h-5 bg-violet-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">{cart.length}</span>}
          </Link>
          <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
            <div className="w-10 h-10 bg-violet-100 text-violet-600 rounded-full flex items-center justify-center font-bold text-lg border-2 border-white shadow-sm">
              {currentUser?.name?.charAt(0) || <User size={20} />}
            </div>
            <div className="text-right hidden lg:block">
              <p className="text-sm font-black text-slate-900 leading-none">{currentUser?.name || 'Guest'}</p>
              <button onClick={handleLogout} className="text-xs font-bold text-red-500 hover:text-red-600">Logout</button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-16 text-center pt-32">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="bg-white/80 backdrop-blur-xl p-12 rounded-[3rem] shadow-[0px_25px_60px_rgba(0,0,0,0.1)] border border-white/80">
          
          <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 5 }} className="text-7xl mb-6 inline-block">👨‍🌾</motion.div>
          <h2 className="text-5xl font-black text-slate-900 mb-6 tracking-tight">Our Mission</h2>
          <p className="text-xl text-slate-600 leading-relaxed font-medium mb-12 max-w-2xl mx-auto">
            We believe that healthy living starts with healthy eating. Our mission is to connect local farmers directly with you, bringing 100% organic, chemical-free produce straight to your doorstep in minutes.
          </p>

          <div className="grid md:grid-cols-3 gap-6 text-left">
            <motion.div whileHover={{ y: -10 }} className="bg-green-50 p-8 rounded-[2rem] border border-green-100 shadow-sm">
              <h3 className="text-xl font-black text-green-800 mb-3">🌱 100% Organic</h3>
              <p className="text-slate-600 font-medium">Certified produce grown without synthetic pesticides or harmful fertilizers.</p>
            </motion.div>
            <motion.div whileHover={{ y: -10 }} className="bg-blue-50 p-8 rounded-[2rem] border border-blue-100 shadow-sm">
              <h3 className="text-xl font-black text-blue-800 mb-3">⚡ 12-Min Delivery</h3>
              <p className="text-slate-600 font-medium">Our lightning-fast delivery partners ensure your food arrives fresh and crisp.</p>
            </motion.div>
            <motion.div whileHover={{ y: -10 }} className="bg-purple-50 p-8 rounded-[2rem] border border-purple-100 shadow-sm">
              <h3 className="text-xl font-black text-purple-800 mb-3">🤝 Fair Trade</h3>
              <p className="text-slate-600 font-medium">We ensure farmers get a fair price for their hard work and dedication.</p>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="mt-12 pt-8 border-t border-slate-200">
            <Link to="/user/fruits" className="inline-block px-12 py-5 bg-slate-900 text-white font-black text-lg rounded-2xl shadow-[0px_15px_30px_rgba(0,0,0,0.4)] hover:bg-green-600 transition-colors">Start Shopping Now</Link>
          </motion.div>

        </motion.div>
      </main>
    </div>
  )
}
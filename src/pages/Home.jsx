import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useStore } from '../context/StoreContext'
import { LogOut, Menu, X, LifeBuoy, ShieldCheck, BookOpen, ShoppingBag, User } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'

const ScrollAnimatedSection = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 100, scale: 0.95 }}
    whileInView={{ opacity: 1, y: 0, scale: 1 }}
    viewport={{ amount: 0.4, margin: "0px 0px -100px 0px" }}
    transition={{ duration: 0.8, ease: 'easeOut' }}
  >
    {children}
  </motion.div>
);

export default function Home() {
  const { currentUser, logout, getCartTotal, cart } = useStore();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/login'); };
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef(null);

  const sidebarAnim = { 
    hidden: { x: '-100%', opacity: 0 }, 
    show: { x: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 30 } } 
  };


  // Auto-open on mobile mount
  useEffect(() => {
    if (window.innerWidth < 768) setIsOpen(true);
  }, []);

  // Timer Logic for Auto-Close
  const resetTimer = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setIsOpen(false), 5000);
  };

  const clearTimer = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  // Manage timer based on state
  useEffect(() => {
    if (isOpen) resetTimer();
    return () => clearTimer();
  }, [isOpen]);

  return (
    <div className="h-screen bg-[#f8fafc] font-sans text-slate-800 flex overflow-hidden">
      
      {/* DESKTOP HEADER */}
      <header className="hidden md:flex fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200 px-8 py-4 justify-between items-center shadow-sm">
        <div className="flex items-center gap-12">
          <Link to="/user/home" className="flex items-center gap-2 group">
            <span className="text-3xl">🌿</span>
            <h1 className="text-3xl font-black text-slate-900 italic tracking-tighter group-hover:text-violet-700 transition-colors">Zesty</h1>
          </Link>
          <nav className="flex gap-6">
            {['Fruits', 'Vegetables', 'Pulses'].map(item => (
              <Link key={item} to={`/user/${item.toLowerCase()}`} className="font-bold text-slate-500 hover:text-violet-700 transition-colors text-sm uppercase tracking-wide">{item}</Link>
            ))}
          </nav>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-full">
            <span className="text-slate-400">📍</span>
            <span className="text-sm font-bold text-slate-600 truncate max-w-[150px]">{currentUser?.address || "Select Location"}</span>
          </div>
          <Link to="/user/cart" className="relative p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ShoppingBag size={24} className="text-slate-700" />
            {cart.length > 0 && <span className="absolute top-0 right-0 w-5 h-5 bg-violet-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">{cart.length}</span>}
          </Link>
          <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
            <div className="text-right hidden lg:block">
              <p className="text-sm font-black text-slate-900 leading-none">{currentUser?.name || 'Guest'}</p>
              <button onClick={handleLogout} className="text-xs font-bold text-red-500 hover:text-red-600">Logout</button>
            </div>
            <div className="w-10 h-10 bg-violet-100 text-violet-600 rounded-full flex items-center justify-center font-bold text-lg border-2 border-white shadow-sm">
              {currentUser?.name?.charAt(0) || <User size={20} />}
            </div>
          </div>
        </div>
      </header>

      {/* MOBILE TRIGGER */}
      <div 
        className="md:hidden fixed top-4 left-4 w-16 h-16 z-[60] flex items-center justify-center cursor-pointer group"
        onClick={() => setIsOpen(!isOpen)}
      >
        <motion.div 
          key={isOpen ? 'open' : 'closed'}
          initial={{ scale: 0, opacity: 0, rotate: -90 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          className={`p-3 bg-white/80 backdrop-blur-md rounded-full shadow-lg border border-slate-200 transition-all duration-300 hover:scale-110`}>
           {isOpen ? <X size={24} className="text-slate-700" /> : <Menu size={24} className="text-slate-700" />}
        </motion.div>
      </div>
      
      {/* SIDEBAR (Mobile Only) */}
      <motion.aside 
        variants={sidebarAnim} 
        initial="hidden" 
        animate={isOpen ? "show" : "hidden"}
        onMouseEnter={clearTimer}
        className="md:hidden fixed top-0 left-0 h-full w-full bg-white/95 backdrop-blur-xl border-r border-white/40 flex flex-col shadow-2xl z-50"
      >
        {/* User Profile Section */}
        <div className="p-8 flex flex-col items-center text-center border-b border-white/40 bg-gradient-to-b from-white/40 to-transparent">
          <div className="w-24 h-24 bg-gradient-to-br from-violet-200 to-fuchsia-200 rounded-full mb-4 flex items-center justify-center text-4xl shadow-inner border-4 border-white">
            👤
          </div>
          <h2 className="text-xl font-black text-slate-900 mb-1">{currentUser?.name || 'Guest'}</h2>
          <div className="text-xs font-bold text-slate-500 space-y-1 mb-3">
             <p className="flex items-center justify-center gap-1 opacity-80">{currentUser?.email || 'No Email'}</p>
             <p className="flex items-center justify-center gap-1 opacity-80">{currentUser?.phone || 'No Phone'}</p>
             <p className="flex items-center justify-center gap-1 opacity-80">{currentUser?.address || 'No Address'}</p>
          </div>
          <button className="px-4 py-1.5 bg-white/80 border border-white/50 rounded-full text-[10px] font-bold text-indigo-600 hover:bg-white transition-colors shadow-sm">
            Edit Details ✏️
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-6 space-y-3 overflow-y-auto custom-scrollbar">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest px-2 mb-2">Menu</p>
          {[
            { path: '/user/fruits', emoji: '🍎', name: 'Fruits', color: 'text-red-500', bg: 'bg-red-50' },
            { path: '/user/vegetables', emoji: '🥦', name: 'Vegetables', color: 'text-green-600', bg: 'bg-green-50' },
            { path: '/user/pulses', emoji: '🌾', name: 'Pulses', color: 'text-amber-600', bg: 'bg-amber-50' },
            { path: '/user/wishlist', emoji: '❤️', name: 'Wishlist', color: 'text-pink-500', bg: 'bg-pink-50' },
            { path: '/user/cart', emoji: '🛒', name: 'Cart', color: 'text-blue-600', bg: 'bg-blue-50' }
          ].map((item) => (
            <Link key={item.name} to={item.path} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-white/50 transition-all group">
              <span 
                className={`w-10 h-10 flex items-center justify-center rounded-xl ${item.bg} ${item.color} text-lg shadow-sm group-hover:scale-110 transition-transform`}
              >{item.emoji}</span>
              <span className="font-bold text-slate-600 group-hover:text-slate-900">{item.name}</span>
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-6 border-t border-white/40 bg-white/20">
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-3 py-3 bg-red-50 text-red-600 rounded-xl font-black hover:bg-red-100 transition-colors text-sm">
            <LogOut size={18} strokeWidth={3} /> Logout
          </button>
        </div>
      </motion.aside>
      
      {/* MAIN CONTENT AREA */}
      <main className="flex-1 relative flex flex-col overflow-y-auto custom-scrollbar md:pt-20">
        
        <div className="min-h-screen flex flex-col w-full">
          
          {/* Center Hero - Full Viewport Height */}
          <div className="min-h-full h-full flex-grow flex items-center justify-center p-10 relative shrink-0">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 100, ease: "linear" }} className="absolute -top-[20%] -right-[10%] w-[50vw] h-[50vw] bg-purple-200/30 rounded-full blur-[100px] pointer-events-none"></motion.div>
            <motion.div animate={{ rotate: -360 }} transition={{ repeat: Infinity, duration: 120, ease: "linear" }} className="absolute -bottom-[20%] -left-[10%] w-[50vw] h-[50vw] bg-indigo-200/30 rounded-full blur-[100px] pointer-events-none"></motion.div>
            
            <motion.div 
              initial={{ scale: 0.8, opacity: 0, y: 50 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              transition={{ duration: 1, ease: "easeOut" }} 
              className="text-center relative z-10"
            >
               <motion.div 
                 animate={{ y: [0, -20, 0] }}
                 transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                 className="inline-block bg-white/40 backdrop-blur-xl p-16 md:p-20 rounded-[3.5rem] shadow-[0_30px_80px_rgba(0,0,0,0.1)] border border-white/60 relative overflow-hidden group hover:shadow-[0_40px_100px_rgba(0,0,0,0.15)] transition-shadow duration-500"
               >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-transparent opacity-60 pointer-events-none"></div>
                  <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }} className="text-8xl md:text-9xl mb-6 drop-shadow-md inline-block relative z-10">🌿</motion.div>
                  <h1 className="text-8xl md:text-[10rem] font-black text-transparent bg-clip-text bg-gradient-to-br from-slate-900 via-green-900 to-slate-800 italic tracking-tighter drop-shadow-sm mb-6 leading-tight relative z-10">Zesty</h1>
                  <p className="text-2xl md:text-3xl text-slate-600 font-extrabold tracking-tight relative z-10">Freshness Delivered to Your Doorstep.</p>
               </motion.div>
            </motion.div>
          </div>

          {/* NEW SECTIONS */}
          <div className="w-full max-w-5xl mx-auto px-10 pb-20 space-y-24 relative z-10">
            <ScrollAnimatedSection>
              <h2 className="text-5xl font-black text-slate-800 text-center mb-12">Why Choose Zesty?</h2>
              <div className="grid md:grid-cols-3 gap-8 text-left">
                <div className="bg-white/70 backdrop-blur-lg p-8 rounded-[2rem] border border-white shadow-lg"><h3 className="text-xl font-black text-green-800 mb-3">🌱 100% Organic</h3><p className="text-slate-600 font-medium">Certified produce grown without synthetic pesticides or harmful fertilizers.</p></div>
                <div className="bg-white/70 backdrop-blur-lg p-8 rounded-[2rem] border border-white shadow-lg"><h3 className="text-xl font-black text-blue-800 mb-3">⚡ Fast Delivery</h3><p className="text-slate-600 font-medium">Our lightning-fast delivery partners ensure your food arrives fresh and crisp.</p></div>
                <div className="bg-white/70 backdrop-blur-lg p-8 rounded-[2rem] border border-white shadow-lg"><h3 className="text-xl font-black text-purple-800 mb-3">🤝 Fair Trade</h3><p className="text-slate-600 font-medium">We ensure farmers get a fair price for their hard work and dedication.</p></div>
              </div>
            </ScrollAnimatedSection>

            <ScrollAnimatedSection>
              <h2 className="text-5xl font-black text-slate-800 text-center mb-12">Our Promise & Policies</h2>
              <div className="grid md:grid-cols-3 gap-8 text-left">
                <div className="bg-white/70 backdrop-blur-lg p-8 rounded-[2rem] border border-white shadow-lg"><ShieldCheck className="w-10 h-10 text-blue-500 mb-4" /><h3 className="text-xl font-black text-slate-800 mb-3">Return Policy</h3><p className="text-slate-600 font-medium">Not happy? Return it at the time of delivery, no questions asked.</p></div>
                <div className="bg-white/70 backdrop-blur-lg p-8 rounded-[2rem] border border-white shadow-lg"><BookOpen className="w-10 h-10 text-blue-500 mb-4" /><h3 className="text-xl font-black text-slate-800 mb-3">Terms of Service</h3><p className="text-slate-600 font-medium">Read our terms to understand the conditions of our service.</p></div>
                <div className="bg-white/70 backdrop-blur-lg p-8 rounded-[2rem] border border-white shadow-lg"><ShieldCheck className="w-10 h-10 text-blue-500 mb-4" /><h3 className="text-xl font-black text-slate-800 mb-3">Privacy Policy</h3><p className="text-slate-600 font-medium">Your data is safe with us. We prioritize your privacy.</p></div>
              </div>
            </ScrollAnimatedSection>

            <ScrollAnimatedSection>
              <h2 className="text-5xl font-black text-slate-800 text-center mb-12">We're Here to Help</h2>
              <div className="bg-white/70 backdrop-blur-lg p-12 rounded-[2rem] border border-white shadow-lg text-center">
                <LifeBuoy className="w-16 h-16 text-indigo-500 mb-6 mx-auto" />
                <h3 className="text-3xl font-black text-slate-800 mb-4">Have Questions?</h3>
                <p className="text-slate-600 font-medium mb-6 max-w-lg mx-auto">Our support team is available 24/7 to help you with any issues or queries you might have.</p>
                <div className="flex justify-center gap-4">
                  <button className="px-8 py-4 bg-indigo-500 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-600 transition">Email Us</button>
                  <button className="px-8 py-4 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl shadow-sm hover:bg-slate-50 transition">Call Us</button>
                </div>
              </div>
            </ScrollAnimatedSection>
          </div>
        </div>

      </main>
    </div>
  )
}
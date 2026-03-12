import { Link, useNavigate } from 'react-router-dom'
import { useStore } from '../context/StoreContext'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Menu, X, LogOut, ShoppingBag, User } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'

export default function Wishlist() {
  const { wishlist, toggleWishlist, addToCart, currentUser, logout } = useStore()
  const navigate = useNavigate();
  const pageAnim = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } } };

  // Sidebar logic
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef(null);
  useEffect(() => { if (window.innerWidth < 768) setIsOpen(true); }, []);
  const resetTimer = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setIsOpen(false), 5000);
  };
  const clearTimer = () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  useEffect(() => { if (isOpen) resetTimer(); return () => clearTimer(); }, [isOpen]);
  const sidebarAnim = { hidden: { x: '-100%', opacity: 0 }, show: { x: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 30 } } };
  const handleLogout = () => { logout(); navigate('/login'); };

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
            {['Fruits', 'Vegetables', 'Pulses', 'Wishlist'].map(item => (
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
            {/* Note: In Wishlist we don't have direct access to cart length easily unless we passed it or imported it again, assuming 'useStore' handles it */}
          </Link>
          <div className="w-10 h-10 bg-violet-100 text-violet-600 rounded-full flex items-center justify-center font-bold text-lg border-2 border-white shadow-sm cursor-pointer" onClick={handleLogout} title="Logout">
            {currentUser?.name?.charAt(0) || <User size={20} />}
          </div>
        </div>
      </header>

      {/* MOBILE TRIGGER */}
      <div className="md:hidden fixed top-4 left-4 w-16 h-16 z-[60] flex items-center justify-center cursor-pointer group"
        onClick={() => setIsOpen(!isOpen)}>
        <motion.div key={isOpen ? 'open' : 'closed'} initial={{ scale: 0, opacity: 0, rotate: -90 }} animate={{ scale: 1, opacity: 1, rotate: 0 }} className={`p-3 bg-white/80 backdrop-blur-md rounded-full shadow-lg border border-slate-200 transition-all duration-300 hover:scale-110`}>
           {isOpen ? <X size={24} className="text-slate-700" /> : <Menu size={24} className="text-slate-700" />}
        </motion.div>
      </div>

      {/* MOBILE SIDEBAR */}
      <motion.aside variants={sidebarAnim} initial="hidden" animate={isOpen ? "show" : "hidden"} className="md:hidden fixed top-0 left-0 h-full w-full bg-white/95 backdrop-blur-xl border-r border-white/40 flex flex-col shadow-2xl z-50">
        <div className="p-8 flex flex-col items-center text-center border-b border-white/40 bg-gradient-to-b from-white/40 to-transparent">
          <div className="w-24 h-24 bg-gradient-to-br from-violet-200 to-fuchsia-200 rounded-full mb-4 flex items-center justify-center text-4xl shadow-inner border-4 border-white">👤</div>
          <h2 className="text-xl font-black text-slate-900 mb-1">{currentUser?.name || 'Guest'}</h2>
          <p className="text-xs font-bold text-slate-500">{currentUser?.email}</p>
        </div>
        <nav className="flex-1 p-6 space-y-3 overflow-y-auto custom-scrollbar">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest px-2 mb-2">Menu</p>
          {[
            { path: '/user/fruits', emoji: '🍎', name: 'Fruits', color: 'text-red-500', bg: 'bg-red-50' },
            { path: '/user/vegetables', emoji: '🥦', name: 'Vegetables', color: 'text-green-600', bg: 'bg-green-50' },
            { path: '/user/pulses', emoji: '🌾', name: 'Pulses', color: 'text-amber-600', bg: 'bg-amber-50' },
            { path: '/user/wishlist', emoji: '❤️', name: 'Wishlist', color: 'text-pink-500', bg: 'bg-pink-50' },
            { path: '/user/cart', emoji: '🛒', name: 'Cart', color: 'text-blue-600', bg: 'bg-blue-50' }
          ].map((item) => (
            <Link key={item.name} to={item.path} onClick={() => setIsOpen(false)} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-white/60 transition-all group">
              <span className={`w-10 h-10 flex items-center justify-center rounded-xl ${item.bg} ${item.color} text-lg shadow-sm group-hover:scale-110 transition-transform`}>{item.emoji}</span>
              <span className="font-bold text-slate-600 group-hover:text-slate-900">{item.name}</span>
            </Link>
          ))}
        </nav>
        <div className="p-6 border-t border-white/40 bg-white/20">
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-3 py-3 bg-red-50 text-red-600 rounded-xl font-black hover:bg-red-100 transition-colors text-sm">
            <LogOut size={18} strokeWidth={3} /> Logout
          </button>
        </div>
      </motion.aside>

      <motion.main variants={pageAnim} initial="hidden" animate="show" className={`flex-1 relative flex flex-col overflow-y-auto custom-scrollbar md:pt-20`}>
        <div className="p-6 md:p-10 pb-20">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-8 pl-16 md:pl-0 pt-6 md:pt-0">My <span className="text-pink-500">Wishlist</span></h1>

        {wishlist.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[3rem] shadow-xl border border-slate-100 max-w-2xl mx-auto">
            <div className="text-7xl mb-6 drop-shadow-md">❤️</div>
            <h2 className="text-4xl font-black mb-4 text-slate-900">Wishlist is empty</h2>
            <p className="text-slate-700 mb-8 font-bold text-lg">Save your favorite items here!</p>
            <Link to="/user/fruits"><motion.button whileTap={{ scale: 0.95 }} className="px-12 py-4 bg-gradient-to-r from-[#f472b6] to-[#ec4899] text-white font-black rounded-2xl shadow-lg">Explore Products</motion.button></Link>
          </div>
        ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlist.map((item) => (
              <motion.div whileHover={{ y: -5 }} key={item.id} className="group relative bg-white rounded-[2rem] p-5 shadow-lg border border-slate-100 transition-all duration-300">
                <Link to={`/user/product/${item.name}`} state={{ product: item }} className="block relative bg-slate-50 rounded-2xl mb-4 h-48 flex items-center justify-center border border-slate-100 overflow-hidden">
                  <motion.button whileTap={{ scale: 1.2 }} onClick={(e) => { e.preventDefault(); toggleWishlist(item); }} className="absolute top-2 right-2 z-10 p-2 bg-white/80 rounded-full border border-white text-red-500 shadow-sm hover:bg-white transition-colors">
                    <Heart size={20} className="fill-red-500 text-red-500" />
                  </motion.button>
                  <img src={item.image} alt={item.name} className="h-32 object-contain hover:scale-110 transition-transform duration-300 drop-shadow-md" />
                </Link>
                <div>
                  <h3 className="text-lg font-black text-slate-900 line-clamp-1">{item.name}</h3>
                  <div className="flex justify-between items-end my-4"><p className="text-slate-900 font-black text-2xl drop-shadow-sm">₹{item.price}<span className="text-sm font-medium text-slate-500">/kg</span></p></div>
                  <motion.button whileTap={{ scale: 0.95 }} onClick={(e) => { e.preventDefault(); addToCart(item.name, item.price, 1, item.image, item.id); }} className="w-full py-3.5 bg-gradient-to-r from-[#f472b6] to-[#ec4899] text-white font-black rounded-2xl shadow-md hover:shadow-lg transition-all">ADD TO CART</motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
        </div>
      </motion.main>
    </div>
  )
}
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { Search, ChevronDown, ShoppingCart, User } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { currentUser, cart, logout, userLocation } = useStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const isActive = (path) => location.pathname.includes(path) ? 'text-[#3B0060] border-b-2 border-[#3B0060]' : 'text-gray-600 hover:text-[#3B0060]';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white font-sans">
      {/* Top Main Bar */}
      <div className="flex items-center justify-between px-4 md:px-8 h-[80px] border-b border-gray-100">
        
        {/* Left: Logo & Location */}
        <div className="flex items-center gap-6 shrink-0">
          <Link to="/user/home" className="text-[36px] font-black text-[#3B0060] tracking-tighter lowercase leading-none">
            zesty
          </Link>
          
          <div className="hidden md:flex flex-col cursor-pointer group">
            <div className="flex items-center gap-1 text-gray-900 font-bold text-[15px]">
              Delivery Location <ChevronDown size={16} className="text-gray-400 group-hover:text-[#3B0060]" />
            </div>
            <div className="text-[12px] text-gray-500 font-medium truncate max-w-[200px]">{userLocation || 'Ahmedabad, Gujarat'}</div>
          </div>
        </div>

        {/* Center: Search Bar */}
        <div className="flex-1 max-w-2xl hidden md:block px-6">
          <div className="flex items-center bg-[#F4F5F7] rounded-xl px-4 h-[48px] focus-within:bg-white focus-within:border focus-within:border-[#3B0060] focus-within:shadow-sm transition-all">
            <Search size={20} className="text-gray-400 mr-3" />
            <input 
              type="text" 
              placeholder='Search for "Apples" or "Dal"' 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent outline-none text-[15px] font-medium text-gray-900 placeholder:text-gray-500" 
            />
          </div>
        </div>

        {/* Right: Auth & Cart */}
        <div className="flex items-center gap-6 shrink-0">
          {currentUser ? (
            <div className="flex items-center gap-3">
               <div className="text-right hidden md:block">
                 <p className="text-[14px] font-bold text-gray-900 leading-none">{currentUser.name}</p>
                 <button onClick={() => { logout(); navigate('/login'); }} className="text-[12px] font-bold text-[#FF3269] hover:underline mt-1">Logout</button>
               </div>
               <div className="w-10 h-10 bg-gray-100 text-[#3B0060] rounded-full flex items-center justify-center font-bold text-lg border border-gray-200 uppercase">
                 {currentUser.name.charAt(0)}
               </div>
            </div>
          ) : (
            <Link to="/login" className="hidden md:flex items-center gap-2 text-gray-700 font-bold text-[15px] hover:text-[#FF3269]">
              <User size={22} /> Login
            </Link>
          )}

          <Link to="/user/cart" className="flex items-center gap-2 bg-[#FF3269] hover:bg-[#E21B70] text-white px-4 py-2.5 rounded-xl font-bold transition-colors">
            <div className="relative">
              <ShoppingCart size={20} />
              {cartCount > 0 && <span className="absolute -top-2 -right-2 bg-white text-[#FF3269] text-[10px] font-black w-4 h-4 flex items-center justify-center rounded-full">{cartCount}</span>}
            </div>
            <span className="hidden md:block text-[14px]">Cart</span>
          </Link>
        </div>
      </div>

      {/* Zepto Bottom Category Bar */}
      <div className="flex justify-center md:justify-start md:px-8 gap-8 border-b border-gray-200 bg-white overflow-x-auto shadow-sm">
        <Link to="/user/home" className={`py-3 text-[14px] font-bold whitespace-nowrap ${location.pathname === '/user/home' ? 'text-[#3B0060] border-b-[3px] border-[#3B0060]' : 'text-gray-500 hover:text-gray-900'}`}>Home</Link>
        <Link to="/user/fruits" className={`py-3 text-[14px] font-bold whitespace-nowrap ${isActive('fruits')}`}>Fresh Fruits</Link>
        <Link to="/user/vegetables" className={`py-3 text-[14px] font-bold whitespace-nowrap ${isActive('vegetables')}`}>Fresh Vegetables</Link>
        <Link to="/user/pulses" className={`py-3 text-[14px] font-bold whitespace-nowrap ${isActive('pulses')}`}>Organic Pulses</Link>
        <Link to="/user/wishlist" className={`py-3 text-[14px] font-bold whitespace-nowrap ${isActive('wishlist')}`}>My Wishlist</Link>
      </div>
    </header>
  );
}
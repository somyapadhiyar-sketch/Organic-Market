import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { Search, ChevronDown, ShoppingCart, User, MapPin, Home, Briefcase, Mic, Mail, Phone, Apple, Carrot, Bean, Amphora, Heart, Package, Settings, Menu, Bot } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Country, State } from 'country-state-city';
import AIChatbot from './AIChatbot';

export default function Navbar() {
  const { currentUser, cart, logout, clearCart, userLocation, setUserLocation, searchQuery, setSearchQuery, products, updateUser } = useStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [localQuery, setLocalQuery] = useState(searchQuery || '');
  const isHomePage = location.pathname === '/home';
  const isSearchPage = ['/fruits', '/vegetables', '/pulses', '/oil'].some(p => location.pathname.includes(p));
  const [isListening, setIsListening] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', email: '', phone: '' });

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const isActive = (path) => location.pathname.includes(path) ? 'text-[#3B0060] border-b-2 border-[#3B0060]' : 'text-gray-600 hover:text-[#3B0060]';

  const handleProfileOpen = () => {
    setIsProfileOpen(!isProfileOpen);
    if (!isProfileOpen) {
      setEditForm({ name: currentUser?.name || '', email: currentUser?.email || '', phone: currentUser?.phone || '' });
      setIsEditingProfile(false);
    }
  };

  // This function is for explicit search actions (submit, voice) that should navigate the user.
  const performSearchAndNavigate = (query) => {
    setSearchQuery(query);
    if (query.trim()) {
      // Find the first product that matches the search query
      const matchedProduct = products.find(product =>
        (product.name || '').toLowerCase().includes(query.toLowerCase())
      );

      if (matchedProduct) {
        navigate(`/user/${String(matchedProduct.category || '').toLowerCase()}`);
      } else {
        // If no match, navigate to a default page to show"no results".
        navigate('/user/fruits');
      }
    }
  };

  const startListening = () => {
    if (isListening) return;
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      return alert("Voice search is not supported in this browser.");
    }
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false; // Set to false to prevent issues from rapid updates
      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = (e) => { console.error(e); setIsListening(false); };
      recognition.onresult = (event) => {
        // Remove trailing punctuation that speech recognition sometimes adds.
        const transcript = event.results[0][0].transcript.replace(/[.?!,;]$/, '').trim();
        setLocalQuery(transcript);
        performSearchAndNavigate(transcript); // Search and navigate on voice result.
      };
      recognition.start();
  };

  // Handles form submission (e.g., pressing Enter).
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    performSearchAndNavigate(localQuery); // Search and navigate on submit.
   };

  // Implements"autosearch" by updating the search query as the user types (debounced).
  // This allows for live filtering on category pages without forced navigation.
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchQuery(localQuery);
    }, 300); // 300ms debounce

    return () => {
      clearTimeout(handler);
    };
  }, [localQuery, setSearchQuery]);

  // Syncs the local search input with the global search query if it changes elsewhere.
  useEffect(() => {
    if (searchQuery !== localQuery) {
      setLocalQuery(searchQuery || '');
    }
  }, [searchQuery]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 font-sans pt-4 pointer-events-none">
      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 pointer-events-auto">

        {/* Main Navigation Bar */}
        <div className="flex items-center justify-between bg-white border-gray-100 shadow-lg rounded-2xl h-[76px]">
          {/* Desktop Links */}
          <div className="hidden md:flex items-center justify-start px-8 gap-8 overflow-x-auto no-scrollbar">
            <Link to="/home" className={`flex items-center gap-1.5 py-3 text-[14px] font-bold whitespace-nowrap ${location.pathname === '/home' ? 'text-[#3B0060] border-b-[3px] border-[#3B0060]' : 'text-gray-500 hover:text-gray-900'}`}><Home size={18} /> Home</Link>
            <Link to="/user/fruits" className={`flex items-center gap-1.5 py-3 text-[14px] font-bold whitespace-nowrap ${isActive('fruits')}`}><Apple size={18} /> Fresh Fruits</Link>
            <Link to="/user/vegetables" className={`flex items-center gap-1.5 py-3 text-[14px] font-bold whitespace-nowrap ${isActive('vegetables')}`}><Carrot size={18} /> Fresh Vegetables</Link>
            <Link to="/user/pulses" className={`flex items-center gap-1.5 py-3 text-[14px] font-bold whitespace-nowrap ${isActive('pulses')}`}><Bean size={18} /> Organic Pulses</Link>
            <Link to="/user/oil" className={`flex items-center gap-1.5 py-3 text-[14px] font-bold whitespace-nowrap ${isActive('oil')}`}><Amphora size={18} /> Cooking Oils</Link>
            <Link to="/user/wishlist" className={`flex items-center gap-1.5 py-3 text-[14px] font-bold whitespace-nowrap ${isActive('wishlist')}`}><Heart size={18} /> My Wishlist</Link>
            <Link to="/user/orders" className={`flex items-center gap-1.5 py-3 text-[14px] font-bold whitespace-nowrap ${isActive('orders')}`}><Package size={18} /> My Orders</Link>
            {currentUser && (
              <button onClick={() => setIsChatOpen(true)} className="flex items-center gap-1.5 px-4 py-2 text-[14px] font-black whitespace-nowrap bg-violet-50 text-violet-700 hover:bg-violet-100 border border-violet-200 rounded-xl transition-colors shrink-0 shadow-sm ml-1 xl:ml-2">
                <Bot size={18} /> Zesty AI
              </button>
            )}
          </div>

          {/* Mobile Links */}
          <div className="flex md:hidden items-center justify-start px-4 gap-2">
            <div className="relative">
              <button onClick={() => setIsCategoryOpen(!isCategoryOpen)} className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${isCategoryOpen || ['/home', '/fruits', '/vegetables', '/pulses', '/oil', '/wishlist', '/orders'].some(p => location.pathname.includes(p)) ? 'bg-[#3B0060] text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'}`}>
                <Menu size={20} />
              </button>
              
              {isCategoryOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsCategoryOpen(false)}></div>
                  <div className="absolute top-full left-0 mt-4 w-[240px] bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-slate-100 p-3 flex flex-col gap-1.5 z-50 animate-in fade-in zoom-in-95 pointer-events-auto">
                     <Link to="/home" onClick={() => setIsCategoryOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[15px] font-bold transition-colors ${location.pathname === '/home' ? 'bg-purple-50 text-[#3B0060]' : 'text-gray-600 hover:bg-gray-50'}`}><Home size={18} /> Home</Link>
                     <Link to="/user/fruits" onClick={() => setIsCategoryOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[15px] font-bold transition-colors ${location.pathname.includes('fruits') ? 'bg-purple-50 text-[#3B0060]' : 'text-gray-600 hover:bg-gray-50'}`}><Apple size={18} /> Fresh Fruits</Link>
                     <Link to="/user/vegetables" onClick={() => setIsCategoryOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[15px] font-bold transition-colors ${location.pathname.includes('vegetables') ? 'bg-purple-50 text-[#3B0060]' : 'text-gray-600 hover:bg-gray-50'}`}><Carrot size={18} /> Fresh Vegetables</Link>
                     <Link to="/user/pulses" onClick={() => setIsCategoryOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[15px] font-bold transition-colors ${location.pathname.includes('pulses') ? 'bg-purple-50 text-[#3B0060]' : 'text-gray-600 hover:bg-gray-50'}`}><Bean size={18} /> Organic Pulses</Link>
                     <Link to="/user/oil" onClick={() => setIsCategoryOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[15px] font-bold transition-colors ${location.pathname.includes('oil') ? 'bg-purple-50 text-[#3B0060]' : 'text-gray-600 hover:bg-gray-50'}`}><Amphora size={18} /> Cooking Oils</Link>
                     <div className="h-px bg-slate-100 my-1 mx-2"></div>
                     <Link to="/user/wishlist" onClick={() => setIsCategoryOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[15px] font-bold transition-colors ${location.pathname.includes('wishlist') ? 'bg-purple-50 text-[#3B0060]' : 'text-gray-600 hover:bg-gray-50'}`}><Heart size={18} /> My Wishlist</Link>
                     <Link to="/user/orders" onClick={() => setIsCategoryOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[15px] font-bold transition-colors ${location.pathname.includes('orders') ? 'bg-purple-50 text-[#3B0060]' : 'text-gray-600 hover:bg-gray-50'}`}><Package size={18} /> My Orders</Link>
                     {currentUser && (
                       <>
                         <div className="h-px bg-slate-100 my-1 mx-2"></div>
                         <button onClick={() => { setIsCategoryOpen(false); setIsChatOpen(true); }} className="flex items-center w-full gap-3 px-4 py-3 rounded-xl text-[15px] font-black transition-colors text-violet-600 hover:bg-violet-50"><Bot size={18} /> Zesty AI</button>
                       </>
                     )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right: Auth & Cart */}
          <div className="flex items-center gap-4 shrink-0 pr-4 xl:pr-8">
            
            {/* Cart Button */}
            <Link to="/user/cart" className="btn-3d btn-lime flex items-center gap-2 px-3 md:px-4 py-2 md:py-2.5 font-bold">
              <div className="relative">
                <ShoppingCart size={20} />
                {cartCount > 0 && <span className="absolute -top-2 -right-2 bg-green-500 text-white text-[10px] font-black w-4 h-4 flex items-center justify-center rounded-full border border-white">{cartCount}</span>}
              </div>
              <span className="hidden md:block text-[14px]">Cart</span>
            </Link>

            {currentUser ? (
              <div className="flex items-center gap-3 relative">
                <div onClick={handleProfileOpen} className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold text-lg border border-blue-100 uppercase cursor-pointer hover:bg-blue-100 transition-colors select-none">
                  {currentUser.name.charAt(0)}
                </div>
                {isProfileOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)}></div>
                    <div className="absolute top-full right-0 mt-2 w-[280px] bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.1)] border border-slate-100 p-5 z-50 animate-in fade-in zoom-in-95 duration-200">
                      <div className="flex items-center gap-4 mb-5 pb-5 border-b border-slate-100">
                        <div className="w-14 h-14 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-black text-2xl uppercase shadow-sm shrink-0">{currentUser.name.charAt(0)}</div>
                        <div className="flex-1 overflow-hidden"><h4 className="font-black text-slate-900 text-lg leading-tight truncate">{currentUser.name}</h4></div>
                        {!isEditingProfile && (<button onClick={() => setIsEditingProfile(true)} className="text-[11px] font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors">Edit</button>)}
                      </div>
                      <div className="space-y-4">
                        {isEditingProfile ? (
                          <div className="space-y-3">
                            <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Name</p><input type="text" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} className="w-full text-sm font-bold text-slate-700 bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg outline-none focus:border-blue-500 transition-all" /></div>
                            <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Email</p><input type="email" value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} className="w-full text-sm font-bold text-slate-700 bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg outline-none focus:border-blue-500 transition-all" /></div>
                            <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Phone</p><input type="tel" value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value.replace(/\D/g, '') })} maxLength="10" className="w-full text-sm font-bold text-slate-700 bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg outline-none focus:border-blue-500 transition-all" /></div>
                            <div className="flex gap-2 pt-2">
                              <button onClick={() => { if (updateUser) updateUser({ ...currentUser, ...editForm }); setIsEditingProfile(false); }} className="flex-1 bg-blue-600 text-white text-xs font-bold py-2.5 rounded-xl hover:bg-blue-700 transition-colors shadow-sm">Save</button>
                              <button onClick={() => setIsEditingProfile(false)} className="flex-1 bg-slate-100 text-slate-600 text-xs font-bold py-2.5 rounded-xl hover:bg-slate-200 transition-colors">Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-start gap-3 group"><div className="p-2.5 bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 rounded-xl transition-colors"><Mail size={18} /></div><div className="flex-1 overflow-hidden"><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Email</p><p className="text-sm font-bold text-slate-700 truncate">{currentUser.email}</p></div></div>
                            <div className="flex items-start gap-3 group"><div className="p-2.5 bg-slate-50 text-slate-400 group-hover:bg-green-50 group-hover:text-green-500 rounded-xl transition-colors"><Phone size={18} /></div><div className="flex-1 overflow-hidden"><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Phone</p><p className="text-sm font-bold text-slate-700">{currentUser.phone || 'N/A'}</p></div></div>
                            <div className="flex items-start gap-3 group"><div className="p-2.5 bg-slate-50 text-slate-400 group-hover:bg-orange-50 group-hover:text-orange-500 rounded-xl transition-colors"><MapPin size={18} /></div><div className="flex-1"><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Delivery Location</p><p className="text-[13px] font-bold text-slate-700 leading-snug">{userLocation || 'Ahmedabad, Gujarat'}</p></div></div>
                          </>
                        )}
                      </div>
                      <Link to="/user/profile" onClick={() => setIsProfileOpen(false)} className="flex items-center justify-center gap-2 w-full mt-4 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl text-sm text-center hover:bg-slate-200 transition-colors">Advanced Settings <Settings size={16} /></Link>
                      <button onClick={() => { if (clearCart) clearCart(); logout(); setIsProfileOpen(false); navigate('/login/user', { replace: true }); }} className="w-full mt-6 py-3 bg-red-50 text-red-600 font-bold rounded-xl text-sm hover:bg-red-100 transition-colors">Logout</button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link to="/login/user" className="flex items-center gap-2 text-gray-700 font-bold text-[15px] hover:text-blue-600"><User size={22} /> <span className="hidden sm:inline">Login</span></Link>
            )}
          </div>
        </div>

        {/* Center: Search Bar - Below Navbar */}
        {isSearchPage && (
          <div className="flex justify-center mt-4 animate-in fade-in slide-in-from-top-2">
            <div className="w-full max-w-2xl">
              <form onSubmit={handleSearchSubmit} className="flex items-center bg-white shadow-lg rounded-2xl h-[52px] border border-gray-100 focus-within:border-blue-600 focus-within:shadow-xl transition-all">
                <button type="submit" className="pl-4 pr-2 text-gray-400 hover:text-blue-600 transition-colors"><Search size={20} /></button>
                <input type="text" placeholder='Search for "Apples" or "Dal"' value={localQuery} onChange={(e) => setLocalQuery(e.target.value)} className="w-full bg-transparent outline-none text-[15px] font-medium text-gray-900 placeholder:text-gray-500" />
                <button type="button" onClick={startListening} className={`p-3 rounded-full transition-colors ${isListening ? 'text-red-500 animate-pulse' : 'text-gray-500 hover:bg-gray-200'}`}><Mic size={18} strokeWidth={isListening ? 3 : 2} /></button>
              </form>
            </div>
          </div>
        )}
      </div>
      
      <AIChatbot isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </header>
  );
}
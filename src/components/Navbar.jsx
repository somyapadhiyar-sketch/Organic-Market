import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { Search, ChevronDown, ShoppingCart, User, MapPin, Home, Briefcase, Mic, Mail, Phone } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Country, State } from 'country-state-city';

export default function Navbar() {
  const { currentUser, cart, logout, userLocation, setUserLocation, searchQuery, setSearchQuery, products, updateUser } = useStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [localQuery, setLocalQuery] = useState(searchQuery || '');
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
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
    <header className="fixed top-0 left-0 right-0 z-50 bg-white font-sans">
      {/* Top Main Bar */}
      <div className="flex items-center justify-between px-4 md:px-8 h-[80px] border-b border-gray-100">
        
        {/* Left: Logo & Location */}
        <div className="flex items-center gap-6 shrink-0">
          <span className="text-[36px] font-black text-blue-600 tracking-tighter lowercase leading-none cursor-default">
            zesty
          </span>
          
          <div className="hidden md:flex flex-col cursor-pointer group relative" onClick={() => setIsLocationOpen(!isLocationOpen)}>
            <div className="flex items-center gap-1 text-gray-900 font-bold text-[15px]">
              Delivery Location <ChevronDown size={16} className="text-gray-400 group-hover:text-blue-600" />
            </div>
            <div className="text-[12px] text-gray-500 font-medium truncate max-w-[200px]">{currentUser?.address || userLocation || 'Ahmedabad, Gujarat'}</div>
            
            {/* Saved Addresses Dropdown */}
            {isLocationOpen && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-100 p-2 z-50">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-2">Select Address</p>
                {currentUser?.savedAddresses?.length > 0 ? (
                  currentUser.savedAddresses.map((addr, idx) => {
                    // Reconstruct readable string from saved data
                    const countryName = Country.getCountryByCode(addr.country)?.name || addr.country;
                    const stateName = State.getStateByCodeAndCountry(addr.state, addr.country)?.name || addr.state;
                    const fullAddr = `${addr.street}, ${addr.city}, ${stateName}, ${countryName} - ${addr.pincode}`;

                    return (
                      <div key={idx} className="relative group">
                        <div onClick={(e) => { e.stopPropagation(); setUserLocation(fullAddr); setIsLocationOpen(false); }} className="p-3 hover:bg-slate-50 rounded-lg cursor-pointer border-b border-gray-50 last:border-0 pr-10">
                          <div className="flex items-center gap-2 mb-1">
                            {addr.type === 'Home' && <Home size={14} className="text-green-600" />}
                            {addr.type === 'Work' && <Briefcase size={14} className="text-blue-600" />}
                            {addr.type === 'Other' && <MapPin size={14} className="text-slate-400" />}
                            <span className="font-bold text-slate-800 text-xs">{addr.type}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 leading-tight line-clamp-2">{fullAddr}</p>
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            const updatedAddresses = currentUser.savedAddresses.filter((_, i) => i !== idx);
                            const updatedUser = { ...currentUser, savedAddresses: updatedAddresses };
                            if (updateUser) updateUser(updatedUser);
                            else currentUser.savedAddresses = updatedAddresses;
                            localStorage.setItem('user', JSON.stringify(updatedUser));
                          }} 
                          className="absolute top-1/2 -translate-y-1/2 right-2 p-1.5 bg-red-50 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100"
                          title="Delete Address"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinelinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                        </button>
                      </div>
                    )
                  })
                ) : (
                  <div className="p-4 text-center text-xs text-slate-400 font-medium">No saved addresses found.</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Center: Search Bar */}
        <div className="flex-1 max-w-2xl hidden md:block px-6">
          <form onSubmit={handleSearchSubmit} className="flex items-center bg-[#F4F5F7] rounded-xl h-[48px] focus-within:bg-white focus-within:border focus-within:border-blue-600 focus-within:shadow-sm transition-all">
            <button type="submit" className="pl-4 pr-2 text-gray-400 hover:text-blue-600 transition-colors">
              <Search size={20} />
            </button>
            <input 
              type="text" 
              placeholder='Search for"Apples" or"Dal"'
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
              className="w-full bg-transparent outline-none text-[15px] font-medium text-gray-900 placeholder:text-gray-500" 
            />
            <button type="button" onClick={startListening} className={`p-3 rounded-full transition-colors ${isListening ? 'text-red-500 animate-pulse' : 'text-gray-500 hover:bg-gray-200'}`}>
              <Mic size={18} strokeWidth={isListening ? 3 : 2} />
            </button>
          </form>
        </div>

        {/* Right: Auth & Cart */}
        <div className="flex items-center gap-6 shrink-0">
          {currentUser ? (
            <div className="flex items-center gap-3 relative">
               <div className="text-right hidden md:block">
                 <p className="text-[14px] font-bold text-gray-900 leading-none">{currentUser.name}</p>
                 <button onClick={() => { logout(); navigate('/login/user', { replace: true }); }} className="text-[12px] font-bold text-red-500 hover:underline mt-1">Logout</button>
               </div>
               <div 
                 onClick={handleProfileOpen}
                 className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold text-lg border border-blue-100 uppercase cursor-pointer hover:bg-blue-100 transition-colors select-none"
               >
                 {currentUser.name.charAt(0)}
               </div>

               {isProfileOpen && (
                 <>
                   <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)}></div>
                   <div className="absolute top-full right-0 mt-2 w-[280px] bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.1)] border border-slate-100 p-5 z-50 animate-in fade-in zoom-in-95 duration-200">
                     <div className="flex items-center gap-4 mb-5 pb-5 border-b border-slate-100">
                       <div className="w-14 h-14 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-black text-2xl uppercase shadow-sm shrink-0">
                         {currentUser.name.charAt(0)}
                       </div>
                       <div className="flex-1 overflow-hidden">
                         <h4 className="font-black text-slate-900 text-lg leading-tight truncate">{currentUser.name}</h4>
                       </div>
                       {!isEditingProfile && (
                         <button onClick={() => setIsEditingProfile(true)} className="text-[11px] font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors">
                           Edit
                         </button>
                       )}
                     </div>
                     
                     <div className="space-y-4">
                       {isEditingProfile ? (
                         <div className="space-y-3">
                           <div>
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Name</p>
                             <input type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full text-sm font-bold text-slate-700 bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg outline-none focus:border-blue-500 transition-all" />
                           </div>
                           <div>
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Email</p>
                             <input type="email" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} className="w-full text-sm font-bold text-slate-700 bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg outline-none focus:border-blue-500 transition-all" />
                           </div>
                           <div>
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Phone</p>
                             <input type="tel" value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value.replace(/\D/g, '')})} maxLength="10" className="w-full text-sm font-bold text-slate-700 bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg outline-none focus:border-blue-500 transition-all" />
                           </div>
                           <div className="flex gap-2 pt-2">
                             <button onClick={() => {
                               if(updateUser) updateUser({ ...currentUser, ...editForm });
                               setIsEditingProfile(false);
                             }} className="flex-1 bg-blue-600 text-white text-xs font-bold py-2.5 rounded-xl hover:bg-blue-700 transition-colors shadow-sm">Save</button>
                             <button onClick={() => setIsEditingProfile(false)} className="flex-1 bg-slate-100 text-slate-600 text-xs font-bold py-2.5 rounded-xl hover:bg-slate-200 transition-colors">Cancel</button>
                           </div>
                         </div>
                       ) : (
                         <>
                           <div className="flex items-start gap-3 group">
                             <div className="p-2.5 bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 rounded-xl transition-colors"><Mail size={18} /></div>
                             <div className="flex-1 overflow-hidden"><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Email</p><p className="text-sm font-bold text-slate-700 truncate">{currentUser.email}</p></div>
                           </div>
                           <div className="flex items-start gap-3 group">
                             <div className="p-2.5 bg-slate-50 text-slate-400 group-hover:bg-green-50 group-hover:text-green-500 rounded-xl transition-colors"><Phone size={18} /></div>
                             <div className="flex-1 overflow-hidden"><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Phone</p><p className="text-sm font-bold text-slate-700">{currentUser.phone || 'N/A'}</p></div>
                           </div>
                           <div className="flex items-start gap-3 group">
                             <div className="p-2.5 bg-slate-50 text-slate-400 group-hover:bg-orange-50 group-hover:text-orange-500 rounded-xl transition-colors"><MapPin size={18} /></div>
                             <div className="flex-1"><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Delivery Location</p><p className="text-[13px] font-bold text-slate-700 leading-snug">{userLocation || 'Ahmedabad, Gujarat'}</p></div>
                           </div>
                         </>
                       )}
                     </div>

                     <Link to="/user/profile" onClick={() => setIsProfileOpen(false)} className="block w-full mt-4 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl text-sm text-center hover:bg-slate-200 transition-colors">
                       Advanced Settings ⚙️
                     </Link>
                     
                     <button onClick={() => { logout(); setIsProfileOpen(false); navigate('/login/user', { replace: true }); }} className="w-full mt-6 py-3 bg-red-50 text-red-600 font-bold rounded-xl text-sm hover:bg-red-100 transition-colors md:hidden">
                       Logout
                     </button>
                   </div>
                 </>
               )}
            </div>
          ) : (
            <Link to="/login/user" className="hidden md:flex items-center gap-2 text-gray-700 font-bold text-[15px] hover:text-blue-600">
              <User size={22} /> Login
            </Link>
          )}

          <Link to="/user/cart" className="btn-3d btn-lime flex items-center gap-2 px-4 py-2.5 font-bold">
            <div className="relative">
              <ShoppingCart size={20} />
              {cartCount > 0 && <span className="absolute -top-2 -right-2 bg-green-500 text-white text-[10px] font-black w-4 h-4 flex items-center justify-center rounded-full border border-white">{cartCount}</span>}
            </div>
            <span className="hidden md:block text-[14px]">Cart</span>
          </Link>
        </div>
      </div>

      {/* Zepto Bottom Category Bar */}
      <div className="flex items-center justify-start px-4 md:px-8 gap-6 md:gap-8 border-b border-gray-200 bg-white overflow-x-auto no-scrollbar">
        <Link to="/home" className={`py-3 text-[14px] font-bold whitespace-nowrap ${location.pathname === '/home' ? 'text-[#3B0060] border-b-[3px] border-[#3B0060]' : 'text-gray-500 hover:text-gray-900'}`}>🏠 Home</Link>
        <Link to="/user/fruits" className={`py-3 text-[14px] font-bold whitespace-nowrap ${isActive('fruits')}`}>🍎 Fresh Fruits</Link>
        <Link to="/user/vegetables" className={`py-3 text-[14px] font-bold whitespace-nowrap ${isActive('vegetables')}`}>🥦 Fresh Vegetables</Link>
        <Link to="/user/pulses" className={`py-3 text-[14px] font-bold whitespace-nowrap ${isActive('pulses')}`}>🌾 Organic Pulses</Link>
        <Link to="/user/oil" className={`py-3 text-[14px] font-bold whitespace-nowrap ${isActive('oil')}`}>🪔 Cooking Oils</Link>
        <Link to="/user/wishlist" className={`py-3 text-[14px] font-bold whitespace-nowrap ${isActive('wishlist')}`}>❤️ My Wishlist</Link>
        <Link to="/user/orders" className={`py-3 text-[14px] font-bold whitespace-nowrap ${isActive('orders')}`}>📦 My Orders</Link>
      </div>
    </header>
  );
}
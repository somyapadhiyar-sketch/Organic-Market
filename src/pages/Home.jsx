import { useRef, useEffect, useLayoutEffect, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, useTransform, useMotionValue, useSpring, AnimatePresence } from 'framer-motion'
import { LifeBuoy, ShieldCheck, ShoppingBag, ArrowRight, Star, Search, Plus, Sparkles, Leaf, Mic } from 'lucide-react'
import Footer from '../components/Footer'
import Navbar from '../components/Navbar'
import { useStore } from '../context/StoreContext'

const FadeIn = ({ children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0, scale: 1 }}
    viewport={{ once: true, margin:"-50px" }}
    transition={{ duration: 0.6, delay, ease:"easeOut" }}
    className="w-full block"
  >
    {children}
  </motion.div>
);

export default function Home() {
  const navigate = useNavigate();
  const { currentUser, products = [], addToCart, showToast } = useStore();
  const { pathname } = useLocation();
  const [isListening, setIsListening] = useState(false);

  const startListening = () => {
    if (isListening) return;
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      return alert("Voice search is not supported in this browser.");
    }
    // Clear existing text immediately so voice replaces it
    setSearchVal('');
    setShowSuggestions(false);

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false; // single utterance — auto-stops
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.replace(/[.?!,;]$/, '').trim();
      setSearchVal(transcript);
      setShowSuggestions(true);
      recognition.stop(); // force-stop immediately after capture
    };
    recognition.start();
  };

  // Search Logic
  const [searchVal, setSearchVal] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);

  // Join Club States
  const [clubEmail, setClubEmail] = useState("");
  const [celebrationParticles, setCelebrationParticles] = useState([]);

  // Close search suggestions on click outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const triggerCelebration = () => {
    const newParticles = Array.from({ length: 65 }).map((_, i) => {
      const isBalloon = Math.random() > 0.5;
      return {
        id: i + Date.now(),
        char: isBalloon ? '🎈' : ['🎉', '⭐', '🍃', '🍊', '🍏', '🍒'][Math.floor(Math.random() * 6)],
        x: Math.random() * 100,
        size: isBalloon ? Math.floor(Math.random() * 25 + 25) : Math.floor(Math.random() * 15 + 15),
        delay: Math.random() * 0.7,
        duration: Math.random() * 2.5 + 2.5, // 2.5 to 5s
        color: isBalloon ? null : ['#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#a855f7', '#ec4899'][Math.floor(Math.random() * 6)],
        horizontalShift: (Math.random() - 0.5) * 150
      };
    });
    setCelebrationParticles(newParticles);
  };

  const handleJoinClub = (e) => {
    e.preventDefault();
    if (!clubEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(clubEmail)) {
      if (showToast) showToast("Please enter a valid email address.");
      return;
    }
    setClubEmail("");
    if (showToast) showToast("🎉 Welcome to the Club! Check your inbox for your first coupon code.");
    triggerCelebration();
  };

  // Filter products for homepage search
  const filteredProducts = searchVal.trim() 
    ? products.filter(p => !p.disabled && p.name.toLowerCase().includes(searchVal.toLowerCase())).slice(0, 5)
    : [];

  // MOUSE TILT LOGIC
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["17.5deg", "-17.5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-17.5deg", "17.5deg"]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    if (currentUser?.role === 'admin') navigate('/admin', { replace: true });
    else if (currentUser?.role === 'delivery') navigate('/delivery', { replace: true });
  }, [currentUser, navigate]);

  return (
    <div className="min-h-screen bg-[#F3F5F7] font-sans text-slate-900 flex flex-col">
      
      <Navbar />

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 relative flex flex-col overflow-x-hidden pt-[100px]">
        
        {/* HERO SECTION - Realistic E-commerce Style */}
        <section className="relative w-full bg-[#F3F5F7] min-h-[400px] md:min-h-[600px] flex items-center py-10 md:py-0">
          
          {/* Decorative Background blob - simpler and positioned better */}
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-100/30 rounded-full blur-3xl translate-x-1/3 -translate-y-1/4"></div>
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-slate-200/50 rounded-full blur-3xl -translate-x-1/4 translate-y-1/4"></div>

          <div className="max-w-7xl mx-auto px-6 w-full relative z-10 grid md:grid-cols-2 gap-12 items-center">
            
            {/* Hero Content */}
            <div className="space-y-8 text-center md:text-left pt-8 md:pt-0">
              <FadeIn>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-slate-100 mb-6">
                  <span className="text-slate-600 font-bold text-xs uppercase tracking-wider">🌿 100% Organic & Fresh</span>
                </div>
                <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-slate-900 leading-[1.1] mb-6">
                  Grocery delivery <br/>
                  in minutes.
                </h1>
                <p className="text-lg md:text-xl text-slate-600 font-medium max-w-lg mx-auto md:mx-0 leading-relaxed mb-6">
                  Experience the freshest produce delivered straight from local farms to your doorstep. No chemicals, just nature.
                </p>
              </FadeIn>

              {/* Dynamic Instant Search */}
              <FadeIn delay={0.1}>
                <div className="relative w-full max-w-md mx-auto md:mx-0 z-30" ref={searchRef}>
                  <div className="flex items-center bg-white border border-slate-200 shadow-sm rounded-2xl h-[56px] px-4 focus-within:border-emerald-500 focus-within:shadow-md transition-all">
                    <Search size={20} className="text-slate-400 mr-3 shrink-0" />
                    <input 
                      type="text" 
                      placeholder="Search fresh fruits, vegetables..." 
                      value={searchVal}
                      onChange={(e) => { setSearchVal(e.target.value); setShowSuggestions(true); }}
                      onFocus={() => setShowSuggestions(true)}
                      className="w-full bg-transparent outline-none text-slate-800 font-bold placeholder-slate-400 text-sm"
                    />
                    {searchVal && (
                      <button onClick={() => { setSearchVal(""); setShowSuggestions(false); }} className="text-slate-400 hover:text-slate-600 font-bold text-xs p-1">✕</button>
                    )}
                    <button type="button" onClick={startListening} className={`p-2 ml-1 rounded-full transition-colors ${isListening ? 'text-red-500 animate-pulse' : 'text-slate-400 hover:text-emerald-500 hover:bg-emerald-50'}`}><Mic size={18} strokeWidth={isListening ? 3 : 2} /></button>
                  </div>

                  {/* Search Suggestions dropdown */}
                  <AnimatePresence>
                    {showSuggestions && filteredProducts.length > 0 && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-[64px] left-0 right-0 bg-white border border-slate-100 rounded-2xl shadow-xl z-[999] overflow-hidden max-h-[300px] overflow-y-auto"
                      >
                        <div className="p-2 divide-y divide-slate-50">
                          {filteredProducts.map(p => (
                            <div 
                              key={p.id}
                              onClick={() => { navigate(`/user/product/${p.name}`, { state: { product: p } }); setShowSuggestions(false); }}
                              className="flex items-center justify-between p-3 hover:bg-slate-50 cursor-pointer transition-colors rounded-xl"
                            >
                              <div className="flex items-center gap-3">
                                <img src={p.image} alt={p.name} className="w-10 h-10 object-contain bg-slate-50 rounded-lg p-1" />
                                <div className="text-left">
                                  <h4 className="font-bold text-sm text-slate-800 leading-tight">{p.name}</h4>
                                  <p className="text-xs text-slate-400">{`1 ${p.unit || 'kg'}`}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-black text-sm text-emerald-600">₹{p.price}</span>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    addToCart(p.name, p.price, 1, p.image, p.id);
                                    if (showToast) showToast(`Added ${p.name} to cart!`);
                                  }}
                                  className="bg-emerald-500 hover:bg-emerald-600 text-white p-1.5 rounded-lg text-xs font-bold transition-all active:scale-95"
                                >
                                  <Plus size={14} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </FadeIn>

              <FadeIn delay={0.2}>
                <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                  <Link to="/user/fruits" className="btn-3d btn-emerald px-8 py-4 font-bold text-lg shadow-lg gap-2 active:scale-95">
                    Start Shopping <ArrowRight size={20} />
                  </Link>
                  <Link to="/user/about" className="px-8 py-4 font-bold text-lg shadow-sm gap-2 active:scale-95 bg-white text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                    Our Story
                  </Link>
                </div>
              </FadeIn>

              <FadeIn delay={0.4}>
                <div className="flex items-center justify-center md:justify-start gap-8 pt-4">
                  <div>
                    <p className="text-3xl font-black text-slate-900">10k+</p>
                    <p className="text-sm font-bold text-slate-500">Happy Customers</p>
                  </div>
                  <div className="w-px h-10 bg-slate-200"></div>
                  <div>
                    <p className="text-3xl font-black text-slate-900">100%</p>
                    <p className="text-sm font-bold text-slate-500">Organic Certified</p>
                  </div>
                </div>
              </FadeIn>
            </div>

            {/* Hero Image / Illustration Placeholder */}
            <motion.div 
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              initial={{ opacity: 0, scale: 0.9, x: 50 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative hidden md:flex items-center justify-center min-h-[500px] w-full"
            >
              {/* 3D BENTO CARD WITH MOUSE TILT */}
              <motion.div 
                style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
                className="relative z-10 w-[420px] h-[480px] bg-white rounded-[3rem] border border-slate-200 shadow-[0_45px_100px_-30px_rgba(0,0,0,0.2)] flex flex-col items-center justify-center p-8 overflow-visible"
              >
                {/* CENTRAL 3D FRUIT ELEMENT */}
                <div className="relative pointer-events-none mb-12" style={{ transform: "translateZ(75px)" }}>
                  <motion.div 
                    animate={{ y: [0, -10, 0], scale: [1, 1.05, 1] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="text-[10rem]"
                  >
                    🧺
                  </motion.div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.span animate={{ y: [-10, 10, -10] }} transition={{ duration: 3.5, repeat: Infinity }} className="text-6xl -mt-16 ml-1 opacity-90">🍎</motion.span>
                  </div>
                </div>

                {/* HIGH-CONTRAST ACTION BOX */}
                <div className="w-full bg-slate-50 border border-slate-200 p-6 rounded-[2.5rem] shadow-sm flex items-center justify-between" style={{ transform: "translateZ(70px)" }}>
                  <div>
                    <h4 className="text-lg font-black text-slate-900 tracking-tight leading-none mb-1">Fresh Delivery</h4>
                    <p className="text-[11px] font-bold text-green-600 uppercase tracking-widest">100% Organic Farm</p>
                  </div>
                  <button 
                    onClick={() => navigate('/user/fruits')} 
                    className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all text-white"
                  >
                    <ShoppingBag size={24} strokeWidth={2.5} />
                  </button>
                </div>

                {/* REDIRECTED ROAMING FRUITS */}
                {[
                  { emoji: "🍒", x: -160, y: -80, d: 4 },
                  { emoji: "🍍", x: 440,  y: 0,   d: 5 },
                  { emoji: "🍉", x: 400,  y: 360, d: 5.5 },
                  { emoji: "🍓", x: -120, y: 380, d: 4.5 },
                  { emoji: "🥝", x: 260,  y: -140, d: 4.8 }
                ].map((f, i) => (
                  <motion.div
                    key={i}
                    animate={{ 
                      y: [f.y, f.y - 40, f.y],
                      x: [f.x, f.x + 20, f.x],
                      rotate: [0, 20, -20, 0]
                    }}
                    transition={{ 
                      duration: f.d, 
                      repeat: Infinity, 
                      ease: "easeInOut",
                      delay: i * 0.5 
                    }}
                    className="absolute text-5xl z-0 select-none pointer-events-none"
                    style={{ left: 0, top: 0 }}
                  >
                    {f.emoji}
                  </motion.div>
                ))}
              </motion.div>

              {/* Quality Badge */}
              <motion.div 
                animate={{ y: [0, -10, 0] }} 
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                className="absolute -top-6 -right-6 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/60 z-20"
                style={{ transform: "translateZ(100px)" }}
              >
                <div className="flex items-center gap-2">
                  <div className="bg-yellow-100 p-2 rounded-full"><Star size={18} className="text-yellow-600 fill-yellow-600"/></div>
                  <div>
                    <p className="text-xs font-black text-slate-900">4.9/5</p>
                    <p className="text-[10px] font-bold text-slate-500">Farmers Choice</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* FRESH CATEGORIES GRID */}
        <section className="max-w-7xl mx-auto px-6 py-12 w-full">
          <FadeIn>
            <div className="flex flex-col md:flex-row md:items-baseline justify-between mb-8 text-center md:text-left">
              <div>
                <span className="text-emerald-600 font-bold text-xs uppercase tracking-widest flex items-center gap-1.5 justify-center md:justify-start">
                  <Sparkles size={14} /> Handpicked For You
                </span>
                <h2 className="text-3xl md:text-4xl font-black text-slate-900 mt-1">Explore Our Fresh Categories</h2>
              </div>
              <Link to="/user/fruits" className="text-emerald-600 hover:text-emerald-700 font-bold text-sm flex items-center gap-1 mt-4 md:mt-0 justify-center group">
                View All Catalog <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </FadeIn>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: "Fruits", path: "/user/fruits", emoji: "🍎", bg: "bg-red-50 hover:bg-red-100/80 border-red-100", textColor: "text-red-700", items: "12+ Items" },
              { name: "Vegetables", path: "/user/vegetables", emoji: "🥬", bg: "bg-green-50 hover:bg-green-100/80 border-green-100", textColor: "text-green-700", items: "18+ Items" },
              { name: "Pulses", path: "/user/pulses", emoji: "🫘", bg: "bg-amber-50 hover:bg-amber-100/80 border-amber-100", textColor: "text-amber-700", items: "8+ Items" },
              { name: "Cold-Pressed Oils", path: "/user/oil", emoji: "🍾", bg: "bg-yellow-50 hover:bg-yellow-100/80 border-yellow-100", textColor: "text-yellow-700", items: "6+ Items" }
            ].map((cat, i) => (
              <FadeIn delay={i * 0.1} key={i}>
                <Link 
                  to={cat.path} 
                  className={`block border p-6 rounded-[2rem] ${cat.bg} transition-all duration-300 transform hover:-translate-y-2 text-center shadow-sm relative overflow-hidden group`}
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/20 rounded-full blur-xl group-hover:scale-125 transition-all"></div>
                  <span className="text-5xl block mb-4 select-none transform group-hover:scale-110 transition-transform duration-300">{cat.emoji}</span>
                  <h3 className={`font-black text-lg ${cat.textColor}`}>{cat.name}</h3>
                  <p className="text-xs text-slate-500 font-bold mt-1 uppercase tracking-wider">{cat.items}</p>
                </Link>
              </FadeIn>
            ))}
          </div>
        </section>

        {/* EXTRA PROMO BANNER */}
        <section className="w-full max-w-7xl mx-auto px-6 py-4 md:py-6">
          <FadeIn>
            <div className="w-full bg-slate-900 rounded-[2.5rem] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between shadow-2xl overflow-hidden relative group">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1610832958506-aa56368176cf?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-40 group-hover:scale-105 transition-transform duration-700"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent"></div>
              <div className="relative z-10 md:w-2/3 mb-8 md:mb-0 text-center md:text-left">
                <span className="text-emerald-400 font-bold tracking-widest uppercase text-xs mb-3 block">Special Offer</span>
                <h2 className="text-3xl md:text-5xl font-black text-white mb-4">Summer Fruit Sale!</h2>
                <p className="text-slate-300 text-lg max-w-lg mx-auto md:mx-0">Juicy mangoes and citrus are here. Get up to 50% off on seasonal organic fruits.</p>
              </div>
              <div className="relative z-10 md:w-1/3 flex justify-center md:justify-end">
                <Link to="/user/fruits" className="bg-emerald-500 hover:bg-emerald-400 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-[0_8px_20px_-6px_rgba(16,185,129,0.5)] hover:shadow-[0_12px_25px_-6px_rgba(16,185,129,0.6)] transition-all duration-300 hover:-translate-y-1">Shop the Sale</Link>
              </div>
            </div>
          </FadeIn>
        </section>

        {/* FEATURES SECTION - Cleaner Look */}
        <section className="py-8 md:py-16 bg-transparent">
          <div className="max-w-7xl mx-auto px-6">
            <FadeIn>
              <div className="text-center mb-10 md:mb-16">
                <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">Why Shop With Zesty?</h2>
                <p className="text-slate-500 max-w-2xl mx-auto text-lg">We bring the season's best produce from the farm directly to your table, ensuring maximum freshness and nutrition.</p>
              </div>
            </FadeIn>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: <ShieldCheck size={32} className="text-emerald-600" />, title:"Certified Organic", desc:"100% chemical-free produce grown with love and care.", color:"bg-emerald-50" },
                { icon: <ShoppingBag size={32} className="text-emerald-600" />, title:"Superfast Delivery", desc:"Get your groceries delivered in 10 minutes or less.", color:"bg-emerald-50" },
                { icon: <LifeBuoy size={32} className="text-emerald-600" />, title:"Direct from Farmers", desc:"Direct from farmers means better prices for you and them.", color:"bg-emerald-50" }
              ].map((feature, i) => (
                <FadeIn delay={i * 0.1} key={i}>
                  <div className="p-6 rounded-3xl border border-slate-100 bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
                    <div className={`w-16 h-16 ${feature.color} rounded-2xl flex items-center justify-center mb-6`}>
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-3">{feature.title}</h3>
                    <p className="text-slate-500 font-medium leading-relaxed">{feature.desc}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* JOIN CLUB SECTION */}
        <section className="w-full max-w-7xl mx-auto px-6 py-8 md:py-12 mb-6">
          <FadeIn>
            <div className="w-full bg-gradient-to-br from-emerald-600 to-teal-800 rounded-[3rem] p-8 md:p-16 flex flex-col lg:flex-row items-center justify-between shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 rounded-full blur-3xl -translate-x-1/4 -translate-y-1/4"></div>
              <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-emerald-500/20 rounded-full blur-3xl translate-x-1/4 translate-y-1/4"></div>
              
              <div className="relative z-10 lg:w-1/2 mb-8 lg:mb-0 text-center lg:text-left">
                <span className="text-emerald-200 font-bold tracking-widest uppercase text-xs mb-3 block flex items-center gap-1.5 justify-center lg:justify-start">
                  <Leaf size={14} /> Join Zesty Club
                </span>
                <h2 className="text-3xl md:text-5xl font-black text-white mb-4">Get 20% OFF on Your First Order!</h2>
                <p className="text-emerald-50 text-base md:text-lg max-w-md mx-auto lg:mx-0 font-medium">Subscribe to our newsletter for exclusive premium coupons, organic lifestyle articles, and recipe suggestions.</p>
              </div>

              <div className="relative z-10 lg:w-1/2 w-full flex justify-center lg:justify-end">
                <form onSubmit={handleJoinClub} className="w-full max-w-md bg-white/10 backdrop-blur-md border border-white/20 p-2 rounded-[2rem] flex flex-col sm:flex-row gap-2 shadow-inner">
                  <input 
                    type="email" 
                    placeholder="Enter your email" 
                    value={clubEmail}
                    onChange={(e) => setClubEmail(e.target.value)}
                    className="flex-1 bg-transparent px-4 py-3 text-white placeholder-emerald-100/70 font-bold text-sm outline-none rounded-xl"
                  />
                  <button type="submit" className="bg-white hover:bg-emerald-50 text-emerald-800 font-black px-6 py-3 rounded-2xl transition-all duration-300 shadow-md active:scale-95 text-sm uppercase tracking-wide">
                    Join Club
                  </button>
                </form>
              </div>
            </div>
          </FadeIn>
        </section>

      </main>

      {/* FLOATING CELEBRATION OVERLAY */}
      <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
        <AnimatePresence>
          {celebrationParticles.map((p) => (
            <motion.div
              key={p.id}
              initial={{ 
                opacity: 1, 
                y: '105vh', 
                x: `${p.x}vw`,
                rotate: 0 
              }}
              animate={{ 
                y: '-20vh', 
                x: `${p.x + (p.horizontalShift / 10)}vw`, 
                rotate: 360 * (Math.random() > 0.5 ? 1 : -1),
                opacity: [1, 1, 0.8, 0]
              }}
              exit={{ opacity: 0 }}
              transition={{ 
                duration: p.duration, 
                delay: p.delay, 
                ease: [0.25, 0.46, 0.45, 0.94] 
              }}
              className="absolute select-none pointer-events-none"
              style={{ 
                fontSize: `${p.size}px`,
                color: p.color || 'inherit'
              }}
            >
              {p.char}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <Footer />
    </div>
  )
}
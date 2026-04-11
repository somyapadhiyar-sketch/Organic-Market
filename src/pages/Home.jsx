import { useRef, useEffect, useLayoutEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, useTransform, useMotionValue, useSpring } from 'framer-motion'
import { LifeBuoy, ShieldCheck, ShoppingBag, ArrowRight, Star } from 'lucide-react'
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
  const { currentUser } = useStore();
  const { pathname } = useLocation();

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
                <p className="text-lg md:text-xl text-slate-600 font-medium max-w-lg mx-auto md:mx-0 leading-relaxed">
                  Experience the freshest produce delivered straight from local farms to your doorstep. No chemicals, just nature.
                </p>
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

                  {/* REDIRECTED ROAMING FRUITS - Clustered specifically around the card now */}
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

        {/* EXTRA PROMO BANNER */}
        <section className="w-full max-w-7xl mx-auto px-6 py-6 md:py-12">
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
        <section className="py-12 md:py-24 bg-transparent">
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

        {/* CTA BANNER */}
        <section className="w-full max-w-7xl mx-auto px-6 py-6 md:py-12 mb-12">
          <FadeIn>
            <div className="w-full bg-slate-900 rounded-[2.5rem] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between shadow-2xl overflow-hidden relative group">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1974&auto=format&fit=crop')] bg-cover bg-center opacity-40 group-hover:scale-105 transition-transform duration-700"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent"></div>
              <div className="relative z-10 md:w-2/3 mb-8 md:mb-0 text-center md:text-left">
                <span className="text-emerald-400 font-bold tracking-widest uppercase text-xs mb-3 block">Daily Specials</span>
                <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Fresh Deals Every Day!</h2>
                <p className="text-slate-300 text-lg max-w-lg mx-auto md:mx-0">Get up to 50% off on organic fruits and vegetables. Delivered fresh to your door.</p>
              </div>
              <div className="relative z-10 md:w-1/3 flex justify-center md:justify-end">
                <Link to="/user/fruits" className="bg-emerald-500 hover:bg-emerald-400 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-[0_8px_20px_-6px_rgba(16,185,129,0.5)] hover:shadow-[0_12px_25px_-6px_rgba(16,185,129,0.6)] transition-all duration-300 hover:-translate-y-1">Explore Deals</Link>
              </div>
            </div>
          </FadeIn>
        </section>

      </main>
      <Footer />
    </div>
  )
}
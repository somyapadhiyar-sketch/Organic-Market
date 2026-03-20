import { useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { LifeBuoy, ShieldCheck, ShoppingBag, ArrowRight, Star } from 'lucide-react'
import Footer from '../components/Footer'
import Navbar from '../components/Navbar'
import { useStore } from '../context/StoreContext'
import WaveBanner from '../components/WaveBanner'

const FadeIn = ({ children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0, scale: 1 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.6, delay, ease: "easeOut" }}
    className="w-full block"
  >
    {children}
  </motion.div>
);

export default function Home() {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const { currentUser } = useStore();

  useEffect(() => {
    if (currentUser?.role === 'admin') navigate('/admin', { replace: true });
    else if (currentUser?.role === 'delivery') navigate('/delivery', { replace: true });
  }, [currentUser, navigate]);

  const { scrollY } = useScroll({ container: containerRef });
  
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const y2 = useTransform(scrollY, [0, 500], [0, -150]);

  return (
    <div className="h-screen bg-white font-sans text-slate-900 flex overflow-hidden">
      
      <Navbar />

      {/* MAIN CONTENT AREA */}
      <main ref={containerRef} className="flex-1 relative flex flex-col overflow-y-auto custom-scrollbar pt-[130px] md:pt-[140px]">
        
        {/* HERO SECTION - Realistic E-commerce Style */}
        <section className="relative w-full bg-[#F3F5F7] overflow-hidden min-h-[600px] flex items-center py-20 md:py-0">
          
          {/* Decorative Background blob - simpler and positioned better */}
          <motion.div style={{ y: y1 }} className="absolute top-0 right-0 w-[600px] h-[600px] bg-green-200/20 rounded-full blur-3xl translate-x-1/3 -translate-y-1/4"></motion.div>
          <motion.div style={{ y: y2 }} className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-orange-100/40 rounded-full blur-3xl -translate-x-1/4 translate-y-1/4"></motion.div>

          <div className="max-w-7xl mx-auto px-6 w-full relative z-10 grid md:grid-cols-2 gap-12 items-center">
            
            {/* Hero Content */}
            <div className="space-y-8 text-center md:text-left pt-8 md:pt-0">
              <FadeIn>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-slate-100 mb-6">
                  <span className="text-green-600 font-bold text-xs uppercase tracking-wider">🌿 100% Organic & Fresh</span>
                </div>
                <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-blue-600 leading-[1.1] mb-6">
                  Grocery delivery <br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-500">in minutes.</span>
                </h1>
                <p className="text-lg md:text-xl text-slate-600 font-medium max-w-lg mx-auto md:mx-0 leading-relaxed">
                  Experience the freshest produce delivered straight from local farms to your doorstep. No chemicals, just nature.
                </p>
              </FadeIn>

              <FadeIn delay={0.2}>
                <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                  <Link to="/user/fruits" className="px-8 py-4 bg-blue-600 text-white font-bold text-lg rounded-2xl shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2 active:scale-95">
                    Start Shopping <ArrowRight size={20} />
                  </Link>
                  <Link to="/user/about" className="px-8 py-4 bg-white text-slate-700 font-bold text-lg rounded-2xl shadow-sm border border-slate-200 hover:bg-slate-50 transition-all flex items-center justify-center gap-2 active:scale-95">
                    Our Story
                  </Link>
                </div>
              </FadeIn>

              <FadeIn delay={0.4}>
                <div className="flex items-center justify-center md:justify-start gap-8 pt-4">
                  <div>
                    <p className="text-3xl font-black text-blue-600">10k+</p>
                    <p className="text-sm font-bold text-slate-500">Happy Customers</p>
                  </div>
                  <div className="w-px h-10 bg-slate-200"></div>
                  <div>
                    <p className="text-3xl font-black text-blue-600">100%</p>
                    <p className="text-sm font-bold text-slate-500">Organic Certified</p>
                  </div>
                </div>
              </FadeIn>
            </div>

            {/* Hero Image / Illustration Placeholder */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, x: 50 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative hidden md:block"
            >
               <div className="relative z-10 bg-white p-4 rounded-[2.5rem] shadow-2xl border border-slate-100 rotate-3 hover:rotate-0 transition-transform duration-500">
                  <div className="bg-slate-50 rounded-[2rem] h-[400px] flex items-center justify-center relative overflow-hidden">
                     
                     <span className="text-[12rem] drop-shadow-2xl">🥑</span>
                     
                     <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-sm p-4 rounded-2xl border border-white/50 shadow-sm flex items-center justify-between">
                        <div>
                          <p className="text-sm font-black text-blue-600">Fresh Delivery</p>
                          <p className="text-xs font-bold text-green-600">From Farm to Home</p>
                        </div>
                        <button onClick={() => navigate(currentUser ? '/user/fruits' : '/login/user')} className="w-8 h-8 bg-blue-600 rounded-full text-white flex items-center justify-center hover:bg-green-600 transition-colors">
                          <ShoppingBag size={14} />
                        </button>
                     </div>
                  </div>
               </div>
               
               {/* Floating elements */}
               <motion.div 
                 animate={{ y: [0, -10, 0] }} 
                 transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                 className="absolute -top-6 -right-6 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 z-20"
               >
                 <div className="flex items-center gap-2">
                   <div className="bg-yellow-100 p-2 rounded-full"><Star size={16} className="text-yellow-600 fill-yellow-600"/></div>
                   <div>
                     <p className="text-xs font-bold text-blue-600">4.9 Rating</p>
                     <p className="text-[10px] font-medium text-slate-500">Top Quality</p>
                   </div>
                 </div>
               </motion.div>
            </motion.div>
          </div>
        </section>

        {/* EXTRA PROMO BANNER */}
        <section className="w-full m-0 p-0 flex">
          <FadeIn>
            <WaveBanner theme="orange" title="Summer Fruit Sale!" subtitle="Juicy mangoes and citrus are here." />
          </FadeIn>
        </section>

        {/* FEATURES SECTION - Cleaner Look */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <FadeIn>
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-black text-blue-600 mb-4">Why Shop With Zesty?</h2>
                <p className="text-slate-500 max-w-2xl mx-auto text-lg">We bring the season's best produce from the farm directly to your table, ensuring maximum freshness and nutrition.</p>
              </div>
            </FadeIn>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: <ShieldCheck size={32} className="text-green-600" />, title: "Certified Organic", desc: "100% chemical-free produce grown with love and care.", color: "bg-green-50" },
                { icon: <ShoppingBag size={32} className="text-blue-600" />, title: "Superfast Delivery", desc: "Get your groceries delivered in 10 minutes or less.", color: "bg-blue-50" },
                { icon: <LifeBuoy size={32} className="text-purple-600" />, title: "Direct from Farmers", desc: "Direct from farmers means better prices for you and them.", color: "bg-purple-50" }
              ].map((feature, i) => (
                <FadeIn delay={i * 0.1} key={i}>
                  <div className="p-6 rounded-3xl border border-slate-100 bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
                    <div className={`w-16 h-16 ${feature.color} rounded-2xl flex items-center justify-center mb-6`}>
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-black text-blue-600 mb-3">{feature.title}</h3>
                    <p className="text-slate-500 font-medium leading-relaxed">{feature.desc}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* CTA BANNER */}
        <section className="w-full m-0 p-0 flex">
          <FadeIn>
            <WaveBanner theme="green" title="Fresh Deals Every Day!" subtitle="Get up to 50% off on organic fruits and vegetables." />
          </FadeIn>
        </section>

        <section className="pb-20">
           <Footer />
        </section>
      </main>
    </div>
  )
}
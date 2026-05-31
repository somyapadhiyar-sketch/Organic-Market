import { useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect, useLayoutEffect } from 'react'
import { useStore } from '../context/StoreContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { Clock, Archive, Info, CheckCircle2, ShoppingBag, ArrowLeft, Star } from 'lucide-react'
import { motion } from 'framer-motion'
const quantityOptionsKg = [
  { value: 0.25, label: '250g' }, 
  { value: 0.5, label: '500g' }, 
  { value: 1, label: '1kg' }, 
  { value: 2, label: '2kg' }, 
  { value: 5, label: '5kg' }
]
const quantityOptionsL = [
  { value: 0.25, label: '250ml' },
  { value: 0.5, label: '500ml' },
  { value: 1, label: '1L' },
  { value: 2, label: '2L' },
  { value: 5, label: '5L' }
]

export default function ProductDetails() {
  const { state } = useLocation(); 
  const navigate = useNavigate();
  const { addToCart, calculatePrice, currentUser } = useStore();
  const { pathname } = useLocation();
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    if (currentUser?.role === 'admin') navigate('/admin', { replace: true });
    else if (currentUser?.role === 'delivery') navigate('/delivery', { replace: true });
  }, [currentUser, navigate]);
  
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  
  useEffect(() => { 
    if (!state?.product) navigate('/user/home') 
  }, [state, navigate])
  
  if (!state?.product) return null;
  const { product } = state;
  const isOil = product.category === 'Oil';
  const quantityOptions = isOil ? quantityOptionsL : quantityOptionsKg;

  const displayPrice = calculatePrice ? calculatePrice(product.price, quantity) : Math.round(product.price * quantity);

  // Helper to ensure we have an array for"why you will love this"
  const features = Array.isArray(product.whyYouWillLoveThis) 
    ? product.whyYouWillLoveThis 
    : typeof product.whyYouWillLoveThis === 'string' 
      ? product.whyYouWillLoveThis.split(',') 
      : ['Fresh & Organic', 'Best Price', 'Premium Quality'];

  const isOutOfStock = product.disabled || product.stock <= 0;
  const availableQuantityOptions = quantityOptions.filter(o => o.value <= (product.stock || 0));

  useEffect(() => {
    if (quantity > product.stock && product.stock > 0) {
      setQuantity(product.stock >= 1 ? 1 : availableQuantityOptions[availableQuantityOptions.length - 1]?.value || 0);
    }
  }, [product.stock]);

  const handleAddToCart = () => {
      addToCart(product.name, product.price, quantity, product.image, product.id);
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2000);
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
      <Navbar />
      
      <main className="flex-grow max-w-7xl mx-auto px-4 md:px-8 pt-[140px] pb-16 w-full">
        
        {/* Breadcrumb / Back Navigation */}
        <motion.div 
            initial={{ opacity: 0, x: -20 }} 
            animate={{ opacity: 1, x: 0 }}
            className="mb-8"
        >
            <button onClick={() => navigate(-1)} className="group flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">
                <span className="p-2 bg-white rounded-full shadow-sm group-hover:shadow-md transition-all border border-slate-100"><ArrowLeft size={16} /></span>
                Back to Shopping
            </button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          
          {/* Left Column: Image Gallery/Hero */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="relative lg:sticky lg:top-[140px] lg:z-10"
          >
            <div className="bg-white rounded-[2.5rem] p-6 md:p-12 shadow-2xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden group">
                {/* Ambient Background Blobs */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-green-50/80 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-50/80 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2"></div>
                
                <motion.div 
                    whileHover={{ scale: 1.05, rotate: 2 }}
                    transition={{ type:"spring", stiffness: 300, damping: 20 }}
                    className="relative z-10 flex items-center justify-center min-h-[250px] md:min-h-[400px]"
                >
                    <img 
                        src={product.image} 
                        alt={product.name} 
                        className="max-h-[250px] md:max-h-[400px] w-auto object-contain drop-shadow-2xl mix-blend-multiply" 
                        onError={(e) => { e.target.src = `https://placehold.co/400x400/F8F8F8/767676?text=${product.name}` }}
                    />
                </motion.div>

                <div className="absolute top-6 left-6 z-20 flex flex-col gap-2">
                    <span className="bg-slate-900 text-white text-xs font-black px-3 py-1.5 rounded-lg shadow-lg uppercase tracking-wide">Organic</span>
                    {isOutOfStock && <span className="bg-red-500 text-white text-xs font-black px-3 py-1.5 rounded-lg shadow-lg uppercase tracking-wide">Out of Stock</span>}
                </div>
            </div>
          </motion.div>

          {/* Right Column: Product Info */}
          <div className="flex flex-col pt-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <div className="flex items-center gap-2 mb-3">
                    <span className="text-green-600 font-bold text-xs tracking-widest uppercase bg-green-100 px-2.5 py-1 rounded-md">{product.category}</span>
                    <div className="flex items-center gap-1 text-yellow-500 text-xs font-bold bg-yellow-50 px-2.5 py-1 rounded-md border border-yellow-100">
                        <Star size={12} fill="currentColor" /> 4.8 (120 reviews)
                    </div>
                </div>

                <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight leading-tight">{product.name}</h1>
                <p className="text-lg text-slate-500 font-medium leading-relaxed mb-8 max-w-lg">{product.desc || 'Freshly sourced organic product from local farms, delivered straight to your kitchen.'}</p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/50 mb-8"
            >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Price</p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-black text-slate-900">₹{displayPrice}</span>
                            <span className="text-lg font-bold text-slate-300 line-through">₹{Math.round(product.price * quantity * 1.2)}</span>
                        </div>
                        {!isOutOfStock && product.stock <= 10 && (
                            <p className="text-xs font-bold text-red-500 mt-2">Hurry! Only {product.stock}{isOil ? 'L' : 'kg'} left in stock.</p>
                        )}
                    </div>
                    <div className="text-left sm:text-right w-full sm:w-auto mt-2 sm:mt-0">
                         <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Quantity</p>
                         <div className="relative w-40 sm:w-32">
                            <select 
                                value={quantity} 
                                onChange={(e) => setQuantity(parseFloat(e.target.value))} 
                                disabled={isOutOfStock || availableQuantityOptions.length === 0}
                                className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-900 font-bold py-3 px-4 pr-8 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer text-base disabled:opacity-50"
                            >
                                {availableQuantityOptions.length > 0 ? (
                                    availableQuantityOptions.map(o => (<option key={o.value} value={o.value}>{o.label}</option>))
                                ) : (
                                    <option value={0}>N/A</option>
                                )}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                            </div>
                         </div>
                    </div>
                </div>

                <motion.button 
                    whileHover={!isOutOfStock && availableQuantityOptions.length > 0 ? { scale: 1.02 } : {}}
                    whileTap={!isOutOfStock && availableQuantityOptions.length > 0 ? { scale: 0.98 } : {}}
                    onClick={!isOutOfStock && availableQuantityOptions.length > 0 ? handleAddToCart : undefined}
                    disabled={isOutOfStock || availableQuantityOptions.length === 0}
                    className={`w-full py-4 font-black flex items-center justify-center gap-3 
                        ${(isOutOfStock || availableQuantityOptions.length === 0) 
                            ? 'btn-3d btn-lime opacity-50 cursor-not-allowed' 
                            : isAdded 
                                ? 'btn-3d btn-emerald opacity-90' 
                                : 'btn-3d btn-emerald'
                        }`}
                >
                    {(isOutOfStock || availableQuantityOptions.length === 0) ?"Out of Stock" : isAdded ? (
                        <>
                            <CheckCircle2 size={24} /> Added to Cart
                        </>
                    ) : (
                        <>
                            <ShoppingBag size={24} /> Add to Cart
                        </>
                    )}
                </motion.button>
            </motion.div>

            {/* NEW: Product Information Section */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8"
            >
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Clock size={24} /></div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Shelf Life</p>
                        <p className="font-bold text-slate-800 text-sm">{product.shelfLife || '3-4 Days'}</p>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-purple-50 text-purple-600 rounded-xl"><Archive size={24} /></div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Storage</p>
                        <p className="font-bold text-slate-800 text-sm">{product.storage || 'Keep Cool'}</p>
                    </div>
                </div>
            </motion.div>

            {/* Details & Features */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="space-y-6"
            >
                <div>
                    <h3 className="font-bold text-slate-900 text-lg mb-4 flex items-center gap-2">
                        Why you'll love this
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {features.map((item, idx) => (
                            <motion.div 
                                key={idx}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 + (idx * 0.1) }}
                                className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 shadow-sm"
                            >
                                <CheckCircle2 size={18} className="text-green-500 flex-shrink-0" />
                                <span className="text-sm font-bold text-slate-700">{item.trim()}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
              
                <div className="pt-5 border-t border-slate-200/60">
                    <h3 className="font-bold text-slate-900 text-lg mb-3 flex items-center gap-2">
                        <Info size={20} className="text-blue-600" /> About the Product
                    </h3>
                    <p className="text-slate-600 leading-relaxed font-medium text-base">
                        {product.about || product.desc ||"Our products are sourced directly from certified organic farms to ensure the highest quality and freshness. We believe in sustainable farming practices that are good for you and the planet."}
                    </p>
                </div>
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
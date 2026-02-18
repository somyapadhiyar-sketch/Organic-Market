import { useLocation, useNavigate, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useCart } from '../context/CartContext'

export default function ProductDetails() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [isLiked, setIsLiked] = useState(false)

  // Redirect if no product found
  useEffect(() => {
    if (!state?.product) navigate('/')
  }, [state, navigate])

  if (!state?.product) return null

  const { product } = state

  // --- SMART DETAILS ENGINE (Generates Data) ---
  const getSmartDetails = (name) => {
    const today = new Date()
    const expiryDate = new Date()
    
    let category = "Fresh Produce"
    let shelfLife = "3-4 Days"
    let typeColor = "bg-green-100 text-green-700" // Default Color Badge
    let description = `Fresh, farm-picked ${name}. Sourced directly from certified organic farms.`
    let benefits = ["100% Organic", "Farm Fresh", "No Pesticides"]
    let storage = "Store in a cool, dry place."

    // 1. Fruit Logic
    if (["Apple", "Banana", "Mango", "Orange", "Grapes", "Pineapple", "Strawberry", "Kiwi", "Papaya", "Guava", "Pomegranate", "Watermelon"].some(f => name.includes(f))) {
      category = "Premium Fruit"
      typeColor = "bg-orange-100 text-orange-700"
      shelfLife = "5-7 Days"
      expiryDate.setDate(today.getDate() + 7)
      description = `Sweet and juicy ${name}, rich in natural vitamins. Perfect for a healthy snack or fresh juice.`
      benefits = ["Immunity Booster", "Rich in Antioxidants", "Naturally Sweet"]
      storage = "Refrigerate for freshness."
    } 
    // 2. Pulse Logic
    else if (["Dal", "Rice", "Beans", "Rajma", "Lentils"].some(p => name.includes(p))) {
      category = "Organic Staple"
      typeColor = "bg-yellow-100 text-yellow-700"
      shelfLife = "6 Months"
      expiryDate.setDate(today.getDate() + 180)
      description = `High-protein ${name}, unpolished and full of nutrition. A perfect staple for your daily diet.`
      benefits = ["High Protein", "Cholesterol Free", "Easy Digest"]
      storage = "Keep in an airtight container."
    }
    // 3. Vegetable Logic
    else {
      category = "Fresh Vegetable"
      typeColor = "bg-green-100 text-green-700"
      expiryDate.setDate(today.getDate() + 4)
      storage = "Keep in vegetable crisper."
    }

    return { category, typeColor, shelfLife, description, benefits, storage, expiry: expiryDate.toDateString(), fssai: "Lic. No. 10015021001000" }
  }

  const details = getSmartDetails(product.name)

  // Button Style (Matching other pages)
  const navBtnStyle = "px-5 py-2 bg-slate-800 text-white font-bold rounded-full shadow-md hover:bg-slate-700 hover:scale-105 transition-all text-sm animate-rope-drop border border-slate-600"

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50 font-sans text-slate-800">
      
      {/* 1. HEADER (Transparent & Animated) */}
      <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-md border-b border-slate-200 px-6 py-4 animate-slide-down">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
             <button onClick={() => navigate(-1)} className="p-2 bg-white rounded-full shadow-sm hover:scale-110 transition">
               ⬅️
             </button>
             <h1 className="text-xl font-black text-slate-900 tracking-tight">Product Details</h1>
          </div>
          <div className="flex gap-3">
             <Link to="/" className={navBtnStyle} style={{animationDelay: '0.1s'}}>Home</Link>
             <Link to="/cart" className={navBtnStyle} style={{animationDelay: '0.2s'}}>🛒 Cart</Link>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-10">
        
        {/* 2. MAIN CARD (Glassmorphism & Fade In) */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[3rem] shadow-2xl border border-white/60 overflow-hidden flex flex-col md:flex-row animate-fade-in-up">
          
          {/* IMAGE SECTION (Zoom In Animation) */}
          <div className="w-full md:w-1/2 p-12 bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center relative group">
            <div className="absolute top-6 left-6 z-10">
               <span className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${details.typeColor} shadow-sm`}>
                 {details.category}
               </span>
            </div>
            <button 
              onClick={() => setIsLiked(!isLiked)} 
              className="absolute top-6 right-6 p-3 bg-white rounded-full shadow-lg hover:scale-110 transition-transform z-10"
            >
              {isLiked ? '❤️' : '🤍'}
            </button>
            
            {/* Image zooms and rotates slightly on hover */}
            <img 
              src={product.image} 
              alt={product.name} 
              className="max-h-80 w-auto object-contain drop-shadow-2xl transform transition-transform duration-700 ease-out group-hover:scale-110 group-hover:rotate-3 animate-zoom-in" 
            />
          </div>

          {/* INFO SECTION (Slide Up Animation) */}
          <div className="w-full md:w-1/2 p-10 flex flex-col justify-center">
             
             {/* Title & Price */}
             <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
               <h1 className="text-5xl font-black text-slate-900 mb-2">{product.name}</h1>
               <div className="flex items-center gap-4 mb-6">
                 <span className="text-4xl font-bold text-green-600">₹{product.price}</span>
                 <span className="text-xl text-slate-400 line-through">₹{Number(product.price) + 20}</span>
                 <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-lg animate-pulse">
                   SAVE ₹20
                 </span>
               </div>
             </div>

             {/* Quantity Selector */}
             <div className="mb-8 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                <p className="text-xs font-bold text-slate-400 uppercase mb-3">Choose Quantity</p>
                <div className="flex gap-3 flex-wrap">
                  {[0.5, 1, 2, 5].map(q => (
                    <button
                      key={q}
                      onClick={() => setQuantity(q)}
                      className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all transform hover:scale-105 ${
                        quantity === q 
                        ? 'bg-slate-900 text-white shadow-lg shadow-slate-500/50' 
                        : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-400'
                      }`}
                    >
                      {q} kg
                    </button>
                  ))}
                </div>
             </div>

             {/* Add To Cart Button (Rope Animation) */}
             <div className="animate-rope-drop" style={{ animationDelay: '0.5s' }}>
               <button 
                 onClick={() => { addToCart(product.name, product.price, quantity); alert('Added to Cart!'); }}
                 className="w-full py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-xl rounded-2xl shadow-xl hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-95 transition-all flex justify-between px-8 items-center"
               >
                 <span>ADD TO CART</span>
                 <span className="bg-white/20 px-3 py-1 rounded-lg text-base">₹{(product.price * quantity).toFixed(0)}</span>
               </button>
             </div>

             {/* Trust Badges */}
             <div className="mt-8 flex gap-6 opacity-80 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
                <div className="flex items-center gap-2">
                  <span className="text-xl">🚚</span>
                  <span className="text-xs font-bold">12 Min Delivery</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">✅</span>
                  <span className="text-xs font-bold">100% Organic</span>
                </div>
             </div>
          </div>
        </div>

        {/* 3. DETAILS GRID (Blinkit Style Info) */}
        <div className="grid md:grid-cols-2 gap-6 mt-8 animate-fade-in-up" style={{ animationDelay: '0.7s' }}>
          
          {/* Highlights */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Why you'll love this</h3>
            <ul className="space-y-3">
              {details.benefits.map((b, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-600 font-medium">
                  <span className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs">✓</span>
                  {b}
                </li>
              ))}
            </ul>
          </div>

          {/* Specs */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Product Details</h3>
            <div className="space-y-3 text-sm">
               <div className="flex justify-between border-b border-slate-50 pb-2">
                 <span className="text-slate-400">Shelf Life</span>
                 <span className="font-bold text-slate-700">{details.shelfLife}</span>
               </div>
               <div className="flex justify-between border-b border-slate-50 pb-2">
                 <span className="text-slate-400">Storage</span>
                 <span className="font-bold text-slate-700">{details.storage}</span>
               </div>
               <div className="flex justify-between">
                 <span className="text-slate-400">Expiry (Approx)</span>
                 <span className="font-bold text-red-500">{details.expiry}</span>
               </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  )
}
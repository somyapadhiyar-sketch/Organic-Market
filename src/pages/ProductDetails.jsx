import { useLocation, useNavigate, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useCart } from '../context/CartContext'

export default function ProductDetails() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [isLiked, setIsLiked] = useState(false)

  // Redirect if accessed directly without clicking a product
  useEffect(() => {
    if (!state?.product) navigate('/')
  }, [state, navigate])

  if (!state?.product) return null

  const { product } = state

  // --- SMART DETAILS ENGINE ---
  // This function generates data based on the product name automatically
  const getSmartDetails = (name) => {
    const today = new Date()
    const expiryDate = new Date()
    
    let category = "Vegetable"
    let shelfLife = "3-4 Days"
    let description = `Fresh, farm-picked ${name} containing natural nutrients. Sourced directly from certified organic farms to ensure the highest quality.`
    let benefits = ["100% Organic", "Farm Fresh", "No Pesticides"]
    let storage = "Store in a cool, dry place."

    // 1. Check if it's a Fruit
    if (["Apple", "Banana", "Mango", "Orange", "Grapes", "Pineapple", "Strawberry", "Kiwi", "Papaya", "Guava", "Pomegranate", "Watermelon", "Cherry", "Peach"].some(f => name.includes(f))) {
      category = "Fruit"
      shelfLife = "5-7 Days"
      expiryDate.setDate(today.getDate() + 7) // Expire in 7 days
      description = `Premium quality ${name} known for its natural sweetness and rich vitamin content. Perfect for a healthy snack, fruit salads, or smoothies.`
      benefits = ["Rich in Vitamins", "Natural Antioxidants", "Boosts Immunity"]
      storage = "Refrigerate for longer freshness."
    } 
    // 2. Check if it's a Pulse/Dal
    else if (["Dal", "Rice", "Beans", "Rajma", "Gram", "Lentils", "Pea"].some(p => name.includes(p))) {
      category = "Staple"
      shelfLife = "6 Months"
      expiryDate.setDate(today.getDate() + 180) // Expire in 6 months
      description = `High-protein organic ${name}. Unpolished and completely free from artificial polish or chemicals to ensure you get the purest taste and nutrition.`
      benefits = ["High Protein", "Cholesterol Free", "Easy to Digest"]
      storage = "Keep in an airtight container."
    } 
    // 3. Default to Vegetable
    else {
      category = "Vegetable"
      shelfLife = "3-4 Days"
      expiryDate.setDate(today.getDate() + 4) // Expire in 4 days
      storage = "Store in the vegetable crisper of your fridge."
    }

    return {
      category,
      shelfLife,
      description,
      benefits,
      storage,
      expiry: expiryDate.toDateString(), // Formats date nicely (e.g., "Mon Feb 23 2026")
      origin: "Gujarat, India",
      fssai: "Lic. No. 10015021001000"
    }
  }

  const details = getSmartDetails(product.name)

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      
      {/* 1. Header */}
      <nav className="sticky top-0 z-50 bg-white shadow-sm border-b border-slate-100 px-4 py-3">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
             <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full transition">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
               </svg>
             </button>
             <h1 className="text-lg font-bold text-slate-800">Product Details</h1>
          </div>
          <Link to="/cart" className="flex items-center gap-2 text-sm font-bold text-green-700 bg-green-50 px-4 py-2 rounded-lg hover:bg-green-100 transition">
             🛒 View Cart
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto p-4 md:p-8">
        
        {/* 2. Main Product Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden mb-8 animate-fade-in-up">
          <div className="flex flex-col md:flex-row">
            
            {/* Image Section */}
            <div className="w-full md:w-1/2 p-10 bg-gradient-to-b from-white to-slate-50 flex items-center justify-center relative">
               <button 
                 onClick={() => setIsLiked(!isLiked)} 
                 className="absolute top-4 right-4 p-3 bg-white rounded-full shadow-md hover:scale-110 transition z-10"
               >
                 {isLiked ? '❤️' : '🤍'}
               </button>
               <img 
                 src={product.image} 
                 alt={product.name} 
                 className="w-full max-h-64 object-contain drop-shadow-xl transform transition duration-700 hover:scale-110"
               />
            </div>

            {/* Info Section */}
            <div className="w-full md:w-1/2 p-8 flex flex-col justify-between">
               <div>
                 <div className="flex items-center gap-2 mb-2">
                   <span className="text-xs font-bold text-slate-400 uppercase tracking-wider border border-slate-200 px-2 py-0.5 rounded">{details.category}</span>
                   <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">⏱️ 12 MINS</span>
                 </div>
                 
                 <h1 className="text-4xl font-black text-slate-900 mb-2">{product.name}</h1>
                 
                 <div className="flex items-end gap-2 mb-6">
                    <span className="text-3xl font-bold text-slate-900">₹{product.price}</span>
                    <span className="text-lg text-slate-400 line-through">₹{Number(product.price) + (product.price * 0.2)}</span>
                    <span className="text-xs font-bold text-green-600 mb-2 bg-green-100 px-2 py-1 rounded-full">20% OFF</span>
                 </div>

                 {/* Quantity Selector */}
                 <div className="mb-8">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-3">Select Quantity</label>
                    <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                      {[0.5, 1, 2, 5].map(q => (
                        <button
                          key={q}
                          onClick={() => setQuantity(q)}
                          className={`px-5 py-3 rounded-xl border text-sm font-bold whitespace-nowrap transition-all ${
                            quantity === q 
                            ? 'border-green-600 bg-green-50 text-green-700 ring-2 ring-green-100' 
                            : 'border-slate-200 text-slate-600 hover:border-green-400'
                          }`}
                        >
                          {q} kg
                        </button>
                      ))}
                    </div>
                 </div>
               </div>

               <button 
                 onClick={() => { addToCart(product.name, product.price, quantity); alert(`${quantity}kg ${product.name} Added!`); }}
                 className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg shadow-green-200 active:scale-95 transition-all flex justify-center items-center gap-2"
               >
                 <span>ADD TO CART</span>
                 <span className="bg-green-700 px-2 py-0.5 rounded text-xs">₹{(product.price * quantity).toFixed(0)}</span>
               </button>
            </div>
          </div>
        </div>

        {/* 3. Blinkit-Style Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
          
          {/* Product Highlights */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Why shop this?</h2>
            <ul className="space-y-4">
              {details.benefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-3 text-slate-600 text-sm">
                  <span className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs">✓</span>
                  {benefit}
                </li>
              ))}
            </ul>
          </div>

          {/* Important Details */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Product Details</h2>
            <div className="space-y-4 text-sm">
               <div className="flex justify-between border-b border-slate-50 pb-2">
                 <span className="text-slate-400">Shelf Life</span>
                 <span className="font-medium text-slate-800">{details.shelfLife}</span>
               </div>
               <div className="flex justify-between border-b border-slate-50 pb-2">
                 <span className="text-slate-400">Storage</span>
                 <span className="font-medium text-slate-800">{details.storage}</span>
               </div>
               <div className="flex justify-between border-b border-slate-50 pb-2">
                 <span className="text-slate-400">Expiry Date</span>
                 <span className="font-bold text-red-500">{details.expiry}</span>
               </div>
               <div className="flex justify-between">
                 <span className="text-slate-400">FSSAI License</span>
                 <span className="font-medium text-slate-800">{details.fssai}</span>
               </div>
            </div>
          </div>
        </div>

        {/* 4. Description */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm mb-8 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
           <h3 className="font-bold text-slate-900 mb-2">Description</h3>
           <p className="text-slate-600 text-sm leading-relaxed mb-6">{details.description}</p>
           
           <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-xl flex gap-3">
             <span className="text-2xl">🛡️</span>
             <div>
               <h4 className="font-bold text-slate-800 text-sm">Genuine Product</h4>
               <p className="text-xs text-slate-500 mt-1">Sourced directly from certified brands and farms.</p>
             </div>
           </div>
        </div>

      </main>
    </div>
  )
}
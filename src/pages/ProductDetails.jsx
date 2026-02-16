import { useLocation, useNavigate, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useCart } from '../context/CartContext'

const quantityOptions = [
  { value: 0.25, label: '250g' },
  { value: 0.5, label: '500g' },
  { value: 1, label: '1kg' },
  { value: 2, label: '2kg' },
  { value: 5, label: '5kg' },
]

export default function ProductDetails() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState('description')

  useEffect(() => {
    if (!state?.product) navigate('/')
  }, [state, navigate])

  if (!state?.product) return null

  const { product } = state
  const totalPrice = (product.price * quantity).toFixed(0)

  const handleAddToCart = () => {
    addToCart(product.name, product.price, quantity)
    alert(`Added ${quantity}kg of ${product.name} to cart!`)
  }

  return (
    // COLORFUL GRADIENT BACKGROUND
    <div className="min-h-screen bg-gradient-to-br from-emerald-600 to-teal-800 font-sans text-white">
      
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/10 backdrop-blur-md border-b border-white/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold tracking-tight hover:opacity-80 transition drop-shadow-md">
            🌿 Organic Market
          </Link>
          <button 
            onClick={() => navigate(-1)} 
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-full font-bold transition-all text-sm backdrop-blur-sm border border-white/20"
          >
            ← Back
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12 lg:py-20 animate-fade-in-up">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-center lg:items-start">
          
          {/* Image Section - Glass Container */}
          <div className="w-full lg:w-1/2">
            <div className="relative group bg-white/20 backdrop-blur-md rounded-[2.5rem] shadow-2xl border border-white/30 p-12 flex items-center justify-center">
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full max-h-[400px] object-contain drop-shadow-2xl transform transition-transform duration-700 group-hover:scale-110"
              />
            </div>
          </div>

          {/* Details Section */}
          <div className="w-full lg:w-1/2 flex flex-col gap-6">
            <div>
              <span className="inline-block px-3 py-1 bg-yellow-400 text-yellow-900 text-xs font-bold uppercase tracking-widest rounded-full mb-3 shadow-lg">
                Premium Organic
              </span>
              <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-2 drop-shadow-lg">
                {product.name}
              </h1>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-green-300">₹{product.price}</span>
                <span className="text-xl opacity-80">/ kg</span>
              </div>
            </div>

            {/* Quantity Card - White Background for readability */}
            <div className="bg-white text-slate-900 p-8 rounded-3xl shadow-2xl animate-zoom-in">
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
                <div className="w-full sm:w-auto">
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Select Weight</label>
                  <select 
                    value={quantity}
                    onChange={(e) => setQuantity(parseFloat(e.target.value))}
                    className="w-full bg-slate-100 border-none text-slate-900 text-lg rounded-xl focus:ring-2 focus:ring-green-500 block p-3 font-bold cursor-pointer"
                  >
                    {quantityOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400 font-bold uppercase">Total</p>
                  <p className="text-4xl font-black text-slate-900">₹{totalPrice}</p>
                </div>
              </div>

              <button 
                onClick={handleAddToCart}
                className="w-full py-4 bg-slate-900 text-white font-bold text-lg rounded-xl hover:bg-green-600 hover:shadow-xl hover:shadow-green-500/30 transition-all duration-300 active:scale-95"
              >
                Add to Cart
              </button>
            </div> 
          </div>
        </div>
      </main>
    </div>
  )
}
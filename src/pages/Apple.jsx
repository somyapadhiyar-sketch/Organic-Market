import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useCart } from '../context/CartContext'

const quantityOptions = [
  { value: 0.1, label: '100g' },
  { value: 0.5, label: '500g' },
  { value: 1, label: '1kg' },
  { value: 5, label: '5kg' },
  { value: 10, label: '10kg' },
  { value: 20, label: '20kg' },
]

export default function Apple() {
  const { addToCart } = useCart()
  const [quantity, setQuantity] = useState(1)

  const handleAddToCart = () => {
    const pricePerKg = 160
    const total = pricePerKg * quantity
    addToCart('Apple', pricePerKg, quantity)
    alert(`Apple (${quantity}kg) added to cart! Total: ₹${total}`)
  }

  return (
    /* New Professional Background: Soft Slate Mesh */
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-green-100">
      
      {/* Header: Sticky Glassmorphism Effect */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/70 border-b border-slate-200 py-4 transition-all">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">🍎 Apple Details</h1>
          <nav className="flex gap-6">
            {['Home', 'Vegetables', 'Pulses', 'Fruits', 'Cart'].map((item) => (
              <Link 
                key={item}
                to={item === 'Home' ? '/' : `/${item.toLowerCase()}`} 
                className="text-sm font-medium text-slate-600 hover:text-green-600 transition-colors duration-200"
              >
                {item}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Main Product Card */}
        <section className="flex flex-col lg:flex-row gap-12 items-start">
          
          {/* Product Image: Professional Reveal Animation */}
          <div className="flex-1 w-full animate-in fade-in zoom-in duration-700">
            <div className="relative group overflow-hidden rounded-3xl bg-white shadow-2xl shadow-slate-200/50">
              <img 
                src="/fruits/apple.png" 
                alt="Apple" 
                className="w-full aspect-square object-contain p-8 transform transition-transform duration-700 group-hover:scale-110"
              />
            </div>
          </div>

          {/* Product Info: Staggered Content Animation */}
          <div className="flex-1 space-y-8 animate-in fade-in slide-in-from-right-8 duration-700 delay-200">
            <div>
              <span className="text-green-600 font-semibold tracking-widest uppercase text-xs">Premium Organic</span>
              <h2 className="text-5xl font-extrabold text-slate-900 mt-2 mb-4">Fresh Fuji Apple</h2>
              <p className="text-3xl font-light text-slate-700">₹160 <span className="text-lg text-slate-400">/ per kg</span></p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <select 
                id="apple-quantity"
                value={quantity}
                onChange={(e) => setQuantity(parseFloat(e.target.value))}
                className="px-6 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-green-500 outline-none appearance-none cursor-pointer shadow-sm hover:border-slate-300 transition-all"
              >
                {quantityOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              <button 
                onClick={handleAddToCart}
                className="flex-grow px-8 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-green-600 transform transition-all active:scale-95 shadow-lg shadow-slate-200"
              >
                Add to Cart
              </button>
            </div>

            <hr className="border-slate-100" />

            {/* Information Grid: Using "Reveal on Scroll" vibes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <InfoSection title="About" delay="delay-300">
                <p className="text-slate-500 leading-relaxed text-sm">
                  Sourced from high-altitude orchards in Himachal, these apples are hand-picked for their crunch and natural sugar content.
                </p>
              </InfoSection>

              <InfoSection title="Nutrition" delay="delay-400">
                <div className="text-sm text-slate-500 space-y-1">
                  <div className="flex justify-between"><span>Fiber</span> <span className="font-bold">2.4g</span></div>
                  <div className="flex justify-between"><span>Vitamin C</span> <span className="font-bold">4.6mg</span></div>
                  <div className="flex justify-between"><span>Calories</span> <span className="font-bold">52kcal</span></div>
                </div>
              </InfoSection>

              <InfoSection title="Shelf Life" delay="delay-500">
                <p className="text-slate-500 text-sm">5-7 days at room temp. Up to 6 weeks in refrigeration.</p>
              </InfoSection>

              <InfoSection title="Origin" delay="delay-600">
                <p className="text-slate-500 text-sm">Proudly Grown in India 🇮🇳</p>
              </InfoSection>
            </div>
          </div>
        </section>
      </main>

      {/* Modern Minimal Footer */}
      <footer className="mt-20 border-t border-slate-200 bg-white py-12">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-slate-400 text-sm">Questions? Reach out at <span className="text-slate-900 font-medium">somyapadhiyar@gmail.com</span></p>
        </div>
      </footer>
    </div>
  )
}

// Helper Component for Cleanliness
function InfoSection({ title, children, delay }) {
  return (
    <div className={`animate-in fade-in slide-in-from-bottom-4 duration-700 ${delay}`}>
      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">{title}</h3>
      {children}
    </div>
  )
}
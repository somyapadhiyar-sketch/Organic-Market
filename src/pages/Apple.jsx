import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useStore } from '../context/StoreContext'
import { ShoppingBag, User } from 'lucide-react'

const quantityOptions = [
  { value: 0.1, label: '100g' },
  { value: 0.5, label: '500g' },
  { value: 1, label: '1kg' },
  { value: 5, label: '5kg' },
  { value: 10, label: '10kg' },
  { value: 20, label: '20kg' },
]

export default function Apple() {
  const { addToCart, showToast, currentUser, cart, logout } = useStore()
  const [quantity, setQuantity] = useState(1)
  const navigate = useNavigate()
  const handleLogout = () => { logout(); navigate('/login'); };

  const handleAddToCart = () => {
    const pricePerKg = 160
    const total = pricePerKg * quantity
    addToCart('Apple', pricePerKg, quantity, '/fruits/apple.png', 'f1')
    showToast(`Apple (${quantity}kg) added to cart! Total: ₹${total}`)
  }

  return (

    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-green-100">

      <header className="hidden md:flex fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200 px-8 py-4 justify-between items-center shadow-sm">
        <div className="flex items-center gap-12">
          <Link to="/user/home" className="flex items-center gap-2 group">
            <span className="text-3xl">🌿</span>
            <h1 className="text-3xl font-black text-slate-900 italic tracking-tighter group-hover:text-violet-700 transition-colors">Zesty</h1>
          </Link>
          <nav className="flex gap-6">
            {['Fruits', 'Vegetables', 'Pulses'].map(item => (
              <Link key={item} to={`/user/${item.toLowerCase()}`} className="font-bold text-slate-500 hover:text-violet-700 transition-colors text-sm uppercase tracking-wide">{item}</Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-6">
          <Link to="/user/cart" className="relative p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ShoppingBag size={24} className="text-slate-700" />
            {cart.length > 0 && <span className="absolute top-0 right-0 w-5 h-5 bg-violet-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">{cart.length}</span>}
          </Link>
          <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
            <div className="w-10 h-10 bg-violet-100 text-violet-600 rounded-full flex items-center justify-center font-bold text-lg border-2 border-white shadow-sm">
              {currentUser?.name?.charAt(0) || <User size={20} />}
            </div>
            <div className="text-right hidden lg:block">
              <p className="text-sm font-black text-slate-900 leading-none">{currentUser?.name || 'Guest'}</p>
              <button onClick={handleLogout} className="text-xs font-bold text-red-500 hover:text-red-600">Logout</button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12 pt-32">

        <section className="flex flex-col lg:flex-row gap-12 items-start">
          
          <div className="flex-1 w-full animate-in fade-in zoom-in duration-700">
            <div className="relative group overflow-hidden rounded-3xl bg-white shadow-2xl shadow-slate-200/50">
              <img 
                src="/fruits/apple.png" 
                alt="Apple" 
                className="w-full aspect-square object-contain p-8 transform transition-transform duration-700 group-hover:scale-110"
              />
            </div>
          </div>

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

      <footer className="mt-20 border-t border-slate-200 bg-white py-12">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-slate-400 text-sm">Questions? Reach out at <span className="text-slate-900 font-medium">somyapadhiyar@gmail.com</span></p>
        </div>
      </footer>
    </div>
  )
}

function InfoSection({ title, children, delay }) {
  return (
    <div className={`animate-in fade-in slide-in-from-bottom-4 duration-700 ${delay}`}>
      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">{title}</h3>
      {children}
    </div>
  )
}
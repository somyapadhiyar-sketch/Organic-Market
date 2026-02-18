import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'

const vegetablesData = [
  { id: 1, name: 'Tomato', price: 40, image: '/vegetable/tomato.png' },
  { id: 2, name: 'Potato', price: 30, image: '/vegetable/potato.png' },
  { id: 3, name: 'Onion', price: 25, image: '/vegetable/onion.png' },
  { id: 4, name: 'Carrot', price: 50, image: '/vegetable/carrot.png' },
  { id: 5, name: 'Cabbage', price: 35, image: '/vegetable/Cabbage.png' },
  { id: 6, name: 'Brinjal', price: 45, image: '/vegetable/Brinjal.png' },
  { id: 7, name: 'Capsicum', price: 80, image: '/vegetable/Capsicum.png' },
  { id: 8, name: 'Cauliflower', price: 55, image: '/vegetable/Cauliflower.png' },
  { id: 9, name: 'Broccoli', price: 120, image: '/vegetable/Broccoli.png' },
  { id: 10, name: 'Coriander Leaves', price: 20, image: '/vegetable/coriander leaves.png' },
  { id: 11, name: 'Lettuce', price: 60, image: '/vegetable/Lettuce.png' },
  { id: 12, name: 'Cucumber', price: 28, image: '/vegetable/Cucumber.png' },
  { id: 13, name: 'Rootbit', price: 22, image: '/vegetable/rootbit.png' },
  { id: 14, name: 'Ladifingur', price: 70, image: '/vegetable/ladifingur.png' },
]

export default function Vegetables() {
  const { addToCart } = useCart()
  
  // HEAVY SHADOW BUTTON STYLE
  // The custom shadow-[...] class creates that deep, floating "3D" look
  const navBtnStyle = "px-6 py-2 bg-slate-900 text-white font-bold rounded-full shadow-[0px_10px_25px_rgba(0,0,0,0.5)] hover:scale-110 transition-all text-sm animate-rope-drop border border-slate-700"

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-200 via-emerald-100 to-teal-200 font-sans text-slate-800">
      
      {/* Header: Transparent Glass + Slide Down Animation */}
      <header className="bg-white/40 backdrop-blur-md border-b border-white/30 sticky top-0 z-50 animate-slide-down">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight drop-shadow-sm">🥦 Fresh Vegetables</h1>
          <nav className="flex flex-wrap justify-center gap-3">
             <Link to="/" className={navBtnStyle} style={{animationDelay: '0.1s'}}>Home</Link>
             <Link to="/fruits" className={navBtnStyle} style={{animationDelay: '0.2s'}}>Fruits</Link>
             <Link to="/pulses" className={navBtnStyle} style={{animationDelay: '0.3s'}}>Pulses</Link>
             <Link to="/cart" className={navBtnStyle} style={{animationDelay: '0.4s'}}>🛒 Cart</Link>
          </nav>
        </div>
      </header>

      {/* Main Grid: Fade In Up Animation */}
      <section className="max-w-7xl mx-auto px-6 py-12 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {vegetablesData.map((veg, index) => (
            <div key={veg.id} className="group bg-white/80 backdrop-blur-sm rounded-3xl p-5 shadow-sm border border-white/50 hover:bg-white hover:shadow-2xl hover:border-green-300 transition-all duration-300 hover:-translate-y-2">
              
              {/* Product Image */}
              <Link to={`/product/${veg.name}`} state={{ product: veg }} className="block relative overflow-hidden rounded-2xl bg-green-50 mb-4 h-48 flex items-center justify-center">
                <img src={veg.image} alt={veg.name} className="h-32 object-contain drop-shadow-md transform transition-transform duration-500 group-hover:scale-110" />
              </Link>
              
              {/* Info & Button */}
              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">{veg.name}</h3>
                <div className="flex justify-between items-end mb-4">
                  <p className="text-slate-500 text-sm">1 kg</p>
                  <p className="text-slate-900 font-bold text-xl">₹{veg.price}</p>
                </div>
                
                {/* Heavy Shadow 'Add' Button */}
                <button 
                  onClick={() => { addToCart(veg.name, veg.price, 1); alert('Added!'); }} 
                  className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl shadow-[0px_10px_20px_rgba(0,0,0,0.4)] hover:shadow-[0px_15px_35px_rgba(0,0,0,0.5)] hover:bg-green-600 transition-all active:scale-95"
                >
                  ADD TO CART
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
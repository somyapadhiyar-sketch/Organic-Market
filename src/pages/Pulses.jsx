import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'

const pulsesData = [
  { id: 1, name: 'Toor Dal', price: 140, image: '/pulses/Toor Dal.png' },
  { id: 2, name: 'Chana Dal', price: 120, image: '/pulses/Chana Dal.png' },
  { id: 3, name: 'Urad Dal', price: 130, image: '/pulses/Urad Dal.png' },
  { id: 4, name: 'Moong Dal', price: 110, image: '/pulses/Moong Dal.png' },
  { id: 5, name: 'Masoor Dal', price: 100, image: '/pulses/Masoor Dal.png' },
  { id: 6, name: 'Rajma', price: 160, image: '/pulses/Rajma.png' },
  { id: 7, name: 'Kidney Beans', price: 150, image: '/pulses/Kidney Beans.png' },
  { id: 8, name: 'Black Gram', price: 125, image: '/pulses/Black Gram.png' },
  { id: 9, name: 'Green Gram', price: 115, image: '/pulses/Green Gram.png' },
  { id: 10, name: 'Horse Gram', price: 90, image: '/pulses/Horse Gram.png' },
  { id: 11, name: 'Moth Beans', price: 95, image: '/pulses/Moth Beans.png' },
  { id: 12, name: 'Cowpea', price: 105, image: '/pulses/Cowpea.png' },
  { id: 13, name: 'Chickpea', price: 135, image: '/pulses/Chickpea.png' },
  { id: 14, name: 'Lentils', price: 145, image: '/pulses/Lentils.png' },
]

export default function Pulses() {
  const { addToCart } = useCart()
  
  // HEAVY SHADOW BUTTON STYLE
  const navBtnStyle = "px-6 py-2 bg-slate-900 text-white font-bold rounded-full shadow-[0px_10px_25px_rgba(0,0,0,0.5)] hover:scale-110 transition-all text-sm animate-rope-drop border border-slate-700"

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 via-amber-100 to-yellow-100 font-sans text-slate-800">
      
      {/* Header: Transparent Glass + Slide Down Animation */}
      <header className="bg-white/40 backdrop-blur-md border-b border-white/30 sticky top-0 z-50 animate-slide-down">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight drop-shadow-sm">🌾 Organic Pulses</h1>
          <nav className="flex flex-wrap justify-center gap-3">
             <Link to="/" className={navBtnStyle} style={{animationDelay: '0.1s'}}>Home</Link>
             <Link to="/fruits" className={navBtnStyle} style={{animationDelay: '0.2s'}}>Fruits</Link>
             <Link to="/vegetables" className={navBtnStyle} style={{animationDelay: '0.3s'}}>Vegetables</Link>
             <Link to="/cart" className={navBtnStyle} style={{animationDelay: '0.4s'}}>🛒 Cart</Link>
          </nav>
        </div>
      </header>

      {/* Main Grid: Fade In Up Animation */}
      <section className="max-w-7xl mx-auto px-6 py-12 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {pulsesData.map((pulse, index) => (
            <div key={pulse.id} className="group bg-white/80 backdrop-blur-sm rounded-3xl p-5 shadow-sm border border-white/50 hover:bg-white hover:shadow-2xl hover:border-orange-300 transition-all duration-300 hover:-translate-y-2">
              
              {/* Product Image */}
              <Link to={`/product/${pulse.name}`} state={{ product: pulse }} className="block relative overflow-hidden rounded-2xl bg-orange-50 mb-4 h-48 flex items-center justify-center">
                <img src={pulse.image} alt={pulse.name} className="h-32 object-contain drop-shadow-md transform transition-transform duration-500 group-hover:scale-110" />
              </Link>
              
              {/* Info & Button */}
              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">{pulse.name}</h3>
                <div className="flex justify-between items-end mb-4">
                  <p className="text-slate-500 text-sm">1 kg</p>
                  <p className="text-slate-900 font-bold text-xl">₹{pulse.price}</p>
                </div>
                
                {/* Heavy Shadow 'Add' Button */}
                <button 
                  onClick={() => { addToCart(pulse.name, pulse.price, 1); alert('Added!'); }} 
                  className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl shadow-[0px_10px_20px_rgba(0,0,0,0.4)] hover:shadow-[0px_15px_35px_rgba(0,0,0,0.5)] hover:bg-orange-600 transition-all active:scale-95"
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
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 via-orange-600 to-red-700 font-sans text-white">
      
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md shadow-lg border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-3xl font-bold drop-shadow-md">🌾 Organic Pulses</h1>
          
          <nav className="flex flex-wrap justify-center items-center gap-3">
             {[
               {name: 'Home', path: '/'},
               {name: '🍎 Fruits', path: '/fruits'},
               {name: '🥦 Vegetables', path: '/vegetables'},
               {name: '🛒 Cart', path: '/cart'}
             ].map((btn, idx) => (
               <Link 
                 key={btn.name} 
                 to={btn.path} 
                 className="px-5 py-2 bg-black/75 hover:bg-white hover:text-orange-600 border border-white/30 rounded-full transition-all text-sm font-bold backdrop-blur-sm animate-rope-drop"
                 style={{ animationDelay: `${idx * 0.1}s` }}
               >
                 {btn.name}
               </Link>
             ))}
          </nav>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {pulsesData.map((pulse, index) => (
            <div 
              key={pulse.id} 
              className="group bg-white/90 backdrop-blur-sm rounded-3xl p-4 shadow-xl hover:shadow-2xl hover:bg-white transition-all duration-300 hover:-translate-y-2 animate-fade-in-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <Link 
                to={`/product/${pulse.name}`}
                state={{ product: pulse }}
                className="block relative overflow-hidden rounded-2xl bg-white mb-4 h-48 flex items-center justify-center border border-slate-100"
              >
                <img 
                  src={pulse.image} 
                  alt={pulse.name}
                  className="h-32 object-contain drop-shadow-md transform transition-transform duration-500 group-hover:scale-110"
                />
              </Link>
              <div className="px-2 text-center text-slate-800">
                <h3 className="text-xl font-bold mb-1">{pulse.name}</h3>
                <p className="text-orange-600 font-bold text-lg mb-4">₹{pulse.price} <span className="text-xs text-slate-400 font-normal">/kg</span></p>
                <button 
                  onClick={() => { addToCart(pulse.name, pulse.price, 1); alert('Added to cart'); }}
                  className="w-full py-2 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition-all shadow-lg active:scale-95"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
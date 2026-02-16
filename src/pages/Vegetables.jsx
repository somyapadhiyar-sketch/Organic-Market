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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-500 via-emerald-600 to-teal-700 font-sans text-white">
      
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md shadow-lg border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-3xl font-bold drop-shadow-md">🥦 Organic Vegetables</h1>
          
          <nav className="flex flex-wrap justify-center items-center gap-3">
             {[
               {name: 'Home', path: '/'},
               {name: '🍎 Fruits', path: '/fruits'},
               {name: '🌾 Pulses', path: '/pulses'},
               {name: '🛒 Cart', path: '/cart'}
             ].map((btn, idx) => (
               <Link 
                 key={btn.name} 
                 to={btn.path} 
                 className="px-5 py-2 bg-black/75 hover:bg-white hover:text-green-600 border border-white/30 rounded-full transition-all text-sm font-bold backdrop-blur-sm animate-rope-drop"
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
          {vegetablesData.map((veg, index) => (
            <div 
              key={veg.id} 
              className="group bg-white/90 backdrop-blur-sm rounded-3xl p-4 shadow-xl hover:shadow-2xl hover:bg-white transition-all duration-300 hover:-translate-y-2 animate-fade-in-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <Link 
                to={`/product/${veg.name}`}
                state={{ product: veg }}
                className="block relative overflow-hidden rounded-2xl bg-white mb-4 h-48 flex items-center justify-center border border-slate-100"
              >
                <img 
                  src={veg.image} 
                  alt={veg.name}
                  className="h-32 object-contain drop-shadow-md transform transition-transform duration-500 group-hover:scale-110"
                />
              </Link>
              <div className="px-2 text-center text-slate-800">
                <h3 className="text-xl font-bold mb-1">{veg.name}</h3>
                <p className="text-green-600 font-bold text-lg mb-4">₹{veg.price} <span className="text-xs text-slate-400 font-normal">/kg</span></p>
                <button 
                  onClick={() => { addToCart(veg.name, veg.price, 1); alert('Added to cart'); }}
                  className="w-full py-2 bg-green-700 text-white font-bold rounded-xl hover:bg-green-800 transition-all shadow-lg active:scale-95"
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
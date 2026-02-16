import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'

const fruitsData = [
  { id: 1, name: 'Apple', price: 160, image: '/fruits/apple.png' },
  { id: 2, name: 'Banana', price: 60, image: '/fruits/banana.png' },
  { id: 3, name: 'Orange', price: 80, image: '/fruits/orange.png' },
  { id: 4, name: 'Grapes', price: 120, image: '/fruits/grapes.png' },
  { id: 5, name: 'Mango', price: 200, image: '/fruits/manog.png' },
  { id: 6, name: 'Pineapple', price: 100, image: '/fruits/pineapple.png' },
  { id: 7, name: 'Strawberry', price: 300, image: '/fruits/strawberry.png' },
  { id: 8, name: 'Kiwi', price: 250, image: '/fruits/kiwi.png' },
  { id: 9, name: 'Papaya', price: 50, image: '/fruits/papaya.png' },
  { id: 10, name: 'Guava', price: 70, image: '/fruits/gwava.png' },
  { id: 11, name: 'Pomegranate', price: 180, image: '/fruits/promogrenate.png' },
  { id: 12, name: 'Watermelon', price: 40, image: '/fruits/watermelon.png' },
  { id: 13, name: 'Cherry', price: 400, image: '/fruits/cherry.png' },
  { id: 14, name: 'Peach', price: 150, image: '/fruits/peach.png' },
]

export default function Fruits() {
  const { addToCart } = useCart()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 font-sans text-white">
      
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md shadow-lg border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-3xl font-bold drop-shadow-md">🍎 Organic Fruits</h1>
          
          <nav className="flex flex-wrap justify-center items-center gap-3">
             {[
               {name: 'Home', path: '/'},
               {name: '🥦Vegetables', path: '/vegetables'},
               {name: '🌾Pulses', path: '/pulses'},
               {name: '🛒 Cart', path: '/cart'}
             ].map((btn, idx) => (
               <Link 
                 key={btn.name} 
                 to={btn.path} 
                 className="px-5 py-2 bg-black/75 hover:bg-white hover:text-blue-600 border border-white/30 rounded-full transition-all text-sm font-bold backdrop-blur-sm animate-rope-drop"
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
          {fruitsData.map((fruit, index) => (
            <div 
              key={fruit.id} 
              className="group bg-white/90 backdrop-blur-sm rounded-3xl p-4 shadow-xl hover:shadow-2xl hover:bg-white transition-all duration-300 hover:-translate-y-2 animate-fade-in-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <Link 
                to={`/product/${fruit.name}`}
                state={{ product: fruit }}
                className="block relative overflow-hidden rounded-2xl bg-white mb-4 h-48 flex items-center justify-center border border-slate-100"
              >
                <img 
                  src={fruit.image} 
                  alt={fruit.name}
                  className="h-32 object-contain drop-shadow-md transform transition-transform duration-500 group-hover:scale-110"
                />
              </Link>
              <div className="px-2 text-center text-slate-800">
                <h3 className="text-xl font-bold mb-1">{fruit.name}</h3>
                <p className="text-green-600 font-bold text-lg mb-4">₹{fruit.price} <span className="text-xs text-slate-400 font-normal">/kg</span></p>
                <button 
                  onClick={() => { addToCart(fruit.name, fruit.price, 1); alert('Added to cart'); }}
                  className="w-full py-2 bg-slate-900 text-white font-bold rounded-xl hover:bg-blue-600 transition-all shadow-lg active:scale-95"
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
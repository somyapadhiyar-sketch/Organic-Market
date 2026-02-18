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
  
  // HEAVY SHADOW STYLE FOR NAV
  const navBtnStyle = "px-6 py-2 bg-slate-900 text-white font-bold rounded-full shadow-[0px_10px_25px_rgba(0,0,0,0.5)] hover:scale-110 transition-all text-sm animate-rope-drop"

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 via-sky-100 to-indigo-200 font-sans text-slate-800">
      
      <header className="bg-white/40 backdrop-blur-md border-b border-white/30 sticky top-0 z-50 animate-slide-down">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">🍎 Premium Fruits</h1>
          <nav className="flex flex-wrap justify-center gap-3">
             <Link to="/" className={navBtnStyle} style={{animationDelay: '0.1s'}}>Home</Link>
             <Link to="/vegetables" className={navBtnStyle} style={{animationDelay: '0.2s'}}>Vegetables</Link>
             <Link to="/pulses" className={navBtnStyle} style={{animationDelay: '0.3s'}}>Pulses</Link>
             <Link to="/cart" className={navBtnStyle} style={{animationDelay: '0.4s'}}>🛒 Cart</Link>
          </nav>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-6 py-12 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {fruitsData.map((fruit) => (
            <div key={fruit.id} className="group bg-white/80 backdrop-blur-sm rounded-3xl p-5 shadow-sm border border-white/50 hover:bg-white hover:shadow-2xl hover:border-blue-200 transition-all duration-300 hover:-translate-y-2">
              <Link to={`/product/${fruit.name}`} state={{ product: fruit }} className="block relative overflow-hidden rounded-2xl bg-blue-50 mb-4 h-48 flex items-center justify-center">
                <img src={fruit.image} alt={fruit.name} className="h-32 object-contain drop-shadow-md transform transition-transform duration-500 group-hover:scale-110" />
              </Link>
              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">{fruit.name}</h3>
                <div className="flex justify-between items-end mb-4">
                  <p className="text-slate-500 text-sm">1 kg</p>
                  <p className="text-slate-900 font-bold text-xl">₹{fruit.price}</p>
                </div>
                {/* Heavy Shadow on Add Button */}
                <button 
                  onClick={() => { addToCart(fruit.name, fruit.price, 1); alert('Added!'); }} 
                  className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl shadow-[0px_10px_20px_rgba(0,0,0,0.4)] hover:shadow-[0px_15px_30px_rgba(0,0,0,0.5)] hover:bg-blue-600 transition-all active:scale-95"
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
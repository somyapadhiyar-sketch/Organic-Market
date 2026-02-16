import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'

export default function Cart() {
  const { cart, removeFromCart, getCartTotal } = useCart()
  const total = getCartTotal()

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-700 via-purple-600 to-indigo-800 text-white font-sans">
      
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md shadow-lg border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-3xl font-bold drop-shadow-md">🛒 Your Cart</h1>
          
          {/* FULL NAVIGATION with ROPE ANIMATION */}
          <nav className="flex flex-wrap justify-center items-center gap-3">
             {[
               {name: 'Home', path: '/'},
               {name: '🍎 Fruits', path: '/fruits'},
               {name: '🥦 Vegetables', path: '/vegetables'},
               {name: '🌾 Pulses', path: '/pulses'},
               {name: 'ℹ️ About', path: '/about'}
             ].map((btn, idx) => (
               <Link 
                 key={btn.name} 
                 to={btn.path} 
                 className="px-5 py-2 bg-black/75 hover:bg-white hover:text-purple-600 border border-white/30 rounded-full transition-all text-sm font-bold backdrop-blur-sm animate-rope-drop"
                 style={{ animationDelay: `${idx * 0.1}s` }}
               >
                 {btn.name}
               </Link>
             ))}
          </nav>
        </div>
      </header>

      {/* Cart Content */}
      <div className="max-w-4xl mx-auto p-6 animate-fade-in-up">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
          {cart.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-2xl opacity-80 mb-6">Your cart is currently empty.</p>
              <Link to="/" className="px-8 py-3 bg-white text-purple-700 font-bold rounded-full hover:bg-gray-100 transition shadow-lg">
                Start Shopping
              </Link>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {cart.map((item, index) => (
                  <div key={`${item.name}-${item.weight}-${index}`} className="flex justify-between items-center bg-white/10 p-4 rounded-xl border border-white/10 hover:bg-white/20 transition">
                    <div>
                      <h3 className="text-xl font-bold">{item.name}</h3>
                      <p className="text-sm opacity-80">{item.weight}kg | ₹{item.pricePerKg}/kg</p>
                      <p className="text-sm opacity-80">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold mb-2">₹{item.total}</p>
                      <button 
                        onClick={() => removeFromCart(item.name, item.weight)}
                        className="text-xs bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition shadow-md"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 pt-6 border-t border-white/20 flex flex-col sm:flex-row justify-between items-center gap-6">
                <div className="text-3xl font-bold">Total: ₹{total}</div>
                <Link 
                  to="/payment"
                  className="px-10 py-4 bg-gradient-to-r from-green-400 to-emerald-600 text-white font-bold rounded-full shadow-lg hover:shadow-green-500/50 hover:scale-105 transition-all transform"
                >
                  Proceed to Payment
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
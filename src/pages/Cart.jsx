import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'

export default function Cart() {
  const { cart, removeFromCart, getCartTotal } = useCart()
  const total = getCartTotal()
  const FREE_DELIVERY_LIMIT = 500

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-700 via-purple-600 to-indigo-800 text-white font-sans">
      
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md shadow-lg border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-3xl font-bold drop-shadow-md">🛒 Your Cart</h1>
          <nav className="flex flex-wrap justify-center items-center gap-3">
             {[
               {name: 'Home', path: '/', color: 'bg-indigo-500'},
               {name: 'Fruits', path: '/fruits', color: 'bg-blue-500'},
               {name: 'Vegetables', path: '/vegetables', color: 'bg-green-500'},
               {name: 'Pulses', path: '/pulses', color: 'bg-orange-500'}
             ].map((btn, idx) => (
               <Link key={btn.name} to={btn.path} className={`px-5 py-2 ${btn.color} border border-white/20 rounded-full transition-all text-sm font-bold shadow-lg hover:scale-110 animate-rope-drop`} style={{ animationDelay: `${idx * 0.1}s` }}>
                 {btn.name}
               </Link>
             ))}
          </nav>
        </div>
      </header>

      {/* Cart Content */}
      <div className="max-w-4xl mx-auto p-6 animate-fade-in-up">
        <div className="bg-white/10 backdrop-blur-xl rounded-[2rem] p-8 border border-white/20 shadow-2xl">
          {cart.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-2xl opacity-80 mb-6">Your cart is currently empty.</p>
              <Link to="/fruits" className="px-8 py-3 bg-white text-purple-700 font-bold rounded-full hover:bg-gray-100 transition shadow-lg hover:scale-105">
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
               {/* Animated Free Delivery Banner */}
              {total > FREE_DELIVERY_LIMIT && (
                <div className="bg-green-500/80 backdrop-blur-md text-white p-4 rounded-xl text-center font-bold border border-white/20 animate-zoom-in shadow-lg mb-6">
                  🎉 Congratulations! You unlocked FREE DELIVERY!
                </div>
              )}

              {cart.map((item, idx) => (
                <div key={`${item.name}-${idx}`} className="flex justify-between items-center bg-white/10 p-4 rounded-xl border border-white/10 hover:bg-white/20 transition hover:translate-x-1">
                  <div>
                    <h3 className="text-xl font-bold">{item.name}</h3>
                    <p className="text-sm opacity-80">{item.weight}kg | ₹{item.pricePerKg}/kg</p>
                  </div>
                  <div className="text-right flex items-center gap-4">
                    <p className="text-xl font-bold">₹{item.total}</p>
                    <button onClick={() => removeFromCart(item.name, item.weight)} className="text-xs bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition shadow-md hover:scale-105">
                      Remove
                    </button>
                  </div>
                </div>
              ))}
              
              <div className="mt-8 pt-6 border-t border-white/20 flex flex-col sm:flex-row justify-between items-center gap-6">
                <div className="text-3xl font-bold drop-shadow-md">Total: ₹{total}</div>
                <Link to="/payment" className="px-10 py-4 bg-gradient-to-r from-green-400 to-emerald-600 text-white font-bold rounded-full shadow-lg hover:shadow-green-500/50 hover:scale-105 transition-all transform">
                  Proceed to Payment
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
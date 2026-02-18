import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'

export default function Cart() {
  const { cart, removeFromCart, getCartTotal } = useCart()
  const total = getCartTotal()
  const FREE_DELIVERY_LIMIT = 500

  const navBtnStyle = "px-5 py-2 bg-slate-800 text-white font-bold rounded-full shadow-md hover:bg-slate-700 hover:scale-105 transition-all text-sm animate-rope-drop border border-slate-600"

  return (
    <div className="min-h-screen bg-gradient-to-br from-fuchsia-100 via-purple-100 to-indigo-100 font-sans text-slate-800 flex flex-col">
      
      <header className="bg-white/40 backdrop-blur-md border-b border-white/30 sticky top-0 z-50 animate-slide-down">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-3xl font-black text-slate-900 drop-shadow-sm">🛒 Your Cart</h1>
          <nav className="flex flex-wrap justify-center gap-3">
             <Link to="/" className={navBtnStyle} style={{animationDelay: '0.1s'}}>Home</Link>
             <Link to="/fruits" className={navBtnStyle} style={{animationDelay: '0.2s'}}>Fruits</Link>
             <Link to="/vegetables" className={navBtnStyle} style={{animationDelay: '0.3s'}}>Vegetables</Link>
             <Link to="/pulses" className={navBtnStyle} style={{animationDelay: '0.4s'}}>Pulses</Link>
          </nav>
        </div>
      </header>

      <div className="flex-grow max-w-4xl mx-auto p-6 w-full animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-8 border border-white/60 shadow-xl">
          
          {cart.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4 grayscale opacity-50">🛍️</div>
              <h2 className="text-2xl font-bold mb-4 text-slate-800">Your cart is empty</h2>
              <p className="text-slate-500 mb-8">Good food is waiting for you.</p>
              <Link to="/fruits" className="px-10 py-4 bg-slate-900 text-white font-bold rounded-full hover:bg-slate-700 transition-all shadow-lg animate-rope-drop">
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
               
              {total > FREE_DELIVERY_LIMIT ? (
                <div className="bg-green-50 border border-green-200 p-4 rounded-xl text-center">
                  <span className="text-green-700 font-bold text-lg">🎉 FREE DELIVERY UNLOCKED!</span>
                </div>
              ) : (
                <div className="bg-slate-50 p-5 rounded-xl text-center border border-slate-100">
                  <p className="text-sm font-bold text-slate-600 mb-2">
                    Add <span className="text-slate-900">₹{FREE_DELIVERY_LIMIT - total}</span> more for Free Delivery
                  </p>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-green-500 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${(total / FREE_DELIVERY_LIMIT) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}

              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {cart.map((item, idx) => (
                  <div key={`${item.name}-${idx}`} className="flex justify-between items-center bg-white border-b border-slate-100 pb-4 last:border-0 hover:bg-slate-50 p-2 rounded-lg transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-slate-100 rounded-full flex items-center justify-center text-xl">
                        🌿
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-800">{item.name}</h3>
                        <p className="text-sm text-slate-500">{item.weight}kg x ₹{item.pricePerKg}</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-lg font-bold text-slate-900">₹{item.total}</p>
                      <button 
                        onClick={() => removeFromCart(item.name, item.weight)} 
                        className="text-xs text-red-500 hover:text-red-700 font-bold hover:underline"
                      >
                        REMOVE
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 pt-6 border-t border-slate-100">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-lg text-slate-500 font-medium">Subtotal</span>
                  <span className="text-3xl font-black text-slate-900">₹{total}</span>
                </div>
                
                <Link to="/payment" className="block w-full py-4 bg-slate-900 text-white font-bold text-center text-xl rounded-2xl shadow-xl hover:bg-green-600 hover:scale-[1.01] transition-all transform active:scale-95">
                  Proceed to Checkout ➔
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
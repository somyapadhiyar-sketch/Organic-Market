import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useEffect, useState } from 'react'

export default function Cart() {
  const { cart, removeFromCart, getCartTotal } = useCart()
  const [cartItems, setCartItems] = useState([])

  useEffect(() => {
    setCartItems(cart)
  }, [cart])

  const total = getCartTotal()

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-300 via-purple-400 to-purple-600">
      {/* Header */}
      <header className="bg-white/90 shadow-md py-5 animate-slide-down">
        <h1 className="text-4xl font-bold text-center text-gray-800">🛒 Shopping Cart</h1>
        <nav className="flex justify-center gap-4 mt-3">
          <Link to="/" className="text-purple-700 hover:text-purple-900 font-bold transition-colors">Home</Link>
          <Link to="/fruits" className="text-purple-700 hover:text-purple-900 font-bold transition-colors">Fruits</Link>
          <Link to="/vegetables" className="text-purple-700 hover:text-purple-900 font-bold transition-colors">Vegetables</Link>
          <Link to="/pulses" className="text-purple-700 hover:text-purple-900 font-bold transition-colors">Pulses</Link>
        </nav>
      </header>

      {/* Cart Container */}
      <div className="max-w-2xl mx-auto mt-5 p-5 bg-white rounded-2xl shadow-lg animate-fade-in-up">
        <div id="cart-items">
          {cartItems.length === 0 ? (
            <p className="text-center text-gray-500 text-lg my-10">Your cart is empty. Start shopping!</p>
          ) : (
            cartItems.map((item, index) => (
              <div 
                key={`${item.name}-${item.weight}-${index}`}
                className="flex justify-between items-center py-4 border-b border-gray-100 animate-slide-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
                  <p className="text-sm text-gray-500">Weight: {item.weight}kg | Price: ₹{item.pricePerKg}/kg</p>
                  <p className="text-sm text-gray-500">Quantity: {item.quantity} | Subtotal: ₹{item.total}</p>
                </div>
                <button 
                  onClick={() => removeFromCart(item.name, item.weight)}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                >
                  Remove
                </button>
              </div>
            ))
          )}
        </div>

        {cartItems.length > 0 && (
          <>
            <div className="text-center text-2xl font-bold text-purple-700 mt-5 py-4 bg-purple-50 rounded-xl">
              Total: ₹{total}
            </div>
            
            <div className="flex gap-4 mt-5">
              <Link 
                to="/payment"
                className="flex-1 bg-green-600 text-white text-center px-6 py-3 rounded-lg hover:bg-green-700 transition duration-300 hover:scale-105"
              >
                Proceed to Checkout
              </Link>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-black/80 text-white text-center py-5 mt-10">
        <p>Contact: somyapadhiyar@gmail.com | Phone: 7990360899</p>
      </footer>
    </div>
  )
}

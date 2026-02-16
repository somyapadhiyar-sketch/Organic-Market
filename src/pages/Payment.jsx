import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useState } from 'react'

export default function Payment() {
  const { cart, getCartTotal, clearCart } = useCart()
  const [formData, setFormData] = useState({ name: '', phone: '', address: '' })
  const [orderComplete, setOrderComplete] = useState(false)
  const total = getCartTotal()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (cart.length === 0) return alert('Cart is empty')
    clearCart()
    setOrderComplete(true)
  }

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-600 to-teal-800 text-white flex flex-col justify-center items-center p-6 text-center animate-zoom-in">
        <div className="bg-white/20 backdrop-blur-xl p-12 rounded-[3rem] border border-white/30 shadow-2xl">
          <h2 className="text-5xl font-bold mb-4">🎉 Order Success!</h2>
          <p className="text-xl opacity-90 mb-8">Thank you for shopping with us.</p>
          <Link to="/" className="px-8 py-3 bg-white text-green-800 font-bold rounded-full hover:bg-gray-100 transition">Return Home</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-800 to-indigo-900 text-white">
      {/* Header */}
      <header className="text-center py-10 animate-fade-in-down">
        <h1 className="text-4xl font-bold drop-shadow-lg">💳 Secure Checkout</h1>
      </header>

      <div className="max-w-6xl mx-auto px-6 pb-20 flex flex-col md:flex-row gap-10 items-start">
        {/* Order Summary */}
        <div className="flex-1 w-full bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-xl animate-fade-in-up">
          <h2 className="text-2xl font-bold mb-6 border-b border-white/20 pb-4">Order Summary</h2>
          {cart.map((item, idx) => (
             <div key={idx} className="flex justify-between py-2 border-b border-white/10">
               <span>{item.name} <span className="text-sm opacity-70">x{item.quantity}</span></span>
               <span className="font-bold">₹{item.total}</span>
             </div>
          ))}
          <div className="mt-6 text-3xl font-bold text-center text-yellow-300">Total: ₹{total}</div>
        </div>

        {/* Form */}
        <div className="flex-1 w-full bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-xl animate-fade-in-up delay-100">
           <h2 className="text-2xl font-bold mb-6 border-b border-white/20 pb-4">Shipping Details</h2>
           <form onSubmit={handleSubmit} className="space-y-4">
             <div>
               <label className="block text-sm font-bold mb-2 ml-2">Full Name</label>
               <input required type="text" className="w-full px-5 py-3 rounded-xl bg-white/10 border border-white/30 focus:bg-white/20 focus:border-white outline-none transition" placeholder="John Doe" onChange={e => setFormData({...formData, name: e.target.value})} />
             </div>
             <div>
               <label className="block text-sm font-bold mb-2 ml-2">Phone</label>
               <input required type="tel" className="w-full px-5 py-3 rounded-xl bg-white/10 border border-white/30 focus:bg-white/20 focus:border-white outline-none transition" placeholder="9876543210" onChange={e => setFormData({...formData, phone: e.target.value})} />
             </div>
             <div>
               <label className="block text-sm font-bold mb-2 ml-2">Address</label>
               <textarea required className="w-full px-5 py-3 rounded-xl bg-white/10 border border-white/30 focus:bg-white/20 focus:border-white outline-none transition" rows="3" placeholder="Delivery Address..." onChange={e => setFormData({...formData, address: e.target.value})}></textarea>
             </div>
             
             <div className="pt-4 flex gap-4">
               <Link to="/cart" className="flex-1 py-4 text-center bg-white/10 hover:bg-white/20 rounded-xl font-bold border border-white/20 transition">Cancel</Link>
               <button type="submit" className="flex-1 py-4 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl font-bold shadow-lg hover:scale-105 transition transform">Pay & Order</button>
             </div>
           </form>
        </div>
      </div>
    </div>
  )
}
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useState, useEffect } from 'react'

export default function Payment() {
  const { cart, getCartTotal, clearCart } = useCart()
  const [cartItems, setCartItems] = useState([])
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    pincode: '',
    deliveryTime: '',
    paymentMethod: ''
  })
  const [orderComplete, setOrderComplete] = useState(false)

  useEffect(() => {
    setCartItems(cart)
  }, [cart])

  const total = getCartTotal()

  const handleInputChange = (e) => {
    const { id, value } = e.target
    setFormData({ ...formData, [id]: value })
  }

  const validateForm = () => {
    const requiredFields = ['name', 'phone', 'email', 'address', 'city', 'pincode', 'deliveryTime', 'paymentMethod']
    let isValid = true

    requiredFields.forEach(field => {
      const element = document.getElementById(field)
      if (!formData[field].trim()) {
        element.style.borderColor = '#ff6b6b'
        isValid = false
      } else {
        element.style.borderColor = 'rgba(255, 255, 255, 0.3)'
      }
    })

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (formData.email && !emailRegex.test(formData.email)) {
      document.getElementById('email').style.borderColor = '#ff6b6b'
      isValid = false
    }

    // Phone validation
    const phoneRegex = /^[6-9]\d{9}$/
    if (formData.phone && !phoneRegex.test(formData.phone)) {
      document.getElementById('phone').style.borderColor = '#ff6b6b'
      isValid = false
    }

    return isValid
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (cartItems.length === 0) {
      alert('Your cart is empty!')
      return
    }

    if (!validateForm()) {
      alert('Please fill in all required fields correctly.')
      return
    }

    // Store order data
    const orderData = {
      ...formData,
      orderItems: cartItems,
      total: total,
      orderDate: new Date().toISOString()
    }
    localStorage.setItem('lastOrder', JSON.stringify(orderData))

    // Clear cart
    clearCart()
    setOrderComplete(true)
  }

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800 text-white flex flex-col justify-center items-center">
        <div className="text-center p-10">
          <h2 className="text-5xl font-bold text-green-400 mb-5">🎉 Payment Successful!</h2>
          <p className="text-xl mb-4">Thank you for your payment. Your order has been confirmed!</p>
          <p className="text-lg mb-6">You will receive a confirmation email shortly.</p>
          <Link 
            to="/"
            className="inline-block mt-6 px-8 py-4 bg-gradient-to-r from-green-500 to-teal-500 text-white text-lg font-bold rounded-full hover:from-green-600 hover:to-teal-600 transition-all duration-300"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800 text-white">
      {/* Header */}
      <header className="text-center py-12 px-5 animate-fade-in-down">
        <h1 className="text-5xl font-bold mb-2 drop-shadow-lg">💳 Payment</h1>
      </header>

      {/* Navigation */}
      <nav className="flex justify-center gap-5 my-4 flex-wrap px-4">
        <Link to="/" className="inline-block px-6 py-3 bg-white/20 backdrop-blur-sm text-white text-lg font-bold rounded-full border-2 border-white/30 hover:bg-white/30 transition-all duration-300">
          Home
        </Link>
        <Link to="/fruits" className="inline-block px-6 py-3 bg-white/20 backdrop-blur-sm text-white text-lg font-bold rounded-full border-2 border-white/30 hover:bg-white/30 transition-all duration-300">
          🍎 Fruits
        </Link>
        <Link to="/vegetables" className="inline-block px-6 py-3 bg-white/20 backdrop-blur-sm text-white text-lg font-bold rounded-full border-2 border-white/30 hover:bg-white/30 transition-all duration-300">
          🥦 Vegetables
        </Link>
        <Link to="/pulses" className="inline-block px-6 py-3 bg-white/20 backdrop-blur-sm text-white text-lg font-bold rounded-full border-2 border-white/30 hover:bg-white/30 transition-all duration-300">
          🌾 Pulses
        </Link>
        <Link to="/cart" className="inline-block px-6 py-3 bg-white/20 backdrop-blur-sm text-white text-lg font-bold rounded-full border-2 border-white/30 hover:bg-white/30 transition-all duration-300">
          🛒 Cart
        </Link>
        <Link to="/about" className="inline-block px-6 py-3 bg-white/20 backdrop-blur-sm text-white text-lg font-bold rounded-full border-2 border-white/30 hover:bg-white/30 transition-all duration-300">
          ℹ️ About
        </Link>
      </nav>

      {/* Checkout Section */}
      <section className="flex-grow flex justify-center items-start py-12 px-5">
        <div className="flex flex-wrap gap-10 max-w-5xl w-full">
          {/* Order Summary */}
          <div className="flex-1 min-w-[300px] bg-white/10 backdrop-blur-sm rounded-2xl p-6 border-2 border-white/20 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <h2 className="text-2xl font-bold mb-5">Order Summary</h2>
            <div id="payment-items">
              {cartItems.length === 0 ? (
                <p className="text-gray-300">Your cart is empty</p>
              ) : (
                cartItems.map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-3 border-b border-white/20">
                    <div>
                      <h4 className="font-semibold">{item.name}</h4>
                      <p className="text-sm text-gray-300">Weight: {item.weight}kg | Price: ₹{item.pricePerKg}/kg | Qty: {item.quantity}</p>
                    </div>
                    <span className="font-bold">₹{item.total}</span>
                  </div>
                ))
              )}
            </div>
            <div className="text-2xl font-bold text-yellow-400 mt-5 text-center py-3 bg-white/10 rounded-xl">
              Total: ₹{total}
            </div>
          </div>

          {/* Delivery Details */}
          <div className="flex-1 min-w-[300px] bg-white/10 backdrop-blur-sm rounded-2xl p-6 border-2 border-white/20 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <h2 className="text-2xl font-bold mb-5">Delivery Details</h2>
            <form id="payment-form" onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="name" className="block mb-2 font-bold">Full Name</label>
                <input 
                  type="text" 
                  id="name" 
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/10 border-2 border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-yellow-400 transition-colors"
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="phone" className="block mb-2 font-bold">Phone Number</label>
                <input 
                  type="tel" 
                  id="phone" 
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/10 border-2 border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-yellow-400 transition-colors"
                  placeholder="Enter phone number"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="email" className="block mb-2 font-bold">Email</label>
                <input 
                  type="email" 
                  id="email" 
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/10 border-2 border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-yellow-400 transition-colors"
                  placeholder="Enter email address"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="address" className="block mb-2 font-bold">Delivery Address</label>
                <textarea 
                  id="address" 
                  rows="3"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/10 border-2 border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-yellow-400 transition-colors"
                  placeholder="Enter delivery address"
                  required
                ></textarea>
              </div>
              <div className="mb-4">
                <label htmlFor="city" className="block mb-2 font-bold">City</label>
                <input 
                  type="text" 
                  id="city" 
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/10 border-2 border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-yellow-400 transition-colors"
                  placeholder="Enter city"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="pincode" className="block mb-2 font-bold">Pincode</label>
                <input 
                  type="text" 
                  id="pincode" 
                  value={formData.pincode}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/10 border-2 border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-yellow-400 transition-colors"
                  placeholder="Enter pincode"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="deliveryTime" className="block mb-2 font-bold">Preferred Delivery Time</label>
                <select 
                  id="deliveryTime"
                  value={formData.deliveryTime}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/10 border-2 border-white/30 rounded-xl text-white focus:outline-none focus:border-yellow-400 transition-colors"
                  required
                >
                  <option value="">Select Time</option>
                  <option value="morning" className="text-black">Morning (9 AM - 12 PM)</option>
                  <option value="afternoon" className="text-black">Afternoon (12 PM - 3 PM)</option>
                  <option value="evening" className="text-black">Evening (3 PM - 6 PM)</option>
                </select>
              </div>
              <div className="mb-4">
                <label htmlFor="paymentMethod" className="block mb-2 font-bold">Payment Method</label>
                <select 
                  id="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/10 border-2 border-white/30 rounded-xl text-white focus:outline-none focus:border-yellow-400 transition-colors"
                  required
                >
                  <option value="">Select Payment Method</option>
                  <option value="cod" className="text-black">Cash on Delivery</option>
                  <option value="upi" className="text-black">UPI</option>
                  <option value="card" className="text-black">Credit/Debit Card</option>
                </select>
              </div>
              <button 
                type="submit" 
                className="w-full py-4 bg-gradient-to-r from-green-500 to-teal-500 text-white text-lg font-bold rounded-full hover:from-green-600 hover:to-teal-600 transition-all duration-300 hover:shadow-lg mt-4"
              >
                Complete Payment
              </button>
            </form>
            <div className="text-2xl font-bold text-yellow-400 mt-5 text-center py-3 bg-white/10 rounded-xl">
              Total Amount: ₹{total}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/50 backdrop-blur-sm text-center py-5 mt-10">
        <p className="text-base">Contact: somyapadhiyar@gmail.com | Phone: 7990360899</p>
      </footer>
    </div>
  )
}

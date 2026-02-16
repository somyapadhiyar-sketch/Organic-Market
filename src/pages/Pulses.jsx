import { Link } from 'react-router-dom'
import { useState } from 'react'
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

const quantityOptions = [
  { value: 0.1, label: '100g' },
  { value: 0.5, label: '500g' },
  { value: 1, label: '1kg' },
  { value: 5, label: '5kg' },
  { value: 10, label: '10kg' },
  { value: 20, label: '20kg' },
]

export default function Pulses() {
  const { addToCart } = useCart()
  const [quantities, setQuantities] = useState({})

  const handleQuantityChange = (pulseId, value) => {
    setQuantities({ ...quantities, [pulseId]: value })
  }

  const handleAddToCart = (pulse) => {
    const weight = quantities[pulse.id] || 1
    addToCart(pulse.name, pulse.price, weight)
    alert(`${pulse.name} (${weight}kg) added to cart! Total: ₹${pulse.price * weight}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600">
      {/* Header */}
      <header className="bg-white/90 shadow-md py-5 animate-slide-down">
        <h1 className="text-4xl font-bold text-center text-gray-800">🌾 Organic Pulses</h1>
        <nav className="flex justify-center gap-4 mt-3">
          <Link to="/" className="text-orange-700 hover:text-orange-900 font-bold transition-colors">Home</Link>
          <Link to="/fruits" className="text-orange-700 hover:text-orange-900 font-bold transition-colors">Fruits</Link>
          <Link to="/vegetables" className="text-orange-700 hover:text-orange-900 font-bold transition-colors">Vegetables</Link>
          <Link to="/cart" className="text-orange-700 hover:text-orange-900 font-bold transition-colors">Cart</Link>
        </nav>
      </header>

      {/* Products Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 p-5 max-w-6xl mx-auto">
        {pulsesData.map((pulse, index) => (
          <div 
            key={pulse.id} 
            className="bg-white rounded-2xl p-5 text-center shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300 animate-fade-in-up"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <img 
              src={pulse.image} 
              alt={pulse.name}
              className="w-full h-40 object-cover rounded-xl mb-4 hover:scale-105 transition-transform duration-300"
            />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">{pulse.name}</h3>
            <p className="text-lg font-bold text-orange-600 mb-2">₹{pulse.price} / kg</p>
            <select 
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg mb-3 focus:border-orange-500 outline-none transition-colors"
              onChange={(e) => handleQuantityChange(pulse.id, parseFloat(e.target.value))}
              defaultValue={1}
            >
              {quantityOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <button 
              onClick={() => handleAddToCart(pulse)}
              className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-400 text-white font-bold rounded-full hover:from-orange-600 hover:to-orange-500 transition-all duration-300 hover:shadow-lg"
            >
              Add to Cart
            </button>
          </div>
        ))}
      </section>

      {/* Footer */}
      <footer className="bg-black/80 text-white text-center py-5 mt-10">
        <p>Contact: somyapadhiyar@gmail.com | Phone: 7990360899</p>
      </footer>
    </div>
  )
}

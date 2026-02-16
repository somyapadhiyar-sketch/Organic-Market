import { Link } from 'react-router-dom'
import { useState } from 'react'
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

const quantityOptions = [
  { value: 0.1, label: '100g' },
  { value: 0.5, label: '500g' },
  { value: 1, label: '1kg' },
  { value: 5, label: '5kg' },
  { value: 10, label: '10kg' },
  { value: 20, label: '20kg' },
]

export default function Vegetables() {
  const { addToCart } = useCart()
  const [quantities, setQuantities] = useState({})

  const handleQuantityChange = (vegId, value) => {
    setQuantities({ ...quantities, [vegId]: value })
  }

  const handleAddToCart = (veg) => {
    const weight = quantities[veg.id] || 1
    addToCart(veg.name, veg.price, weight)
    alert(`${veg.name} (${weight}kg) added to cart! Total: ₹${veg.price * weight}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-green-500 to-green-600">
      {/* Header */}
      <header className="bg-white/90 shadow-md py-5 animate-slide-down">
        <h1 className="text-4xl font-bold text-center text-gray-800">🥦 Organic Vegetables</h1>
        <nav className="flex justify-center gap-4 mt-3">
          <Link to="/" className="text-green-700 hover:text-green-900 font-bold transition-colors">Home</Link>
          <Link to="/fruits" className="text-green-700 hover:text-green-900 font-bold transition-colors">Fruits</Link>
          <Link to="/pulses" className="text-green-700 hover:text-green-900 font-bold transition-colors">Pulses</Link>
          <Link to="/cart" className="text-green-700 hover:text-green-900 font-bold transition-colors">Cart</Link>
        </nav>
      </header>

      {/* Products Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 p-5 max-w-6xl mx-auto">
        {vegetablesData.map((veg, index) => (
          <div 
            key={veg.id} 
            className="bg-white rounded-2xl p-5 text-center shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300 animate-fade-in-up"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <img 
              src={veg.image} 
              alt={veg.name}
              className="w-full h-40 object-cover rounded-xl mb-4 hover:scale-105 transition-transform duration-300"
            />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">{veg.name}</h3>
            <p className="text-lg font-bold text-green-700 mb-2">₹{veg.price} / kg</p>
            <select 
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg mb-3 focus:border-green-500 outline-none transition-colors"
              onChange={(e) => handleQuantityChange(veg.id, parseFloat(e.target.value))}
              defaultValue={1}
            >
              {quantityOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <button 
              onClick={() => handleAddToCart(veg)}
              className="w-full py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-full hover:from-green-600 hover:to-green-700 transition-all duration-300 hover:shadow-lg"
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

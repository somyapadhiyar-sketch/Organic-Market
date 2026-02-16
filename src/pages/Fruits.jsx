import { Link } from 'react-router-dom'
import { useState } from 'react'
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

const quantityOptions = [
  { value: 0.1, label: '100g' },
  { value: 0.5, label: '500g' },
  { value: 1, label: '1kg' },
  { value: 5, label: '5kg' },
  { value: 10, label: '10kg' },
  { value: 20, label: '20kg' },
]

export default function Fruits() {
  const { addToCart } = useCart()
  const [quantities, setQuantities] = useState({})

  const handleQuantityChange = (fruitId, value) => {
    setQuantities({ ...quantities, [fruitId]: value })
  }

  const handleAddToCart = (fruit) => {
    const weight = quantities[fruit.id] || 1
    addToCart(fruit.name, fruit.price, weight)
    alert(`${fruit.name} (${weight}kg) added to cart! Total: ₹${fruit.price * weight}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-500">
      {/* Header */}
      <header className="bg-white/90 shadow-md py-5 animate-slide-down">
        <h1 className="text-4xl font-bold text-center text-gray-800">🍎 Organic Fruits</h1>
        <nav className="flex justify-center gap-4 mt-3">
          <Link to="/" className="text-blue-600 hover:text-indigo-600 font-bold transition-colors">Home</Link>
          <Link to="/vegetables" className="text-blue-600 hover:text-indigo-600 font-bold transition-colors">Vegetables</Link>
          <Link to="/pulses" className="text-blue-600 hover:text-indigo-600 font-bold transition-colors">Pulses</Link>
          <Link to="/cart" className="text-blue-600 hover:text-indigo-600 font-bold transition-colors">Cart</Link>
          <Link to="/about" className="text-blue-600 hover:text-indigo-600 font-bold transition-colors">About</Link>
        </nav>
      </header>

      {/* Products Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 p-5 max-w-6xl mx-auto">
        {fruitsData.map((fruit, index) => (
          <div 
            key={fruit.id} 
            className="bg-white rounded-2xl p-5 text-center shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300 animate-fade-in-up"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <img 
              src={fruit.image} 
              alt={fruit.name}
              className="w-full h-40 object-cover rounded-xl mb-4 hover:scale-105 transition-transform duration-300"
            />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">{fruit.name}</h3>
            <p className="text-lg font-bold text-green-600 mb-2">₹{fruit.price} / kg</p>
            <select 
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg mb-3 focus:border-blue-500 outline-none transition-colors"
              onChange={(e) => handleQuantityChange(fruit.id, parseFloat(e.target.value))}
              defaultValue={1}
            >
              {quantityOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <button 
              onClick={() => handleAddToCart(fruit)}
              className="w-full py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white font-bold rounded-full hover:from-green-600 hover:to-teal-600 transition-all duration-300 hover:shadow-lg"
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

import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useCart } from '../context/CartContext'

const quantityOptions = [
  { value: 0.1, label: '100g' },
  { value: 0.5, label: '500g' },
  { value: 1, label: '1kg' },
  { value: 5, label: '5kg' },
  { value: 10, label: '10kg' },
  { value: 20, label: '20kg' },
]

export default function Apple() {
  const { addToCart } = useCart()
  const [quantity, setQuantity] = useState(1)

  const handleAddToCart = () => {
    const pricePerKg = 160
    const total = pricePerKg * quantity
    addToCart('Apple', pricePerKg, quantity)
    alert(`Apple (${quantity}kg) added to cart! Total: ₹${total}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-400 via-red-500 to-teal-500">
      {/* Header */}
      <header className="bg-white/90 shadow-md py-5 animate-slide-down">
        <h1 className="text-4xl font-bold text-center text-gray-800">🍎 Apple Details</h1>
        <nav className="flex justify-center gap-4 mt-3">
          <Link to="/" className="text-blue-600 hover:text-indigo-600 font-bold transition-colors">Home</Link>
          <Link to="/vegetables" className="text-blue-600 hover:text-indigo-600 font-bold transition-colors">Vegetables</Link>
          <Link to="/pulses" className="text-blue-600 hover:text-indigo-600 font-bold transition-colors">Pulses</Link>
          <Link to="/fruits" className="text-blue-600 hover:text-indigo-600 font-bold transition-colors">Fruits</Link>
          <Link to="/cart" className="text-blue-600 hover:text-indigo-600 font-bold transition-colors">Cart</Link>
        </nav>
      </header>

      {/* Product Details */}
      <section className="flex flex-wrap max-w-5xl mx-auto mt-5 bg-white rounded-2xl shadow-lg overflow-hidden animate-fade-in-up">
        {/* Product Image */}
        <div className="flex-1 min-w-[300px] p-6 text-center">
          <img 
            src="/fruits/apple.png" 
            alt="Apple" 
            className="w-full max-w-md mx-auto rounded-xl shadow-md animate-bounce"
          />
        </div>

        {/* Product Info */}
        <div className="flex-2 min-w-[300px] p-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Apple</h2>
          <p className="text-2xl font-bold text-green-600 mb-4">₹160 / kg</p>
          
          <div className="flex gap-3 mb-6">
            <select 
              id="apple-quantity"
              value={quantity}
              onChange={(e) => setQuantity(parseFloat(e.target.value))}
              className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 outline-none transition-colors"
            >
              {quantityOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <button 
              onClick={handleAddToCart}
              className="flex-1 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white font-bold rounded-full hover:from-green-600 hover:to-teal-600 transition-all duration-300 hover:shadow-lg"
            >
              Add to Cart
            </button>
          </div>

          {/* Product Sections */}
          <div className="flex flex-col gap-5">
            {/* About the Product */}
            <div className="border-b border-gray-200 pb-5 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <h3 className="text-xl font-bold text-gray-800 mb-2 border-b-2 border-green-500 pb-1 inline-block">About the Product</h3>
              <p className="text-gray-600 leading-relaxed">
                Our organic apples are fresh, juicy, and packed with natural goodness. Sourced from certified organic farms, they are free from pesticides and chemicals, ensuring a healthy choice for you and your family.
              </p>
            </div>

            {/* Nutritional Facts */}
            <div className="border-b border-gray-200 pb-5 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <h3 className="text-xl font-bold text-gray-800 mb-2 border-b-2 border-green-500 pb-1 inline-block">Nutritional Facts</h3>
              <ul className="text-gray-600 space-y-1">
                <li><strong>Calories:</strong> 52 per 100g</li>
                <li><strong>Fiber:</strong> 2.4g per 100g</li>
                <li><strong>Vitamin C:</strong> 4.6mg per 100g</li>
                <li><strong>Potassium:</strong> 107mg per 100g</li>
                <li><strong>Sugar:</strong> 10.4g per 100g</li>
              </ul>
            </div>

            {/* Health Benefits */}
            <div className="border-b border-gray-200 pb-5 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <h3 className="text-xl font-bold text-gray-800 mb-2 border-b-2 border-green-500 pb-1 inline-block">Health Benefits</h3>
              <ul className="text-gray-600 space-y-2">
                <li>Rich in dietary fiber, which aids digestion and helps maintain a healthy gut.</li>
                <li>Contains antioxidants like quercetin and vitamin C, which support immune function and reduce inflammation.</li>
                <li>Low in calories and high in water content, making it a great snack for weight management.</li>
                <li>May improve heart health by lowering cholesterol levels and reducing the risk of heart disease.</li>
                <li>Provides essential vitamins and minerals, including vitamin A, potassium, and folate.</li>
              </ul>
            </div>

            {/* Taste Profile */}
            <div className="border-b border-gray-200 pb-5 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <h3 className="text-xl font-bold text-gray-800 mb-2 border-b-2 border-green-500 pb-1 inline-block">Taste Profile</h3>
              <p className="text-gray-600 leading-relaxed">
                Apples have a sweet, crisp, and juicy flavor with a slight tartness depending on the variety. They offer a refreshing crunch and are versatile for both eating fresh and cooking.
              </p>
            </div>

            {/* Season */}
            <div className="border-b border-gray-200 pb-5 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
              <h3 className="text-xl font-bold text-gray-800 mb-2 border-b-2 border-green-500 pb-1 inline-block">Season</h3>
              <p className="text-gray-600 leading-relaxed">
                Apples are typically in season from late summer to fall (August to November in the Northern Hemisphere), with peak availability in September and October.
              </p>
            </div>

            {/* Shelf Life */}
            <div className="border-b border-gray-200 pb-5 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
              <h3 className="text-xl font-bold text-gray-800 mb-2 border-b-2 border-green-500 pb-1 inline-block">Shelf Life</h3>
              <p className="text-gray-600 leading-relaxed">
                Apples stay fresh for about 5-7 days at room temperature. When stored in a refrigerator, they can remain good to eat for 3-6 weeks.
              </p>
            </div>

            {/* Country of Origin */}
            <div className="border-b border-gray-200 pb-5 animate-fade-in-up" style={{ animationDelay: '0.7s' }}>
              <h3 className="text-xl font-bold text-gray-800 mb-2 border-b-2 border-green-500 pb-1 inline-block">Country of Origin</h3>
              <p className="text-gray-600 leading-relaxed">India</p>
            </div>

            {/* Return Policy */}
            <div className="pb-5 animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
              <h3 className="text-xl font-bold text-gray-800 mb-2 border-b-2 border-green-500 pb-1 inline-block">Return Policy</h3>
              <p className="text-gray-600 leading-relaxed">
                We offer a same-day return policy, but items will not be accepted for return if the food label is missing, damaged, or removed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/80 text-white text-center py-5 mt-10">
        <p>Contact: somyapadhiyar@gmail.com | Phone: 7990360899</p>
      </footer>
    </div>
  )
}

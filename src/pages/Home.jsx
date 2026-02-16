import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-700 via-purple-600 to-indigo-800 text-white flex flex-col">
      {/* Header - TRANSPARENT GLASS */}
      <header className="text-center py-12 px-5 animate-fade-in-down">
        <h1 className="text-5xl md:text-6xl font-extrabold mb-4 drop-shadow-lg tracking-tight">🌿 Organic Market</h1>
        <p className="text-xl opacity-90 font-light tracking-wide">Fresh, organic produce delivered to your doorstep</p>
      </header>

      {/* Navigation - COLORFUL BUTTONS */}
      <nav className="flex flex-wrap justify-center items-center gap-4 px-4 animate-fade-in-up">
        <Link to="/fruits" className="px-6 py-3 bg-blue-500 hover:bg-blue-600 border border-white/20 rounded-full text-white font-bold hover:scale-105 transition-all duration-300 shadow-lg shadow-blue-500/30">
          🍎 Fruits
        </Link>
        <Link to="/vegetables" className="px-6 py-3 bg-green-500 hover:bg-green-600 border border-white/20 rounded-full text-white font-bold hover:scale-105 transition-all duration-300 shadow-lg shadow-green-500/30">
          🥦 Vegetables
        </Link>
        <Link to="/pulses" className="px-6 py-3 bg-orange-500 hover:bg-orange-600 border border-white/20 rounded-full text-white font-bold hover:scale-105 transition-all duration-300 shadow-lg shadow-orange-500/30">
          🌾 Pulses
        </Link>
        <Link to="/cart" className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 border border-white/20 rounded-full text-white font-bold hover:scale-105 transition-all duration-300 shadow-lg shadow-yellow-500/30">
          🛒 Cart
        </Link>
        <Link to="/about" className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 border border-white/20 rounded-full text-white font-bold hover:scale-105 transition-all duration-300 shadow-lg shadow-indigo-500/30">
          ℹ️ About
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="flex-grow flex flex-col justify-center items-center text-center py-12 px-5 animate-zoom-in">
        <div className="bg-white/10 backdrop-blur-lg p-10 rounded-3xl border border-white/20 shadow-2xl max-w-2xl">
          <h2 className="text-4xl font-bold mb-6 drop-shadow-md">Welcome to Nature's Store</h2>
          <p className="text-lg leading-relaxed opacity-90 mb-8">
            We bring the farm directly to your table. Choose a category above to start shopping for fresh, pesticide-free products.
          </p>
          <Link to="/fruits" className="inline-block px-8 py-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded-full shadow-lg hover:shadow-green-500/50 transition-all duration-300 transform hover:-translate-y-1">
            Start Shopping Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/40 backdrop-blur-md text-center py-6 border-t border-white/10">
        <p className="text-sm opacity-80">Contact: somyapadhiyar@gmail.com | Phone: 7990360899</p>
      </footer>
    </div>
  )
}
import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800 text-white flex flex-col">
      {/* Header */}
      <header className="text-center py-12 px-5 animate-fade-in-down">
        <h1 className="text-5xl font-bold mb-2 drop-shadow-lg">🌿 Organic Market</h1>
        <p className="text-xl opacity-90">Fresh, organic produce delivered to your doorstep</p>
      </header>

      {/* Navigation */}
      <nav className="flex justify-center gap-5 my-8 flex-wrap px-4">
        <Link to="/fruits" className="inline-block px-6 py-3 bg-white/20 backdrop-blur-sm text-white text-lg font-bold rounded-full border-2 border-white/30 hover:bg-white/30 hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
          🍎 Fruits
        </Link>
        <Link to="/vegetables" className="inline-block px-6 py-3 bg-white/20 backdrop-blur-sm text-white text-lg font-bold rounded-full border-2 border-white/30 hover:bg-white/30 hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
          🥦 Vegetables
        </Link>
        <Link to="/pulses" className="inline-block px-6 py-3 bg-white/20 backdrop-blur-sm text-white text-lg font-bold rounded-full border-2 border-white/30 hover:bg-white/30 hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
          🌾 Pulses
        </Link>
        <Link to="/cart" className="inline-block px-6 py-3 bg-white/20 backdrop-blur-sm text-white text-lg font-bold rounded-full border-2 border-white/30 hover:bg-white/30 hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
          🛒 Cart
        </Link>
        <Link to="/about" className="inline-block px-6 py-3 bg-white/20 backdrop-blur-sm text-white text-lg font-bold rounded-full border-2 border-white/30 hover:bg-white/30 hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
          ℹ️ About
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="flex-grow flex flex-col justify-center items-center text-center py-12 px-5">
        <h2 className="text-4xl font-bold mb-5 drop-shadow-lg">Welcome to Our Organic Store</h2>
        <p className="text-xl max-w-2xl leading-relaxed opacity-90">Choose your category below to explore our fresh organic products.</p>
      </section>

      {/* Footer */}
      <footer className="bg-black/50 backdrop-blur-sm text-center py-5">
        <p className="text-base">Contact: somyapadhiyar@gmail.com | Phone: 7990360899</p>
      </footer>
    </div>
  )
}

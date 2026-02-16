import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-700 via-purple-600 to-indigo-800 text-white flex flex-col">
      {/* Header */}
      <header className="text-center py-12 px-5 animate-fade-in-down">
        <h1 className="text-5xl md:text-6xl font-extrabold mb-4 drop-shadow-lg tracking-tight">🌿 Organic Market</h1>
        <p className="text-xl opacity-90 font-light tracking-wide">Fresh, organic produce delivered to your doorstep</p>
      </header>

      {/* Navigation - UNIFORM COLOR & ROPE ANIMATION */}
      <nav className="flex flex-wrap justify-center items-center gap-4 px-4 overflow-hidden py-4">
        {[
          { name: '🍎 Fruits', path: '/fruits' },
          { name: '🥦 Vegetables', path: '/vegetables' },
          { name: '🌾 Pulses', path: '/pulses' },
          { name: '🛒 Cart', path: '/cart' },
          { name: 'ℹ️ About', path: '/about' }
        ].map((item, index) => (
          <Link 
            key={item.name}
            to={item.path} 
            className="px-6 py-3 bg-black/75 backdrop-blur-md border-2 border-white/30 rounded-full text-white font-bold hover:bg-white hover:text-purple-800 hover:scale-110 transition-all duration-300 shadow-lg animate-rope-drop"
            style={{ animationDelay: `${index * 0.15}s` }} /* Staggered Drop */
          >
            {item.name}
          </Link>
        ))}
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
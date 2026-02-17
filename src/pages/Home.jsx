import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-900 text-white flex flex-col font-sans">
      {/* Header */}
      <header className="text-center py-12 px-5 animate-fade-in-down">
        <h1 className="text-5xl md:text-6xl font-extrabold mb-4 drop-shadow-2xl tracking-tight">🌿 Organic Market</h1>
        <p className="text-xl opacity-90 font-light tracking-wide">Fresh, organic produce delivered to your doorstep</p>
      </header>

      {/* Navigation - ROPE DROP ANIMATION */}
      <nav className="flex flex-wrap justify-center items-center gap-4 px-4 overflow-hidden py-4">
        {[
          { name: '🍎 Fruits', path: '/fruits', color: 'bg-blue-500' },
          { name: '🥦 Vegetables', path: '/vegetables', color: 'bg-green-500' },
          { name: '🌾 Pulses', path: '/pulses', color: 'bg-orange-500' },
          { name: '🛒 Cart', path: '/cart', color: 'bg-yellow-500' },
          { name: 'ℹ️ About', path: '/about', color: 'bg-indigo-500' }
        ].map((item, index) => (
          <Link 
            key={item.name}
            to={item.path} 
            className={`px-6 py-3 ${item.color} border border-white/20 rounded-full text-white font-bold hover:scale-110 transition-all duration-300 shadow-lg shadow-black/20 animate-rope-drop`}
            style={{ animationDelay: `${index * 0.15}s` }}
          >
            {item.name}
          </Link>
        ))}
      </nav>

      {/* Hero Section */}
      <section className="flex-grow flex flex-col justify-center items-center text-center py-12 px-5 animate-zoom-in">
        <div className="bg-white/10 backdrop-blur-xl p-10 rounded-[2rem] border border-white/20 shadow-2xl max-w-3xl">
          <h2 className="text-4xl font-bold mb-6 drop-shadow-md">Welcome to Nature's Store</h2>
          <p className="text-lg leading-relaxed opacity-90 mb-8 font-medium">
            We bring the farm directly to your table. Choose a category above to start shopping for fresh, pesticide-free products.
          </p>
          <Link to="/fruits" className="inline-block px-10 py-4 bg-gradient-to-r from-green-400 to-green-600 text-white font-bold rounded-full shadow-lg hover:shadow-green-500/50 transition-all duration-300 transform hover:-translate-y-1 hover:scale-105">
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
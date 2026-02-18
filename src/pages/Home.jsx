import { Link } from 'react-router-dom'

export default function Home() {
  // THE HEAVY SHADOW BUTTON STYLE
  // shadow-[0px_20px_50px_rgba(0,0,0,0.5)] -> Creates that deep, dark blur
  const btnStyle = "px-10 py-4 bg-slate-900 text-white font-bold rounded-full shadow-[0px_20px_40px_rgba(0,0,0,0.6)] hover:scale-110 hover:shadow-[0px_25px_50px_rgba(0,0,0,0.7)] transition-all duration-300 animate-rope-drop border border-slate-700"

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-200 via-purple-100 to-indigo-200 font-sans text-slate-800">
      
      <header className="py-10 px-5 text-center animate-slide-down relative z-10">
        <h1 className="text-6xl font-black mb-3 text-slate-900 tracking-tight drop-shadow-sm">
          🌿 Organic Market
        </h1>
        <p className="text-xl text-slate-600 font-bold">Premium Quality • 100% Fresh • 12 Min Delivery</p>
      </header>

      {/* Navigation with HEAVY SHADOWS */}
      <nav className="flex flex-wrap justify-center items-center gap-6 px-4 py-8 z-20 relative">
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
            className={btnStyle}
            style={{ animationDelay: `${index * 0.15}s` }}
          >
            {item.name}
          </Link>
        ))}
      </nav>

      <section className="flex-grow flex flex-col justify-center items-center text-center py-12 px-5 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
        <div className="bg-white/60 backdrop-blur-xl p-12 rounded-[2.5rem] shadow-2xl border border-white/40 max-w-4xl w-full">
          <h2 className="text-4xl font-bold mb-6 text-slate-900">The Healthy Choice</h2>
          <p className="text-lg text-slate-700 mb-10 leading-relaxed max-w-2xl mx-auto font-medium">
            Experience the true taste of nature. Our products are sourced directly from certified organic farms.
          </p>
          
          {/* Heavy Shadow on CTA Button too */}
          <Link to="/fruits" className="inline-block px-12 py-5 bg-green-600 text-white font-bold text-xl rounded-full shadow-[0px_20px_40px_rgba(0,0,0,0.5)] hover:bg-green-700 hover:-translate-y-1 transition-all transform animate-rope-drop" style={{ animationDelay: '0.8s' }}>
            Start Shopping ➔
          </Link>
        </div>
      </section>

      <footer className="bg-white/50 border-t border-slate-200 text-center py-8">
        <p className="text-sm text-slate-500 font-bold">© 2026 Organic Market</p>
      </footer>
    </div>
  )
}
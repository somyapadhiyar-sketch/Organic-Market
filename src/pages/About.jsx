import { Link } from 'react-router-dom'

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800 text-white flex flex-col">
      {/* Header */}
      <header className="text-center py-12 px-5 animate-fade-in-down">
        <h1 className="text-5xl font-bold mb-2 drop-shadow-lg">🌿 About Organic Market</h1>
        <p className="text-xl opacity-90">Fresh, organic produce delivered to your doorstep</p>
      </header>

      {/* Navigation */}
      <nav className="flex justify-center gap-5 my-8 flex-wrap px-4">
        <Link to="/" className="inline-block px-6 py-3 bg-white/20 backdrop-blur-sm text-white text-lg font-bold rounded-full border-2 border-white/30 hover:bg-white/30 hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
          Home
        </Link>
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
      </nav>

      {/* About Section */}
      <section className="flex-grow flex flex-col justify-center items-center text-center py-12 px-5">
        <h2 className="text-4xl font-bold mb-10 drop-shadow-lg">Contact Us</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-4xl w-full">
          {/* WhatsApp */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border-2 border-white/20 hover:bg-white/20 hover:-translate-y-2 transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <h3 className="text-2xl font-bold mb-3">📱 WhatsApp</h3>
            <a 
              href="https://wa.me/7990360899" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-lg hover:text-yellow-300 transition-colors underline"
            >
              Chat with us on WhatsApp
            </a>
          </div>

          {/* Call Us */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border-2 border-white/20 hover:bg-white/20 hover:-translate-y-2 transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <h3 className="text-2xl font-bold mb-3">📞 Call Us</h3>
            <a 
              href="tel:7990360899"
              className="text-lg hover:text-yellow-300 transition-colors underline"
            >
              +91 7990360899
            </a>
          </div>

          {/* Email */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border-2 border-white/20 hover:bg-white/20 hover:-translate-y-2 transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <h3 className="text-2xl font-bold mb-3">📧 Email</h3>
            <a 
              href="mailto:somyapadhiyar@gmail.com"
              className="text-lg hover:text-yellow-300 transition-colors underline"
            >
              somyapadhiyar@gmail.com
            </a>
          </div>

          {/* Location */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border-2 border-white/20 hover:bg-white/20 hover:-translate-y-2 transition-all duration-300 animate-fade-in-up md:col-span-2 lg:col-span-3" style={{ animationDelay: '0.4s' }}>
            <h3 className="text-2xl font-bold mb-3">📍 Location</h3>
            <p className="text-lg mb-3">Near Chavand Gate, Main Bazar, Lathi, Amreli, Gujarat, India</p>
            <iframe 
              src="https://maps.google.com/maps?q=Near%20Chavand%20Gate%2C%20Main%20Bazar%2C%20Lathi%2C%20Amreli%2C%20Gujarat%2C%20India&output=embed" 
              width="100%" 
              height="200" 
              style={{ border: 0 }} 
              allowFullScreen="" 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              className="rounded-lg"
            ></iframe>
          </div>

          {/* Address */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border-2 border-white/20 hover:bg-white/20 hover:-translate-y-2 transition-all duration-300 animate-fade-in-up col-span-1 md:col-span-2 lg:col-span-3" style={{ animationDelay: '0.5s' }}>
            <h3 className="text-2xl font-bold mb-3">🏠 Address</h3>
            <p className="text-lg">
              Neat Chavand Gate<br />
              Main Bazar<br />
              Lathi, Amreli, Gujarat, India<br />
              PIN: 365430
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/50 backdrop-blur-sm text-center py-5">
        <p className="text-base">Contact: somyapadhiyar@gmail.com | Phone: 7990360899</p>
      </footer>
    </div>
  )
}

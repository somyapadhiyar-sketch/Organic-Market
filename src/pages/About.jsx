import { Link } from 'react-router-dom'

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800 text-white flex flex-col font-sans">
      
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md shadow-lg border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-3xl font-bold drop-shadow-md">🌿 About Organic Market</h1>
          
          {/* NAVIGATION with ROPE ANIMATION */}
          <nav className="flex flex-wrap justify-center items-center gap-3">
             {[
               {name: 'Home', path: '/'},
               {name: '🍎 Fruits', path: '/fruits'},
               {name: '🥦 Vegetables', path: '/vegetables'},
               {name: '🌾 Pulses', path: '/pulses'},
               {name: '🛒 Cart', path: '/cart'}
             ].map((btn, idx) => (
               <Link 
                 key={btn.name} 
                 to={btn.path} 
                 className="px-5 py-2 bg-black/75 hover:bg-white hover:text-purple-600 border border-white/30 rounded-full transition-all text-sm font-bold backdrop-blur-sm animate-rope-drop"
                 style={{ animationDelay: `${idx * 0.1}s` }}
               >
                 {btn.name}
               </Link>
             ))}
          </nav>
        </div>
      </header>

      {/* About Section */}
      <section className="flex-grow flex flex-col justify-center items-center text-center py-12 px-5">
        <div className="max-w-4xl w-full space-y-8">
          <h2 className="text-4xl font-bold mb-10 drop-shadow-lg animate-fade-in-down">Contact Us</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* WhatsApp */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 hover:-translate-y-2 transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <h3 className="text-2xl font-bold mb-3">📱 WhatsApp</h3>
              <a 
                href="https://wa.me/7990360899" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-lg hover:text-yellow-300 transition-colors underline decoration-dotted"
              >
                Chat with us
              </a>
            </div>

            {/* Call Us */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 hover:-translate-y-2 transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <h3 className="text-2xl font-bold mb-3">📞 Call Us</h3>
              <a 
                href="tel:7990360899"
                className="text-lg hover:text-yellow-300 transition-colors underline decoration-dotted"
              >
                +91 7990360899
              </a>
            </div>

            {/* Email */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 hover:-translate-y-2 transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <h3 className="text-2xl font-bold mb-3">📧 Email</h3>
              <a 
                href="mailto:somyapadhiyar@gmail.com"
                className="text-lg hover:text-yellow-300 transition-colors underline decoration-dotted"
              >
                somyapadhiyar@gmail.com
              </a>
            </div>

            {/* Location */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 hover:-translate-y-2 transition-all duration-300 animate-fade-in-up md:col-span-2 lg:col-span-3" style={{ animationDelay: '0.4s' }}>
              <h3 className="text-2xl font-bold mb-3">📍 Location</h3>
              <p className="text-lg mb-3">Near Chavand Gate, Main Bazar, Lathi, Amreli, Gujarat, India</p>
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3707.458362660087!2d71.385!3d21.725!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjHCsDQzJzMwLjAiTiA3McKwMjMnMDYuMCJF!5e0!3m2!1sen!2sin!4v1600000000000!5m2!1sen!2sin" 
                width="100%" 
                height="250" 
                style={{ border: 0 }} 
                allowFullScreen="" 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                className="rounded-xl shadow-inner"
              ></iframe>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/50 backdrop-blur-sm text-center py-5 border-t border-white/10">
        <p className="text-base opacity-80">Contact: somyapadhiyar@gmail.com | Phone: 7990360899</p>
      </footer>
    </div>
  )
}
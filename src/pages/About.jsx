import { Link } from 'react-router-dom'

export default function About() {
  const navBtnStyle = "px-5 py-2 bg-slate-800 text-white font-bold rounded-full shadow-md hover:bg-slate-700 hover:scale-105 transition-all text-sm animate-rope-drop border border-slate-600"

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-gray-200 to-zinc-100 font-sans text-slate-800 flex flex-col">
      
      <header className="bg-white/40 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 animate-slide-down">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">ℹ️ About Us</h1>
          <nav className="flex flex-wrap justify-center gap-3">
             <Link to="/" className={navBtnStyle} style={{animationDelay: '0.1s'}}>Home</Link>
             <Link to="/fruits" className={navBtnStyle} style={{animationDelay: '0.2s'}}>Fruits</Link>
             <Link to="/vegetables" className={navBtnStyle} style={{animationDelay: '0.3s'}}>Vegetables</Link>
             <Link to="/pulses" className={navBtnStyle} style={{animationDelay: '0.4s'}}>Pulses</Link>
             <Link to="/cart" className={navBtnStyle} style={{animationDelay: '0.5s'}}>Cart</Link>
          </nav>
        </div>
      </header>
     
      <div className="flex-grow max-w-4xl mx-auto p-6 w-full animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        <div className="bg-white/80 backdrop-blur-md rounded-[2.5rem] p-10 border border-white/60 shadow-2xl text-center">
          <h2 className="text-4xl font-bold mb-6 text-slate-800">Our Mission</h2>
          <p className="text-lg text-slate-600 mb-12 leading-relaxed max-w-2xl mx-auto">
            We are dedicated to bringing the freshest organic produce directly from farmers to your table. No middlemen, no chemicals—just pure nature.
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              { icon: '🚜', title: 'Direct from Farm', desc: 'Sourced from certified organic farmers.' },
              { icon: '🚀', title: 'Fast Delivery', desc: 'Freshness delivered in 15 minutes.' },
              { icon: '✅', title: 'Quality Check', desc: 'Every item is handpicked & verified.' }
            ].map((item, idx) => (
               <div key={idx} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:shadow-lg transition-all">
                 <div className="text-4xl mb-3">{item.icon}</div>
                 <h3 className="font-bold text-slate-900 mb-2">{item.title}</h3>
                 <p className="text-sm text-slate-500">{item.desc}</p>
               </div>
            ))}
          </div>

          <div className="bg-slate-900 text-white p-8 rounded-2xl shadow-xl">
            <h3 className="text-2xl font-bold mb-4">Contact Us</h3>
            <p className="opacity-80 mb-2">📞 +91 7990360899</p>
            <p className="opacity-80 mb-6">📧 somyapadhiyar@gmail.com</p>
            <p className="text-sm opacity-50">Near Chavand Gate, Main Bazar, Lathi, Amreli, Gujarat</p>
          </div>
        </div>
      </div>
      
      <footer className="bg-white/50 text-center py-6">
        <p className="text-sm text-slate-500 font-bold">© 2026 Organic Market</p>
      </footer>
    </div>
  )
}
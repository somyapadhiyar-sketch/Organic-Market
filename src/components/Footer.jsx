export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 pt-12 pb-12 mt-16 font-sans">
      <div className="max-w-7xl mx-auto px-6 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-8">
        <div>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130 40" width="120" height="35" className="mb-2 mx-auto md:mx-0">
            <defs><linearGradient id="zg2" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#8b5cf6" /><stop offset="100%" stopColor="#d946ef" /></linearGradient></defs>
            <path d="M102,14 C102,8 110,8 110,8 C110,14 102,14 102,14 Z" fill="#10b981" />
            <text x="0" y="32" fontFamily="system-ui, sans-serif" fontSize="32" fontWeight="900" fill="url(#zg2)" letterSpacing="-1.5">zesty</text>
          </svg>
          <p className="text-sm font-bold text-slate-500 mt-2">100% Organic produce delivered in minutes.</p>
        </div>
        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 text-center md:text-right shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">24/7 Support Center</p>
          <p className="text-xl font-black text-slate-900 mb-1">📞 7990360899</p>
          <p className="text-sm font-black text-purple-600 hover:underline cursor-pointer">✉️ somyapadhiyar@gmail.com</p>
        </div>
      </div>
    </footer>
  )
}
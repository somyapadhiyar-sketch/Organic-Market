import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export default function Footer() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-10 mt-auto">
      <footer className="bg-blue-50 pt-12 pb-8 px-6 md:px-12 border border-blue-100 shadow-lg rounded-3xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          
          {/* Zesty Info */}
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-2xl font-black text-blue-600 tracking-tighter lowercase leading-none mb-4">zesty</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              The fastest and freshest grocery delivery service in town. 100% organic, straight from local farms to your doorstep.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-slate-800 mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/home" className="text-slate-500 hover:text-blue-600 flex items-center transition-colors">Home <ChevronRight size={14} className="ml-1" /></Link></li>
              <li><Link to="/user/fruits" className="text-slate-500 hover:text-blue-600 flex items-center transition-colors">Shop Fruits <ChevronRight size={14} className="ml-1" /></Link></li>
              <li><Link to="/user/vegetables" className="text-slate-500 hover:text-blue-600 flex items-center transition-colors">Shop Vegetables <ChevronRight size={14} className="ml-1" /></Link></li>
              <li><Link to="/user/pulses" className="text-slate-500 hover:text-blue-600 flex items-center transition-colors">Shop Pulses <ChevronRight size={14} className="ml-1" /></Link></li>
              <li><Link to="/user/oil" className="text-slate-500 hover:text-blue-600 flex items-center transition-colors">Shop Oils <ChevronRight size={14} className="ml-1" /></Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-bold text-slate-800 mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/user/about" className="text-slate-500 hover:text-blue-600 transition-colors">About Us</Link></li>
              <li><Link to="/login/delivery" className="text-slate-500 hover:text-blue-600 transition-colors">Delivery</Link></li>
              <li><Link to="/login/user" className="text-slate-500 hover:text-blue-600 transition-colors">User Login</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-slate-800 mb-4">Contact</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li>Email: <a href="mailto:somyapadhiyar@gmail.com" className="hover:text-blue-600 transition-colors">somyapadhiyar@gmail.com</a></li>
              <li>Phone: +91 7990360899</li>
              <li>Ahmedabad, Gujarat, India</li>
            </ul>
          </div>

        </div>
        <div className="mt-12 border-t border-blue-100 pt-6 text-center">
          <p className="text-xs text-blue-400 font-medium">
            &copy; {new Date().getFullYear()} Zesty. All Rights Reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
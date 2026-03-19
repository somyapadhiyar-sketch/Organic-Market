import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white pt-12 pb-8 px-4 md:px-8 border-t border-gray-100">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
        
        {/* Zesty Info */}
        <div className="col-span-2 md:col-span-1">
          <h3 className="text-2xl font-black text-blue-600 tracking-tighter lowercase leading-none mb-4">zesty</h3>
          <p className="text-sm text-gray-500 leading-relaxed">
            The fastest and freshest grocery delivery service in town. 100% organic, straight from local farms to your doorstep.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-bold text-gray-800 mb-4">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/home" className="text-gray-600 hover:text-blue-600 flex items-center">Home <ChevronRight size={14} className="ml-1" /></Link></li>
            <li><Link to="/user/fruits" className="text-gray-600 hover:text-blue-600 flex items-center">Shop Fruits <ChevronRight size={14} className="ml-1" /></Link></li>
            <li><Link to="/user/vegetables" className="text-gray-600 hover:text-blue-600 flex items-center">Shop Vegetables <ChevronRight size={14} className="ml-1" /></Link></li>
            <li><Link to="/user/pulses" className="text-gray-600 hover:text-blue-600 flex items-center">Shop Pulses <ChevronRight size={14} className="ml-1" /></Link></li>
          </ul>
        </div>

        {/* Company */}
        <div>
          <h4 className="font-bold text-gray-800 mb-4">Company</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/user/about" className="text-gray-600 hover:text-blue-600">About Us</Link></li>
            <li><Link to="/login/admin" className="text-gray-600 hover:text-blue-600">Admin</Link></li>
            <li><Link to="/login/delivery" className="text-gray-600 hover:text-blue-600">Delivery</Link></li>
            <li><Link to="/login/user" className="text-gray-600 hover:text-blue-600">User Login</Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-bold text-gray-800 mb-4">Contact</h4>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>Email: <a href="mailto:somyapadhiyar@gmail.com" className="hover:text-blue-600">somyapadhiyar@gmail.com</a></li>
            <li>Phone: +91 12345 67890</li>
            <li>Ahmedabad, Gujarat, India</li>
          </ul>
        </div>

      </div>
      <div className="mt-12 border-t border-gray-100 pt-6 text-center">
        <p className="text-xs text-gray-400 font-medium">
          &copy; {new Date().getFullYear()} Zesty. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}
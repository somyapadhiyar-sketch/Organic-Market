import { useEffect, useLayoutEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import Footer from '../components/Footer';
import WaveBanner from '../components/WaveBanner';

export default function Pulses() {
  const { products, searchQuery, currentUser } = useStore();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser?.role === 'admin') navigate('/admin', { replace: true });
    else if (currentUser?.role === 'delivery') navigate('/delivery', { replace: true });
  }, [currentUser, navigate]);
  
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  
  const categoryData = products.filter(p => String(p.category || '').toLowerCase() === 'pulses');

  const filteredData = (searchQuery && searchQuery.trim() !== '')
    ? categoryData.filter(p => (p.name || '').toLowerCase().includes(searchQuery.toLowerCase())) 
    : categoryData;

  return (
    <div className="min-h-screen bg-[#F4F6F9] font-sans flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        <WaveBanner theme="purple" title="Organic Pulses & Grains" subtitle="High protein, unpolished dals directly from the farm." className="!h-[350px] md:!h-[400px] pt-[140px] md:pt-[90px]" bottomColorClass="fill-[#F4F6F9]" />
        
        <div className="px-4 sm:px-6 lg:px-10 mt-8 mb-6 flex justify-between items-end">
          <div>
            <h2 className="text-[24px] font-black text-[#1C1C1C]">Organic Pulses & Grains</h2>
            <p className="text-gray-500 text-[14px] font-medium mt-1">Unpolished, protein-rich staples for your daily meals.</p>
          </div>
        </div>
        
        <div className="px-4 sm:px-6 lg:px-10">
          {filteredData.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {filteredData.map(item => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-slate-100"><h2 className="text-2xl font-bold text-slate-500">No such item in this section found.</h2></div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
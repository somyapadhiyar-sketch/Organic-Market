import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import Footer from '../components/Footer';

export default function Fruits() {
  const { products, searchQuery, currentUser } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser?.role === 'admin') navigate('/admin', { replace: true });
    else if (currentUser?.role === 'delivery') navigate('/delivery', { replace: true });
  }, [currentUser, navigate]);

  const categoryData = products.filter(p => p.category === 'Fruits');

  const filteredData = (searchQuery && searchQuery.trim() !== '')
    ? categoryData.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())) 
    : categoryData;

  return (
    <div className="min-h-screen bg-[#F4F6F9] font-sans flex flex-col">
      <Navbar />
      
      {/* 130px pt to clear the Zepto double-header */}
      <main className="px-4 sm:px-6 lg:px-10 pt-[140px] pb-12">
        <div className="mb-6 flex justify-between items-end">
          <div>
            <h2 className="text-[24px] font-black text-[#1C1C1C]">Buy Fresh Fruits Online</h2>
            <p className="text-gray-500 text-[14px] font-medium mt-1">Directly sourced, delivered in 10 minutes.</p>
          </div>
        </div>
        
        {filteredData.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filteredData.map(item => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-slate-100"><h2 className="text-2xl font-bold text-slate-500">No such item in this section found.</h2></div>
        )}
      </main>
      <Footer />
    </div>
  )
}
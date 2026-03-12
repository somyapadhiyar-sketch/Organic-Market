import { useStore } from '../context/StoreContext';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';

export default function Fruits() {
  const { products } = useStore();
  const categoryData = products.filter(p => p.category === 'Fruits');

  return (
    <div className="min-h-screen bg-[#F4F6F9] font-sans">
      <Navbar />
      
      {/* 130px pt to clear the Zepto double-header */}
      <main className="max-w-[1280px] mx-auto px-4 md:px-6 pt-[140px] pb-12">
        <div className="mb-6 flex justify-between items-end">
          <div>
            <h2 className="text-[24px] font-black text-[#1C1C1C]">Buy Fresh Fruits Online</h2>
            <p className="text-gray-500 text-[14px] font-medium mt-1">Directly sourced, delivered in 10 minutes.</p>
          </div>
        </div>
        
        {/* Zepto 6-column grid on large screens */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
          {categoryData.map(item => (
            <ProductCard key={item.id} product={item} />
          ))}
        </div>
      </main>
    </div>
  )
}
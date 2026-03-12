import { useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useStore } from '../context/StoreContext'
import Navbar from '../components/Navbar'

const quantityOptions = [{ value: 0.5, label: '500g' }, { value: 1, label: '1kg' }, { value: 2, label: '2kg' }, { value: 5, label: '5kg' }]

export default function ProductDetails() {
  const { state } = useLocation(); const navigate = useNavigate();
  const { addToCart } = useStore();
  const [quantity, setQuantity] = useState(1);
  useEffect(() => { if (!state?.product) navigate('/user/home') }, [state, navigate])
  if (!state?.product) return null;
  const { product } = state;

  return (
    <div className="min-h-screen bg-[#F4F6F9] font-sans text-[#1C1C1C]">
      <Navbar />
      <main className="max-w-[1000px] mx-auto px-4 md:px-6 pt-[150px] pb-16">
        
        <div className="flex items-center text-[13px] text-gray-500 mb-6 font-bold cursor-pointer hover:text-[#3B0060]" onClick={() => navigate(-1)}>
          ← Back to Shop
        </div>

        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-200 flex flex-col md:flex-row gap-10">
          
          {/* Zepto Image Box */}
          <div className="w-full md:w-[400px] bg-[#F8F8F8] rounded-xl p-8 flex items-center justify-center border border-gray-100 relative h-[400px]">
            <div className="absolute top-4 left-4 bg-blue-600 text-white text-[12px] font-bold px-3 py-1 rounded">10% OFF</div>
            <img 
              src={product.image} 
              alt={product.name} 
              className="max-h-[300px] w-auto object-contain mix-blend-multiply" 
              onError={(e) => { e.target.src = `https://placehold.co/400x400/F8F8F8/767676?text=${product.name}` }}
            />
          </div>

          <div className="flex-1 flex flex-col justify-center">
            <h1 className="text-[28px] font-black text-[#1C1C1C] mb-2">{product.name}</h1>
            <p className="text-[15px] font-medium text-[#767676] mb-6">{product.desc || 'Freshly sourced organic product.'}</p>
            
            <div className="flex items-end gap-3 mb-8 border-b border-gray-100 pb-6">
              <span className="text-[36px] font-black text-[#1C1C1C] leading-none">₹{product.price}</span>
              <span className="text-lg font-bold text-gray-400 line-through mb-1">₹{Math.round(product.price * 1.1)}</span>
              <span className="text-sm font-bold text-gray-500 mb-1.5 ml-2">/ 1 kg</span>
            </div>

            <div className="mb-8">
               <label className="text-[13px] font-bold text-gray-800 mb-2 block">Select Quantity</label>
               <select value={quantity} onChange={(e) => setQuantity(parseFloat(e.target.value))} className="w-full md:w-[60%] px-4 py-3 bg-white border border-gray-300 rounded-xl outline-none font-bold text-gray-900 text-base focus:border-[#FF3269]">
                 {quantityOptions.map(o => (<option key={o.value} value={o.value}>{o.label}</option>))}
               </select>
            </div>

            {/* Zepto Primary Add to Cart */}
            <button onClick={() => { addToCart(product.name, product.price, quantity, product.image, product.id); alert('Added to Cart!'); }} 
               className="w-full py-4 bg-[#FF3269] text-white font-bold text-[16px] rounded-xl hover:bg-[#E21B70] transition-colors flex justify-center items-center gap-2">
              ADD TO CART • ₹{Math.round(product.price * quantity)}
            </button>
            
            <div className="mt-8 bg-gray-50 p-4 rounded-xl flex items-center gap-4 border border-gray-100">
              <span className="text-2xl">⚡</span>
              <div>
                <p className="text-[14px] font-bold text-[#1C1C1C]">Superfast Delivery</p>
                <p className="text-[12px] font-medium text-gray-500">Get your order in 10 minutes.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
import { Link } from 'react-router-dom';
import { Plus, Minus } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export default function ProductCard({ product }) {
  const { cart, addToCart, decreaseCartQuantity } = useStore();
  const cartItem = cart.find(item => item.id === product.id);
  const currentQuantity = cartItem ? cartItem.quantity : 0;

  return (
    <div className="bg-white rounded-2xl p-3 border border-gray-200 hover:shadow-md transition-shadow flex flex-col h-full font-sans relative">
      
      {/* Zepto Discount Tag */}
      <div className="absolute top-0 left-4 bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded-b-md z-10">
        10% OFF
      </div>
      
      {/* Zepto Gray Image Box */}
      <Link to={`/user/product/${product.name}`} state={{ product }} className="block bg-[#F8F8F8] rounded-xl mb-3 p-4 h-36 flex items-center justify-center relative overflow-hidden mt-2">
        {product.disabled && <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-20"><span className="bg-gray-800 text-white font-bold px-3 py-1 rounded text-[11px]">Out of Stock</span></div>}
        
        {/* Bulletproof Image Fallback */}
        <img 
          src={product.image} 
          alt={product.name} 
          className="h-full object-contain mix-blend-multiply hover:scale-105 transition-transform duration-200" 
          onError={(e) => { e.target.src = `https://placehold.co/400x400/F8F8F8/767676?text=${product.name}` }}
        />
      </Link>
      
      <div className="flex-grow flex flex-col">
        <Link to={`/user/product/${product.name}`} state={{ product }}>
          <h3 className="text-[14px] font-bold text-[#1C1C1C] leading-snug mb-1 line-clamp-2">{product.name}</h3>
          <p className="text-[12px] font-medium text-[#767676] mb-3">1 kg</p>
        </Link>
        
        <div className="flex items-center justify-between mt-auto pt-2">
          <div className="flex flex-col">
            <span className="text-[11px] text-[#767676] line-through font-medium">₹{Math.round(product.price * 1.1)}</span>
            <span className="text-[15px] font-bold text-[#1C1C1C]">₹{product.price}</span>
          </div>

          {/* Zepto Add Button Logic */}
          {product.disabled ? (
            <button disabled className="px-4 py-1.5 bg-gray-100 text-gray-400 font-bold rounded-lg text-[12px]">Out of Stock</button>
          ) : currentQuantity > 0 ? (
            <div className="flex items-center bg-[#FF3269] text-white rounded-lg h-9 w-[76px] justify-between px-1 shadow-sm">
              <button onClick={(e) => { e.preventDefault(); decreaseCartQuantity(product.id, 1); }} className="h-full px-1 flex items-center justify-center"><Minus size={16} strokeWidth={3} /></button>
              <span className="font-bold text-[14px]">{currentQuantity}</span>
              <button onClick={(e) => { e.preventDefault(); addToCart(product.name, product.price, 1, product.image, product.id); }} className="h-full px-1 flex items-center justify-center"><Plus size={16} strokeWidth={3} /></button>
            </div>
          ) : (
            <button onClick={(e) => { e.preventDefault(); addToCart(product.name, product.price, 1, product.image, product.id); }} className="px-5 py-1.5 border border-[#FF3269] text-[#FF3269] bg-[#FFF5F7] hover:bg-[#FF3269] hover:text-white font-bold rounded-lg text-[13px] transition-colors shadow-sm">
              ADD
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
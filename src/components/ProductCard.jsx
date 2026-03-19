import { Link, useNavigate } from 'react-router-dom';
import { Plus, Minus, Heart } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export default function ProductCard({ product }) {
  const { cart, addToCart, decreaseCartQuantity, wishlist, toggleWishlist, showToast, currentUser } = useStore();
  const cartItem = cart.find(item => item.id === product.id);
  const currentQuantity = cartItem ? cartItem.quantity : 0;
  const navigate = useNavigate();
  const isInWishlist = wishlist.some(item => item.id === product.id);

  const handleAuthAction = (action) => {
    if (!currentUser) {
      showToast("Please login to shop!");
      navigate('/login');
    } else {
      action();
    }
  };

  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300 flex flex-col h-full font-sans relative group">
      
      {/* Zepto Discount Tag */}
      <div className="absolute top-0 left-4 bg-gradient-to-r from-green-600 to-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-b-lg shadow-sm z-10">
        10% OFF
      </div>

      {/* Wishlist Button */}
      <button 
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleAuthAction(() => { toggleWishlist(product); showToast && showToast(isInWishlist ? `${product.name} removed from wishlist` : `${product.name} added to wishlist`); }); }}
        className="absolute top-3 right-3 z-10 p-1.5 bg-white/70 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
      >
        <Heart size={18} className={`transition-all ${isInWishlist ? 'text-red-500 fill-red-500' : 'text-gray-500'}`} />
      </button>
      
      {/* Zepto Gray Image Box */}
      <Link to={`/user/product/${product.name}`} state={{ product }} className="block bg-[#F8F8F8] rounded-xl mb-4 p-4 h-48 flex items-center justify-center relative overflow-hidden mt-2">
        {product.disabled && <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-20"><span className="bg-gray-800 text-white font-bold px-3 py-1 rounded text-[11px]">Out of Stock</span></div>}
        
        {/* Bulletproof Image Fallback */}
        <img 
          src={product.image} 
          alt={product.name} 
          className="h-full object-contain mix-blend-multiply hover:scale-105 transition-transform duration-200" 
          onError={(e) => { 
            // Smart fallback: If .png fails, automatically try .jpg
            if (e.target.src.endsWith('.png')) {
              e.target.src = product.image.replace('.png', '.jpg');
            } else if (!e.target.src.includes('placehold.co')) {
              e.target.src = `https://placehold.co/400x400/F8F8F8/767676?text=${product.name.replace(/ /g, '+')}`;
            }
          }}
        />
      </Link>
      
      <div className="flex-grow flex flex-col">
        <Link to={`/user/product/${product.name}`} state={{ product }}>
          <h3 className="text-sm font-bold text-slate-800 leading-snug mb-1 line-clamp-2">{product.name}</h3>
          <p className="text-[12px] font-medium text-[#767676] mb-3">1 kg</p>
        </Link>
        
        <div className="mt-auto pt-2 space-y-3">
          <div className="flex flex-col">
            <span className="text-[11px] text-[#767676] line-through font-medium">₹{Math.round(product.price * 1.1)}</span>
            <span className="text-base font-bold text-slate-800">₹{product.price}</span>
          </div>

          {/* Zepto Add Button Logic */}
          <div className="flex items-center">
            {product.disabled ? (
              <button disabled className="w-full px-4 py-2 bg-slate-100 text-slate-400 font-bold rounded-lg text-sm">Out of Stock</button>
            ) : currentQuantity > 0 ? (
              <div className="flex items-center bg-slate-100 text-slate-800 rounded-lg h-9 w-full justify-between shadow-sm border border-slate-200">
                <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); decreaseCartQuantity(product.id, 1); }} className="h-full px-2 flex items-center justify-center rounded-l-lg hover:bg-slate-200 transition-colors"><Minus size={16} strokeWidth={3} /></button>
                <span className="font-bold text-sm">{currentQuantity}</span>
                <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToCart(product.name, product.price, 1, product.image, product.id); }} className="h-full px-2 flex items-center justify-center rounded-r-lg hover:bg-slate-200 transition-colors"><Plus size={16} strokeWidth={3} /></button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 w-full">
                <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleAuthAction(() => addToCart(product.name, product.price, 1, product.image, product.id)); }} className="px-3 py-2 border border-slate-300 text-slate-800 bg-white hover:bg-slate-50 font-bold rounded-lg text-sm transition-colors shadow-sm">
                  Add
                </button>
                <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleAuthAction(() => { addToCart(product.name, product.price, 1, product.image, product.id); navigate('/user/cart'); }); }} className="px-3 py-2 bg-slate-800 text-white font-bold rounded-lg text-sm transition-colors shadow-sm hover:bg-slate-700">
                  Buy Now
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

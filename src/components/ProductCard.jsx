import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { Plus, Minus, Heart, Star } from 'lucide-react';

export default function ProductCard({ product }) {
  const { cart, addToCart, decreaseCartQuantity, wishlist, toggleWishlist, showToast } = useStore();

  if (!product) return null;

  const cartItem = cart.find(item => item.id === product.id);
  const quantity = cartItem ? cartItem.quantity : 0;
  const isInWishlist = wishlist.some(item => item.id === product.id);
  const isOutOfStock = product.disabled || product.stock <= 0;

  const finalPrice = Number(product.price || 0);
  const originalPrice = Number(product.originalPrice || Math.round(finalPrice * 1.25));
  const discount = originalPrice > 0 ? Math.round(((originalPrice - finalPrice) / originalPrice) * 100) : 0;

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
    showToast(isInWishlist ? `${product.name} removed from wishlist` : `${product.name} added to wishlist`);
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product.name, product.price, 1, product.image, product.id);
    if (showToast) showToast(`Added ${product.name} to cart!`);
  };

  const handleIncrease = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product.name, product.price, 1, product.image, product.id);
  };

  const handleDecrease = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const qtyToRemove = quantity >= 1 ? 1 : quantity;
    decreaseCartQuantity(product.id, qtyToRemove);
  };

  return (
    <Link 
      to={`/user/product/${product.name}`} 
      state={{ product }} 
      className="group border border-slate-100 rounded-3xl p-4 bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-full relative"
    >
      <div className="relative">
        <div className="h-40 w-full bg-gray-50 rounded-xl flex items-center justify-center p-4 mb-4 overflow-hidden">
          <img 
            src={product.image} 
            alt={product.name} 
            className="max-w-full max-h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105" 
            onError={(e) => { e.target.src = `https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=400&auto=format&fit=crop` }}
          />
        </div>
        
        {/* Discount Badge */}
        {discount > 0 && !isOutOfStock && (
          <span className="absolute top-2 left-2 bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wide shadow-sm z-10">
            {discount}% OFF
          </span>
        )}

        {isOutOfStock && (
          <span className="absolute top-2 left-2 bg-red-100 text-red-700 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide border border-red-200 z-10">
            Out of Stock
          </span>
        )}
        
        <button 
          onClick={handleWishlistToggle} 
          className="absolute top-2 right-2 p-2 bg-white/70 backdrop-blur-sm rounded-full text-slate-500 hover:text-red-500 transition-colors z-10"
        >
          <Heart size={18} fill={isInWishlist ? '#ef4444' : 'none'} className={isInWishlist ? 'text-red-500' : ''} />
        </button>
      </div>

      <div className="flex-1 flex flex-col">
        <h3 className="font-bold text-gray-800 text-base leading-tight line-clamp-2 flex-1">{product.name}</h3>
        
        {/* Rating Stars */}
        <div className="flex items-center gap-1 mt-1 mb-2">
          <div className="flex text-amber-400">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={11} fill={i < Math.round(product.rating || 4.5) ? "currentColor" : "none"} className="stroke-1" />
            ))}
          </div>
          <span className="text-[10px] text-gray-400 font-bold">({product.reviews || 24})</span>
        </div>

        <div className="flex items-center justify-between mt-1">
          <p className="text-sm text-gray-500">{`1 ${product.unit || 'kg'}`}</p>
          <div className="flex items-baseline gap-1.5 md:hidden">
            <span className="font-extrabold text-base text-gray-900">₹{finalPrice}</span>
            {discount > 0 && <span className="text-xs text-gray-400 line-through font-semibold">₹{originalPrice}</span>}
          </div>
        </div>
      </div>

      <div className="flex justify-end md:justify-between items-center mt-3 md:mt-4 w-full">
        <div className="hidden md:flex flex-col">
          <div className="flex items-baseline gap-1.5">
            <span className="font-extrabold text-lg text-gray-900">₹{finalPrice}</span>
            {discount > 0 && <span className="text-xs text-gray-400 line-through font-semibold">₹{originalPrice}</span>}
          </div>
        </div>
        
        <div className="w-full md:w-auto">
          {isOutOfStock ? (
            <button disabled className="btn-3d btn-danger w-full md:w-auto px-4 py-2 font-bold text-[13px] opacity-70 cursor-not-allowed">Out of Stock</button>
          ) : quantity > 0 ? (
            <div className="flex items-center justify-between md:justify-center w-full md:w-auto bg-white border border-gray-200 rounded-full h-10 shadow-sm overflow-hidden z-10 relative">
              <button onClick={handleDecrease} className="h-full w-10 md:w-9 flex items-center justify-center p-0 rounded-none border-none shadow-none text-slate-500 bg-slate-50 hover:bg-slate-200 transition-colors"><Minus size={14} strokeWidth={3}/></button>
              <span className="font-bold text-[13px] flex-1 md:flex-none md:w-8 text-center bg-white text-gray-800 z-10">{quantity}</span>
              <button onClick={handleIncrease} className="h-full w-10 md:w-9 flex items-center justify-center p-0 rounded-none border-none shadow-none text-green-700 bg-green-50 hover:bg-green-100 transition-colors"><Plus size={14} strokeWidth={3}/></button>
            </div>
          ) : (
            <button onClick={handleAddToCart} className="btn-3d btn-emerald w-full md:w-auto px-4 py-2 flex items-center justify-center gap-2 font-bold text-[13px]">
              <Plus size={14} strokeWidth={3}/> Add
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useLayoutEffect } from 'react'
import { useStore } from '../context/StoreContext'
import { Heart, ShoppingBag, Trash2, Plus, Minus } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function Wishlist() {
  const { wishlist, toggleWishlist, addToCart, showToast, cart, decreaseCartQuantity, currentUser } = useStore()
  const navigate = useNavigate()
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    if (currentUser?.role === 'admin') navigate('/admin', { replace: true });
    else if (currentUser?.role === 'delivery') navigate('/delivery', { replace: true });
  }, [currentUser, navigate]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 md:px-6 pt-[140px] pb-20 w-full">
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">My Wishlist</h1>
          <p className="text-slate-500 mt-2 font-medium">Your collection of favorite items.</p>
        </div>

        {wishlist.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-lg border border-slate-100">
            <Heart size={64} className="mx-auto text-slate-300" />
            <h2 className="text-2xl font-bold mt-6 text-slate-700">Your wishlist is empty</h2>
            <p className="text-slate-500 mt-2 mb-8">Add your favorite items to your wishlist to see them here.</p>
            <Link to="/user/fruits">
              <button className="px-8 py-3 btn-3d btn-lime font-bold shadow-lg">
                Explore Products
              </button>
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-lg">
            <div className="space-y-4">
            {wishlist.map((item) => {
              const cartItem = cart.find(cartItem => cartItem.id === item.id);
              const currentQuantity = cartItem ? cartItem.quantity : 0;

              return (
                <div key={item.id} className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5 p-4 border-b border-slate-100 last:border-0 hover:bg-slate-50 rounded-xl transition-colors">
                  <div className="flex items-center gap-4 flex-1">
                    <Link to={`/user/product/${item.name}`} state={{ product: item }} className="w-20 h-20 bg-slate-100 rounded-lg p-2 flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-contain" onError={(e) => { e.target.src = `https://placehold.co/100x100/F8F8F8/767676?text=Img` }} />
                    </Link>
                    <div className="flex-1">
                      <Link to={`/user/product/${item.name}`} state={{ product: item }}>
                        <h3 className="font-bold text-slate-800">{item.name}</h3>
                      </Link>
                      <p className="text-lg font-extrabold text-slate-800 mt-1">₹{item.price}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-3 mt-2 sm:mt-0 w-full sm:w-auto">
                    {currentQuantity > 0 ? (
                      <div className="flex items-center bg-slate-100 text-slate-800 rounded-xl h-10 shadow-sm border border-slate-200">
                        <button onClick={() => decreaseCartQuantity(item.id, 1)} className="px-3 h-full flex items-center justify-center rounded-l-xl hover:bg-slate-200 transition-colors"><Minus size={14} strokeWidth={3}/></button>
                        <span className="font-bold text-sm w-8 text-center">{currentQuantity}</span>
                        <button onClick={() => addToCart(item.name, item.price, 1, item.image, item.id)} className="px-3 h-full flex items-center justify-center rounded-r-xl hover:bg-slate-200 transition-colors"><Plus size={14} strokeWidth={3}/></button>
                      </div>
                    ) : (
                      <button onClick={() => { addToCart(item.name, item.price, 1, item.image, item.id); showToast(`${item.name} added to cart`); }} className="p-2.5 bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors" title="Add to Cart">
                        <ShoppingBag size={18} />
                      </button>
                    )}
                    <button onClick={() => { toggleWishlist(item); showToast(`${item.name} removed from wishlist`); }} className="p-2.5 btn-3d btn-danger text-sm font-bold transition-colors" title="Remove from Wishlist">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              )
            })}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useLayoutEffect } from 'react'
import { useStore } from '../context/StoreContext'
import { Heart } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ProductCard from '../components/ProductCard'

export default function Wishlist() {
  const { wishlist, currentUser } = useStore()
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
      
      <main className="max-w-7xl mx-auto px-4 md:px-6 pt-[120px] w-full flex-1">
        <div className="mb-10 text-center">
          <h1 className="text-4xl sm:text-5xl font-black text-slate-800 tracking-tight">My Wishlist</h1>
          <p className="text-lg text-slate-500 mt-3 font-medium max-w-xl mx-auto">Your hand-picked collection of favorite items. Ready to add them to your cart?</p>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {wishlist.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
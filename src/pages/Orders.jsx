import React, { useEffect, useState, useLayoutEffect } from"react";
import { Link, useNavigate, useLocation } from"react-router-dom";
import { useStore } from"../context/StoreContext";
import Navbar from"../components/Navbar";
import { ShoppingBag, Package, Tag, CreditCard, Motorbike, Search as SearchIcon, Phone } from 'lucide-react'; 
import Footer from"../components/Footer";

export default function Orders() {
  const navigate = useNavigate();
  const { currentUser, orders, addToCart, showToast, products } = useStore();
  const { pathname } = useLocation();
  const [userOrders, setUserOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const filterOptions = ["All","Out for Delivery","Pending","Delivered"];

  useEffect(() => {
    if (!currentUser) {
      navigate("/login/user");
      return;
    }
    if (currentUser.role === 'admin') {
      navigate('/admin', { replace: true });
      return;
    } else if (currentUser.role === 'delivery') {
      navigate('/delivery', { replace: true });
      return;
    }

    const filteredOrders = orders.filter(
      o => o.customer?.phone === currentUser.phone || o.customer?.name === currentUser.name
    );
    setUserOrders(filteredOrders);
  }, [navigate, currentUser, orders]);

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  const formatPrice = (priceVal) => {
    return new Intl.NumberFormat("en-IN", {
      style:"currency",
      currency:"INR",
      maximumFractionDigits: 0
    }).format(priceVal);
  };

  const handleBuyAgain = (order) => {
    (order.items || []).forEach((item) => {
      addToCart(item.name, item.price, item.quantity || 1, item.image, item.id);
    });
    showToast("Items from order added to cart!");
    navigate("/user/cart");
  };

  if (!currentUser) return null;

  // Sorting logic to prioritize active deliveries
  const statusWeight = { "Pending": 1, "Out for Delivery": 2, "Delivered": 3 };

  const displayOrders = userOrders
    .filter(o => statusFilter ==="All" || o.status === statusFilter)
    .sort((a, b) => (statusWeight[a.status] || 99) - (statusWeight[b.status] || 99));

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      <Navbar />
      
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 pt-[140px] pb-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight"><Package className="inline-block mr-2 translate-y-[2px]" size={28} /> My Orders</h1>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-48 shrink-0">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="w-full flex items-center justify-between px-4 py-3 sm:py-2.5 bg-white border border-slate-200 rounded-xl text-base sm:text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all shadow-sm cursor-pointer"
              >
                <span>{statusFilter ==="All" ?"All Orders" : statusFilter}</span>
                <span className={`text-[10px] text-slate-400 transition-transform duration-200 ${isFilterOpen ? 'rotate-180' : ''}`}>▼</span>
              </button>
              
              {isFilterOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsFilterOpen(false)}></div>
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    {filterOptions.map(option => (
                      <button
                        key={option}
                        onClick={() => { setStatusFilter(option); setIsFilterOpen(false); }}
                        className={`w-full text-left px-4 py-3 text-sm font-bold transition-colors ${statusFilter === option ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'}`}
                      >
                        {option ==="All" ?"All Orders" : option}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            <Link to="/user/fruits" className="text-sm font-bold text-blue-600 bg-blue-50 px-5 py-2.5 rounded-xl hover:bg-blue-100 transition-colors w-full sm:w-auto text-center whitespace-nowrap">
              Continue Shopping
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-8">
          {displayOrders.length > 0 ? (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
              {displayOrders.map((order, index) => (
                <div key={index} className="border border-slate-200 rounded-2xl p-5 bg-slate-50 transition-colors hover:border-blue-300">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-2">
                    <div>
                      <span className="font-black text-slate-900 block text-lg">{order.id}</span>
                      <span className="text-xs font-bold text-slate-400">{order.date}</span>
                    </div>
                    <span className={`px-3 py-1 rounded-lg text-xs font-bold w-max ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' : order.status === 'Out for Delivery' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                      {order.status}
                    </span>
                  </div>

                  <div className="space-y-3 border-t border-slate-200 pt-4">
                    {(order.items || []).slice(0, 3).map((item, idx) => {
                      const product = products.find(p => p.id === item.id) || {};
                      const unit = product.category === 'Oil' ? 'L' : 'kg';
                      return (
                      <div key={idx} className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 p-1 flex-shrink-0">
                            <img src={item.image} alt={item.name} className="w-full h-full object-contain mix-blend-multiply" />
                          </div>
                          <span className="font-bold text-slate-700">{item.name}</span>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className="font-bold text-slate-900 bg-white px-3 py-1 rounded-lg border border-slate-200">Qty: {item.quantity}{unit}</span>
                          <span className="text-xs font-bold text-slate-500">₹{Math.round(item.price * item.quantity)}</span>
                        </div>
                      </div>
                    )})}
                    {(order.items || []).length > 3 && <p className="text-xs font-bold text-slate-500 text-center bg-slate-200/50 py-2 rounded-lg">+{(order.items || []).length - 3} more items</p>}
                  </div>

                  <div className="space-y-2 border-t border-slate-200 mt-4 pt-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-medium text-slate-500">Item Total</span>
                      <span className="font-bold text-slate-700">₹{(order.items || []).reduce((total, item) => total + ((item.price || 0) * (item.quantity || 1)), 0)}</span>
                    </div>
                    {order.couponCode ? (
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-bold text-green-600 flex items-center gap-1"><Tag size={14} className="inline" /> Offer Applied ({order.couponCode})</span>
                        <span className="font-bold text-green-600">-₹{order.discountAmount}</span>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center text-sm text-slate-500">
                        <span className="font-medium flex items-center gap-1"><Tag size={14} className="inline" /> Offer Applied</span>
                        <span className="font-medium italic">No code used</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-2">
                      <span className="font-bold text-slate-500 flex items-center gap-1"><CreditCard size={14} className="inline" /> Payment Method</span>
                      <span className="font-bold text-slate-700">
                        {order.paymentMethod === 'COD' ? 'Cash on Delivery' : order.paymentMethod === 'NetBanking' ? 'Net Banking' : order.paymentMethod}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <span className="font-bold text-slate-500">Grand Total</span>
                      <span className="font-black text-slate-900 text-xl">{formatPrice(order.total)}</span>
                    </div>
                  </div>

                  {/* Delivery Partner Tracking Widget */}
                  {order.deliveryPartner && (
                    <div className={`mt-4 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${order.status === 'Delivered' ? 'bg-slate-50 border border-slate-200' : 'bg-orange-50 border border-orange-100'}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-xl shadow-inner uppercase shrink-0 ${order.status === 'Delivered' ? 'bg-slate-200 text-slate-600' : 'bg-orange-200 text-orange-700'}`}>
                          {order.deliveryPartner.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900">{order.deliveryPartner.name}</p>
                          <p className="text-[11px] font-bold text-slate-500 mt-0.5 flex items-center gap-1">
                            <span>{order.status === 'Delivered' ? <><Package size={12} className="inline-block mr-1 translate-y-[-1px]" /> Delivered by</> : <><Motorbike size={12} className="inline-block mr-1 translate-y-[-1px]" /> Delivery Partner</>}</span>
                            <span>•</span>
                            <span className="text-slate-700">{order.deliveryPartner.phone}</span>
                          </p>
                        </div>
                      </div>
                      {order.status !== 'Delivered' && (
                        <a href={`tel:${order.deliveryPartner.phone}`} className="flex w-full sm:w-auto items-center justify-center gap-2 px-5 py-2.5 bg-white border border-orange-200 text-orange-700 font-bold text-xs rounded-xl hover:bg-orange-50 transition-colors shadow-sm whitespace-nowrap">
                          <Phone size={14} className="inline mr-1" /> Call {order.deliveryPartner.name.split(' ')[0]}
                        </a>
                      )}
                    </div>
                  )}
                  {order.deliveryPartner && order.status === 'Out for Delivery' && (
                    <p className="text-[10px] font-bold text-slate-500 mt-2 text-center bg-slate-100 p-2 rounded-lg leading-relaxed">
                    <Motorbike size={14} className="inline-block mr-1 translate-y-[-1px]" /> Please be polite and respectful. Our partners brave all weather conditions to deliver your order safely!
                    </p>
                  )}

                  <div className="flex flex-wrap gap-3 mt-5">
                    <button onClick={() => handleBuyAgain(order)} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors shadow-sm">
                      Buy Again
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : userOrders.length > 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <SearchIcon size={64} className="mb-4 text-slate-300" />
              <p className="text-slate-800 font-bold text-lg">No orders found</p>
              <p className="text-slate-500 mt-1">You don't have any orders marked as"{statusFilter}".</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <ShoppingBag size={80} className="mb-4 text-slate-300" />
              <p className="text-slate-800 font-bold text-lg">No orders yet</p>
              <Link to="/user/fruits" className="btn-3d btn-lime mt-4 px-8 py-3.5 font-bold text-sm">Start Shopping</Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
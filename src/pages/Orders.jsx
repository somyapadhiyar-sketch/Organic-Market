import React, { useEffect, useState, useLayoutEffect } from"react";
import { Link, useNavigate, useLocation } from"react-router-dom";
import { useStore } from"../context/StoreContext";
import Navbar from"../components/Navbar";
import { ShoppingBag, Package, CreditCard, Motorbike, Search as SearchIcon, Phone, Tag } from 'lucide-react'; 
import Footer from"../components/Footer";

export default function Orders() {
  const navigate = useNavigate();
  const { currentUser, orders, addToCart, showToast, products } = useStore();
  const { pathname } = useLocation();
  const [userOrders, setUserOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [expandedOrders, setExpandedOrders] = useState({});

  const filterOptions = ["All","Out for Delivery","Pending","Delivered"];

  useEffect(() => {
    if (!currentUser) {
      navigate("/login/user", { state: { from: '/user/orders' } });
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

  const toggleExpand = (orderId) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
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
      
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 pt-[140px]">
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
                <div key={index} className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  
                  {/* Header Area */}
                  <div className="bg-slate-50/80 border-b border-slate-100 p-4 sm:px-6 sm:py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-black text-slate-800 uppercase tracking-wide">Order ID: {order.id}</span>
                        <span className="text-xs font-bold text-slate-500 bg-slate-200/50 px-2.5 py-0.5 rounded-md">{order.date}</span>
                      </div>
                      {order.deliveryOtp && order.status !== 'Delivered' && (
                        <p className="text-xs font-bold text-orange-600 mt-2 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span>
                          Delivery OTP: <span className="text-sm font-black tracking-widest bg-orange-100 px-1.5 py-0.5 rounded border border-orange-200">{order.deliveryOtp}</span>
                        </p>
                      )}
                    </div>
                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold w-max border ${order.status === 'Delivered' ? 'bg-green-50 text-green-600 border-green-200' : order.status === 'Out for Delivery' ? 'bg-blue-50 text-blue-600 border-blue-200' : order.deliveryPartnerEmail === 'online_broadcast' ? 'bg-yellow-50 text-yellow-600 border-yellow-200' : 'bg-orange-50 text-orange-600 border-orange-200'}`}>
                      {order.status === 'Pending' ? (order.deliveryPartnerEmail === 'online_broadcast' ? 'Assigning Partner...' : 'Processing') : order.status}
                    </span>
                  </div>

                  {/* Body Content Area */}
                  <div className="p-4 sm:p-6 flex flex-col md:flex-row gap-6 md:gap-8">
                    
                    {/* Left: Items list */}
                    <div className="flex-1 space-y-4">
                      {(() => {
                        const isExpanded = expandedOrders[order.id];
                        const itemsToShow = isExpanded ? (order.items || []) : (order.items || []).slice(0, 3);
                        const hiddenCount = (order.items || []).length - 3;
                        return (
                          <>
                            {itemsToShow.map((item, idx) => {
                              const product = products.find(p => p.id === item.id) || {};
                              const unit = product.category === 'Oil' ? 'L' : 'kg';
                              return (
                                <div key={idx} className="flex items-center gap-3 sm:gap-4 animate-in fade-in slide-in-from-top-1">
                                  <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 p-2 flex-shrink-0">
                                    <img src={item.image} alt={item.name} className="w-full h-full object-contain mix-blend-multiply" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-bold text-slate-800 text-sm truncate">{item.name}</p>
                                    <p className="text-xs font-bold text-slate-500 mt-0.5">{item.quantity}{unit} × ₹{item.price}</p>
                                  </div>
                                  <div className="text-right shrink-0">
                                    <p className="font-black text-slate-800 text-sm">₹{Math.round(item.price * item.quantity)}</p>
                                  </div>
                                </div>
                              )
                            })}
                            {hiddenCount > 0 && (
                              <button onClick={() => toggleExpand(order.id)} className="text-xs font-bold text-blue-600 mt-2 bg-blue-50 hover:bg-blue-100 transition-colors inline-block px-3 py-1.5 rounded-lg cursor-pointer">
                                {isExpanded ? "Show less" : `+${hiddenCount} more items`}
                              </button>
                            )}
                          </>
                        )
                      })()}
                    </div>

                    {/* Right: Summary & Tracking */}
                    <div className="md:w-64 shrink-0 flex flex-col gap-4 border-t md:border-t-0 md:border-l border-slate-100 pt-5 md:pt-0 md:pl-8">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Order Total</p>
                        <p className="text-3xl font-black text-slate-900">{formatPrice(order.total)}</p>
                        
                        {order.couponCode && (
                          <p className="text-xs font-bold text-green-600 mt-1.5 flex items-center gap-1"><Tag size={12} /> Saved ₹{order.discountAmount} ({order.couponCode})</p>
                        )}
                        <p className="text-xs font-bold text-slate-500 mt-1.5 flex items-center gap-1.5">
                          <CreditCard size={14} className="text-slate-400" /> 
                          {order.paymentMethod === 'COD' ? 'Cash on Delivery' : order.paymentMethod === 'NetBanking' ? 'Net Banking' : order.paymentMethod}
                        </p>
                      </div>

                      {order.deliveryPartner && (
                        <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Delivery Partner</p>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-white border border-slate-200 shadow-sm rounded-full flex items-center justify-center text-xs font-black text-slate-600 shrink-0 uppercase">
                              {order.deliveryPartner.name.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-slate-800 truncate">{order.deliveryPartner.name}</p>
                              <p className="text-[10px] font-bold text-slate-500 truncate">{order.deliveryPartner.phone}</p>
                            </div>
                            {order.status !== 'Delivered' && (
                              <a href={`tel:${order.deliveryPartner.phone}`} className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center hover:bg-blue-200 transition-colors shrink-0">
                                <Phone size={14} />
                              </a>
                            )}
                          </div>
                        </div>
                      )}

                      <button onClick={() => handleBuyAgain(order)} className="w-full py-3 bg-white border border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50 rounded-xl font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-2 mt-auto">
                        <ShoppingBag size={16} /> Buy Again
                      </button>
                    </div>
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
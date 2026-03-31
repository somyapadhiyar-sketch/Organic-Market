import { useState, useEffect } from 'react'
import { useStore } from '../context/StoreContext'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Plus, LogOut, Search, Mic, Edit, Trash2, PackagePlus, PowerOff, MapPin } from 'lucide-react'
import PartnerDetailsModal from '../components/PartnerDetailsModal'
import AdminSales from '../components/AdminSales'

export default function Admin() {
  const { products, toggleProductStatus, deleteProduct, editProduct, deliveryPartners, approveDelivery, orders, logout, updateOrderStatus, showToast } = useStore()
  const navigate = useNavigate();
  const location = useLocation();
  const initialTab = location.pathname.includes('sales') ? 'sales' : location.pathname.includes('vegetables') ? 'vegetables' : location.pathname.includes('pulses') ? 'pulses' : location.pathname.includes('orders') ? 'orders' : location.pathname.includes('delivery') ? 'delivery' : location.pathname.includes('oil') ? 'oil' : 'fruits';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [isRefilling, setIsRefilling] = useState(false);
  const [refillAmount, setRefillAmount] = useState('');
  const [selectedPartner, setSelectedPartner] = useState(null);

  const selectedProduct = products.find(p => p.id === selectedProductId);
  const handleTabSwitch = (tab) => { 
    navigate(`/admin/${tab}`); 
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    const currentTab = location.pathname.includes('sales') ? 'sales' : location.pathname.includes('vegetables') ? 'vegetables' : location.pathname.includes('pulses') ? 'pulses' : location.pathname.includes('orders') ? 'orders' : location.pathname.includes('delivery') ? 'delivery' : location.pathname.includes('oil') ? 'oil' : 'fruits';
    setActiveTab(currentTab);
    setSelectedProductId(null);
    setIsRefilling(false);
    setRefillAmount('');
  }, [location.pathname]);

  // Stats calculation
  const totalProducts = products.length;
  const outOfStock = products.filter(p => p.disabled).length;
  const pendingOrders = orders.filter(o => o.status === 'Pending').length;

  // Voice Search Handler
  const startListening = () => {
    if (isListening) return;
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      return alert("Voice search is not supported in this browser.");
    }
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = true;
      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = (e) => { console.error(e); setIsListening(false); };
      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
        setSearchQuery(transcript);
      };
      recognition.start();
  };

  // Filter Helpers
  const filteredProducts = products.filter(p => {
    const matchesSearch = (p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || (p.category || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'fruits' ? String(p.category || '').toLowerCase() === 'fruits' : activeTab === 'vegetables' ? String(p.category || '').toLowerCase() === 'vegetables' : activeTab === 'pulses' ? String(p.category || '').toLowerCase() === 'pulses' : activeTab === 'oil' ? String(p.category || '').toLowerCase() === 'oil' : true;
    return matchesSearch && matchesTab;
  });
  const filteredOrders = orders.filter(o => (o.id || '').toLowerCase().includes(searchQuery.toLowerCase()) || (o.customer?.name || '').toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredPartners = deliveryPartners.filter(d => (d.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || (d.email || '').toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="min-h-screen w-full bg-[#F4F6F9] font-sans text-[#1C1C1C]">
      
      {/* Top Navbar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="px-4 md:px-6 py-3 flex flex-col md:flex-row justify-between items-center gap-4">
          
          <div className="flex items-center gap-3 w-full md:w-auto shrink-0 justify-between md:justify-start">
            <span className="text-[28px] sm:text-[32px] font-black italic tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 group-hover:from-green-500 group-hover:to-emerald-500 transition-all duration-500 cursor-default">Zesty</span>
            <div className="flex md:hidden gap-2">
              <Link to="/admin/add-product" className="p-2 px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors rounded-xl shadow-sm">
                <Plus size={18} />
              </Link>
              <button onClick={() => { logout(); navigate('/home', { replace: true }); }} className="p-2 px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors rounded-xl shadow-sm">
                <LogOut size={18} />
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 w-full max-w-2xl px-0 md:px-6">
            <div className="flex items-center bg-[#F4F5F7] rounded-xl h-[44px] px-4 border border-transparent focus-within:bg-white focus-within:border-blue-500 focus-within:shadow-sm transition-all">
              <Search size={18} className="text-gray-400 mr-3" />
              <input 
                type="text" 
                placeholder={`Search ${activeTab}...`} 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent outline-none w-full text-sm font-medium text-gray-800"
              />
              <button type="button" onClick={startListening} className={`p-2 -mr-2 rounded-full transition-colors ${isListening ? 'text-red-500 animate-pulse' : 'text-gray-500 hover:bg-gray-200'}`}>
                <Mic size={18} strokeWidth={isListening ? 3 : 2} />
              </button>
            </div>
          </div>

          <div className="hidden md:flex gap-3 shrink-0">
            <Link to="/admin/add-product" className="btn-3d btn-emerald px-4 py-2 font-bold text-[13px] gap-2 whitespace-nowrap shadow-sm">
              <Plus size={16} /> Add Product
            </Link>
            <button onClick={() => { logout(); navigate('/home', { replace: true }); }} className="btn-3d btn-danger px-4 py-2 font-bold text-[13px] gap-2 whitespace-nowrap shadow-sm">
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>

        {/* Category Navbar */}
        <div className="flex items-center justify-start px-4 md:px-6 gap-6 md:gap-8 bg-white overflow-x-auto no-scrollbar">
          <button onClick={() => handleTabSwitch('fruits')} className={`py-3.5 text-[14px] font-bold whitespace-nowrap transition-colors ${activeTab === 'fruits' ? 'text-[#3B0060] border-b-[3px] border-[#3B0060]' : 'text-gray-500 hover:text-gray-900'}`}>🍎 Fruits</button>
          <button onClick={() => handleTabSwitch('vegetables')} className={`py-3.5 text-[14px] font-bold whitespace-nowrap transition-colors ${activeTab === 'vegetables' ? 'text-[#3B0060] border-b-[3px] border-[#3B0060]' : 'text-gray-500 hover:text-gray-900'}`}>🥦 Vegetables</button>
          <button onClick={() => handleTabSwitch('pulses')} className={`py-3.5 text-[14px] font-bold whitespace-nowrap transition-colors ${activeTab === 'pulses' ? 'text-[#3B0060] border-b-[3px] border-[#3B0060]' : 'text-gray-500 hover:text-gray-900'}`}>🌾 Pulses</button>
          <button onClick={() => handleTabSwitch('oil')} className={`py-3.5 text-[14px] font-bold whitespace-nowrap transition-colors ${activeTab === 'oil' ? 'text-[#3B0060] border-b-[3px] border-[#3B0060]' : 'text-gray-500 hover:text-gray-900'}`}>🪔 Oil</button>
          <button onClick={() => handleTabSwitch('orders')} className={`py-3.5 text-[14px] font-bold whitespace-nowrap flex items-center gap-2 transition-colors ${activeTab === 'orders' ? 'text-[#3B0060] border-b-[3px] border-[#3B0060]' : 'text-gray-500 hover:text-gray-900'}`}>
            🛍️ Orders {pendingOrders > 0 && <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">{pendingOrders}</span>}
          </button>
          <button onClick={() => handleTabSwitch('delivery')} className={`py-3.5 text-[14px] font-bold whitespace-nowrap flex items-center gap-2 transition-colors ${activeTab === 'delivery' ? 'text-[#3B0060] border-b-[3px] border-[#3B0060]' : 'text-gray-500 hover:text-gray-900'}`}>
            🚚 Delivery Partners
          </button>
          <button onClick={() => handleTabSwitch('sales')} className={`py-3.5 text-[14px] font-bold whitespace-nowrap flex items-center gap-2 transition-colors ${activeTab === 'sales' ? 'text-[#3B0060] border-b-[3px] border-[#3B0060]' : 'text-gray-500 hover:text-gray-900'}`}>
            📈 Sales Analytics
          </button>
        </div>
      </header>

      <main className="w-full py-6 px-4 md:px-6">
        
        {/* Quick Stats Grid */}
        {activeTab === 'orders' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-center">
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1">Total Products</p>
              <p className="text-3xl font-black text-gray-900">{totalProducts}</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-center">
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1">Out of Stock</p>
              <p className="text-3xl font-black text-red-500">{outOfStock}</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-center">
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1">Pending Orders</p>
              <p className="text-3xl font-black text-orange-500">{pendingOrders}</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-center">
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1">Total Orders</p>
              <p className="text-3xl font-black text-blue-600">{orders.length}</p>
            </div> 
          </div>
        )}

        {/* Content Area based on Tabs */}
        {['fruits', 'vegetables', 'pulses', 'oil'].includes(activeTab) && (
          selectedProduct ? (
            <div className="bg-white rounded-[2rem] p-6 md:p-10 shadow-sm border border-gray-200 animate-in fade-in zoom-in-95 duration-300">
              <button onClick={() => { setSelectedProductId(null); setIsRefilling(false); setRefillAmount(''); }} className="mb-6 flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors">
                ← Back to Grid
              </button>   
              <div className="flex flex-col md:flex-row gap-8 lg:gap-12 items-center md:items-start">
                <div className="w-full md:w-1/3 aspect-square bg-[#F8F8F8] rounded-3xl p-8 flex items-center justify-center relative shadow-inner">
                   {selectedProduct.disabled || selectedProduct.stock <= 0 ? (
                     <span className="absolute top-4 left-4 bg-red-50 text-red-600 text-xs font-bold px-3 py-1.5 rounded-lg uppercase tracking-wide border border-red-100 shadow-sm">Out of Stock</span>
                   ) : (
                     <span className="absolute top-4 left-4 bg-green-50 text-[#0A8745] text-xs font-bold px-3 py-1.5 rounded-lg uppercase tracking-wide border border-green-100 shadow-sm">{selectedProduct.stock} kg Left</span>
                   )}
                   <img src={selectedProduct.image} className="max-w-full max-h-full object-contain mix-blend-multiply" onError={(e) => {
                     if (e.target.src.endsWith('.png')) {
                       e.target.src = selectedProduct.image.replace('.png', '.jpg');
                     } else if (!e.target.src.includes('placehold.co')) {
                       e.target.src ="https://placehold.co/400x400/F8F8F8/767676?text=Img";
                     }
                   }}/>
                </div>
                
                <div className="flex-1 w-full space-y-6">
                   <div>
                     <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">{selectedProduct.category}</p>
                     <h2 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight">{selectedProduct.name}</h2>
                     <p className="text-2xl font-black text-blue-600 mt-3">₹{selectedProduct.price} <span className="text-base text-gray-400 font-medium">/ per {selectedProduct.category === 'Oil' ? 'L' : 'kg'}</span></p>
                   </div>
                   <p className="text-gray-600 font-medium leading-relaxed text-lg max-w-2xl">{selectedProduct.desc}</p>
                   
                   <div className="grid grid-cols-2 gap-4 max-w-lg">
                      <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 shadow-sm">
                        <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Stock Available</p>
                        <p className="text-2xl font-black text-gray-900">{selectedProduct.stock || 0} {selectedProduct.category === 'Oil' ? 'L' : 'kg'}</p>
                      </div>
                      <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 shadow-sm">
                        <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Status</p>
                        <p className={`text-2xl font-black ${selectedProduct.disabled || selectedProduct.stock <= 0 ? 'text-red-500' : 'text-green-600'}`}>{selectedProduct.disabled || selectedProduct.stock <= 0 ? 'Out of Stock' : 'Active'}</p>
                      </div>
                   </div>

                   <div className="pt-6 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 max-w-3xl">
                      <Link to={`/admin/edit-product/${selectedProduct.id}`} className="btn-3d btn-blue py-3.5 font-bold gap-2 shadow-sm">
                        <Edit size={18} /> Edit
                      </Link>
                      
                      {isRefilling ? (
                        <div className="flex bg-white rounded-xl overflow-hidden border-2 border-green-500 shadow-sm col-span-1 sm:col-span-2 lg:col-span-1">
                          <input type="number" min="1" autoFocus value={refillAmount} onChange={e => setRefillAmount(e.target.value)} placeholder={selectedProduct.category === 'Oil' ? 'L' : 'kg'} className="w-full px-3 outline-none text-sm font-bold text-gray-800" />
                          <button onClick={() => {
                            const amount = parseInt(refillAmount);
                            if (!isNaN(amount) && amount > 0) {
                              editProduct(selectedProduct.id, { stock: (selectedProduct.stock || 0) + amount, disabled: false });
                              showToast(`✅ ${amount}${selectedProduct.category === 'Oil' ? 'L' : 'kg'} added to ${selectedProduct.name}!`);
                            } else {
                              showToast("❌ Enter valid amount!");
                            }
                            setIsRefilling(false);
                            setRefillAmount('');
                          }} className="btn-3d btn-emerald px-4 py-2 text-white font-black rounded-none shadow-none">✓</button>
                          <button onClick={() => setIsRefilling(false)} className="btn-3d btn-lime px-3 bg-gray-100 hover:bg-gray-200 text-gray-600 font-black rounded-none shadow-none">✕</button>
                        </div>
                      ) : (
                        <button onClick={() => setIsRefilling(true)} className="btn-3d btn-emerald py-3.5 font-bold gap-2 shadow-sm">
                          <PackagePlus size={18} /> Refill
                        </button>
                      )}

                      <button onClick={() => toggleProductStatus(selectedProduct.id)} className={`btn-3d ${selectedProduct.disabled ? 'btn-orange' : 'btn-lime'} py-3.5 font-bold gap-2 shadow-sm`}>
                        <PowerOff size={18} /> {selectedProduct.disabled ? 'Enable' : 'Disable'}
                      </button>
                      <button onClick={() => { 
                        deleteProduct(selectedProduct.id); 
                        setSelectedProductId(null); 
                      }} className="btn-3d btn-danger py-3.5 font-bold gap-2 shadow-sm">
                        <Trash2 size={18} /> Delete
                      </button>
                   </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {filteredProducts.map(p => (
                <div key={p.id} onClick={() => setSelectedProductId(p.id)} className="bg-white rounded-[1.5rem] p-4 shadow-sm border border-gray-200 flex flex-col relative group hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer">
                  {p.disabled || p.stock <= 0 ? (
                    <span className="absolute top-3 left-3 bg-red-50 text-red-600 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide z-10 border border-red-100">Out of Stock</span>
                  ) : (
                    <span className="absolute top-3 left-3 bg-green-50 text-[#0A8745] text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide z-10 border border-green-100">{p.stock} {p.category === 'Oil' ? 'L' : 'kg'} Left</span>
                  )}
                  <div className="h-32 w-full bg-[#F8F8F8] rounded-xl flex items-center justify-center p-3 mb-3 relative mt-8 overflow-hidden">
                    <img src={p.image} className="max-w-full max-h-full object-contain mix-blend-multiply transition-transform group-hover:scale-105" onError={(e) => {
                      if (e.target.src.endsWith('.png')) {
                        e.target.src = p.image.replace('.png', '.jpg');
                      } else if (!e.target.src.includes('placehold.co')) {
                        e.target.src ="https://placehold.co/100x100/F8F8F8/767676?text=Img";
                      }
                    }}/>
                  </div>
                  <div className="flex-1 flex items-center justify-center text-center">
                    <h3 className="font-bold text-gray-900 text-base leading-tight line-clamp-2">{p.name}</h3>
                  </div>
                </div>
              ))}
              {filteredProducts.length === 0 && (
                <div className="col-span-full py-12 text-center text-gray-500 font-medium bg-white rounded-2xl border border-gray-200">No products found.</div>
              )}
            </div>
          )
        )}

        {activeTab === 'orders' && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {filteredOrders.length === 0 ? (
              <div className="p-12 text-center text-gray-500 font-medium">No orders found.</div>
            ) : (
              <div className="p-6 grid gap-4">
                {filteredOrders.map(order => (
                  <div key={order.id} className="border border-gray-200 rounded-xl p-5 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <p className="font-black text-gray-900">{order.id}</p>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${order.status === 'Pending' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                          {order.status}
                        </span>
                        <span className="text-gray-400 font-medium text-xs">{order.date}</span>
                      </div>
                      <p className="text-sm font-bold text-gray-600">{order.customer?.name || 'Unknown'} • {order.customer?.phone || 'N/A'}</p>
                      <p className="text-sm text-gray-500 mt-1">{(order.items || []).map(i => `${i.quantity}x ${i.name}`).join(', ')}</p>
                    </div>
                    <div className="text-left md:text-right shrink-0 bg-gray-50 p-4 rounded-xl">
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">{order.paymentMethod}</p>
                      <p className="font-black text-xl text-gray-900">₹{order.total}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'delivery' && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {filteredPartners.length === 0 ? (
              <div className="p-12 text-center text-gray-500 font-medium">No delivery partners found.</div>
            ) : (
              <div className="p-6 grid gap-4">
                {filteredPartners.map(partner => (
                  <div key={partner.email} onClick={() => setSelectedPartner(partner)} className="flex flex-col md:flex-row justify-between md:items-center bg-gray-50 border border-gray-200 p-5 rounded-xl gap-4 cursor-pointer hover:bg-gray-100 transition-colors">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-white shadow-sm overflow-hidden shrink-0 flex items-center justify-center bg-slate-200 text-2xl font-black text-slate-500">
                      {partner.photoURL ? <img src={partner.photoURL} alt={partner.name} className="w-full h-full object-cover" /> : partner.name.charAt(0)}
                    </div>
                    <div className="flex-1 flex flex-col md:flex-row justify-between md:items-center gap-4">
                      <div>
                        <h4 className="font-black text-[18px] text-gray-900">{partner.name}</h4>
                        <p className="text-[13px] font-bold text-gray-500 mt-1">{partner.phone} • {partner.email}</p>
                        <p className="text-[12px] text-gray-400 mt-1 uppercase tracking-wide flex items-center gap-1"><MapPin size={12}/> {partner.address}</p>
                      </div>
                      <div className="flex items-center md:items-end flex-row md:flex-col justify-between shrink-0">
                        <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider mb-2 ${partner.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                          {partner.status}
                        </span>
                        {partner.status === 'Pending' && (
                          <button onClick={(e) => { e.stopPropagation(); approveDelivery(partner.email); }} className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors rounded-xl px-5 py-2.5 font-bold text-[12px] shadow-sm">
                            Approve Partner
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'sales' && (
          <AdminSales />
        )}

      </main>

      {selectedPartner && (
        <PartnerDetailsModal 
          partner={selectedPartner} 
          onClose={() => setSelectedPartner(null)} 
        />
      )}
    </div>
  )
}
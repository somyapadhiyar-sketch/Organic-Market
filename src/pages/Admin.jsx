import { useState, useEffect } from 'react'
import { useStore } from '../context/StoreContext'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Plus, LogOut, Search, Mic, Edit, Trash2, PackagePlus, PowerOff, MapPin, Menu, Amphora, Apple, Carrot, Bean, ShoppingBag, Motorbike, Store, BarChart3, ChevronDown, Grid } from 'lucide-react'
import { getFirestore, doc, updateDoc } from 'firebase/firestore'
import { auth } from '../firebase'
import PartnerDetailsModal from '../components/PartnerDetailsModal'
import AdminSales from '../components/AdminSales'

export default function Admin() {
  const { products, toggleProductStatus, deleteProduct, editProduct, deliveryPartners, approveDelivery, orders, logout, clearCart, updateOrderStatus, showToast, updatePartnerStatus, assignOrderToPartner, deleteDeliveryPartner } = useStore()
  const navigate = useNavigate();
  const location = useLocation();
  const initialTab = location.pathname.split('/admin/')[1] || 'sales';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [isRefilling, setIsRefilling] = useState(false);
  const [refillAmount, setRefillAmount] = useState('');
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterOptions = ["All", "Pending", "Out for Delivery", "Delivered"];
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
  const [assignmentModes, setAssignmentModes] = useState({});
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(['fruits', 'vegetables', 'pulses', 'oil'].includes(initialTab));

  const selectedProduct = products.find(p => p.id === selectedProductId);
  const handleTabSwitch = (tab) => { 
    navigate(`/admin/${tab}`);
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setIsSidebarCollapsed(true);
    } else {
      setIsSidebarCollapsed(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    setActiveTab(location.pathname.split('/admin/')[1] || 'sales');
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

  const statusWeight = { 'Pending': 1, 'Out for Delivery': 2, 'Delivered': 3 };
  const filteredOrders = orders
    .filter(o => statusFilter === 'All' || o.status === statusFilter)
    .filter(o => (o.id || '').toLowerCase().includes(searchQuery.toLowerCase()) || (o.customer?.name || '').toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => (statusWeight[a.status] || 99) - (statusWeight[b.status] || 99));
  const onlinePartners = deliveryPartners.filter(d => d.deliveryMode !== 'Offline' && ((d.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || (d.email || '').toLowerCase().includes(searchQuery.toLowerCase())));
  const offlinePartners = deliveryPartners.filter(d => d.deliveryMode === 'Offline' && ((d.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || (d.email || '').toLowerCase().includes(searchQuery.toLowerCase())));
  
  return (
    <div className="h-screen w-full bg-slate-50 font-sans text-[#1C1C1C] flex overflow-hidden">
      
      {/* Mobile Overlay */}
      {!isSidebarCollapsed && (
        <div className="md:hidden fixed inset-0 bg-slate-900/20 z-40 backdrop-blur-sm" onClick={() => setIsSidebarCollapsed(true)} />
      )}

      {/* Sidebar (Desktop & Mobile) */}
      <aside className={`bg-white border-r border-gray-200 flex-shrink-0 flex flex-col z-50 transition-all duration-300 ease-in-out fixed md:relative h-full ${isSidebarCollapsed ? '-translate-x-full md:translate-x-0 w-64 md:w-20' : 'translate-x-0 w-64'}`}>
        
        {/* Mobile Logo inside Sidebar */}
        <div className="md:hidden flex items-center justify-center h-[72px] shrink-0 border-b border-gray-100">
          <span className="text-[28px] font-black italic tracking-tighter leading-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-600 pb-1 pr-2">Zesty</span>
        </div>

        <div className={`flex-1 pt-6 md:pt-12 pb-6 space-y-1.5 overflow-y-auto custom-scrollbar ${isSidebarCollapsed ? 'px-3' : 'px-4'}`}>
          
          {/* Sales Tab */}
          <button onClick={() => handleTabSwitch('sales')} className={`w-full flex items-center py-3 rounded-xl text-[14px] font-bold transition-all relative group ${isSidebarCollapsed ? 'px-0 justify-center gap-0' : 'px-4 gap-3'} ${activeTab === 'sales' ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
            <span className="text-lg"><BarChart3 size={20} /></span>
            <span className={`transition-all duration-200 whitespace-nowrap overflow-hidden ${isSidebarCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>Sales</span>
            {isSidebarCollapsed && <span className="absolute left-full ml-4 px-3 py-1.5 text-xs font-bold bg-gray-800 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">Sales</span>}
          </button>

          {/* Categories Dropdown Toggle */}
          <button onClick={() => setIsCategoriesOpen(!isCategoriesOpen)} className={`w-full flex items-center py-3 rounded-xl text-[14px] font-bold transition-all relative group ${isSidebarCollapsed ? 'px-0 justify-center gap-0' : 'px-4 gap-3'} ${['fruits', 'vegetables', 'pulses', 'oil'].includes(activeTab) ? 'bg-emerald-50 text-emerald-700' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
            <span className="text-lg"><Grid size={20} /></span>
            <div className={`flex items-center justify-between transition-all duration-200 overflow-hidden ${isSidebarCollapsed ? 'w-0 opacity-0' : 'flex-1 opacity-100'}`}>
              <span className="whitespace-nowrap">Categories</span>
              <ChevronDown size={16} className={`transition-transform ${isCategoriesOpen ? 'rotate-180' : ''}`} />
            </div>
            {isSidebarCollapsed && <span className="absolute left-full ml-4 px-3 py-1.5 text-xs font-bold bg-gray-800 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">Categories</span>}
          </button>

          {/* Categories List */}
          {isCategoriesOpen && (
            <div className={`space-y-1.5 overflow-hidden transition-all ${isSidebarCollapsed ? '' : 'pl-4'}`}>
              {[
                {tab: 'fruits', icon: <Apple size={18} />, label: 'Fruits'},
                {tab: 'vegetables', icon: <Carrot size={18} />, label: 'Vegetables'},
                {tab: 'pulses', icon: <Bean size={18} />, label: 'Pulses'},
                {tab: 'oil', icon: <Amphora size={18} />, label: 'Oil'}
              ].map(item => (
                <button key={item.tab} onClick={() => handleTabSwitch(item.tab)} className={`w-full flex items-center py-2.5 rounded-xl text-[14px] font-bold transition-all relative group ${isSidebarCollapsed ? 'px-0 justify-center gap-0' : 'px-4 gap-3'} ${activeTab === item.tab ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
                  <span className="text-lg">{item.icon}</span>
                  <span className={`transition-all duration-200 whitespace-nowrap overflow-hidden ${isSidebarCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>{item.label}</span>
                  {isSidebarCollapsed && <span className="absolute left-full ml-4 px-3 py-1.5 text-xs font-bold bg-gray-800 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">{item.label}</span>}
                </button>
              ))}
            </div>
          )}
          
          {[
            {tab: 'orders', icon: <ShoppingBag size={20} />, label: 'Orders', badge: pendingOrders}, 
            {tab: 'delivery', icon: <Motorbike size={20} />, label: 'Online Partners'}, 
            {tab: 'offline-delivery', icon: <Store size={20} />, label: 'Offline Partners'}
          ].map(item => (
            <button key={item.tab} onClick={() => handleTabSwitch(item.tab)} className={`w-full flex items-center py-3 rounded-xl text-[14px] font-bold transition-all relative group ${isSidebarCollapsed ? 'px-0 justify-center gap-0' : 'px-4 gap-3'} ${activeTab === item.tab ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
              <span className="text-lg">{item.icon}</span>
              <span className={`transition-all duration-200 whitespace-nowrap overflow-hidden ${isSidebarCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>{item.label}</span>
              {item.badge > 0 && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-black transition-all ${isSidebarCollapsed ? 'absolute top-1 right-1' : 'ml-auto'} ${activeTab === item.tab ? 'bg-white text-emerald-600' : 'bg-red-500 text-white'}`}>
                  {item.badge}
                </span>
              )}
              {isSidebarCollapsed && <span className="absolute left-full ml-4 px-3 py-1.5 text-xs font-bold bg-gray-800 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">{item.label}</span>}
            </button>
          ))}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen">
      
      {/* Top Navbar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="px-4 md:px-6 py-3 flex flex-col md:flex-row justify-between items-center gap-4 h-auto md:h-[72px]">
          
          {/* Logo & Mobile Buttons */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between">
            <div className="flex items-center">
              <button onClick={(e) => { e.stopPropagation(); setIsSidebarCollapsed(!isSidebarCollapsed); }} className="md:hidden p-2 -ml-2 mr-2 text-gray-500 hover:bg-gray-200 rounded-full transition-colors">
                <Menu size={20} />
              </button>
              <span className="text-[28px] font-black italic tracking-tighter leading-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-600 pb-1 pr-2">Zesty</span>
            </div>
            <div className="flex md:hidden gap-2">
              <Link to="/admin/add-product" className="p-2 px-3 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors rounded-xl shadow-sm">
                <Plus size={18} />
              </Link>
              <button onClick={() => { if(clearCart) clearCart(); logout(); navigate('/home', { replace: true }); }} className="p-2 px-3 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors rounded-xl shadow-sm">
                <LogOut size={18} />
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 w-full max-w-2xl px-0 md:px-6">
            <div className="flex items-center bg-slate-100 rounded-xl h-[44px] px-4 border border-transparent focus-within:bg-white focus-within:border-blue-500 focus-within:shadow-sm transition-all">
              <Search size={18} className="text-gray-400 mr-2" />
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

          {/* Desktop Actions */}
          <div className="hidden md:flex gap-3 shrink-0">
            <Link to="/admin/add-product" className="btn-3d btn-emerald px-4 py-2 font-bold text-[13px] gap-2 whitespace-nowrap shadow-sm">
              <Plus size={16} /> Add Product
            </Link>
            <button onClick={() => { if(clearCart) clearCart(); logout(); navigate('/home', { replace: true }); }} className="btn-3d btn-danger px-4 py-2 font-bold text-[13px] gap-2 whitespace-nowrap shadow-sm">
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>

      </header>

      <main className="w-full py-6 px-4 md:px-6 flex-1 overflow-y-auto custom-scrollbar" onClick={() => { if (typeof window !== 'undefined' && window.innerWidth >= 768) setIsSidebarCollapsed(true); }}>
        
        {/* Quick Stats Grid */}
        {activeTab === 'orders' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
            <div className="bg-white p-4 md:p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-center">
              <p className="text-[10px] md:text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1 line-clamp-1">Total Products</p>
              <p className="text-2xl md:text-3xl font-black text-gray-900">{totalProducts}</p>
            </div>
            <div className="bg-white p-4 md:p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-center">
              <p className="text-[10px] md:text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1 line-clamp-1">Out of Stock</p>
              <p className="text-2xl md:text-3xl font-black text-red-500">{outOfStock}</p>
            </div>
            <div className="bg-white p-4 md:p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-center">
              <p className="text-[10px] md:text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1 line-clamp-1">Pending Orders</p>
              <p className="text-2xl md:text-3xl font-black text-orange-500">{pendingOrders}</p>
            </div>
            <div className="bg-white p-4 md:p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-center">
              <p className="text-[10px] md:text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1 line-clamp-1">Total Orders</p>
              <p className="text-2xl md:text-3xl font-black text-blue-600">{orders.length}</p>
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
          <div className="mb-4 flex justify-end">
            <div className="relative w-full sm:w-48 shrink-0 z-20">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all shadow-sm cursor-pointer"
              >
                <span>{statusFilter === "All" ? "All Orders" : statusFilter}</span>
                <span className={`text-[10px] text-gray-400 transition-transform duration-200 ${isFilterOpen ? 'rotate-180' : ''}`}>▼</span>
              </button>
              
              {isFilterOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsFilterOpen(false)}></div>
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    {filterOptions.map(option => (
                      <button
                        key={option}
                        onClick={() => { setStatusFilter(option); setIsFilterOpen(false); }}
                        className={`w-full text-left px-4 py-3 text-sm font-bold transition-colors ${statusFilter === option ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}`}
                      >
                        {option === "All" ? "All Orders" : option}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {filteredOrders.length === 0 ? (
              <div className="p-8 md:p-12 text-center text-gray-500 font-medium">No orders found.</div>
            ) : (
              <div className="p-3 md:p-6 grid gap-3 md:gap-4">
                {filteredOrders.map(order => (
                  <div key={order.id} className="border border-gray-200 rounded-xl p-4 md:p-5 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                    <div className="w-full">
                      <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-2">
                        <p className="font-black text-gray-900 break-all">{order.id}</p>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide shrink-0 ${order.status === 'Pending' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                          {order.status}
                        </span>
                        <span className="text-gray-400 font-medium text-xs">{order.date}</span>
                      </div>
                      <p className="text-sm font-bold text-gray-600">{order.customer?.name || 'Unknown'} • {order.customer?.phone || 'N/A'}</p>
                      <p className="text-sm text-gray-500 mt-1">{(order.items || []).map(i => `${i.quantity}x ${i.name}`).join(', ')}</p>
                      
                      <div className="mt-4">
                        {order.status === 'Pending' && !order.deliveryPartnerName && order.deliveryPartnerEmail !== 'online_broadcast' ? (
                          <div className="flex flex-col gap-2 w-full sm:max-w-xs">
                            <select
                              value={assignmentModes[order.id] || ''}
                              onChange={async (e) => {
                                const mode = e.target.value;
                                setAssignmentModes({ ...assignmentModes, [order.id]: mode });
                                if (mode === 'Online') {
                                  try {
                                    updateOrderStatus(order.id, 'Pending', 'online_broadcast');
                                    const db = getFirestore(auth.app);
                                    await updateDoc(doc(db, "orders", order.id), {
                                      deliveryPartnerEmail: 'online_broadcast',
                                      status: 'Pending'
                                    });
                                    showToast('✅ Order is available to all online partners.');
                                  } catch (err) {
                                    console.error(err);
                                  }
                                }
                              }}
                              onClick={e => e.stopPropagation()}
                              className="bg-white border border-gray-200 text-gray-700 text-xs font-bold rounded-xl focus:ring-emerald-500 focus:border-emerald-500 block w-full p-2.5 shadow-sm outline-none"
                            >
                              <option value="">Assign Delivery Mode...</option>
                              <option value="Online">🟢 Online Delivery (Broadcast)</option>
                              <option value="Offline">📦 Offline Delivery (Manual)</option>
                            </select>

                            {assignmentModes[order.id] === 'Offline' && (
                              <div className="animate-in fade-in slide-in-from-top-1 mt-1">
                                <select
                                  onChange={async (e) => {
                                    const partnerEmail = e.target.value;
                                    if (partnerEmail) {
                                      const partner = deliveryPartners.find(p => p.email === partnerEmail);
                                      try {
                                        updateOrderStatus(order.id, 'Out for Delivery', partnerEmail);
                                        const db = getFirestore(auth.app);
                                        await updateDoc(doc(db, "orders", order.id), {
                                          status: 'Out for Delivery',
                                          deliveryPartnerEmail: partnerEmail,
                                          deliveryPartnerName: partner?.name || 'Partner',
                                          deliveryPartner: {
                                            name: partner?.name || 'Partner',
                                            phone: partner?.phone || '',
                                            email: partnerEmail
                                          }
                                        });
                                        showToast(`✅ Order assigned to ${partner?.name || 'offline partner'}!`);
                                        const newModes = {...assignmentModes};
                                        delete newModes[order.id];
                                        setAssignmentModes(newModes);
                                      } catch (err) {
                                        console.error(err);
                                      }
                                    }
                                  }}
                                  onClick={e => e.stopPropagation()}
                                  className="bg-slate-50 border border-slate-200 text-emerald-700 text-xs font-bold rounded-xl focus:ring-emerald-500 focus:border-emerald-500 block w-full p-2.5 shadow-sm outline-none"
                                >
                                  <option value="">Select Offline Partner...</option>
                                  {deliveryPartners.filter(p => p.deliveryMode === 'Offline' && p.status === 'Approved').map(p => (
                                    <option key={p.email} value={p.email}>{p.name}</option>
                                  ))}
                                </select>
                              </div>
                            )}
                          </div>
                        ) : order.deliveryPartnerEmail === 'online_broadcast' && order.status === 'Pending' ? (
                          <div className="mt-3 inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-bold border border-blue-100 break-words w-full sm:w-auto"><span>🟢</span> Broadcasted</div>
                        ) : (
                          (order.deliveryPartnerName || (order.deliveryPartnerEmail && order.deliveryPartnerEmail !== 'online_broadcast')) && <div className="mt-3 inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-bold border border-emerald-100 break-all w-full sm:w-auto"><span>🛵</span> Assigned: {order.deliveryPartnerName || order.deliveryPartnerEmail}</div>
                        )}
                      </div>
                    </div>
                    <div className="text-left md:text-right shrink-0 bg-gray-50 p-4 rounded-xl flex md:block items-center justify-between mt-2 md:mt-0">
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-0 md:mb-1">{order.paymentMethod}</p>
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
            {onlinePartners.length === 0 ? (
              <div className="p-12 text-center text-gray-500 font-medium">No online partners found.</div>
            ) : (
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                  <thead>
                    <tr className="bg-slate-50 border-b border-gray-200">
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Partner</th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Contact</th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Area</th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {onlinePartners.map(partner => (
                      <tr key={partner.email} onClick={() => setSelectedPartner(partner)} className="hover:bg-slate-50 transition-colors cursor-pointer group">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full border-2 border-white shadow-sm overflow-hidden shrink-0 flex items-center justify-center bg-slate-200 font-black text-slate-500">
                              {partner.photoURL ? <img src={partner.photoURL} alt={partner.name} className="w-full h-full object-cover" /> : partner.name.charAt(0)}
                            </div>
                            <span className="font-black text-sm text-gray-900">{partner.name}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <p className="text-xs font-bold text-gray-700">{partner.phone}</p>
                          <p className="text-[11px] text-gray-500">{partner.email}</p>
                        </td>
                        <td className="p-4">
                          <p className="text-xs text-gray-600 flex items-center gap-1"><MapPin size={12} className="text-gray-400" /> {partner.address}</p>
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${partner.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                            {partner.status === 'Approved' ? 'Online' : partner.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {partner.status === 'Pending' && <button onClick={(e) => { e.stopPropagation(); approveDelivery(partner.email); }} className="btn-3d btn-emerald px-3 py-1.5 font-bold text-[11px] shadow-sm">Approve Online</button>}
                            <button onClick={(e) => { e.stopPropagation(); if (window.confirm(`Remove ${partner.name}?`)) { deleteDeliveryPartner(partner.email); } }} className="btn-3d btn-danger px-3 py-1.5 font-bold text-[11px] shadow-sm">Remove</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'offline-delivery' && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {offlinePartners.length === 0 ? (
              <div className="p-12 text-center text-gray-500 font-medium">No offline delivery partners found.</div>
            ) : (
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                  <thead>
                    <tr className="bg-slate-50 border-b border-gray-200">
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Partner</th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Contact</th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Area</th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {offlinePartners.map(partner => (
                      <tr key={partner.email} onClick={() => setSelectedPartner(partner)} className="hover:bg-slate-50 transition-colors cursor-pointer group">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full border-2 border-white shadow-sm overflow-hidden shrink-0 flex items-center justify-center bg-slate-200 font-black text-slate-500">
                              {partner.photoURL ? <img src={partner.photoURL} alt={partner.name} className="w-full h-full object-cover" /> : partner.name.charAt(0)}
                            </div>
                            <span className="font-black text-sm text-gray-900">{partner.name}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <p className="text-xs font-bold text-gray-700">{partner.phone}</p>
                          <p className="text-[11px] text-gray-500">{partner.email}</p>
                        </td>
                        <td className="p-4">
                          <p className="text-xs text-gray-600 flex items-center gap-1"><MapPin size={12} className="text-gray-400" /> {partner.address}</p>
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${partner.status === 'Approved' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                            {partner.status === 'Approved' ? 'Offline (Approved)' : partner.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {partner.status === 'Pending' && <button onClick={(e) => { e.stopPropagation(); approveDelivery(partner.email); }} className="btn-3d btn-blue px-3 py-1.5 font-bold text-[11px] shadow-sm">Approve Offline</button>}
                            <button onClick={(e) => { e.stopPropagation(); if (window.confirm(`Remove ${partner.name}?`)) { deleteDeliveryPartner(partner.email); } }} className="btn-3d btn-danger px-3 py-1.5 font-bold text-[11px] shadow-sm">Remove</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
    </div>
  )
}
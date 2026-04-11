import { useState, useEffect } from 'react'
import { useStore } from '../context/StoreContext'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Plus, LogOut, Search, Mic, Edit, Trash2, PackagePlus, PowerOff, MapPin, Menu, Amphora, Apple, Carrot, Bean, ShoppingBag, Motorbike, Store, BarChart3, ChevronDown, Grid, Tag, Phone, CreditCard } from 'lucide-react'
import { getFirestore, doc, updateDoc, collection, getDocs, addDoc, deleteDoc } from 'firebase/firestore'
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
  const [isRefilling, setIsRefilling] = useState(null);
  const [refillAmount, setRefillAmount] = useState('');
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterOptions = ["All", "Pending", "Out for Delivery", "Delivered"];
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
  const [assignmentModes, setAssignmentModes] = useState({});
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(['fruits', 'vegetables', 'pulses', 'oil'].includes(initialTab));
  const [openDropdown, setOpenDropdown] = useState(null);
  const [coupons, setCoupons] = useState([]);
  const [newCoupon, setNewCoupon] = useState({ code: '', discount: '', validFromDate: '', validFromTime: '', validUntilDate: '', validUntilTime: '' });

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
    setIsRefilling(null);
    setRefillAmount('');
  }, [location.pathname]);

  useEffect(() => {
    if (activeTab !== 'coupons') return;
    
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const db = getFirestore(auth.app);
          const querySnapshot = await getDocs(collection(db, "coupons"));
          const couponsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setCoupons(couponsData);
        } catch (e) {
          console.error("Error fetching coupons:", e);
        }
      }
    });
    return () => unsubscribe();
  }, [activeTab]);

  const handleAddCoupon = async (e) => {
    e.preventDefault();
    try {
      const validFrom = newCoupon.validFromDate ? `${newCoupon.validFromDate}T${newCoupon.validFromTime || '00:00'}` : '';
      const validUntil = newCoupon.validUntilDate ? `${newCoupon.validUntilDate}T${newCoupon.validUntilTime || '23:59'}` : '';
      const db = getFirestore(auth.app);
      const docRef = await addDoc(collection(db, "coupons"), { code: newCoupon.code.toUpperCase(), discountPercent: Number(newCoupon.discount), validFrom, validUntil, active: true, usedBy: [] });
      setCoupons([...coupons, { id: docRef.id, code: newCoupon.code.toUpperCase(), discountPercent: Number(newCoupon.discount), validFrom, validUntil, active: true, usedBy: [] }]);
      setNewCoupon({ code: '', discount: '', validFromDate: '', validFromTime: '', validUntilDate: '', validUntilTime: '' });
      if(showToast) showToast("Coupon added!");
    } catch (e) { if(showToast) showToast("Failed to add coupon"); }
  };

  const handleToggleCoupon = async (coupon) => {
    try {
      const db = getFirestore(auth.app);
      await updateDoc(doc(db, "coupons", coupon.id), { active: !coupon.active });
      setCoupons(coupons.map(c => c.id === coupon.id ? { ...c, active: !c.active } : c));
      if(showToast) showToast(`Coupon ${coupon.active ? 'disabled' : 'enabled'}`);
    } catch (e) { if(showToast) showToast("Failed to update coupon"); }
  };

  const handleDeleteCoupon = async (id) => {
    if(!window.confirm("Delete this coupon?")) return;
    try {
      const db = getFirestore(auth.app);
      await deleteDoc(doc(db, "coupons", id));
      setCoupons(coupons.filter(c => c.id !== id));
      if(showToast) showToast("Coupon deleted");
    } catch (e) { if(showToast) showToast("Failed to delete coupon"); }
  };

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
        setSearchQuery(transcript.replace(/[.?!]+$/, ''));
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
            {tab: 'offline-delivery', icon: <Store size={20} />, label: 'Offline Partners'},
            {tab: 'coupons', icon: <Tag size={20} />, label: 'Coupons'}
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
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-slate-50 border-b border-gray-200">
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Stock</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredProducts.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-[#F8F8F8] flex items-center justify-center p-1 shrink-0">
                            <img src={p.image} className="max-w-full max-h-full object-contain mix-blend-multiply" alt={p.name} onError={(e) => {
                              if (e.target.src.endsWith('.png')) {
                                e.target.src = p.image.replace('.png', '.jpg');
                              } else if (!e.target.src.includes('placehold.co')) {
                                e.target.src ="https://placehold.co/100x100/F8F8F8/767676?text=Img";
                              }
                            }}/>
                          </div>
                          <div>
                            <p className="font-bold text-sm text-gray-900">{p.name}</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{p.category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-bold text-gray-900">₹{p.price}<span className="text-xs text-gray-400 font-medium">/{p.category === 'Oil' ? 'L' : 'kg'}</span></td>
                      <td className="p-4 font-bold text-gray-700">{p.stock || 0} {p.category === 'Oil' ? 'L' : 'kg'}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${p.disabled || p.stock <= 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
                          {p.disabled || p.stock <= 0 ? 'Out of Stock' : 'Active'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link to={`/admin/edit-product/${p.id}`} className="btn-3d btn-blue px-3 py-1.5 font-bold text-[11px] shadow-sm flex items-center gap-1">
                            <Edit size={14} /> Edit
                          </Link>
                          
                          {isRefilling === p.id ? (
                            <div className="flex bg-white rounded-lg overflow-hidden border-2 border-green-500 shadow-sm">
                              <input type="number" min="1" autoFocus value={refillAmount} onChange={e => setRefillAmount(e.target.value)} placeholder={p.category === 'Oil' ? 'L' : 'kg'} className="w-16 px-2 outline-none text-xs font-bold text-gray-800" />
                              <button onClick={() => {
                                const amount = parseInt(refillAmount);
                                if (!isNaN(amount) && amount > 0) {
                                  editProduct(p.id, { stock: (p.stock || 0) + amount, disabled: false });
                                  if(showToast) showToast(`✅ ${amount}${p.category === 'Oil' ? 'L' : 'kg'} added to ${p.name}!`);
                                } else {
                                  if(showToast) showToast("❌ Enter valid amount!");
                                }
                                setIsRefilling(null);
                                setRefillAmount('');
                              }} className="bg-green-500 hover:bg-green-600 text-white px-2 font-black transition-colors">✓</button>
                              <button onClick={() => setIsRefilling(null)} className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-2 font-black transition-colors">✕</button>
                            </div>
                          ) : (
                            <button onClick={() => setIsRefilling(p.id)} className="btn-3d btn-emerald px-3 py-1.5 font-bold text-[11px] shadow-sm flex items-center gap-1">
                              <PackagePlus size={14} /> Refill
                            </button>
                          )}

                          <button onClick={() => toggleProductStatus(p.id)} className={`btn-3d ${p.disabled ? 'btn-orange' : 'btn-lime'} px-3 py-1.5 font-bold text-[11px] shadow-sm flex items-center gap-1`}>
                            <PowerOff size={14} /> {p.disabled ? 'Enable' : 'Disable'}
                          </button>
                          
                          <button onClick={() => { 
                            if(window.confirm(`Delete ${p.name}?`)) deleteProduct(p.id); 
                          }} className="btn-3d btn-danger px-3 py-1.5 font-bold text-[11px] shadow-sm flex items-center gap-1">
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredProducts.length === 0 && (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-gray-500 font-medium">No products found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
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
          <div className="space-y-4 md:space-y-6 pb-12">
            {filteredOrders.length === 0 ? (
              <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-12 text-center text-gray-500 font-medium">No orders found.</div>
            ) : (
              filteredOrders.map(order => (
                <div key={order.id} className={`bg-white border border-slate-200 rounded-3xl shadow-sm hover:shadow-md transition-shadow relative ${openDropdown?.startsWith(order.id) ? 'z-50' : 'z-10'}`}>
                  
                  {/* Header Area */}
                  <div className="bg-slate-50/80 border-b border-slate-100 p-4 sm:px-6 sm:py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 rounded-t-3xl">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-black text-slate-800 uppercase tracking-wide">Order ID: {order.id}</span>
                        <span className="text-xs font-bold text-slate-500 bg-slate-200/50 px-2.5 py-0.5 rounded-md">{order.date}</span>
                      </div>
                    </div>
                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold w-max border ${order.status === 'Delivered' ? 'bg-green-50 text-green-600 border-green-200' : order.status === 'Out for Delivery' ? 'bg-blue-50 text-blue-600 border-blue-200' : order.deliveryPartnerEmail === 'online_broadcast' ? 'bg-yellow-50 text-yellow-600 border-yellow-200' : 'bg-orange-50 text-orange-600 border-orange-200'}`}>
                      {order.status === 'Pending' ? (order.deliveryPartnerEmail === 'online_broadcast' ? 'Assigning Partner...' : 'Processing') : order.status}
                    </span>
                  </div>

                  {/* Body Content Area */}
                  <div className="p-4 sm:p-6 flex flex-col lg:flex-row gap-6 lg:gap-8">
                    
                    {/* Left: Customer & Items */}
                    <div className="flex-1 space-y-5">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center font-black text-lg uppercase shrink-0">
                          {order.customer?.name?.charAt(0) || '?'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-800 truncate">{order.customer?.name || 'Unknown Customer'}</p>
                          <div className="flex flex-wrap items-center gap-2 mt-0.5">
                            <p className="text-[11px] font-bold text-slate-500 flex items-center gap-1"><Phone size={12}/> {order.customer?.phone || 'N/A'}</p>
                            <span className="text-slate-300">•</span>
                            <p className="text-[11px] font-bold text-slate-500 truncate flex items-center gap-1"><MapPin size={12}/> {order.customer?.type || 'Home'}</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Order Items ({order.items?.length || 0})</p>
                        <div className="flex flex-wrap gap-2">
                          {(order.items || []).map((item, i) => (
                            <div key={i} className="bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 shadow-sm flex items-center gap-1.5">
                              <span className="text-orange-500">{item.quantity}x</span> <span className="truncate max-w-[150px]">{item.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Middle: Delivery Assignment */}
                    <div className="lg:w-[280px] shrink-0 flex flex-col gap-3 border-t lg:border-t-0 lg:border-l border-slate-100 pt-5 lg:pt-0 lg:pl-8">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Delivery Assignment</p>
                      
                      <div className="w-full">
                        {order.status === 'Pending' && !order.deliveryPartnerName && order.deliveryPartnerEmail !== 'online_broadcast' ? (
                          <div className="flex flex-col gap-3 w-full">
                            <div className="relative w-full">
                              <button
                                onClick={(e) => { e.stopPropagation(); setOpenDropdown(openDropdown === `${order.id}-mode` ? null : `${order.id}-mode`); }}
                                className="bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl focus:ring-2 focus:ring-blue-500 w-full p-3 shadow-sm outline-none flex justify-between items-center hover:bg-slate-50 transition-colors"
                              >
                                <span className="truncate">{assignmentModes[order.id] === 'Online' ? '🟢 Online (Broadcast)' : assignmentModes[order.id] === 'Offline' ? '📦 Offline (Manual)' : 'Assign Mode...'}</span>
                                <ChevronDown size={14} className={`shrink-0 ml-1 transition-transform ${openDropdown === `${order.id}-mode` ? 'rotate-180' : ''}`} />
                              </button>
                              {openDropdown === `${order.id}-mode` && (
                                <>
                                  <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setOpenDropdown(null); }}></div>
                                  <div className="absolute top-full left-0 w-full min-w-[200px] mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-20 py-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                    <button
                                      onClick={async (e) => {
                                        e.stopPropagation();
                                        setOpenDropdown(null);
                                        const mode = 'Online';
                                        setAssignmentModes({ ...assignmentModes, [order.id]: mode });
                                        try {
                                          updateOrderStatus(order.id, 'Pending', 'online_broadcast');
                                          const db = getFirestore(auth.app);
                                          await updateDoc(doc(db, "orders", order.id), {
                                            deliveryPartnerEmail: 'online_broadcast',
                                            status: 'Pending'
                                          });
                                          if(showToast) showToast('✅ Order is available to all online partners.');
                                        } catch (err) {
                                          console.error(err);
                                        }
                                      }}
                                      className="w-full text-left px-4 py-3 text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                                    >
                                      🟢 Online (Broadcast)
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setOpenDropdown(null);
                                        setAssignmentModes({ ...assignmentModes, [order.id]: 'Offline' });
                                      }}
                                      className="w-full text-left px-4 py-3 text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                                    >
                                      📦 Offline (Manual)
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>

                            {assignmentModes[order.id] === 'Offline' && (
                              <div className="relative w-full animate-in fade-in slide-in-from-top-2">
                                <button
                                  onClick={(e) => { e.stopPropagation(); setOpenDropdown(openDropdown === `${order.id}-partner` ? null : `${order.id}-partner`); }}
                                  className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-xl focus:ring-2 focus:ring-emerald-500 w-full p-3 shadow-sm outline-none flex justify-between items-center hover:bg-emerald-100 transition-colors"
                                >
                                  <span className="truncate">Select Partner...</span>
                                  <ChevronDown size={14} className={`shrink-0 ml-1 transition-transform ${openDropdown === `${order.id}-partner` ? 'rotate-180' : ''}`} />
                                </button>
                                {openDropdown === `${order.id}-partner` && (
                                  <>
                                    <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setOpenDropdown(null); }}></div>
                                    <div className="absolute top-full right-0 lg:left-0 w-full min-w-[200px] mt-2 bg-white border border-emerald-100 rounded-xl shadow-xl z-20 py-1.5 overflow-y-auto max-h-56 custom-scrollbar animate-in fade-in zoom-in-95 duration-200">
                                      {deliveryPartners.filter(p => p.deliveryMode === 'Offline' && p.status === 'Approved').length === 0 ? (
                                        <div className="px-4 py-3 text-xs font-medium text-gray-500 text-center">No partners available</div>
                                      ) : (
                                        deliveryPartners.filter(p => p.deliveryMode === 'Offline' && p.status === 'Approved').map(p => (
                                          <button
                                            key={p.email}
                                            onClick={async (e) => {
                                              e.stopPropagation();
                                              setOpenDropdown(null);
                                              const partnerEmail = p.email;
                                              try {
                                                updateOrderStatus(order.id, 'Out for Delivery', partnerEmail);
                                                const db = getFirestore(auth.app);
                                                await updateDoc(doc(db, "orders", order.id), {
                                                  status: 'Out for Delivery',
                                                  deliveryPartnerEmail: partnerEmail,
                                                  deliveryPartnerName: p.name || 'Partner',
                                                  deliveryPartner: {
                                                    name: p.name || 'Partner',
                                                    phone: p.phone || '',
                                                    email: partnerEmail
                                                  }
                                                });
                                                if(showToast) showToast(`✅ Order assigned to ${p.name || 'offline partner'}!`);
                                                const newModes = {...assignmentModes};
                                                delete newModes[order.id];
                                                setAssignmentModes(newModes);
                                              } catch (err) {
                                                console.error(err);
                                              }
                                            }}
                                            className="w-full text-left px-4 py-3 text-xs font-bold text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors truncate"
                                          >
                                            {p.name}
                                          </button>
                                        ))
                                      )}
                                    </div>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        ) : order.deliveryPartnerEmail === 'online_broadcast' && order.status === 'Pending' ? (
                          <div className="inline-flex items-center gap-2 bg-yellow-50 text-yellow-700 px-4 py-3 rounded-xl text-xs font-bold border border-yellow-200 shadow-sm w-full">
                            <span className="relative flex h-2.5 w-2.5 shrink-0"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-yellow-500"></span></span>
                            Waiting for partner...
                          </div>
                        ) : (
                          (order.deliveryPartnerName || (order.deliveryPartnerEmail && order.deliveryPartnerEmail !== 'online_broadcast')) && (
                            <div className="bg-emerald-50/50 rounded-2xl p-3 border border-emerald-100 w-full">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white border border-emerald-200 shadow-sm rounded-full flex items-center justify-center text-sm font-black text-emerald-600 shrink-0 uppercase">
                                  {order.deliveryPartnerName ? order.deliveryPartnerName.charAt(0) : 'P'}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-bold text-slate-800 truncate">{order.deliveryPartnerName || order.deliveryPartnerEmail}</p>
                                  {order.deliveryPartner?.phone && (
                                    <p className="text-[10px] font-bold text-slate-500 truncate mt-0.5">{order.deliveryPartner.phone}</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>

                    {/* Right: Payment & Total */}
                    <div className="lg:w-48 shrink-0 flex flex-col gap-4 border-t lg:border-t-0 lg:border-l border-slate-100 pt-5 lg:pt-0 lg:pl-8">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Order Total</p>
                        <p className="text-3xl font-black text-slate-900">₹{order.total}</p>
                        
                        {order.couponCode && (
                          <p className="text-xs font-bold text-green-600 mt-1.5 flex items-center gap-1"><Tag size={12} /> Saved ₹{order.discountAmount}</p>
                        )}
                        <p className="text-xs font-bold text-slate-500 mt-1.5 flex items-center gap-1.5">
                          <CreditCard size={14} className="text-slate-400" /> 
                          {order.paymentMethod === 'COD' ? 'Cash on Delivery' : order.paymentMethod === 'NetBanking' ? 'Net Banking' : order.paymentMethod}
                        </p>
                      </div>
                    </div>

                  </div>
                </div>
              ))
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

        {activeTab === 'coupons' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 animate-in fade-in zoom-in-95">
              <h3 className="font-bold text-lg mb-4 text-slate-800 flex items-center gap-2"><Tag size={20} className="text-emerald-600"/> Add New Coupon</h3>
              <form onSubmit={handleAddCoupon} className="flex flex-col md:flex-row flex-wrap gap-4 items-end">
                <div className="flex-1 w-full min-w-[120px]">
                  <label className="text-xs font-bold text-gray-500 uppercase">Coupon Code</label>
                  <input required type="text" value={newCoupon.code} onChange={e => setNewCoupon({...newCoupon, code: e.target.value})} className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 font-bold uppercase" placeholder="e.g. SAVE20" />
                </div>
                <div className="w-full md:w-28">
                  <label className="text-xs font-bold text-gray-500 uppercase">Discount (%)</label>
                  <input required type="number" min="1" max="100" value={newCoupon.discount} onChange={e => setNewCoupon({...newCoupon, discount: e.target.value})} className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 font-bold" placeholder="20" />
                </div>
                <div className="flex-1 w-full min-w-[180px]">
                  <label className="text-xs font-bold text-gray-500 uppercase">Valid From</label>
                  <div className="flex gap-2 mt-1">
                    <input required type="date" value={newCoupon.validFromDate} onChange={e => setNewCoupon({...newCoupon, validFromDate: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 font-bold text-sm" />
                    <input required type="time" value={newCoupon.validFromTime} onChange={e => setNewCoupon({...newCoupon, validFromTime: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 font-bold text-sm" />
                  </div>
                </div>
                <div className="flex-1 w-full min-w-[180px]">
                  <label className="text-xs font-bold text-gray-500 uppercase">Valid Until</label>
                  <div className="flex gap-2 mt-1">
                    <input required type="date" value={newCoupon.validUntilDate} onChange={e => setNewCoupon({...newCoupon, validUntilDate: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 font-bold text-sm" />
                    <input required type="time" value={newCoupon.validUntilTime} onChange={e => setNewCoupon({...newCoupon, validUntilTime: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 font-bold text-sm" />
                  </div>
                </div>
                <button type="submit" className="btn-3d btn-emerald px-6 py-3 font-bold w-full md:w-auto h-[46px]">Generate</button>
              </form>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden animate-in fade-in zoom-in-95 delay-100">
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                  <thead>
                    <tr className="bg-slate-50 border-b border-gray-200">
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Code</th><th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Discount</th><th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Valid From</th><th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Valid Until</th><th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th><th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {coupons.map(coupon => (
                      <tr key={coupon.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 font-black text-gray-900">{coupon.code}</td>
                        <td className="p-4 font-bold text-emerald-600">{coupon.discountPercent}% OFF</td>
                        <td className="p-4 text-sm font-medium text-gray-600">{coupon.validFrom ? new Date(coupon.validFrom).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' }) : '-'}</td>
                        <td className="p-4 text-sm font-medium text-gray-600">{coupon.validUntil ? new Date(coupon.validUntil).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' }) : (coupon.expiryDate ? new Date(coupon.expiryDate).toLocaleDateString() : '-')}</td>
                        <td className="p-4"><span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${coupon.active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>{coupon.active ? 'Active' : 'Inactive'}</span></td>
                        <td className="p-4 text-right">
                          <button onClick={() => handleToggleCoupon(coupon)} className="btn-3d bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-3 py-1.5 font-bold text-[11px] shadow-sm mr-2">{coupon.active ? 'Disable' : 'Enable'}</button>
                          <button onClick={() => handleDeleteCoupon(coupon.id)} className="btn-3d btn-danger px-3 py-1.5 font-bold text-[11px] shadow-sm">Delete</button>
                        </td>
                      </tr>
                    ))}
                    {coupons.length === 0 && <tr><td colSpan="5" className="p-8 text-center text-gray-500 font-medium">No coupons generated yet.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
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
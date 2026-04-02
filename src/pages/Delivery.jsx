import { useStore } from '../context/StoreContext'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Search, Camera, Mail, Phone, MapPin, CheckCircle2, Upload, Edit2, Save, X, Wifi, WifiOff, Package, Truck, Tag, CreditCard, Banknote, Motorbike, LogOut } from 'lucide-react'
import { useState, useRef, useLayoutEffect } from 'react'
import { getFirestore, doc, updateDoc } from 'firebase/firestore'
import { auth } from '../firebase'

export default function Delivery() {
  const { orders, updateOrderStatus, logout, clearCart, currentUser, updateUser, updatePartnerStatus } = useStore()
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const handleLogout = () => { if (clearCart) clearCart(); logout(); navigate('/home', { replace: true }); };
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('orders');
  const [isUploading, setIsUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ name: '', phone: '' });
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterOptions = ["All", "Pending", "Out for Delivery", "Delivered"];

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname, activeTab]);

  const handleEditToggle = async () => {
    if (isEditing) {
      try {
        const updatedUser = { ...currentUser, name: editData.name, phone: editData.phone };
        updateUser(updatedUser);
        if (currentUser?.uid) {
          const db = getFirestore(auth.app);
          await updateDoc(doc(db,"users", currentUser.uid), { name: editData.name, phone: editData.phone });
        }
        setIsEditing(false);
      } catch(e) { console.error(e); alert("Failed to update profile"); }
    } else {
      setEditData({ name: currentUser?.name || '', phone: currentUser?.phone || '' });
      setIsEditing(true);
    }
  };

  const uploadPhotoData = async (base64String) => {
    setIsUploading(true);
    try {
      const updatedUser = { ...currentUser, photoURL: base64String };
      updateUser(updatedUser);
      if (currentUser?.uid) {
        const db = getFirestore(auth.app);
        await updateDoc(doc(db,"users", currentUser.uid), { photoURL: base64String });
      }
    } catch (error) {
      console.error("Error updating photo:", error);
      alert("Failed to save photo.");
    } finally {
      setIsUploading(false);
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      uploadPhotoData(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const openCamera = async () => {
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode:"user" } });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access camera. Please check permissions.");
      setShowCamera(false);
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      const context = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const base64String = canvas.toDataURL('image/jpeg');
      closeCamera();
      uploadPhotoData(base64String);
    }
  };

  const closeCamera = () => {
    const stream = videoRef.current?.srcObject;
    if (stream) stream.getTracks().forEach(track => track.stop());
    setShowCamera(false);
  };

  // Filter to only show pending orders OR orders specifically picked up by THIS delivery partner
  const visibleOrders = orders.filter(o => {
    // 'Offline' status partners only see orders explicitly assigned to them.
    if (currentUser?.status === 'Offline' || currentUser?.deliveryMode === 'Offline') {
      return o.deliveryPartnerEmail === currentUser?.email;
    }
    // 'Approved' (Online) partners see orders explicitly broadcasted to 'online_broadcast', or orders assigned to them.
    return (o.status === 'Pending' && o.deliveryPartnerEmail === 'online_broadcast') || (o.deliveryPartnerEmail === currentUser?.email);
  });

  const statusWeight = { 'Pending': 1, 'Out for Delivery': 2, 'Delivered': 3 };
  const filteredOrders = visibleOrders
    .filter(o => statusFilter === 'All' || o.status === statusFilter)
    .filter(o => (o.id || '').toLowerCase().includes(searchQuery.toLowerCase()) || (o.customer?.name || '').toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => (statusWeight[a.status] || 99) - (statusWeight[b.status] || 99));

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200 px-4 sm:px-6 py-3 flex justify-between items-center shadow-sm transition-all">
        <div onClick={() => setActiveTab('orders')} className="flex items-center gap-2 group shrink-0 cursor-pointer"> {/* Replaced emoji with Motorbike icon */}
          <Motorbike size={28} className="text-orange-600 sm:text-3xl" />
          <h1 className="text-lg sm:text-2xl font-black text-slate-900 italic tracking-tighter group-hover:text-orange-600 transition-colors hidden sm:block">Zesty Delivery</h1>
        </div>
        <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 sm:gap-3">
            <button onClick={() => setActiveTab(activeTab === 'orders' ? 'profile' : 'orders')} className="text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl transition-colors mr-1">
              {activeTab === 'orders' ? 'My Profile' : 'Back to Orders'}
            </button>
            <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold text-lg border-2 border-white shadow-sm overflow-hidden shrink-0">
              {currentUser?.photoURL ? <img src={currentUser.photoURL} alt="Profile" className="w-full h-full object-cover" /> : (currentUser?.name?.charAt(0) || 'D')}
            </div>
            <div className="text-right hidden sm:block">
              <p className="text-sm font-black text-slate-900 leading-none mb-1">{currentUser?.name || 'Partner'}</p>
              <button onClick={handleLogout} className="text-xs font-bold text-red-500 hover:text-red-600 flex items-center justify-end w-full gap-1"><LogOut size={12}/> Logout</button>
            </div>
            <button onClick={handleLogout} className="sm:hidden p-2 bg-red-50 text-red-500 rounded-full hover:bg-red-100 transition-colors shrink-0">
               <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>
      <div className="max-w-4xl mx-auto space-y-6 pt-24 px-6">
        
        {activeTab === 'profile' ? (
          <div className="bg-white rounded-3xl p-8 border border-orange-100 shadow-lg animate-in fade-in zoom-in-95 duration-300 max-w-xl mx-auto relative">
            <button onClick={handleEditToggle} className="absolute top-6 right-6 flex items-center gap-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl transition-colors shadow-sm">
              {isEditing ? <><Save size={14}/> Save</> : <><Edit2 size={14}/> Edit</>}
            </button>

            <div className="flex flex-col items-center mb-8 mt-4">
              <div className="relative w-32 h-32 rounded-full border-4 border-orange-50 shadow-xl flex items-center justify-center bg-orange-100 text-orange-500 text-4xl font-black mb-4 overflow-hidden">
                {currentUser?.photoURL ? <img src={currentUser.photoURL} alt="Profile" className="w-full h-full object-cover" /> : (currentUser?.name?.charAt(0) || 'D')}
                {isUploading && (
                  <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                    <span className="text-xs font-black text-orange-600 animate-pulse">Saving...</span>
                  </div>
                )}
              </div>
              
              <div className="flex gap-3 mb-5">
                <button onClick={openCamera} disabled={isUploading} className="flex items-center gap-1.5 px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-xs font-bold cursor-pointer hover:bg-orange-200 transition-colors shadow-sm">
                  <Camera size={14}/> Camera
                </button>
                <label htmlFor="galleryInput" className="flex items-center gap-1.5 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-xs font-bold cursor-pointer hover:bg-blue-200 transition-colors shadow-sm">
                  <Upload size={14}/> Gallery
                </label>
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" id="galleryInput" disabled={isUploading} />
              </div>

              {isEditing ? (
                <input type="text" value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} className="text-2xl font-black text-slate-900 text-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-1 outline-none focus:border-orange-400 w-full max-w-xs" />
              ) : (
                <h2 className="text-2xl font-black text-slate-900">{currentUser?.name}</h2>
              )}
              <span className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 mt-3 ${
                (currentUser?.status === 'Approved' && currentUser?.deliveryMode !== 'Offline') ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
              }`}>
                {(currentUser?.status === 'Approved' && currentUser?.deliveryMode !== 'Offline') ? <><Wifi size={14}/> Online Mode</> : <><WifiOff size={14}/> Offline Mode</>}
              </span>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0"><Mail size={20}/></div>
                <div className="flex-1"><p className="text-xs font-bold text-slate-400 uppercase">Email Address</p><p className="font-bold text-slate-700">{currentUser?.email}</p></div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center shrink-0"><Phone size={20}/></div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-slate-400 uppercase">Phone Number</p>
                  {isEditing ? (
                    <input type="tel" value={editData.phone} onChange={e => setEditData({...editData, phone: e.target.value.replace(/\D/g, '')})} className="w-full mt-1 bg-white border border-slate-200 rounded-lg px-3 py-1 outline-none focus:border-orange-400 font-bold text-slate-700" />
                  ) : (
                    <p className="font-bold text-slate-700">{currentUser?.phone}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center shrink-0"><MapPin size={20}/></div>
                <div className="flex-1"><p className="text-xs font-bold text-slate-400 uppercase">Service Area</p><p className="font-bold text-slate-700">{currentUser?.address}</p></div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Search Bar and Filter */}
            <div className="flex flex-col sm:flex-row gap-4 relative z-10">
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-orange-100 flex items-center gap-3 flex-1">
                <Search className="text-gray-400" size={20}/>
                <input 
                  type="text" 
                  placeholder="Search orders by ID or Customer Name..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 outline-none text-sm font-medium"
                />
              </div>

              <div className="relative w-full sm:w-48 shrink-0 self-center">
                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="w-full flex items-center justify-between px-4 py-4 sm:py-4 bg-white border border-orange-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all shadow-sm cursor-pointer"
                >
                  <span>{statusFilter === "All" ? "All Orders" : statusFilter}</span>
                  <span className={`text-[10px] text-slate-400 transition-transform duration-200 ${isFilterOpen ? 'rotate-180' : ''}`}>▼</span>
                </button>
                
                {isFilterOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsFilterOpen(false)}></div>
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-orange-100 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                      {filterOptions.map(option => (
                        <button
                          key={option}
                          onClick={() => { setStatusFilter(option); setIsFilterOpen(false); }}
                          className={`w-full text-left px-4 py-3 text-sm font-bold transition-colors ${statusFilter === option ? 'bg-orange-50 text-orange-700' : 'text-slate-700 hover:bg-slate-50'}`}
                        >
                          {option === "All" ? "All Orders" : option}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

        {filteredOrders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-slate-200"><h2 className="text-2xl font-bold text-slate-400">No orders found.</h2></div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map(order => (
              <div key={order.id} className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                
                {/* Header */}
                <div className="bg-slate-50 border-b border-slate-100 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="font-black text-slate-900 block text-lg">{order.id}</span>
                    <span className="text-xs font-bold text-slate-400">{order.date}</span>
                  </div>
                  <span className={`px-3 py-1.5 rounded-lg text-xs font-bold w-max ${order.status === 'Delivered' ? 'bg-green-100 text-green-700 border border-green-200' : order.status === 'Out for Delivery' ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'bg-orange-100 text-orange-700 border border-orange-200'}`}>
                    {order.status}
                  </span>
                </div>

                {/* Body */}
                <div className="p-4 sm:p-6 flex flex-col md:flex-row gap-6">
                  {/* Left Column - Customer & Items */}
                  <div className="flex-1 space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <h3 className="font-bold text-xl text-slate-800">{order.customer?.name || 'Unknown Customer'}</h3>
                      <a href={`tel:${order.customer?.phone}`} className="inline-flex items-center justify-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-bold bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl transition-colors w-full sm:w-auto border border-blue-100">
                        <Phone size={16} /> Call {order.customer?.phone}
                      </a>
                    </div>
                    
                    <div className="flex items-start gap-2.5 text-sm text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <MapPin size={18} className="shrink-0 mt-0.5 text-slate-400" /> 
                      <p className="leading-relaxed">
                        <span className="font-bold text-slate-700">{order.customer?.type || 'Home'}: </span>
                        {order.customer?.street ? `${order.customer.street}, ${order.customer.city} - ${order.customer.pincode}` : order.customer?.address || 'Address not provided'}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Order Items</p>
                      <div className="flex flex-wrap gap-2">
                        {(order.items || []).map((item, i) => (
                          <div key={i} className="bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 shadow-sm flex items-center gap-1.5">
                            <span className="text-orange-500">{item.quantity}x</span> {item.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Right Column - Payment & Actions */}
                  <div className="md:w-[280px] shrink-0 flex flex-col bg-slate-50 p-5 sm:p-6 rounded-3xl border border-slate-100">
                    <div className="text-center mb-6">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">To Collect</p>
                      <p className="text-4xl font-black text-slate-900">₹{order.total}</p>
                      <div className="inline-flex items-center gap-1 mt-2 bg-white px-3 py-1 rounded-md border border-slate-200 shadow-sm">
                        <CreditCard size={12} className="text-slate-400" />
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{order.paymentMethod}</p>
                      </div>
                    </div>
                    
                    <div className="mt-auto space-y-3">
                      {order.status === 'Pending' && !(currentUser?.status === 'Offline' || currentUser?.deliveryMode === 'Offline') && (
                        <button onClick={() => updateOrderStatus(order.id, 'Out for Delivery', currentUser?.email)} className="w-full py-3.5 bg-blue-600 text-white font-bold text-sm rounded-xl shadow-[0px_8px_16px_rgba(37,99,235,0.2)] hover:bg-blue-700 active:scale-95 transition-all">Pick Up Order</button>
                      )}
                      {(order.status === 'Out for Delivery' || (order.status === 'Pending' && (currentUser?.status === 'Offline' || currentUser?.deliveryMode === 'Offline'))) && (
                        <button onClick={() => updateOrderStatus(order.id, 'Delivered')} className="w-full py-3.5 bg-green-500 text-white font-bold text-sm rounded-xl shadow-[0px_8px_16px_rgba(34,197,94,0.2)] hover:bg-green-600 active:scale-95 transition-all flex items-center justify-center gap-2"><CheckCircle2 size={18}/> Mark Delivered</button>
                      )}
                      {order.status === 'Delivered' && (
                        <button disabled className="w-full py-3.5 bg-slate-200 text-slate-400 font-bold text-sm rounded-xl cursor-not-allowed flex items-center justify-center gap-2"><CheckCircle2 size={18}/> Order Complete</button>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
          </>
        )}
      </div>

      {/* Live Camera Modal */}
      {showCamera && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center p-4">
          <button onClick={closeCamera} className="absolute top-6 right-6 text-white p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors">
            <X size={24} />
          </button>
          <div className="relative w-full max-w-md bg-black rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-800 aspect-[3/4]">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover"></video>
            <canvas ref={canvasRef} className="hidden"></canvas>
            <div className="absolute bottom-8 left-0 right-0 flex justify-center">
              <button onClick={capturePhoto} className="w-16 h-16 bg-white rounded-full border-4 border-slate-300 shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-transform">
                <div className="w-12 h-12 bg-white border border-slate-200 rounded-full"></div>
              </button>
            </div>
          </div>
          <p className="text-white mt-4 font-bold text-sm tracking-widest uppercase">Position your face & tap</p>
        </div>
      )}
    </div>
  )
}
import { useStore } from '../context/StoreContext'
import { Link, useNavigate } from 'react-router-dom'
import { Search, Camera, Mail, Phone, MapPin, CheckCircle2, Upload, Edit2, Save, X } from 'lucide-react'
import { useState, useRef } from 'react'
import { getFirestore, doc, updateDoc } from 'firebase/firestore'
import { auth } from '../firebase'

export default function Delivery() {
  const { orders, updateOrderStatus, logout, currentUser, updateUser } = useStore()
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/home', { replace: true }); };
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('orders');
  const [isUploading, setIsUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ name: '', phone: '' });
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const handleEditToggle = async () => {
    if (isEditing) {
      try {
        const updatedUser = { ...currentUser, name: editData.name, phone: editData.phone };
        updateUser(updatedUser);
        if (currentUser?.uid) {
          const db = getFirestore(auth.app);
          await updateDoc(doc(db, "users", currentUser.uid), { name: editData.name, phone: editData.phone });
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
        await updateDoc(doc(db, "users", currentUser.uid), { photoURL: base64String });
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
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
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
  const visibleOrders = orders.filter(o => 
    o.status === 'Pending' || o.deliveryPartnerEmail === currentUser?.email
  );

  const filteredOrders = visibleOrders.filter(o => (o.id || '').toLowerCase().includes(searchQuery.toLowerCase()) || (o.customer?.name || '').toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200 px-4 sm:px-6 py-3 flex justify-between items-center shadow-sm transition-all">
        <div className="flex items-center gap-2 group shrink-0">
          <span className="text-2xl sm:text-3xl">🛵</span>
          <h1 className="text-lg sm:text-2xl font-black text-slate-900 italic tracking-tighter group-hover:text-orange-600 transition-colors hidden sm:block">Zesty Delivery</h1>
        </div>
        <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
            <button onClick={() => setActiveTab(activeTab === 'orders' ? 'profile' : 'orders')} className="text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl transition-colors mr-1 sm:mr-2">
              {activeTab === 'orders' ? 'My Profile' : 'Back to Orders'}
            </button>
            <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold text-lg border-2 border-white shadow-sm overflow-hidden">
              {currentUser?.photoURL ? <img src={currentUser.photoURL} alt="Profile" className="w-full h-full object-cover" /> : (currentUser?.name?.charAt(0) || 'D')}
            </div>
            <div className="text-right hidden lg:block">
              <p className="text-sm font-black text-slate-900 leading-none">{currentUser?.name || 'Partner'}</p>
              <button onClick={handleLogout} className="text-xs font-bold text-red-500 hover:text-red-600">Logout</button>
            </div>
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
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold mt-2 flex items-center gap-1"><CheckCircle2 size={14}/> {currentUser?.status || 'Active Partner'}</span>
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
            {/* Search Bar */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-orange-100 flex items-center gap-3">
              <Search className="text-gray-400" size={20}/>
              <input 
                type="text" 
                placeholder="Search orders by ID or Customer Name..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 outline-none text-sm font-medium"
              />
            </div>

        {filteredOrders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-orange-100"><h2 className="text-2xl font-bold text-slate-400">No orders found.</h2></div>
        ) : (
          filteredOrders.map(order => (
            <div key={order.id} className="bg-white p-6 rounded-[2rem] shadow-lg border border-orange-100 flex flex-col md:flex-row justify-between gap-6">
              <div className="flex-1">
                <div className="flex flex-wrap gap-3 mb-4"><span className="bg-orange-100 text-orange-700 font-black px-3 py-1 rounded-lg text-xs">{order.id}</span><span className={`text-xs font-bold px-3 py-1 rounded-lg ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' : order.status === 'Out for Delivery' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>{order.status}</span><span className="text-xs text-slate-400 font-medium py-1">{order.date}</span></div>
                <h3 className="font-bold text-xl mb-1 text-slate-900">{order.customer?.name || 'Unknown Customer'}</h3>
                <a href={`tel:${order.customer?.phone}`} className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-bold mb-1 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors w-max">📞 Call {order.customer?.phone}</a>
                <p className="text-sm text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100 mt-2">📍 {order.customer?.address} ({order.customer?.type || 'Home'})</p>
                <div className="mt-4"><p className="text-xs font-bold text-slate-400 uppercase mb-2">Order Items:</p><div className="flex flex-wrap gap-2">{(order.items || []).map((item, i) => (<div key={i} className="bg-orange-50 border border-orange-100 px-3 py-1 rounded-lg text-xs font-bold text-orange-800">{item.quantity}x {item.name}</div>))}</div></div>
              </div>
              <div className="md:w-64 bg-slate-50 p-6 rounded-3xl border border-slate-100 flex flex-col justify-center text-center">
                <p className="text-slate-500 font-medium mb-1">To Collect</p><p className="text-4xl font-black text-slate-900 mb-6">₹{order.total}</p>
                {order.status === 'Pending' && (<button onClick={() => updateOrderStatus(order.id, 'Out for Delivery', currentUser?.email)} className="w-full py-4 bg-orange-500 text-white font-bold rounded-xl shadow-[0px_10px_20px_rgba(249,115,22,0.4)] hover:bg-orange-600 active:scale-95 transition-all">Pick Up Order</button>)}
                {order.status === 'Out for Delivery' && (<button onClick={() => updateOrderStatus(order.id, 'Delivered')} className="w-full py-4 bg-green-500 text-white font-bold rounded-xl shadow-[0px_10px_20px_rgba(34,197,94,0.4)] hover:bg-green-600 active:scale-95 transition-all">Mark Delivered ✓</button>)}
                {order.status === 'Delivered' && (<button disabled className="w-full py-4 bg-slate-200 text-slate-400 font-bold rounded-xl cursor-not-allowed">Order Complete</button>)}
              </div>
            </div>
          ))
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
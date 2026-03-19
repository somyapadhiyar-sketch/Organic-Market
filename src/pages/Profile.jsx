import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useStore } from "../context/StoreContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Profile() {
  const navigate = useNavigate();
  const { currentUser, updateUser, deleteUser, logout, showToast } = useStore();

  const [showAddresses, setShowAddresses] = useState(false);
  const [addresses, setAddresses] = useState([]);

  // Notification preferences state
  const [notificationPrefs, setNotificationPrefs] = useState({
    orderUpdates: true,
    promotions: true,
  });

  // Address Form State
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressIndex, setEditingAddressIndex] = useState(null);
  const [addressFormData, setAddressFormData] = useState({
    name: "", phone: "", street: "", city: "", state: "", pincode: "", type: "Home"
  });

  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [activeSupportSection, setActiveSupportSection] = useState(null);
  const [editName, setEditName] = useState("");

  // Password change modal state
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "", newPassword: "", confirmPassword: "",
  });

  // Payment methods state
  const [showPaymentMethods, setShowPaymentMethods] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentFormData, setPaymentFormData] = useState({
    type: "CARD", cardNumber: "", cardHolder: "", expiryMonth: "", expiryYear: "", cvv: "", upiId: "", bankName: "", accountNumber: "",
  });

  // Account info
  const [memberSince, setMemberSince] = useState("");
  const [lastLogin, setLastLogin] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
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

    setEditName(currentUser.name || "");

    // Load addresses from currentUser object
    setAddresses(currentUser.savedAddresses || []);
    setPaymentMethods(currentUser.savedPayments || []);

    // Load mock dates
    const savedMemberSince = localStorage.getItem("memberSince_" + currentUser.email);
    if (savedMemberSince) {
      setMemberSince(savedMemberSince);
    } else {
      const formatted = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long" });
      setMemberSince(formatted);
      localStorage.setItem("memberSince_" + currentUser.email, formatted);
    }

    const nowFormatted = new Date().toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
    setLastLogin(nowFormatted);

    const savedPrefs = localStorage.getItem("notificationPrefs_" + currentUser.email);
    if (savedPrefs) setNotificationPrefs(JSON.parse(savedPrefs));

  }, [navigate, currentUser]);

  const handleNotificationToggle = (type) => {
    const updated = { ...notificationPrefs, [type]: !notificationPrefs[type] };
    setNotificationPrefs(updated);
    localStorage.setItem("notificationPrefs_" + currentUser.email, JSON.stringify(updated));
  };

  // --- Password Management ---
  const handlePasswordChange = () => {
    if (!passwordData.currentPassword || !passwordData.newPassword) return showToast("Please fill all fields");
    if (passwordData.newPassword.length < 6) return showToast("New password must be at least 6 characters");
    if (passwordData.newPassword !== passwordData.confirmPassword) return showToast("New passwords do not match");
    if (currentUser.password !== passwordData.currentPassword) return showToast("Current password is incorrect");

    updateUser({ ...currentUser, password: passwordData.newPassword });
    showToast("Password changed successfully!");
    setShowPasswordChange(false);
    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  // --- Address Management ---
  const openAddAddressForm = () => {
    setEditingAddressIndex(null);
    setAddressFormData({ name: currentUser.name || "", phone: currentUser.phone || "", street: "", city: "", state: "", pincode: "", type: "Home" });
    setShowAddressForm(true);
  };

  const openEditAddressForm = (addr, index) => {
    setEditingAddressIndex(index);
    setAddressFormData(addr);
    setShowAddressForm(true);
  };

  const saveAddress = () => {
    if (!addressFormData.name || !addressFormData.phone || !addressFormData.street || !addressFormData.pincode) {
      return showToast("Please fill all required fields");
    }

    let updatedAddresses = [...addresses];
    if (editingAddressIndex !== null) {
      updatedAddresses[editingAddressIndex] = addressFormData;
    } else {
      updatedAddresses.push(addressFormData);
    }

    setAddresses(updatedAddresses);
    updateUser({ ...currentUser, savedAddresses: updatedAddresses });
    showToast("Address saved successfully!");
    setShowAddressForm(false);
  };

  const handleDeleteAddress = (index) => {
    if (!window.confirm("Delete this address?")) return;
    const updatedAddresses = addresses.filter((_, i) => i !== index);
    setAddresses(updatedAddresses);
    updateUser({ ...currentUser, savedAddresses: updatedAddresses });
    showToast("Address deleted");
  };

  const setAsDefaultAddress = (index) => {
    const selected = addresses[index];
    const others = addresses.filter((_, i) => i !== index);
    const reordered = [selected, ...others];
    setAddresses(reordered);
    updateUser({ ...currentUser, savedAddresses: reordered });
    showToast("Default address updated");
  };

  const handleSaveProfile = () => {
    if (!editName.trim()) return;
    updateUser({ ...currentUser, name: editName });
    setShowEditProfile(false);
    showToast("Profile updated successfully!");
  };

  const handleDeleteAccount = () => {
    if (window.confirm("⚠️ WARNING: Are you sure you want to delete your account?\n\nThis will permanently erase your data and cannot be undone.")) {
      deleteUser(currentUser.email);
      showToast("Your account has been successfully deleted.");
      navigate("/signup");
    }
  };

  // --- Payment Methods ---
  const savePaymentMethod = () => {
    if (paymentFormData.type === "CARD" && (!paymentFormData.cardNumber || !paymentFormData.cvv)) return showToast("Fill all card details");
    
    const newPayment = {
      id: Date.now(),
      ...paymentFormData,
      lastFour: paymentFormData.type === "CARD" ? paymentFormData.cardNumber.replace(/\s/g, "").slice(-4) : null,
    };

    const updatedPayments = [...paymentMethods, newPayment];
    setPaymentMethods(updatedPayments);
    updateUser({ ...currentUser, savedPayments: updatedPayments });
    setShowPaymentForm(false);
    showToast("Payment method added!");
  };

  const handleDeletePayment = (id) => {
    if (!window.confirm("Remove this payment method?")) return;
    const updatedPayments = paymentMethods.filter((p) => p.id !== id);
    setPaymentMethods(updatedPayments);
    updateUser({ ...currentUser, savedPayments: updatedPayments });
    showToast("Payment method removed");
  };

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      <Navbar />
      
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-[130px] pb-12">
        <h1 className="text-3xl font-black text-slate-900 mb-8 tracking-tight">Advanced Settings ⚙️</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Left Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* User Info Card */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center text-4xl font-black mb-4 shadow-lg uppercase">
                {currentUser.name.charAt(0)}
              </div>
              <h2 className="text-xl font-black text-slate-900 mb-1">{currentUser.name}</h2>
              <p className="text-slate-500 text-sm font-medium mb-4">{currentUser.email}</p>

              <div className="flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-bold mb-6 border border-green-100">
                ✓ Verified Account
              </div>

              <div className="w-full space-y-3 text-left border-t border-slate-100 pt-5">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-400 uppercase tracking-wider">Member Since</span>
                  <span className="text-slate-700 font-bold">{memberSince}</span>
                </div>
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-400 uppercase tracking-wider">Last Login</span>
                  <span className="text-slate-700 font-bold">{lastLogin}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Account Settings Panel */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-8">
              <h3 className="text-xl font-black text-slate-900 mb-6 border-b border-slate-100 pb-4">Account Settings</h3>

              <div className="space-y-6">
                {/* 1. Edit Profile */}
                <div className="border-b border-slate-100 pb-6">
                  <div className="flex justify-between items-center cursor-pointer group" onClick={() => setShowEditProfile(!showEditProfile)}>
                    <span className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">Personal Information</span>
                    <span className="text-blue-600 text-sm font-bold bg-blue-50 px-3 py-1.5 rounded-lg">{showEditProfile ? "Close ↑" : "Edit →"}</span>
                  </div>
                  {showEditProfile && (
                    <div className="mt-5 space-y-4 animate-in fade-in slide-in-from-top-2">
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Full Name</label>
                        <div className="flex gap-3">
                          <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-800" />
                          <button onClick={handleSaveProfile} className="bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-xl text-sm font-bold shadow-sm transition-colors">Save</button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Email Address</label>
                        <input type="email" value={currentUser.email} disabled className="w-full p-3 bg-gray-100 border border-gray-200 rounded-xl text-sm font-bold text-gray-500 cursor-not-allowed" />
                        <p className="text-[11px] font-bold text-slate-400 mt-2">Email address cannot be changed for security reasons.</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Change Password */}
                <div className="border-b border-slate-100 pb-6">
                  <div className="flex justify-between items-center cursor-pointer group" onClick={() => setShowPasswordChange(!showPasswordChange)}>
                    <span className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">Change Password</span>
                    <span className="text-blue-600 text-sm font-bold bg-blue-50 px-3 py-1.5 rounded-lg">{showPasswordChange ? "Close ↑" : "Update →"}</span>
                  </div>
                  {showPasswordChange && (
                    <div className="mt-5 space-y-4 animate-in fade-in slide-in-from-top-2">
                      <input type="password" value={passwordData.currentPassword} onChange={e => setPasswordData({...passwordData, currentPassword: e.target.value})} placeholder="Current Password" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-800" />
                      <input type="password" value={passwordData.newPassword} onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})} placeholder="New Password" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-800" />
                      <input type="password" value={passwordData.confirmPassword} onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})} placeholder="Confirm New Password" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-800" />
                      <button onClick={handlePasswordChange} className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3.5 rounded-xl font-bold text-sm shadow-sm transition-colors">Update Password</button>
                    </div>
                  )}
                </div>

                {/* 3. Shipping Addresses */}
                <div className="border-b border-slate-100 pb-6">
                  <div className="flex justify-between items-center cursor-pointer group" onClick={() => setShowAddresses(!showAddresses)}>
                    <span className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">Shipping Addresses ({addresses.length})</span>
                    <span className="text-blue-600 text-sm font-bold bg-blue-50 px-3 py-1.5 rounded-lg">{showAddresses ? "Close ↑" : "Manage →"}</span>
                  </div>

                  {showAddresses && (
                    <div className="mt-5 space-y-4 animate-in fade-in slide-in-from-top-2">
                      {!showAddressForm && (
                        <button onClick={openAddAddressForm} className="w-full py-4 border-2 border-dashed border-blue-200 rounded-2xl text-blue-600 font-bold hover:bg-blue-50 transition-colors flex items-center justify-center gap-2">
                          + Add New Address
                        </button>
                      )}

                      {showAddressForm && (
                        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                          <h4 className="font-black text-slate-900 mb-5">{editingAddressIndex !== null ? "Edit Address" : "Add New Address"}</h4>
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <input type="text" value={addressFormData.name} onChange={e => setAddressFormData({...addressFormData, name: e.target.value})} placeholder="Full Name" className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-blue-500 transition-all text-slate-800" />
                              <input type="tel" maxLength="10" value={addressFormData.phone} onChange={e => setAddressFormData({...addressFormData, phone: e.target.value.replace(/\D/g, '')})} placeholder="Phone Number" className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-blue-500 transition-all text-slate-800" />
                            </div>
                            <input type="text" value={addressFormData.street} onChange={e => setAddressFormData({...addressFormData, street: e.target.value})} placeholder="Flat / House / Office No, Street Name" className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-blue-500 transition-all text-slate-800" />
                            <div className="grid grid-cols-3 gap-4">
                              <input type="text" value={addressFormData.city} onChange={e => setAddressFormData({...addressFormData, city: e.target.value})} placeholder="City" className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-blue-500 transition-all text-slate-800" />
                              <input type="text" value={addressFormData.state} onChange={e => setAddressFormData({...addressFormData, state: e.target.value})} placeholder="State" className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-blue-500 transition-all text-slate-800" />
                              <input type="text" maxLength="6" value={addressFormData.pincode} onChange={e => setAddressFormData({...addressFormData, pincode: e.target.value.replace(/\D/g, '')})} placeholder="Pincode" className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-blue-500 transition-all text-slate-800" />
                            </div>
                            <div className="flex gap-2 mb-2">
                              {['Home', 'Work', 'Other'].map(type => (
                                <button key={type} onClick={() => setAddressFormData({...addressFormData, type})} className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors border ${addressFormData.type === type ? 'bg-blue-100 border-blue-500 text-blue-700' : 'bg-white border-slate-200 text-slate-500'}`}>{type}</button>
                              ))}
                            </div>
                            <div className="flex gap-3 pt-2">
                              <button onClick={saveAddress} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-bold text-sm shadow-sm transition-colors">Save Address</button>
                              <button onClick={() => setShowAddressForm(false)} className="flex-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 py-3.5 rounded-xl font-bold text-sm transition-colors">Cancel</button>
                            </div>
                          </div>
                        </div>
                      )}

                      {addresses.length === 0 && !showAddressForm ? (
                        <p className="text-sm font-bold text-slate-400 text-center py-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200">No saved addresses.</p>
                      ) : (
                        <div className="space-y-4 mt-2">
                          {addresses.map((addr, index) => (
                            <div key={index} className={`p-5 rounded-2xl border-2 transition-all ${index === 0 ? "border-green-500 bg-green-50/30" : "border-slate-100 bg-white"}`}>
                              <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
                                <div>
                                  <div className="flex flex-wrap items-center gap-2 mb-2">
                                    <span className="font-black text-slate-900">{addr.name}</span>
                                    <span className="bg-slate-200 text-slate-700 text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">{addr.type}</span>
                                    {index === 0 && <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider border border-green-200">Default</span>}
                                  </div>
                                  <p className="text-slate-600 text-sm font-medium mb-1">{addr.street}, {addr.city}, {addr.state} - {addr.pincode}</p>
                                  <p className="text-slate-500 text-xs font-bold mt-2">📞 {addr.phone}</p>
                                </div>
                                <div className="flex flex-wrap gap-2 sm:shrink-0 w-full sm:w-auto">
                                  <button onClick={() => openEditAddressForm(addr, index)} className="flex-1 sm:flex-none py-2 px-3 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors font-bold text-xs text-center">Edit</button>
                                  <button onClick={() => handleDeleteAddress(index)} className="flex-1 sm:flex-none py-2 px-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors font-bold text-xs text-center">Delete</button>
                                  {index !== 0 && <button onClick={() => setAsDefaultAddress(index)} className="flex-1 sm:flex-none py-2 px-3 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors font-bold text-xs text-center">Set Default</button>}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 4. Payment Methods */}
                <div className="border-b border-slate-100 pb-6">
                  <div className="flex justify-between items-center cursor-pointer group" onClick={() => setShowPaymentMethods(!showPaymentMethods)}>
                    <span className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">Payment Methods</span>
                    <span className="text-blue-600 text-sm font-bold bg-blue-50 px-3 py-1.5 rounded-lg">{showPaymentMethods ? "Close ↑" : "Manage →"}</span>
                  </div>

                  {showPaymentMethods && (
                    <div className="mt-5 space-y-4 animate-in fade-in slide-in-from-top-2">
                      {paymentMethods.map(method => (
                        <div key={method.id} className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 p-5 border border-slate-200 rounded-2xl bg-white shadow-sm">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-xl shrink-0">💳</div>
                            <div className="overflow-hidden">
                              <p className="text-sm font-black text-slate-900 truncate">
                                {method.type === "CARD" && `•••• ${method.lastFour}`}
                                {method.type === "UPI" && method.upiId}
                                {method.type === "NET_BANKING" && method.bankName}
                              </p>
                              <p className="text-xs font-bold text-slate-400 mt-0.5 truncate">
                                {method.type === "CARD" && `Expires ${method.expiryMonth}/${method.expiryYear}`}
                                {method.type === "UPI" && "UPI Linked"}
                                {method.type === "NET_BANKING" && `Acc: •••• ${method.accountNumber.slice(-4)}`}
                              </p>
                            </div>
                          </div>
                          <button onClick={() => handleDeletePayment(method.id)} className="w-full sm:w-auto text-red-500 hover:bg-red-50 py-2.5 px-4 rounded-xl transition-colors font-bold text-xs bg-white border border-red-100 text-center shrink-0">Remove</button>
                        </div>
                      ))}

                      {!showPaymentForm ? (
                        <button onClick={() => setShowPaymentForm(true)} className="w-full py-4 border-2 border-dashed border-blue-200 rounded-2xl text-blue-600 font-bold hover:bg-blue-50 transition-colors flex items-center justify-center gap-2">
                          + Add Payment Method
                        </button>
                      ) : (
                        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                          <h4 className="font-black text-slate-900 mb-5">Add New Payment Method</h4>
                          <div className="flex gap-2 mb-5 bg-white p-1 rounded-xl border border-slate-200">
                            {["CARD", "UPI", "NET_BANKING"].map(type => (
                              <button key={type} onClick={() => setPaymentFormData({...paymentFormData, type})} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${paymentFormData.type === type ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-100"}`}>
                                {type === "CARD" ? "Card" : type === "UPI" ? "UPI" : "Net Banking"}
                              </button>
                            ))}
                          </div>

                          <div className="space-y-4">
                            {paymentFormData.type === "CARD" && (
                              <>
                                <input type="text" maxLength="19" value={paymentFormData.cardNumber} onChange={e => setPaymentFormData({...paymentFormData, cardNumber: e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim()})} placeholder="Card Number" className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-blue-500 text-slate-800" />
                                <input type="text" value={paymentFormData.cardHolder} onChange={e => setPaymentFormData({...paymentFormData, cardHolder: e.target.value})} placeholder="Card Holder Name" className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-blue-500 text-slate-800" />
                                <div className="grid grid-cols-3 gap-3">
                                  <input type="text" placeholder="MM" maxLength="2" value={paymentFormData.expiryMonth} onChange={e => setPaymentFormData({...paymentFormData, expiryMonth: e.target.value.replace(/\D/g, '')})} className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-blue-500 text-slate-800 text-center" />
                                  <input type="text" placeholder="YY" maxLength="2" value={paymentFormData.expiryYear} onChange={e => setPaymentFormData({...paymentFormData, expiryYear: e.target.value.replace(/\D/g, '')})} className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-blue-500 text-slate-800 text-center" />
                                  <input type="password" placeholder="CVV" maxLength="3" value={paymentFormData.cvv} onChange={e => setPaymentFormData({...paymentFormData, cvv: e.target.value.replace(/\D/g, '')})} className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-blue-500 text-slate-800 text-center" />
                                </div>
                              </>
                            )}
                            {paymentFormData.type === "UPI" && (
                              <input type="text" value={paymentFormData.upiId} onChange={e => setPaymentFormData({...paymentFormData, upiId: e.target.value})} placeholder="username@bank" className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-blue-500 text-slate-800" />
                            )}
                            {paymentFormData.type === "NET_BANKING" && (
                              <>
                                <select value={paymentFormData.bankName} onChange={e => setPaymentFormData({...paymentFormData, bankName: e.target.value})} className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-blue-500 text-slate-800">
                                  <option value="">Select Bank</option><option value="HDFC">HDFC Bank</option><option value="SBI">State Bank of India</option><option value="ICICI">ICICI Bank</option>
                                </select>
                                <input type="text" value={paymentFormData.accountNumber} onChange={e => setPaymentFormData({...paymentFormData, accountNumber: e.target.value})} placeholder="Account Number" className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-blue-500 text-slate-800" />
                              </>
                            )}
                            <div className="flex gap-3 pt-2">
                              <button onClick={savePaymentMethod} className="flex-1 bg-slate-900 hover:bg-slate-800 text-white py-3.5 rounded-xl font-bold text-sm shadow-sm transition-colors">Save Method</button>
                              <button onClick={() => setShowPaymentForm(false)} className="flex-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 py-3.5 rounded-xl font-bold text-sm transition-colors">Cancel</button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 5. Help & Support */}
                <div className="border-b border-slate-100 pb-6">
                  <div className="flex justify-between items-center cursor-pointer group" onClick={() => setShowSupport(!showSupport)}>
                    <span className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">Help & Support</span>
                    <span className="text-blue-600 text-sm font-bold bg-blue-50 px-3 py-1.5 rounded-lg">{showSupport ? "Close ↑" : "View →"}</span>
                  </div>
                  {showSupport && (
                    <div className="mt-4 animate-in fade-in space-y-3">
                      <div onClick={() => setActiveSupportSection(activeSupportSection === "contact" ? null : "contact")} className="p-4 rounded-xl text-sm cursor-pointer font-bold flex justify-between bg-slate-50 hover:bg-blue-50 text-slate-700 transition-colors border border-slate-100">
                        Contact Customer Service <span>{activeSupportSection === "contact" ? "−" : "+"}</span>
                      </div>
                      {activeSupportSection === "contact" && (
                        <div className="p-5 bg-white border border-slate-100 rounded-xl text-sm text-slate-600 font-medium ml-4">
                          <p className="font-black text-slate-900 mb-3">We're here to help!</p>
                          <p className="mb-1">Email: <a href="mailto:support@zesty.com" className="text-blue-600 hover:underline font-bold">support@zesty.com</a></p>
                          <p className="mb-1">Phone: <a href="tel:+919876543210" className="text-blue-600 hover:underline font-bold">+91 98765 43210</a></p>
                          <p>Hours: Mon-Sat, 9:00 AM - 8:00 PM</p>
                        </div>
                      )}

                      <div onClick={() => setActiveSupportSection(activeSupportSection === "faq" ? null : "faq")} className="p-4 rounded-xl text-sm cursor-pointer font-bold flex justify-between bg-slate-50 hover:bg-blue-50 text-slate-700 transition-colors border border-slate-100">
                        Frequently Asked Questions <span>{activeSupportSection === "faq" ? "−" : "+"}</span>
                      </div>
                      {activeSupportSection === "faq" && (
                        <div className="p-5 bg-white border border-slate-100 rounded-xl text-sm text-slate-600 font-medium ml-4 space-y-4">
                          <div><p className="font-black text-slate-900 mb-1">How do I track my order?</p><p>Check the "Recent Orders" section above.</p></div>
                          <div><p className="font-black text-slate-900 mb-1">Can I cancel my order?</p><p>Cancellations are allowed if the order hasn't been picked up.</p></div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 6. Delete Account */}
                <div className="pt-2">
                  <div className="flex justify-between items-center cursor-pointer group bg-red-50 p-4 rounded-xl border border-red-100 hover:bg-red-100 transition-colors" onClick={handleDeleteAccount}>
                    <span className="text-sm font-black text-red-600">Delete Account</span>
                    <span className="text-red-600 text-sm font-bold bg-white px-3 py-1.5 rounded-lg border border-red-200">Delete Permanently</span>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useStore } from '../context/StoreContext'
import { Plus, Minus, MapPin, CreditCard, Banknote, Building, CheckCircle2, Loader2, ArrowRight, ShoppingCart, Truck, Wallet, Home, Briefcase, Map } from 'lucide-react'
import { Country, State, City } from 'country-state-city'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

// Mock Pincode data for validation
const MOCK_PINCODE_DATA = {
  "India": {
    "Gujarat": {
      "Ahmedabad": ["380001", "380006", "380009", "380015", "380052"],
      "Surat": ["395003", "395004", "395007", "395010"],
      "Vadodara": ["390001", "390002", "390007"],
      "Rajkot": ["360001", "360002", "360004"],
      "Gandhinagar": ["382010", "382016", "382021"]
    },
    "Maharashtra": {
      "Mumbai": ["400001", "400002", "400011"],
      "Pune": ["411001", "411002", "411005"]
    }
  }
};

export default function Cart() {
  const { cart, addToCart, decreaseCartQuantity, getCartTotal, placeOrder, currentUser, showToast, updateUser, setUserLocation } = useStore()
  const total = getCartTotal()
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1); // 1 = Cart, 2 = Address, 3 = Payment
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  // Payment Details State
  const [paymentDetails, setPaymentDetails] = useState({
    upiId: '',
    cardNumber: '',
    cardName: '',
    expiryMM: '',
    expiryYY: '',
    cvv: '',
    bankName: ''
  });
  
  // Address States
  const [saveAddress, setSaveAddress] = useState(false);
  
  // Address State
  const [address, setAddress] = useState(() => {
    const saved = currentUser?.savedAddresses?.[0]; // Default to first saved address
    return {
      name: currentUser?.name || '',
      phone: currentUser?.phone || '',
      street: saved?.street || '',
      country: saved?.country || '',
      state: saved?.state || '',
      city: saved?.city || '',
      pincode: saved?.pincode || '',
      type: saved?.type || 'Home'
    };
  });

  const countries = Country.getAllCountries();
  const states = address.country ? State.getStatesOfCountry(address.country) : [];
  const cities = address.country && address.state ? City.getCitiesOfState(address.country, address.state) : [];

  // Coupon & OTP States
  const [couponCode, setCouponCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponMessage, setCouponMessage] = useState({ type: "", text: "" });
  const [showOffers, setShowOffers] = useState(false);

  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);

  useEffect(() => {
    let interval;
    if (otpTimer > 0) {
      interval = setInterval(() => setOtpTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  useEffect(() => {
    if (currentUser?.role === 'admin') navigate('/admin', { replace: true });
    else if (currentUser?.role === 'delivery') navigate('/delivery', { replace: true });
  }, [currentUser, navigate]);

  const availableOffers = [
    { code: "ZESTY20", desc: "Get 20% OFF on your entire order." },
    { code: "WELCOME50", desc: "Flat 50% OFF for new users!" },
  ];

  const handleApplyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (code === "ZESTY20") { setDiscountPercent(0.2); setCouponMessage({ type: "success", text: "Coupon applied! 20% OFF" }); }
    else if (code === "WELCOME50") { setDiscountPercent(0.5); setCouponMessage({ type: "success", text: "Coupon applied! 50% OFF" }); }
    else if (code === "") { setCouponMessage({ type: "error", text: "Please enter a code." }); }
    else { setDiscountPercent(0); setCouponMessage({ type: "error", text: "Invalid or expired coupon." }); }
  };

  const discountAmount = Math.round(total * discountPercent);
  const discountedSubtotal = total - discountAmount;
  const deliveryFee = discountedSubtotal > 500 ? 0 : 30;
  const handlingCharge = 5;
  const grandTotal = discountedSubtotal + deliveryFee + handlingCharge;

  const arePaymentDetailsValid = () => {
    if (paymentMethod === 'UPI') return paymentDetails.upiId.includes('@') && paymentDetails.upiId.length > 3;
    if (paymentMethod === 'Card') return paymentDetails.cardNumber.length >= 19 && paymentDetails.cardName.trim() !== '' && paymentDetails.expiryMM && paymentDetails.expiryYY && paymentDetails.cvv.length >= 3;
    if (paymentMethod === 'NetBanking') return paymentDetails.bankName !== '';
    return true; // COD
  };

  const handleProceed = () => {
    if (!currentUser) return showToast("Please login to place an order!");
    if (step === 2) { // Validate address before moving to payment
      if (!address.name || !address.phone || !address.street || !address.country || !address.state || !address.city || !address.pincode) {
        return showToast("Please fill all delivery details!");
      }

      const countryName = Country.getCountryByCode(address.country)?.name;
      const stateName = State.getStateByCodeAndCountry(address.state, address.country)?.name;

      // Pincode validation
      const validPincodes = countryName && stateName ? MOCK_PINCODE_DATA[countryName]?.[stateName]?.[address.city] : undefined;

      if (validPincodes === undefined) {
        return showToast("Sorry, we don't deliver to this city yet.");
      }

      if (!validPincodes.includes(address.pincode)) {
        return showToast("Sorry, we don't deliver to this Pincode yet.");
      }

      // Generate formatted address string for display/storage
      const formattedAddress = `${address.street}, ${address.city}, ${stateName}, ${countryName} - ${address.pincode}`;

      // Update session location immediately so Navbar updates
      if (setUserLocation) setUserLocation(formattedAddress);

      // Persist to user profile if checkbox is checked
      if (saveAddress && currentUser) {
        const newAddress = { ...address };
        let updatedSavedAddresses = currentUser.savedAddresses || [];
        
        // Append new address. Filter out exact duplicates to avoid clutter.
        const isDuplicate = updatedSavedAddresses.some(a => a.type === newAddress.type && a.street === newAddress.street && a.pincode === newAddress.pincode);

        if (!isDuplicate) {
          updatedSavedAddresses = [newAddress, ...updatedSavedAddresses];
          const updatedUser = { ...currentUser, savedAddresses: updatedSavedAddresses };
          if (updateUser) updateUser(updatedUser);
          else currentUser.savedAddresses = updatedSavedAddresses;
          
          try {
            localStorage.setItem('user', JSON.stringify(updatedUser));
          } catch (e) {
            console.error("Failed to save address to local storage", e);
          }
        }
      }
    }
    setStep(s => s + 1);
  };

  const handlePayment = (e) => {
    e.preventDefault();
    
    if (paymentMethod !== 'COD' && otp !== '123456') {
      return showToast("Invalid OTP. Please enter 123456 to verify.");
    }

    setIsProcessing(true);
    
    // Simulate real payment gateway delay
    setTimeout(() => {
      placeOrder({ 
        items: cart, 
        customer: address, 
        total: grandTotal, 
        paymentMethod,
        date: new Date().toLocaleString()
      });
      setIsProcessing(false);
      setOrderSuccess(true);
      
      // Redirect to home after 3 seconds
      setTimeout(() => {
        navigate('/home');
      }, 3000);
    }, 2000);
  };

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center font-sans text-center p-4">
        <CheckCircle2 size={80} className="text-green-600 mb-6" />
        <h1 className="text-4xl font-black text-slate-800 mb-3">Order Placed Successfully!</h1>
        <p className="text-slate-600 font-medium text-lg max-w-md">Your fresh, organic groceries are being packed and will be with you in minutes.</p>
        <p className="text-slate-400 mt-6 font-bold text-sm">Redirecting to home...</p>
      </div>
    );
  }

  const checkoutSteps = [
    { name: 'Shopping Cart', icon: <ShoppingCart size={20}/> },
    { name: 'Delivery Details', icon: <Truck size={20}/> },
    { name: 'Payment', icon: <Wallet size={20}/> },
  ];

  const StepIndicator = () => (
    <div className="max-w-2xl mx-auto w-full mb-12 px-4">
      <div className="flex items-center">
        {checkoutSteps.map((stepInfo, index) => (
          <div key={index} className="flex items-center w-full">
            <div className={`flex flex-col items-center ${step > index ? 'text-green-600' : 'text-slate-400'}`}>
              <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${step > index ? 'bg-green-100 border-green-600' : 'bg-slate-100 border-slate-300'}`}>
                {step > index + 1 ? <CheckCircle2 size={20}/> : stepInfo.icon}
              </div>
              <p className={`text-xs font-bold mt-2 text-center ${step > index ? 'text-slate-700' : 'text-slate-400'}`}>{stepInfo.name}</p>
            </div>
            {index < checkoutSteps.length - 1 && <div className={`flex-1 h-1 mx-4 rounded-full ${step > index + 1 ? 'bg-green-600' : 'bg-slate-200'}`}></div>}
          </div>
        ))}
      </div>
    </div>
  );

  const isCheckoutDisabled = () => {
    if (isProcessing) return true;
    if (step === 3) {
      if (!arePaymentDetailsValid()) return true;
      if (paymentMethod !== 'COD' && (!otpSent || otp.length !== 6)) return true;
    }
    return false;
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 md:px-6 pt-[140px] pb-20 w-full">
        
        {cart.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 sm:p-12 md:p-20 text-center border border-slate-100 shadow-xl mt-8 max-w-2xl mx-auto">
            <div className="text-8xl mb-6">🛒</div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-800 mb-3">Your Cart is Empty</h2>
            <p className="text-slate-500 font-medium text-lg mb-8">Looks like you haven't added anything to your cart yet.</p>
            <Link to="/user/fruits">
              <button className="px-8 py-4 bg-slate-800 text-white font-bold rounded-2xl hover:bg-slate-700 transition-colors shadow-lg">Start Shopping</button>
            </Link>
          </div>
        ) : (
          <>
            <StepIndicator />
            <div className="flex flex-col lg:flex-row gap-8">
            
            {/* LEFT COLUMN: Cart Items OR Payment Form */}
            <div className="flex-1 space-y-8">
              
              {/* STEP 1: CART REVIEW */}
              {step === 1 && (
                <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-lg">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 border-b border-slate-100 pb-6">
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800">Your Cart ({cart.length} items)</h2>
                    <span className="bg-green-100 text-green-700 text-[10px] sm:text-xs font-black px-3 py-1.5 rounded-full w-max">⚡ 10 MINS DELIVERY</span>
                  </div>

                  <div className="space-y-6">
                    {cart.map((item, idx) => (
                      <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5 border-b border-slate-100 pb-6 last:border-0 last:pb-0">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-slate-50 border border-slate-100 rounded-2xl p-2 flex-shrink-0 flex items-center justify-center">
                            <img src={item.image} className="w-full h-full object-contain mix-blend-multiply" onError={(e) => { e.target.src = `https://placehold.co/100x100/F8F8F8/767676?text=Img` }} />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-lg text-slate-800 leading-tight">{item.name}</h4>
                            <p className="text-sm font-medium text-slate-500 mt-1">1 kg</p>
                            <p className="font-bold text-lg text-slate-900 mt-2">₹{item.price}</p>
                          </div>
                        </div>
                        <div className="flex justify-end w-full sm:w-auto mt-2 sm:mt-0">
                          <div className="flex items-center bg-slate-100 text-slate-800 rounded-xl h-11 shadow-sm border border-slate-200">
                            <button onClick={() => decreaseCartQuantity(item.id, 1)} className="px-3 h-full flex items-center justify-center rounded-l-xl hover:bg-slate-200 transition-colors"><Minus size={16} strokeWidth={3}/></button>
                            <span className="font-bold text-base w-8 text-center">{item.quantity}</span>
                            <button onClick={() => addToCart(item.name, item.price, 1, item.image, item.id)} className="px-3 h-full flex items-center justify-center rounded-r-xl hover:bg-slate-200 transition-colors"><Plus size={16} strokeWidth={3}/></button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 2: ADDRESS */}
              {step === 2 && (
                <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-lg">
                  <h3 className="font-extrabold text-2xl mb-6 text-slate-800 flex items-center gap-3"><MapPin size={24} className="text-green-600" /> Delivery Details</h3>
                  
                  {/* Saved Address Selector */}
                  {currentUser?.savedAddresses?.length > 0 && (
                    <div className="mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Saved Addresses</p>
                      <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                        {currentUser.savedAddresses.map((addr, idx) => (
                          <div key={idx} className="relative flex-shrink-0 group">
                            <button 
                              onClick={() => setAddress(addr)}
                              className={`text-left p-3 rounded-xl border transition-all min-w-[140px] h-full ${address.type === addr.type && address.street === addr.street ? 'bg-green-100 border-green-500 ring-1 ring-green-500' : 'bg-white border-slate-200 hover:border-slate-300'}`}
                            >
                              <div className="font-bold text-slate-800 text-xs mb-1 flex items-center gap-1">{addr.type === 'Home' ? '🏠' : addr.type === 'Work' ? '💼' : '📍'} {addr.type}</div>
                              <div className="text-[10px] text-slate-500 font-medium truncate max-w-[120px]">{addr.street}</div>
                              <div className="text-[10px] text-slate-400">{addr.pincode}</div>
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                const updatedAddresses = currentUser.savedAddresses.filter((_, i) => i !== idx);
                                const updatedUser = { ...currentUser, savedAddresses: updatedAddresses };
                                if (updateUser) updateUser(updatedUser);
                                else currentUser.savedAddresses = updatedAddresses;
                                localStorage.setItem('user', JSON.stringify(updatedUser));
                              }} 
                              className="absolute top-2 right-2 p-1.5 bg-red-50 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100"
                              title="Delete Address"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinelinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <input required type="text" placeholder="Full Name" value={address.name} onChange={e => setAddress({...address, name: e.target.value})} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500 font-medium text-sm" />
                    <input required type="tel" maxLength="10" placeholder="10-digit Mobile Number" value={address.phone} onChange={e => setAddress({...address, phone: e.target.value.replace(/\D/g, '')})} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500 font-medium text-sm" />
                    
                    {/* Dynamic Dropdowns */}
                    <div className="relative">
                      <select value={address.country} onChange={(e) => setAddress({...address, country: e.target.value, state: '', city: ''})} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500 font-medium text-sm appearance-none">
                        <option value="">Select Country</option>
                        {countries.map(c => <option key={c.isoCode} value={c.isoCode}>{c.name}</option>)}
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
                    </div>

                    <div className="relative">
                      <select disabled={!address.country} value={address.state} onChange={(e) => setAddress({...address, state: e.target.value, city: ''})} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500 font-medium text-sm appearance-none disabled:opacity-50">
                        <option value="">Select State</option>
                        {states.map(s => <option key={s.isoCode} value={s.isoCode}>{s.name}</option>)}
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
                    </div>

                    <div className="relative">
                      <select disabled={!address.state} value={address.city} onChange={(e) => setAddress({...address, city: e.target.value})} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500 font-medium text-sm appearance-none disabled:opacity-50">
                        <option value="">Select City</option>
                        {cities.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
                    </div>

                    <input required type="text" placeholder="Pincode" value={address.pincode} onChange={e => setAddress({...address, pincode: e.target.value.replace(/\D/g, '')})} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500 font-medium text-sm" />
                    <div className="md:col-span-2">
                      <input required type="text" placeholder="Flat / House / Office No, Street Name" value={address.street} onChange={e => setAddress({...address, street: e.target.value})} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500 font-medium text-sm" />
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    {['Home', 'Work', 'Other'].map(type => (
                      <button key={type} onClick={() => setAddress({...address, type})} className={`px-5 py-2.5 rounded-full text-sm font-bold border transition-all flex items-center gap-2 ${address.type === type ? 'bg-green-100 border-green-500 text-green-700 shadow-sm' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                        {type === 'Home' && <Home size={16} />} {type === 'Work' && <Briefcase size={16} />} {type === 'Other' && <MapPin size={16} />} {type}
                      </button>
                    ))}
                  </div>

                  <div className="mt-6">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={saveAddress} onChange={(e) => setSaveAddress(e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-green-600 focus:ring-green-600" />
                      <span className="font-bold text-sm text-slate-600">Save this address for future use</span>
                    </label>
                  </div>
                </div>
              )}

              {/* STEP 3: PAYMENT */}
              {step === 3 && (
                <form onSubmit={handlePayment} className="space-y-6">

                  {/* Payment Methods Section */}
                  <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-lg">
                    <h3 className="font-extrabold text-2xl mb-6 text-slate-800 flex items-center gap-3"><CreditCard size={24} className="text-green-600" /> Payment Method</h3>
                    <div className="space-y-3">
                      
                      {/* UPI ACCORDION */}
                      <div className={`border-2 rounded-xl transition-all overflow-hidden ${paymentMethod === 'UPI' ? 'border-green-600 bg-green-50/50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                        <label className="flex items-center p-4 cursor-pointer">
                          <input type="radio" name="payment" value="UPI" checked={paymentMethod === 'UPI'} onChange={() => { setPaymentMethod('UPI'); setOtp(''); setOtpSent(false); setOtpTimer(0); }} className="w-4 h-4 text-green-600 focus:ring-green-600 border-slate-300 accent-green-600" />
                          <div className="ml-3 flex-1">
                            <span className="block text-base font-bold text-slate-800">Google Pay / PhonePe / UPI</span>
                            <span className="block text-sm text-slate-500">Pay instantly via any UPI app</span>
                          </div>
                          <img src="https://cdn-icons-png.flaticon.com/512/12140/12140590.png" className="w-8 h-8 opacity-80" alt="UPI" />
                        </label>
                        {paymentMethod === 'UPI' && (
                          <div className="px-4 pb-4 pt-1 ml-7 animate-in fade-in slide-in-from-top-2">
                            <input type="text" placeholder="Enter UPI ID (e.g., username@upi)" value={paymentDetails.upiId} onChange={e => setPaymentDetails({...paymentDetails, upiId: e.target.value})} className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500 font-medium text-sm" />
                          </div>
                        )}
                      </div>

                      {/* CARD ACCORDION */}
                      <div className={`border-2 rounded-xl transition-all overflow-hidden ${paymentMethod === 'Card' ? 'border-green-600 bg-green-50/50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                        <label className="flex items-center p-4 cursor-pointer">
                          <input type="radio" name="payment" value="Card" checked={paymentMethod === 'Card'} onChange={() => { setPaymentMethod('Card'); setOtp(''); setOtpSent(false); setOtpTimer(0); }} className="w-4 h-4 text-green-600 focus:ring-green-600 border-slate-300 accent-green-600" />
                          <div className="ml-3 flex-1">
                            <span className="block text-base font-bold text-slate-800">Credit / Debit Card</span>
                            <span className="block text-sm text-slate-500">Visa, MasterCard, RuPay</span>
                          </div>
                          <CreditCard className="w-6 h-6 text-slate-400" />
                        </label>
                        {paymentMethod === 'Card' && (
                          <div className="px-4 pb-4 pt-1 ml-7 space-y-3 animate-in fade-in slide-in-from-top-2">
                            <input type="text" placeholder="Card Number" maxLength="19" value={paymentDetails.cardNumber} onChange={e => setPaymentDetails({...paymentDetails, cardNumber: e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim()})} className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500 font-medium text-sm" />
                            <input type="text" placeholder="Name on Card" value={paymentDetails.cardName} onChange={e => setPaymentDetails({...paymentDetails, cardName: e.target.value})} className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500 font-medium text-sm" />
                            <div className="flex gap-3">
                              <input type="text" placeholder="MM" maxLength="2" value={paymentDetails.expiryMM} onChange={e => setPaymentDetails({...paymentDetails, expiryMM: e.target.value.replace(/\D/g, '')})} className="w-1/4 p-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500 font-medium text-sm text-center" />
                              <input type="text" placeholder="YY" maxLength="2" value={paymentDetails.expiryYY} onChange={e => setPaymentDetails({...paymentDetails, expiryYY: e.target.value.replace(/\D/g, '')})} className="w-1/4 p-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500 font-medium text-sm text-center" />
                              <input type="password" placeholder="CVV" maxLength="3" value={paymentDetails.cvv} onChange={e => setPaymentDetails({...paymentDetails, cvv: e.target.value.replace(/\D/g, '')})} className="w-1/2 p-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500 font-medium text-sm text-center tracking-widest" />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* NET BANKING ACCORDION */}
                      <div className={`border-2 rounded-xl transition-all overflow-hidden ${paymentMethod === 'NetBanking' ? 'border-green-600 bg-green-50/50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                        <label className="flex items-center p-4 cursor-pointer">
                          <input type="radio" name="payment" value="NetBanking" checked={paymentMethod === 'NetBanking'} onChange={() => { setPaymentMethod('NetBanking'); setOtp(''); setOtpSent(false); setOtpTimer(0); }} className="w-4 h-4 text-green-600 focus:ring-green-600 border-slate-300 accent-green-600" />
                          <div className="ml-3 flex-1">
                            <span className="block text-base font-bold text-slate-800">Net Banking</span>
                            <span className="block text-sm text-slate-500">All major banks supported</span>
                          </div>
                          <Building className="w-6 h-6 text-slate-400" />
                        </label>
                        {paymentMethod === 'NetBanking' && (
                          <div className="px-4 pb-4 pt-1 ml-7 animate-in fade-in slide-in-from-top-2 relative">
                            <select value={paymentDetails.bankName} onChange={e => setPaymentDetails({...paymentDetails, bankName: e.target.value})} className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500 font-medium text-sm appearance-none cursor-pointer">
                              <option value="">Select your Bank</option>
                              <option value="HDFC">HDFC Bank</option>
                              <option value="SBI">State Bank of India</option>
                              <option value="ICICI">ICICI Bank</option>
                              <option value="Axis">Axis Bank</option>
                              <option value="Kotak">Kotak Mahindra Bank</option>
                            </select>
                            <div className="absolute right-7 top-1/2 -translate-y-1/2 mt-0.5 pointer-events-none text-slate-400">▼</div>
                          </div>
                        )}
                      </div>

                      {/* COD ACCORDION */}
                      <div className={`border-2 rounded-xl transition-all overflow-hidden ${paymentMethod === 'COD' ? 'border-green-600 bg-green-50/50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                        <label className="flex items-center p-4 cursor-pointer">
                          <input type="radio" name="payment" value="COD" checked={paymentMethod === 'COD'} onChange={() => { setPaymentMethod('COD'); setOtp(''); setOtpSent(false); setOtpTimer(0); }} className="w-4 h-4 text-green-600 focus:ring-green-600 border-slate-300 accent-green-600" />
                          <div className="ml-3 flex-1">
                            <span className="block text-base font-bold text-slate-800">Cash on Delivery</span>
                            <span className="block text-sm text-slate-500">Pay at your doorstep</span>
                          </div>
                          <Banknote className="w-6 h-6 text-slate-400" />
                        </label>
                      </div>

                    {/* Dynamic OTP Verification Section */}
                    {paymentMethod !== 'COD' && arePaymentDetailsValid() && (
                      <div className="mt-6 p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-3 animate-in fade-in zoom-in duration-300">
                        <h4 className="text-sm font-bold text-slate-800">Security Verification</h4>
                        <p className="text-xs text-slate-500">Please verify your {paymentMethod === 'UPI' ? 'UPI' : 'Card'} transaction via OTP to proceed.</p>
                        <div className="flex gap-3">
                          <input
                            required
                            type="password"
                            placeholder="Enter 6-digit OTP (123456)"
                            maxLength="6"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                            disabled={!otpSent}
                            className="w-2/3 p-3 rounded-xl border border-slate-200 text-sm bg-white outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100 disabled:bg-slate-100 disabled:text-slate-400"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              showToast("OTP sent to your registered device! (Use 123456)");
                              setOtpSent(true);
                              setOtpTimer(30);
                            }}
                            disabled={otpTimer > 0}
                            className={`w-1/3 bg-green-100 hover:bg-green-200 text-green-700 font-bold rounded-xl text-sm transition-colors ${otpTimer > 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                          >
                            {otpTimer > 0 ? `Wait ${otpTimer}s` : otpSent ? "Resend" : "Get OTP"}
                          </button>
                        </div>
                      </div>
                    )}

                    </div>
                  </div>

                  {/* Hidden Submit Button triggered by Right Panel */}
                  <button id="real-checkout-btn" type="submit" className="hidden"></button>
                </form>
              )}
            </div>

            {/* RIGHT COLUMN: Bill Details */}
            <div className="w-full lg:w-[380px]">
              <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-lg sticky top-[140px]">
                <h3 className="font-extrabold text-xl mb-6 text-slate-800 border-b border-slate-100 pb-4">Bill Details</h3>
                <div className="space-y-4 text-base text-slate-600 font-medium mb-6">
                  <div className="flex justify-between"><span>Item Total</span><span className="font-bold text-slate-800">₹{total}</span></div>
                  {discountPercent > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount ({discountPercent * 100}%)</span>
                      <span className="font-bold">-₹{discountAmount}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    {deliveryFee === 0 ? <span className="text-green-600 font-bold">FREE</span> : <span className="font-bold text-slate-800">₹{deliveryFee}</span>}
                  </div>
                  <div className="flex justify-between"><span>Handling Charge</span><span className="font-bold text-slate-800">₹{handlingCharge}</span></div>
                </div>
                
                <div className="flex justify-between items-center border-t-2 border-dashed border-slate-200 pt-4 mb-6">
                  <span className="font-bold text-lg text-slate-800">Grand Total</span>
                  <span className="font-extrabold text-2xl text-slate-800">₹{grandTotal}</span>
                </div>

                {step === 1 && (
                  <button onClick={handleProceed} className="w-full py-4 bg-slate-800 text-white font-bold text-base rounded-2xl hover:bg-slate-700 transition-colors shadow-lg flex items-center justify-center gap-2">
                    Proceed to Address <ArrowRight size={20} />
                  </button>
                )}

                {step === 2 && (
                  <button onClick={handleProceed} className="w-full py-4 bg-slate-800 text-white font-bold text-base rounded-2xl hover:bg-slate-700 transition-colors shadow-lg flex items-center justify-center gap-2">
                    Proceed to Payment <ArrowRight size={20} />
                  </button>
                )}

                {step === 3 && (
                  <button 
                    onClick={() => document.getElementById('real-checkout-btn').click()} 
                    disabled={isCheckoutDisabled()}
                    className="w-full py-4 bg-green-600 text-white font-bold text-base rounded-2xl hover:bg-green-700 transition-colors flex justify-center items-center gap-2 disabled:bg-slate-400 disabled:cursor-wait shadow-lg shadow-green-200"
                  >
                    {isProcessing ? <><Loader2 className="animate-spin" size={20} /> Processing...</> : `Pay ₹${grandTotal} Securely`}
                  </button>
                )}
                
                {step > 1 && (
                  <button onClick={() => setStep(s => s - 1)} className="w-full mt-3 py-3 text-slate-500 font-bold text-sm hover:text-slate-800 transition-colors">
                    ← Back
                  </button>
                )}

                <div className="mt-6 pt-6 border-t border-dashed border-slate-200">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold text-md text-slate-800">Have a coupon?</h3>
                    <button onClick={() => setShowOffers(!showOffers)} className="text-xs text-green-600 font-bold hover:underline">
                      {showOffers ? "Hide offers" : "View offers"}
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <input type="text" placeholder="ZESTY20" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} className="w-full p-3 bg-slate-100 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500 font-medium text-sm uppercase"/>
                    <button onClick={handleApplyCoupon} className="px-4 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 transition-colors text-xs">APPLY</button>
                  </div>
                  {showOffers && (
                    <div className="mt-3 space-y-2">
                      {availableOffers.map((offer, idx) => (
                        <div key={idx} className="border border-dashed border-green-300 bg-green-50 p-3 rounded-lg flex justify-between items-center">
                          <div><span className="font-bold text-green-700 text-sm block">{offer.code}</span><span className="text-xs text-slate-600">{offer.desc}</span></div>
                          <button onClick={() => { setCouponCode(offer.code); setShowOffers(false); }} className="bg-white border border-green-200 text-green-600 px-3 py-1.5 rounded-md text-xs font-bold hover:bg-green-100 transition-colors">Use</button>
                        </div>
                      ))}
                    </div>
                  )}
                  {couponMessage.text && (
                    <p className={`mt-2 text-xs font-bold ${couponMessage.type === "success" ? "text-green-600" : "text-red-500"}`}>{couponMessage.type === "success" ? "✓ " : "✕ "}{couponMessage.text}</p>
                  )}
                </div>
              </div>
            </div>

          </div></>
        )}
      </main>
      <Footer />
    </div>
  )
}
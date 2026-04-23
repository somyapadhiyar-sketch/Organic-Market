import { useState, useEffect, useLayoutEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useStore } from '../context/StoreContext';
import { ArrowRight, Mail, Lock, User, Eye, EyeOff, Phone, MapPin, Camera, Upload, Wifi, WifiOff, Leaf, Bike } from 'lucide-react';
import { Country, State, City } from 'country-state-city';
import { createUserWithEmailAndPassword, updateProfile } from"firebase/auth";
import { getFirestore, doc, setDoc } from"firebase/firestore";
import { auth } from '../firebase';

export default function DeliverySignup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  
  // Address State
  const [country, setCountry] = useState('');
  const [stateRegion, setStateRegion] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [photoURL, setPhotoURL] = useState(null);
  
  const [deliveryMode, setDeliveryMode] = useState('Online');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { showToast, setCurrentUser } = useStore();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // Derived state for dropdowns
  const countries = Country.getAllCountries();
  const states = country ? State.getStatesOfCountry(country) : [];
  const cities = country && stateRegion ? City.getCitiesOfState(country, stateRegion) : [];

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  // Auto-set Address field
  useEffect(() => {
    const countryName = country ? Country.getCountryByCode(country)?.name : '';
    const stateName = stateRegion ? State.getStateByCodeAndCountry(stateRegion, country)?.name : '';
    const parts = [city, stateName, countryName].filter(Boolean);
    setAddress(parts.join(', '));
  }, [city, stateRegion, country]);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoURL(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.endsWith('.om')) {
      if (showToast) showToast("Please enter a valid email address (e.g., name@domain.com).");
      return;
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password)) {
      if (showToast) showToast("Password must be at least 8 chars long with upper, lower, number, & special character.");
      return;
    }

    if (!country || !stateRegion || !city) {
      if (showToast) showToast("Please complete your location details.");
      return;
    }
    if (!photoURL) {
      if (showToast) showToast("Please upload a profile photo to continue.");
      return;
    }

    setLoading(true);
    
    try {
      const webhookRes = await fetch(import.meta.env.VITE_WEBHOOK_PARTNER_SIGNUP_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          phone,
          address,
          city,
          stateRegion,
          country,
          photoURL,
          deliveryMode,
          type: deliveryMode.toLowerCase()
        })
      });
      
      const textRes = await webhookRes.text();
      let message = textRes;
      try {
        const jsonRes = JSON.parse(textRes);
        message = jsonRes.message || jsonRes.output || jsonRes.response || textRes;

        if (jsonRes.status === 'error') {
          if (showToast) showToast(message);
          setLoading(false);
          return;
        }
      } catch (e) {}

      if (showToast) showToast(message || "Signup request sent! Pending admin approval.");
      setLoading(false);
      navigate('/login/delivery');
    } catch (webhookError) {
      console.error("Webhook Error:", webhookError);
      if (showToast) showToast("Error connecting to server.");
      setLoading(false);
      return;
    }
  };

  return (
    <div className="min-h-screen bg-white flex font-sans text-slate-900">
      {/* Left Side - Branding & Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-orange-50 relative overflow-hidden items-center justify-center">
        <div className="absolute top-8 left-8 z-10">
           <Link to="/" className="flex items-center gap-2 group">
            <Leaf size={32} className="text-green-600" />
            <h1 className="text-3xl font-black text-blue-600 italic tracking-tighter">Zesty</h1>
          </Link>
        </div>
        
        <div className="relative z-10 p-12 text-center">
           <motion.img 
             initial={{ y: 20, opacity: 0 }} 
             animate={{ y: 0, opacity: 1 }}
             transition={{ duration: 0.8 }}
             src="https://cdn-icons-png.flaticon.com/512/2933/2933246.png" 
             alt="Join Zesty Delivery" 
             className="w-96 mx-auto mb-8 drop-shadow-2xl"
           />
           <h2 className="text-4xl font-black text-orange-600 mb-4">Become a Partner</h2>
           <p className="text-lg text-slate-600 max-w-md mx-auto">Join our delivery team and earn by delivering fresh groceries to our customers.</p>
        </div>

        {/* Background Elements */}
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-orange-200/50 rounded-full blur-3xl"></div>
        <div className="absolute top-20 right-20 w-72 h-72 bg-green-200/50 rounded-full blur-3xl"></div>
      </div>

      {/* Right Side - Signup Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 bg-white relative">
        <div className="max-w-md w-full">
           <div className="lg:hidden mb-10 text-center">
             <Link to="/" className="inline-flex items-center gap-2">
            <Leaf size={32} className="text-green-600" />
                <h1 className="text-3xl font-black text-blue-600 italic tracking-tighter">Zesty</h1>
             </Link>
           </div>

           <div className="mb-8">
         <h2 className="text-2xl sm:text-3xl font-black text-orange-600 mb-2 flex items-center gap-2">Delivery Partner Signup <Bike className="text-orange-600" size={28} /></h2>
             <p className="text-slate-500 font-medium">Enter your details to register.</p>
           </div>

           <div className="flex flex-col items-center mb-6">
             <div className="relative w-24 h-24 rounded-full border-4 border-orange-50 shadow-xl flex items-center justify-center bg-orange-100 text-orange-500 text-3xl font-black overflow-hidden group">
               {photoURL ? (
                 <img src={photoURL} alt="Profile" className="w-full h-full object-cover" />
               ) : (
                 <Camera size={32} />
               )}
               <label className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                 <Upload size={16} className="mb-1" />
                 <span className="text-[10px] font-bold uppercase tracking-wider">Upload</span>
                 <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
               </label>
             </div>
             <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-3">Profile Photo Required *</p>
           </div>

           <div className="space-y-2 mb-4">
             <label className="text-sm font-bold text-slate-700">Delivery Mode</label>
             <div className="grid grid-cols-2 gap-3">
               <button type="button" onClick={() => setDeliveryMode('Online')} className={`flex items-center justify-center gap-2 p-4 rounded-xl border-2 font-bold transition-all ${deliveryMode === 'Online' ? 'bg-green-50 border-green-500 text-green-700' : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                 <Wifi size={20} /> Online
               </button>
               <button type="button" onClick={() => setDeliveryMode('Offline')} className={`flex items-center justify-center gap-2 p-4 rounded-xl border-2 font-bold transition-all ${deliveryMode === 'Offline' ? 'bg-slate-200 border-slate-400 text-slate-700' : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                 <WifiOff size={20} /> Offline
               </button>
             </div>
             <p className="text-xs text-slate-500 font-medium px-1 pt-1">
               <b>Online:</b> See all available orders. <b>Offline:</b> Only see orders assigned to you by an admin.
             </p>
           </div>

           <form onSubmit={handleSubmit} className="space-y-4">
             <div className="space-y-2">
               <label className="text-sm font-bold text-slate-700">Full Name</label>
               <div className="relative"><User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} /><input type="text" required placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:bg-white outline-none transition-all font-medium" /></div>
             </div>

             <div className="space-y-2">
               <label className="text-sm font-bold text-slate-700">Email Address</label>
               <div className="relative"><Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} /><input type="email" required placeholder="john@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:bg-white outline-none transition-all font-medium" /></div>
             </div>

             <div className="space-y-2">
               <label className="text-sm font-bold text-slate-700">Phone Number</label>
               <div className="relative"><Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} /><input type="tel" required placeholder="10-digit number" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:bg-white outline-none transition-all font-medium" /></div>
             </div>

             <div className="space-y-2">
               <label className="text-sm font-bold text-slate-700">Service Area</label>
               
               {/* Dropdowns Grid */}
               <div className="grid grid-cols-2 gap-3 mb-3">
                 <div className="relative">
                   <select required value={country} onChange={(e) => { setCountry(e.target.value); setStateRegion(''); setCity(''); }} className="w-full pl-4 pr-8 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:bg-white outline-none transition-all font-medium appearance-none text-slate-700">
                     <option value="">Select Country</option>
                     {countries.map(c => <option key={c.isoCode} value={c.isoCode}>{c.name}</option>)}
                   </select>
                   <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
                 </div>
                 
                 <div className="relative">
                   <select required disabled={!country} value={stateRegion} onChange={(e) => { setStateRegion(e.target.value); setCity(''); }} className="w-full pl-4 pr-8 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:bg-white outline-none transition-all font-medium appearance-none text-slate-700 disabled:opacity-50">
                     <option value="">Select State</option>
                     {states.map(s => <option key={s.isoCode} value={s.isoCode}>{s.name}</option>)}
                   </select>
                   <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
                 </div>

                 <div className="relative col-span-2">
                   <select required disabled={!stateRegion} value={city} onChange={(e) => setCity(e.target.value)} className="w-full pl-4 pr-8 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:bg-white outline-none transition-all font-medium appearance-none text-slate-700 disabled:opacity-50">
                     <option value="">Select City</option>
                     {cities.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                   </select>
                   <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
                 </div>
               </div>

               {/* Auto-set Address Field */}
               <div className="relative">
                 <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                 <input type="text" readOnly placeholder="Full Location (Auto-filled)" value={address} className="w-full pl-12 pr-4 py-3 bg-gray-100 border border-slate-200 rounded-xl font-medium text-slate-500 cursor-not-allowed" />
               </div>
             </div>

             <div className="space-y-2">
               <label className="text-sm font-bold text-slate-700">Password</label>
               <div className="relative">
                 <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                 <input type={showPassword ?"text" :"password"} required placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-12 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:bg-white outline-none transition-all font-medium" />
                 <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                   {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                 </button>
               </div>
             </div>

             <motion.button whileTap={{ scale: 0.98 }} type="submit" disabled={loading} className="btn-3d btn-orange w-full py-4 mt-2 font-bold flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
               {loading ?"Submitting..." :"Register for Delivery"}
               {!loading && <ArrowRight size={20} />}
             </motion.button>
           </form>

           <div className="mt-6 text-center">
             <p className="text-slate-500 font-medium">
               Already have an account? <Link to="/login/delivery" className="text-green-600 font-bold hover:underline">Login</Link>
             </p>
           </div>
        </div>
      </div>
    </div>
  );
}
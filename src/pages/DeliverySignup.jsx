import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useStore } from '../context/StoreContext';
import { ArrowRight, Mail, Lock, User, Eye, EyeOff, Phone, MapPin, Camera, Upload } from 'lucide-react';
import { Country, State, City } from 'country-state-city';
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
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
  
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { showToast } = useStore();
  const navigate = useNavigate();

  // Derived state for dropdowns
  const countries = Country.getAllCountries();
  const states = country ? State.getStatesOfCountry(country) : [];
  const cities = country && stateRegion ? City.getCitiesOfState(country, stateRegion) : [];

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
      // 1. Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Update Firebase Auth Profile Name
      await updateProfile(user, { displayName: name });

      // 3. Save User Details to Firestore Backend
      const db = getFirestore(auth.app);
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name,
        email,
        phone,
        address,
        city,
        stateRegion,
        country,
        photoURL,
        role: 'delivery',
        status: 'Pending',
        createdAt: new Date().toISOString()
      });

      // 4. Show success message and redirect
      if (showToast) showToast("Registration request sent! You can login once approved by admin.");
      navigate('/login/delivery');
    } catch (error) {
      console.error("Delivery Signup Error:", error);
      let message = "Failed to create account.";
      if (error.code === 'auth/email-already-in-use') message = "An account with this email already exists.";
      else if (error.code === 'auth/invalid-email') message = "Invalid email address.";
      else if (error.code === 'auth/weak-password') message = "Password should be at least 6 characters.";
      
      if (showToast) showToast(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex font-sans text-slate-900">
      {/* Left Side - Branding & Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-orange-50 relative overflow-hidden items-center justify-center">
        <div className="absolute top-8 left-8 z-10">
           <Link to="/" className="flex items-center gap-2 group">
            <span className="text-4xl">🌿</span>
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
                <span className="text-4xl">🌿</span>
                <h1 className="text-3xl font-black text-blue-600 italic tracking-tighter">Zesty</h1>
             </Link>
           </div>

           <div className="mb-8">
             <h2 className="text-2xl sm:text-3xl font-black text-orange-600 mb-2">Delivery Partner Signup 🛵</h2>
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
                 <input type={showPassword ? "text" : "password"} required placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-12 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:bg-white outline-none transition-all font-medium" />
                 <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                   {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                 </button>
               </div>
             </div>

             <motion.button whileTap={{ scale: 0.98 }} type="submit" disabled={loading} className="w-full py-4 mt-2 bg-orange-500 text-white font-bold rounded-xl shadow-lg hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
               {loading ? "Submitting..." : "Register for Delivery"}
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
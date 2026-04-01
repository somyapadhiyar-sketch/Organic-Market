import { useState, useEffect, useLayoutEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useStore } from '../context/StoreContext';
import { ArrowRight, Mail, Lock, User, Eye, EyeOff, Phone, MapPin, Map, Leaf, Sparkles } from 'lucide-react';
import { Country, State, City }  from 'country-state-city';
import { createUserWithEmailAndPassword, updateProfile } from"firebase/auth";
import { getFirestore, doc, setDoc } from"firebase/firestore";
import { auth } from '../firebase';

// Mock Pincode data for validation
const MOCK_PINCODE_DATA = {"India": {"Gujarat": {"Ahmedabad": ["380001","380006","380009","380015","380052"],"Surat": ["395003","395004","395007","395010"],"Vadodara": ["390001","390002","390007"],"Rajkot": ["360001","360002","360004"],"Gandhinagar": ["382010","382016","382021"]
    },"Maharashtra": {"Mumbai": ["400001","400002","400011"],"Pune": ["411001","411002","411005"]
    }
  }
};

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  
  // Address State
  const [street, setStreet] = useState('');
  const [country, setCountry] = useState(''); // isoCode
  const [stateRegion, setStateRegion] = useState(''); // isoCode
  const [city, setCity] = useState(''); // name
  const [pincode, setPincode] = useState('');
  const [address, setAddress] = useState('');

  // Password State
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const { setCurrentUser, showToast } = useStore();
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
    const parts = [street, city, stateName, countryName, pincode].filter(Boolean);
    setAddress(parts.join(', '));
  }, [street, city, stateRegion, country, pincode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.endsWith('.om')) {
      if (showToast) showToast("Please enter a valid email address (e.g., name@domain.com).");
      return;
    }

    if (password !== confirmPassword) {
      if (showToast) showToast("Passwords do not match!");
      return;
    }
    
    if (phone.length !== 10) {
      if (showToast) showToast("Phone number must be exactly 10 digits!");
      return;
    }

    if (!address || !country || !stateRegion || !city || !pincode) {
      if (showToast) showToast("Please complete your address details.");
      return;
    }

    // Pincode validation
    const countryName = Country.getCountryByCode(country)?.name;
    const stateName = State.getStateByCodeAndCountry(stateRegion, country)?.name;
    const validPincodes = MOCK_PINCODE_DATA[countryName]?.[stateName]?.[city];
    if (validPincodes && !validPincodes.includes(pincode)) {
      if (showToast) showToast("Invalid Pincode for the selected location.");
      return;
    }

    setLoading(true);

    try {
      // 1. Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Update Firebase Auth Profile Name
      await updateProfile(user, { displayName: name });

      // 3. Save User Details to Firestore Backend (Run in background to prevent freezing)
      const db = getFirestore(auth.app);
      setDoc(doc(db,"users", user.uid), {
        uid: user.uid,
        name,
        email,
        phone,
        address,
        street,
        city,
        stateRegion,
        country,
        pincode,
        role: 'user',
        createdAt: new Date().toISOString()
      }).catch(err => console.error("Firestore Database Error:", err));

      // 4. Set user in context
      const userData = {
        uid: user.uid,
        name,
        email,
        role: 'user'
      };
      setCurrentUser(userData);

      if (user) {
        if (showToast) showToast("Account created successfully! Welcome" + name);
        navigate('/home', { replace: true });
      } else {
        if (showToast) showToast("Signup failed. Please try again.");
      }
    } catch (error) {
      console.error("Signup Error:", error);
      let message ="Failed to create account.";
      if (error.code === 'auth/email-already-in-use') message ="An account with this email already exists.";
      else if (error.code === 'auth/invalid-email') message ="Invalid email address.";
      else if (error.code === 'auth/weak-password') message ="Password should be at least 6 characters.";
      
      if (showToast) showToast(message);
    } finally {
      setLoading(false);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white flex font-sans text-slate-900">
      {/* Left Side - Branding & Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-blue-50 relative overflow-hidden items-center justify-center">
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
             src="https://cdn-icons-png.flaticon.com/512/3081/3081840.png" 
             alt="Join Zesty" 
             className="w-96 mx-auto mb-8 drop-shadow-2xl"
           />
           <h2 className="text-4xl font-black text-blue-600 mb-4">Join the Freshness</h2>
           <p className="text-lg text-slate-600 max-w-md mx-auto">Create an account and start your journey to a healthier lifestyle with organic produce delivered in minutes.</p>
        </div>

        {/* Background Elements */}
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-200/50 rounded-full blur-3xl"></div>
        <div className="absolute top-20 right-20 w-72 h-72 bg-emerald-200/50 rounded-full blur-3xl"></div>
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
         <h2 className="text-2xl sm:text-3xl font-black text-blue-600 mb-2 flex items-center gap-2">Create Account <Sparkles className="text-amber-400" size={28} /></h2>
             <p className="text-slate-500 font-medium">Enter your details to register.</p>
           </div>

           <form onSubmit={handleSubmit} className="space-y-4">
             <div className="space-y-2">
               <label className="text-sm font-bold text-slate-700">Full Name</label>
               <div className="relative">
                 <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                 <input type="text" required placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white outline-none transition-all font-medium" />
               </div>
             </div>

             <div className="space-y-2">
               <label className="text-sm font-bold text-slate-700">Email Address</label>
               <div className="relative">
                 <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                 <input type="email" required placeholder="john@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white outline-none transition-all font-medium" />
               </div>
             </div>

             <div className="space-y-2">
               <label className="text-sm font-bold text-slate-700">Phone Number</label>
               <div className="relative">
                 <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                 <input type="tel" required placeholder="10-digit number" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white outline-none transition-all font-medium" />
               </div>
             </div>

             {/* Address Section */}
             <div className="space-y-2">
               <label className="text-sm font-bold text-slate-700">Delivery Address</label>
               
               {/* Street */}
               <div className="relative mb-3">
                 <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                 <input type="text" required placeholder="House No, Building, Street" value={street} onChange={(e) => setStreet(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white outline-none transition-all font-medium" />
               </div>

               {/* Dropdowns Grid */}
               <div className="grid grid-cols-2 gap-3 mb-3">
                 <div className="relative">
                   <select required value={country} onChange={(e) => { setCountry(e.target.value); setStateRegion(''); setCity(''); }} className="w-full pl-4 pr-8 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white outline-none transition-all font-medium appearance-none text-slate-700">
                     <option value="">Select Country</option>
                     {countries.map(c => <option key={c.isoCode} value={c.isoCode}>{c.name}</option>)}
                   </select>
                   <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
                 </div>
                 
                 <div className="relative">
                   <select required disabled={!country} value={stateRegion} onChange={(e) => { setStateRegion(e.target.value); setCity(''); }} className="w-full pl-4 pr-8 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white outline-none transition-all font-medium appearance-none text-slate-700 disabled:opacity-50">
                     <option value="">Select State</option>
                     {states.map(s => <option key={s.isoCode} value={s.isoCode}>{s.name}</option>)}
                   </select>
                   <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
                 </div>

                 <div className="relative">
                   <select required disabled={!stateRegion} value={city} onChange={(e) => setCity(e.target.value)} className="w-full pl-4 pr-8 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white outline-none transition-all font-medium appearance-none text-slate-700 disabled:opacity-50">
                     <option value="">Select City</option>
                     {cities.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                   </select>
                   <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
                 </div>

                 <div className="relative">
                   <input type="text" required placeholder="Pincode" value={pincode} onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))} className="w-full pl-4 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white outline-none transition-all font-medium" />
                 </div>
               </div>

               {/* Auto-set Address Field */}
               <div className="relative">
                 <Map className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                 <input type="text" readOnly placeholder="Full Address (Auto-filled)" value={address} className="w-full pl-12 pr-4 py-3 bg-gray-100 border border-slate-200 rounded-xl font-medium text-slate-500 cursor-not-allowed" />
               </div>
             </div>

             <div className="space-y-2">
               <label className="text-sm font-bold text-slate-700">Create Password</label>
               <div className="relative">
                 <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                 <input type={showPassword ?"text" :"password"} required placeholder="Create Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-12 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white outline-none transition-all font-medium" />
                 <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                   {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                 </button>
               </div>
             </div>

             <div className="space-y-2">
               <label className="text-sm font-bold text-slate-700">Confirm Password</label>
               <div className="relative">
                 <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                 <input type={showConfirmPassword ?"text" :"password"} required placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full pl-12 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white outline-none transition-all font-medium" />
                 <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                   {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                 </button>
               </div>
             </div>

             <motion.button whileTap={{ scale: 0.98 }} type="submit" disabled={loading} className="btn-3d btn-blue w-full py-4 mt-2 font-bold flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
               {loading ?"Creating Account..." :"Sign Up"}
               {!loading && <ArrowRight size={20} />}
             </motion.button>
           </form>

           <div className="mt-8 text-center">
             <p className="text-slate-500 font-medium">
               Already have an account? <Link to="/login/user" className="text-green-600 font-bold hover:underline">Login</Link>
             </p>
           </div>
        </div>
      </div>
    </div>
  );
}
import { useState, useEffect, useLayoutEffect } from 'react';
import { useNavigate, Link, useParams, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useStore } from '../context/StoreContext';
import { ArrowRight, Mail, Lock, Eye, EyeOff, Leaf, KeyRound, Hand } from 'lucide-react';

export default function Login() {
  const { role = '' } = useParams();
  const normalizedRole = role.toLowerCase();
  const activeRole = ['admin', 'delivery'].includes(normalizedRole) ? normalizedRole : 'user';
  const location = useLocation();
  const { pathname } = location;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Forgot Password State
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  const store = useStore();
  const navigate = useNavigate();

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  // Prevent crashing if the store is not yet available during initial render.
  if (!store) {
    return null; // Or a loading spinner
  }
  const { showToast, setCurrentUser, usersDB, deliveryPartners } = store;

  const handleSubmit = async (e) => {
    e.preventDefault();
 
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.endsWith('.om')) {
      if (showToast) showToast("Please enter a valid email address (e.g., name@domain.com).");
      return;
    }

    // Strict check for Admin credentials
    if (activeRole === 'admin') {
      if (email !== 'somyapadhiyar@gmail.com' || password !== 'somya24092007') {
        if (showToast) showToast("Access denied. Invalid Admin Credentials.");
        return; 
      } 
    }

    setLoading(true);      
             
    if (activeRole === 'admin') {
      const userData = { name: 'Admin', email: 'somyapadhiyar@gmail.com', role: 'admin' };
      setCurrentUser(userData);
      if (showToast) showToast("Welcome back, Admin!");
      setLoading(false);
      navigate('/admin', { replace: true });
      return;
    }

    if (activeRole === 'user') {
      try {
        const webhookRes = await fetch(import.meta.env.VITE_WEBHOOK_USER_AUTH_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, requestType: "Login" })
        });
        
        const textRes = await webhookRes.text();
        let message = textRes;
        let isValidationError = false;
        try {
          const jsonRes = JSON.parse(textRes);
          message = jsonRes.message || jsonRes.output || jsonRes.response || textRes;
          
          if (jsonRes.token) {
            localStorage.setItem('token', jsonRes.token);
            
            const userData = { 
              uid: jsonRes.userId || email, 
              name: jsonRes.name || email.split('@')[0], 
              email, 
              role: 'user' 
            };
            if (store.clearCart) store.clearCart();
            setCurrentUser(userData);
            if (showToast) showToast(`Welcome back, ${userData.name}!`);
            setLoading(false);
            const redirectPath = location.state?.from ? location.state.from : '/home';
            navigate(redirectPath, { replace: true });
            return;
          }
          
          if (jsonRes.status === 'error' && Array.isArray(jsonRes.errors) && jsonRes.errors.length > 0) {
            message = jsonRes.errors[0];
            isValidationError = true;
          }
        } catch (e) {}
        
        if (isValidationError) {
          if (showToast) showToast(message);
          setLoading(false);
          return;
        }

        console.log("Login Webhook Response:", message);
      } catch (webhookError) {
        console.error("Webhook Error:", webhookError);
      }

      // Fallback for user offline/dev
      const localUser = usersDB.find(u => u.email === email);
      if (localUser) {
        setCurrentUser(localUser);
        if (showToast) showToast(`Offline Login: Welcome back, ${localUser.name}!`);
        setLoading(false);
        const redirectPath = location.state?.from ? location.state.from : '/home';
        navigate(redirectPath, { replace: true });
        return;
      }

      if (showToast) showToast("Invalid email or password.");
      setLoading(false);
      return;
    }

    if (activeRole === 'delivery') {
      try {
        const webhookRes = await fetch(import.meta.env.VITE_WEBHOOK_PARTNER_LOGIN_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        });
        
        const textRes = await webhookRes.text();
        let message = textRes;
        try {
          const jsonRes = JSON.parse(textRes);
          message = jsonRes.message || jsonRes.output || jsonRes.response || textRes;

          const statusStr = String(jsonRes.status || '').toLowerCase();
          if (statusStr === 'success' && jsonRes.user) {
            const userInfo = jsonRes.user;
            const dMode = userInfo.type || userInfo.deliveryMode || 'online';
            const userData = {
              ...userInfo,
              uid: userInfo._id || userInfo.userId || email,
              name: userInfo.name || email.split('@')[0],
              email: userInfo.email || email,
              role: 'delivery',
              status: 'Approved',
              deliveryMode: dMode
            };
            if (jsonRes.token) localStorage.setItem('deliveryToken', jsonRes.token);
            
            if (store.clearCart) store.clearCart();
            
            setCurrentUser(userData);
            if (showToast) showToast(`Welcome back, ${userData.name}!`);
            setLoading(false);
            navigate(`/delivery/${dMode.toLowerCase()}`, { replace: true });
            return;
          }

          if (statusStr === 'pending' || statusStr === 'error' || jsonRes.message) {
            if (showToast) showToast(message || "Login failed. Please try again.");
            setLoading(false);
            return;
          }
        } catch (e) {}
        
        if (showToast) showToast(typeof message === 'string' ? message : "Login failed or pending approval.");
        setLoading(false);
        return;
      } catch (webhookError) {
        console.error("Webhook Error:", webhookError);
      }

      // Fallback for delivery offline/dev
      const localPartner = deliveryPartners.find(p => p.email === email);
      if (localPartner) {
        if (localPartner.status !== 'Approved') {
          if (showToast) showToast("Your delivery account is pending admin approval.");
          setLoading(false);
          return;
        }
        setCurrentUser(localPartner);
        if (showToast) showToast(`Offline Login: Welcome back, ${localPartner.name}!`);
        setLoading(false);
        navigate(`/delivery/${localPartner.deliveryMode.toLowerCase()}`, { replace: true });
        return;
      }

      if (showToast) showToast("Error connecting to server.");
      setLoading(false);
      return;
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    // Google Sign-in Mock
    const googleUser = {
      uid: 'google-user-' + Date.now(),
      name: activeRole === 'admin' ? 'Admin' : 'Google User',
      email: activeRole === 'admin' ? 'somyapadhiyar@gmail.com' : 'user@google.com',
      role: activeRole
    };
    
    if (activeRole === 'admin') {
      setCurrentUser(googleUser);
      if (showToast) showToast("Welcome back, Admin!");
      setLoading(false);
      navigate('/admin', { replace: true });
    } else {
      if (activeRole === 'delivery') {
        googleUser.status = 'Pending';
      }
      setCurrentUser(googleUser);
      if (showToast) showToast(`Welcome back, ${googleUser.name}!`);
      setLoading(false);
      const redirectPath = activeRole === 'delivery' ? '/delivery' : '/home';
      navigate(redirectPath, { replace: true });
    }
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (activeRole === 'admin') {
      if (showToast) showToast("Admin password cannot be reset online. Contact Super Admin.");
      setLoading(false);
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(resetEmail) || resetEmail.endsWith('.om')) {
      if (showToast) showToast("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    if (showToast) showToast("Password reset link sent! Please check your email inbox/spam folder.");
    setIsForgotPassword(false);
    setResetEmail('');
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
             src="https://cdn-icons-png.flaticon.com/512/3081/3081986.png" 
             alt="Grocery Delivery" 
             className="w-96 mx-auto mb-8 drop-shadow-2xl"
           />
           <h2 className="text-4xl font-black text-blue-600 mb-4">Groceries in Minutes</h2>
           <p className="text-lg text-slate-600 max-w-md mx-auto">Get fresh organic produce delivered to your doorstep in 10 minutes or less.</p>
        </div>

        {/* Background Elements */}
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-200/50 rounded-full blur-3xl"></div>
        <div className="absolute top-20 right-20 w-72 h-72 bg-green-200/50 rounded-full blur-3xl"></div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 bg-white relative">
        <div className="max-w-md w-full">
           <div className="lg:hidden mb-10 text-center">
             <Link to="/" className="inline-flex items-center gap-2">
                <Leaf size={32} className="text-green-600" />
                <h1 className="text-3xl font-black text-blue-600 italic tracking-tighter">Zesty</h1>
              </Link>
           </div>

           {isForgotPassword ? (
             <>
               <div className="mb-10">
                 <h2 className="text-2xl sm:text-3xl font-black text-blue-600 mb-2 flex items-center gap-2">Reset Password <KeyRound className="text-blue-600" size={28} /></h2>
                 <p className="text-slate-500 font-medium">
                   Enter your registered email to receive a password reset link.
                 </p>
               </div>

               <form onSubmit={handleForgotPasswordSubmit} className="space-y-6">
                 <div className="space-y-2">
                   <label className="text-sm font-bold text-slate-700">Registered Email</label>
                   <div className="relative">
                     <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                     <input 
                       type="email" 
                       required 
                       placeholder="john@example.com"
                       value={resetEmail} 
                       onChange={(e) => setResetEmail(e.target.value)}
                       className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white outline-none transition-all font-medium"
                     />
                   </div>
                 </div>

                 <motion.button 
                   whileTap={{ scale: 0.98 }}
                   type="submit" 
                   disabled={loading}
                   className="btn-3d btn-blue w-full py-4 font-bold flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                 >
                   {loading ? "Sending Link..." : "Send Reset Link"}
                   {!loading && <ArrowRight size={20} />}
                 </motion.button>
               </form>

               <div className="mt-8 text-center">
                 <button onClick={() => { setIsForgotPassword(false); setResetEmail(''); }} className="text-slate-500 font-bold hover:text-slate-800 transition-colors">
                   ← Back to Login
                 </button>
               </div>
             </>
           ) : (
             <>
               <div className="mb-10">
                 <h2 className="text-2xl sm:text-3xl font-black text-blue-600 mb-2">
                   {activeRole === 'admin' ? 'Admin Portal' : activeRole === 'delivery' ? 'Delivery Partner' : <span className="flex items-center gap-2">Welcome Back! <Hand className="text-amber-500" size={28} /></span>}
                 </h2>
                 <p className="text-slate-500 font-medium">Please login to your {activeRole} account to continue.</p>
               </div>
               <form onSubmit={handleSubmit} className="space-y-6">
                 <div className="space-y-2">
                   <label className="text-sm font-bold text-slate-700">Email Address</label>
                   <div className="relative">
                     <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                     <input 
                       type="email" 
                       required 
                       placeholder={activeRole === 'admin' ?"admin@zesty.com" :"john@example.com"}
                       value={email} 
                       onChange={(e) => setEmail(e.target.value)}
                       className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white outline-none transition-all font-medium"
                     />
                   </div>
                 </div>

                 <div className="space-y-2">
                   <div className="flex justify-between items-center">
                     <label className="text-sm font-bold text-slate-700">Password</label>
                     <button type="button" onClick={() => setIsForgotPassword(true)} className="text-xs font-bold text-green-600 hover:text-green-700">Forgot Password?</button>
                   </div>
                   <div className="relative">
                     <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                     <input 
                       type={showPassword ?"text" :"password"} 
                       required 
                       placeholder="••••••••" 
                       value={password} 
                       onChange={(e) => setPassword(e.target.value)}
                       className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white outline-none transition-all font-medium"
                     />
                     <button 
                       type="button"
                       onClick={() => setShowPassword(!showPassword)}
                       className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                     >
                       {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                     </button>
                   </div>
                 </div>

                 <motion.button 
                   whileTap={{ scale: 0.98 }}
                   type="submit" 
                   disabled={loading}
                   className="btn-3d btn-blue w-full py-4 font-bold flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                 >
                   {loading ?"Logging in..." : `Login as ${activeRole.charAt(0).toUpperCase() + activeRole.slice(1)}`}
                   {!loading && <ArrowRight size={20} />}
                 </motion.button>
               </form>

               {activeRole === 'user' && (
                 <div className="mt-8 text-center">
                   <p className="text-slate-500 font-medium">
                     New to Zesty? <Link to="/signup" state={{ from: location.state?.from }} className="text-green-600 font-bold hover:underline">Create an Account</Link>
                   </p>
                 </div>
               )}
               {activeRole === 'delivery' && (
                 <div className="mt-8 text-center">
                   <p className="text-slate-500 font-medium">
                     Want to deliver for Zesty? <Link to="/signup/delivery" className="text-green-600 font-bold hover:underline">Create a Partner Account</Link>
                   </p>
                 </div>
               )}

               {(activeRole === 'user' || activeRole === 'delivery') && (
                 <div className="mt-10 pt-6 border-t border-slate-100">
                   <p className="text-xs text-center text-slate-400 font-bold uppercase tracking-widest mb-4">Or continue with</p>
                   <div className="flex justify-center">
                     <button 
                       type="button" 
                       onClick={handleGoogleLogin} 
                       disabled={loading}
                       className="btn-3d btn-lime border-none w-full max-w-xs flex items-center justify-center gap-2 py-3 border rounded-xl transition font-bold disabled:opacity-70 disabled:cursor-not-allowed"
                     >
                       <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" /> Google
                     </button>
                   </div>
                 </div>
               )}
             </>
           )}
        </div>
      </div>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useStore } from '../context/StoreContext';
import { ArrowRight, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { auth } from '../firebase';

export default function Login() {
  const { role } = useParams();
  const activeRole = ['admin', 'delivery'].includes(role) ? role : 'user';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Forgot Password State
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetStep, setResetStep] = useState(1);
  const [resetEmail, setResetEmail] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const { loginUser, showToast, checkEmailExists, resetPassword, setCurrentUser } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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

    try {
      let user;
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        user = userCredential.user;
      } catch (err) {
        // Auto-create admin if it doesn't exist in Firebase Auth yet
        if (activeRole === 'admin' && email === 'somyapadhiyar@gmail.com' && password === 'somya24092007') {
           try {
             const userCredential = await createUserWithEmailAndPassword(auth, email, password);
             user = userCredential.user;
             const db = getFirestore(auth.app);
             await setDoc(doc(db, "users", user.uid), { name: 'Admin', email, role: 'admin' });
           } catch (createErr) {
             if (createErr.code === 'auth/email-already-in-use') throw { custom: "Admin account exists with different credentials. Please click 'Continue with Google' to log in." };
             throw createErr;
           }
        } else {
           throw err;
        }
      }

      const db = getFirestore(auth.app);
      const userDoc = await getDoc(doc(db, "users", user.uid));
      let userData = { name: email.split('@')[0], email, role: 'user' };
      
      if (userDoc.exists()) {
        userData = userDoc.data();
      } else if (email === 'somyapadhiyar@gmail.com') {
        // Fallback if doc was deleted but Auth exists
        userData = { name: 'Admin', email, role: 'admin' };
        await setDoc(doc(db, "users", user.uid), userData);
      }

      const actualRole = userData.role || 'user';

      // 1. Role verification
      if (actualRole !== activeRole) {
        await auth.signOut();
        if (showToast) showToast(`Access denied. You are registered as ${actualRole}, not ${activeRole}.`);
        setLoading(false);
        return;
      }

      // 2. Delivery partner approval check
      if (actualRole === 'delivery' && userData.status !== 'Approved') {
        await auth.signOut();
        if (showToast) showToast("Your delivery account is pending admin approval.");
        setLoading(false);
        return;
      }

      // 3. Proceed with Login
      setCurrentUser(userData);
      if (showToast) showToast(`Welcome back, ${userData.name || activeRole}!`);
      
      const paths = {
        admin: '/admin',
        delivery: '/delivery',
        user: '/home'
      };
      
      navigate(paths[activeRole] || '/home', { replace: true });
    } catch (error) {
      console.error("Login Error:", error);
      
      if (error.custom) {
        if (showToast) showToast(error.custom);
        return;
      }
      
      let message = "Invalid email or password.";
      
      if (error.code === 'auth/user-not-found') message = "No account found with this email.";
      if (error.code === 'auth/wrong-password') message = "Incorrect password.";
      if (error.code === 'auth/invalid-credential') message = "Invalid login credentials.";
      if (error.code === 'auth/too-many-requests') message = "Too many attempts. Try again later.";
      if (error.code === 'auth/operation-not-allowed') message = "Email/Password sign-in is not enabled in Firebase Authentication.";
      
      if (showToast) showToast(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Strict check for Admin Google Login
      if (activeRole === 'admin' && user.email !== 'somyapadhiyar@gmail.com') {
        await auth.signOut();
        if (showToast) showToast("Access denied. You are not authorized as Admin.");
        setLoading(false);
        return;
      }

      const db = getFirestore(auth.app);
      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);
      
      let userData = {
        uid: user.uid,
        name: user.displayName || user.email.split('@')[0],
        email: user.email,
        role: activeRole,
        photoURL: user.photoURL || null
      };
      
      if (!userDoc.exists()) {
        if (activeRole === 'delivery') {
          userData.status = 'Pending';
        }
        await setDoc(userRef, userData);
      } else {
        userData = userDoc.data();
      }

      const actualRole = userData.role || 'user';

      // 1. Role verification
      if (actualRole !== activeRole) {
        await auth.signOut();
        if (showToast) showToast(`Access denied. You are registered as ${actualRole}, not ${activeRole}.`);
        setLoading(false);
        return;
      }

      // 2. Delivery partner approval check
      if (actualRole === 'delivery' && userData.status !== 'Approved') {
        await auth.signOut();
        if (showToast) showToast("Your delivery account is pending admin approval.");
        setLoading(false);
        return;
      }

      // 3. Proceed with Login
      setCurrentUser(userData);
      if (showToast) showToast(`Welcome back, ${userData.name || activeRole}!`);
      
      const paths = {
        admin: '/admin',
        delivery: '/delivery',
        user: '/home'
      };
      
      navigate(paths[activeRole] || '/home', { replace: true });
    } catch (error) {
      console.error("Google Login Error:", error);
      if (error.code !== 'auth/popup-closed-by-user' && showToast) {
        showToast("Google login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay
    setLoading(false);

    if (resetStep === 1) {
      if (activeRole === 'admin') {
        if (showToast) showToast("Admin password cannot be reset online. Contact Super Admin.");
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(resetEmail) || resetEmail.endsWith('.om')) {
        if (showToast) showToast("Please enter a valid email address.");
        return;
      }

      const exists = checkEmailExists(resetEmail, activeRole);
      if (exists) {
        if (showToast) showToast("OTP sent to your email! (Use 123456)");
        setResetStep(2);
      } else {
        if (showToast) showToast("No account found with this email.");
      }
    } else if (resetStep === 2) {
      if (resetOtp === '123456') { // Mock OTP Verification
        if (showToast) showToast("OTP Verified!");
        setResetStep(3);
      } else {
        if (showToast) showToast("Invalid OTP.");
      }
    } else if (resetStep === 3) {
      if (newPassword !== confirmNewPassword) return showToast && showToast("Passwords do not match.");
      if (newPassword.length < 6) return showToast && showToast("Password must be at least 6 characters.");
      
      const res = resetPassword(resetEmail, activeRole, newPassword);
      if (res.success) {
        if (showToast) showToast("Password reset successfully! Please login.");
        setIsForgotPassword(false);
        setResetStep(1);
        setEmail(resetEmail);
        setPassword('');
        setResetEmail(''); setResetOtp(''); setNewPassword(''); setConfirmNewPassword('');
      } else {
        if (showToast) showToast(res.msg);
      }
    }
  };

  return (
    <div className="min-h-screen bg-white flex font-sans text-slate-900">
      {/* Left Side - Branding & Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-blue-50 relative overflow-hidden items-center justify-center">
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
                <span className="text-4xl">🌿</span>
                <h1 className="text-3xl font-black text-blue-600 italic tracking-tighter">Zesty</h1>
             </Link>
           </div>

           {isForgotPassword ? (
             <>
               <div className="mb-10">
                 <h2 className="text-2xl sm:text-3xl font-black text-blue-600 mb-2">Reset Password 🔐</h2>
                 <p className="text-slate-500 font-medium">
                   {resetStep === 1 && "Enter your email to receive an OTP."}
                   {resetStep === 2 && `Enter the OTP sent to ${resetEmail}.`}
                   {resetStep === 3 && "Create a new secure password."}
                 </p>
               </div>

               <form onSubmit={handleForgotPasswordSubmit} className="space-y-6">
                 {resetStep === 1 && (
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
                 )}

                 {resetStep === 2 && (
                   <div className="space-y-2">
                     <label className="text-sm font-bold text-slate-700">6-Digit OTP</label>
                     <div className="relative">
                       <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                       <input 
                         type="text" 
                         maxLength="6"
                         required 
                         placeholder="123456"
                         value={resetOtp} 
                         onChange={(e) => setResetOtp(e.target.value.replace(/\D/g, ''))}
                         className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white outline-none transition-all font-medium tracking-widest"
                       />
                     </div>
                   </div>
                 )}

                 {resetStep === 3 && (
                   <>
                     <div className="space-y-2">
                       <label className="text-sm font-bold text-slate-700">New Password</label>
                       <div className="relative">
                         <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                         <input 
                           type={showPassword ? "text" : "password"} 
                           required 
                           placeholder="••••••••" 
                           value={newPassword} 
                           onChange={(e) => setNewPassword(e.target.value)}
                           className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white outline-none transition-all font-medium"
                         />
                         <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                           {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                         </button>
                       </div>
                     </div>
                     <div className="space-y-2">
                       <label className="text-sm font-bold text-slate-700">Confirm New Password</label>
                       <div className="relative">
                         <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                         <input 
                           type={showPassword ? "text" : "password"} 
                           required 
                           placeholder="••••••••" 
                           value={confirmNewPassword} 
                           onChange={(e) => setConfirmNewPassword(e.target.value)}
                           className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white outline-none transition-all font-medium"
                         />
                       </div>
                     </div>
                   </>
                 )}

                 <motion.button 
                   whileTap={{ scale: 0.98 }}
                   type="submit" 
                   disabled={loading}
                   className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                 >
                   {loading ? "Processing..." : resetStep === 1 ? "Send OTP" : resetStep === 2 ? "Verify OTP" : "Update Password"}
                   {!loading && <ArrowRight size={20} />}
                 </motion.button>
               </form>

               <div className="mt-8 text-center">
                 <button onClick={() => { setIsForgotPassword(false); setResetStep(1); setResetEmail(''); setResetOtp(''); }} className="text-slate-500 font-bold hover:text-slate-800 transition-colors">
                   ← Back to Login
                 </button>
               </div>
             </>
           ) : (
             <>
               <div className="mb-10">
                 <h2 className="text-2xl sm:text-3xl font-black text-blue-600 mb-2">
                   {activeRole === 'admin' ? 'Admin Portal' : activeRole === 'delivery' ? 'Delivery Partner' : 'Welcome Back! 👋'}
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
                       placeholder={activeRole === 'admin' ? "admin@zesty.com" : "john@example.com"}
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
                       type={showPassword ? "text" : "password"} 
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
                   className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                 >
                   {loading ? "Logging in..." : `Login as ${activeRole.charAt(0).toUpperCase() + activeRole.slice(1)}`}
                   {!loading && <ArrowRight size={20} />}
                 </motion.button>
               </form>

               {activeRole === 'user' && (
                 <div className="mt-8 text-center">
                   <p className="text-slate-500 font-medium">
                     New to Zesty? <Link to="/signup" className="text-green-600 font-bold hover:underline">Create an Account</Link>
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
                       className="w-full max-w-xs flex items-center justify-center gap-2 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition font-bold text-slate-700 disabled:opacity-70 disabled:cursor-not-allowed"
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
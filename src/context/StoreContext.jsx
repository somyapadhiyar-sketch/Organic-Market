import { createContext, useContext, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getFirestore, collection, getDocs, doc, setDoc, deleteDoc, query, where, updateDoc, onSnapshot } from "firebase/firestore";
import { auth } from '../firebase';

let hasAlertedQuota = false;
const safeJSONParse = (key, fallback) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.error(`Error parsing ${key} from localStorage, resetting it.`, e);
    localStorage.removeItem(key);
    return fallback;
  }
};

const defaultProducts = [];

const StoreContext = createContext();

export function StoreProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const item = sessionStorage.getItem('currentUser');
      return item ? JSON.parse(item) : null;
    } catch (e) {
      return null;
    }
  });
  const [usersDB, setUsersDB] = useState(() => safeJSONParse('usersDB', []));
  const [deliveryPartners, setDeliveryPartners] = useState(() => safeJSONParse('deliveryPartners', []));
  const [userLocation, setUserLocation] = useState(() => localStorage.getItem('userLocation') || 'Ahmedabad, Gujarat');
  const [searchQuery, setSearchQuery] = useState('');

  // Start with default products, but we will overwrite this immediately with Firebase data
  const [products, setProducts] = useState(defaultProducts); 
  const [orders, setOrders] = useState(() => safeJSONParse('orders', []));
  const [cart, setCart] = useState(() => safeJSONParse('cart', []));
  const [wishlist, setWishlist] = useState(() => safeJSONParse('wishlist', []));
  const [salesHistory, setSalesHistory] = useState(() => safeJSONParse('salesHistory', []));
  const [toasts, setToasts] = useState([]);

  // Fetch Products from Firebase on App Load
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const db = getFirestore(auth.app);
        const querySnapshot = await getDocs(collection(db, "products"));
        
        if (querySnapshot.empty) {
          // First time setup: Seed Firestore with your default products
          for (const prod of defaultProducts) {
            await setDoc(doc(db, "products", prod.id), prod);
          }
          setProducts(defaultProducts);
        } else {
          // Load from Firestore
          const fbProducts = querySnapshot.docs.map(doc => doc.data());
          
          // Automatically add any missing default products to Firestore
          const missingProducts = defaultProducts.filter(dp => !fbProducts.some(fbp => fbp.id === dp.id));
          if (missingProducts.length > 0) {
            for (const prod of missingProducts) {
              await setDoc(doc(db, "products", prod.id), prod);
              fbProducts.push(prod);
            }
          }

          setProducts(fbProducts);
        }
      } catch (error) {
        console.error("Error fetching products from Firebase:", error);
      }
    };

    fetchProducts();

        // Fetch Delivery Partners from Firebase
        const fetchPartners = async () => {
          try {
            const db = getFirestore(auth.app);
            const q = query(collection(db, "users"), where("role", "==", "delivery"));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
              const fbPartners = querySnapshot.docs.map(doc => doc.data());
              setDeliveryPartners(fbPartners);
            }
          } catch (error) {
            console.error("Error fetching delivery partners:", error);
          }
        };
        fetchPartners();
  }, []);

  // Fetch Orders from Firebase in Real-time
  useEffect(() => {
    const db = getFirestore(auth.app);
    const unsubscribe = onSnapshot(collection(db, "orders"), (snapshot) => {
      if (!snapshot.empty) {
        const fbOrders = snapshot.docs.map(doc => doc.data());
        // Sort orders so newest are first (using the timestamp embedded in ID)
        fbOrders.sort((a, b) => {
          const timeA = parseInt((a.id || '').replace('ORD', '')) || 0;
          const timeB = parseInt((b.id || '').replace('ORD', '')) || 0;
          return timeB - timeA;
        });
        setOrders(fbOrders);
      }
    }, (error) => console.error("Error fetching orders:", error));
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    try {
      if (currentUser) {
        sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
      } else {
        sessionStorage.removeItem('currentUser');
      }
      localStorage.removeItem('currentUser'); // Clean up old persistent login
      
      localStorage.setItem('usersDB', JSON.stringify(usersDB));
      localStorage.setItem('deliveryPartners', JSON.stringify(deliveryPartners));
      localStorage.setItem('orders', JSON.stringify(orders));
      localStorage.setItem('cart', JSON.stringify(cart));
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
      localStorage.setItem('salesHistory', JSON.stringify(salesHistory));
      localStorage.setItem('userLocation', userLocation);
    } catch (e) {
      console.warn("Storage Quota Exceeded! Could not save to localStorage.", e);
      if (!hasAlertedQuota) {
        alert("⚠️ Browser Memory is FULL! Your image could not be saved. Please right-click -> Inspect -> Application -> Local Storage -> Delete all data, then refresh.");
        hasAlertedQuota = true;
      }
    }
  }, [currentUser, usersDB, deliveryPartners, orders, cart, wishlist, salesHistory, userLocation]);

  const showToast = (message) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message }]);
    setTimeout(() => removeToast(id), 4000);
  };
  const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  // Password Reset Methods
  const checkEmailExists = (email, role) => {
    if (role === 'admin') return email === 'somyapadhiyar@gmail.com';
    if (role === 'delivery') return deliveryPartners.some(d => d.email === email);
    return usersDB.some(u => u.email === email);
  };

  const resetPassword = (email, role, newPassword) => {
    if (role === 'admin') return { success: false, msg: 'Admin password cannot be reset.' };
    if (role === 'delivery') {
      const idx = deliveryPartners.findIndex(d => d.email === email);
      if (idx === -1) return { success: false, msg: 'Account not found.' };
      const updated = [...deliveryPartners];
      updated[idx].password = newPassword;
      setDeliveryPartners(updated);
      return { success: true };
    }
    const idx = usersDB.findIndex(u => u.email === email);
    if (idx === -1) return { success: false, msg: 'Account not found.' };
    const updated = [...usersDB];
    updated[idx].password = newPassword;
    setUsersDB(updated);
    return { success: true };
  };

  // Auth Methods
  const registerUser = (name, email, phone, address, password) => {
    if (usersDB.find(u => u.email === email)) return { success: false, msg: 'Email already exists!' };
    const newUser = { name, email, phone, address, password, role: 'user' };
    setUsersDB([...usersDB, newUser]);
    setCurrentUser(newUser);
    return { success: true };
  };
  const updateUser = (updatedUser) => {
    setCurrentUser(updatedUser);
    setUsersDB(prev => prev.map(u => u.email === updatedUser.email ? updatedUser : u));
  };
  const deleteUser = (email) => {
    setUsersDB(prev => prev.filter(u => u.email !== email));
    logout();
  };
  const registerDelivery = (name, email, phone, address, password, photoURL) => {
    if (deliveryPartners.find(d => d.email === email)) return { success: false, msg: 'Email already exists!' };
    const newPartner = { name, email, phone, address, password, role: 'delivery', status: 'Pending', photoURL };
    setDeliveryPartners([...deliveryPartners, newPartner]);
    return { success: true, msg: 'Request sent to Admin for approval!' };
  };
  const loginUser = (email, password, role) => {
    if (role === 'admin') {
      if (email === 'somyapadhiyar@gmail.com' && password === 'somya24092007') {
        setCurrentUser({ name: 'Admin', email, role: 'admin' });
        return { success: true };
      }
      return { success: false, msg: 'Invalid Admin Credentials' };
    }
    if (role === 'delivery') {
      const partner = deliveryPartners.find(d => d.email === email && d.password === password);
      if (!partner) return { success: false, msg: 'Invalid Credentials' };
      if (partner.status !== 'Approved') return { success: false, msg: 'Your account is pending admin approval.' };
      setCurrentUser(partner);
      return { success: true };
    }
    const user = usersDB.find(u => u.email === email && u.password === password);
    if (user) { 
      setCurrentUser(user); 
      return { success: true }; 
    }
    return { success: false, msg: 'Invalid Email or Password' };
  };
  const logout = () => setCurrentUser(null);

  // Admin Methods
  const approveDelivery = async (email) => {
    setDeliveryPartners(prev => prev.map(d => d.email === email ? { ...d, status: 'Approved' } : d));
    try {
      const db = getFirestore(auth.app);
      const q = query(collection(db, "users"), where("email", "==", email), where("role", "==", "delivery"));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(async (document) => {
        await updateDoc(doc(db, "users", document.id), { status: 'Approved' });
      });
    } catch(e) { console.error("Error updating approval in Firestore:", e); }
  };

  const toggleProductStatus = async (id) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, disabled: !p.disabled } : p));
    const product = products.find(p => p.id === id);
    if (product) {
      try {
        const db = getFirestore(auth.app);
        await setDoc(doc(db, "products", id), { disabled: !product.disabled }, { merge: true });
      } catch(e) { console.error(e); }
    }
  };

  const deleteProduct = async (id) => {
    if(window.confirm("Delete this item?")) {
      setProducts(prev => prev.filter(p => p.id !== id));
      setCart(prev => prev.filter(item => !item.id.startsWith(id))); // Remove variants
      try {
        const db = getFirestore(auth.app);
        await deleteDoc(doc(db, "products", id));
      } catch(e) { console.error(e); }
    }
  };

  const addNewProduct = async (product) => {
    // Parse "whyYouWillLoveThis" into an array if it comes as a comma-separated string from the UI
    const parsedReasons = Array.isArray(product.whyYouWillLoveThis) 
      ? product.whyYouWillLoveThis 
      : (product.whyYouWillLoveThis ? product.whyYouWillLoveThis.split(',').map(item => item.trim()).filter(Boolean) : []);

    let prefix = 'new_';
    if (product.category === 'Fruits') prefix = 'f';
    else if (product.category === 'Vegetables') prefix = 'v';
    else if (product.category === 'Pulses') prefix = 'p';

    const existingIds = products
      .filter(p => p.id && p.id.startsWith(prefix))
      .map(p => parseInt(p.id.replace(prefix, ''), 10))
      .filter(num => !isNaN(num));

    const maxIdNum = existingIds.length > 0 ? Math.max(...existingIds) : 0;
    const generatedId = prefix === 'new_' ? `new_${Date.now()}` : `${prefix}${maxIdNum + 1}`;

    const newProduct = { 
      ...product, 
      whyYouWillLoveThis: parsedReasons,
      id: generatedId, 
      disabled: false, 
      stock: product.stock || 150, 
      sold: 0 
    };
    setProducts(prev => [newProduct, ...prev]);
    try {
      const db = getFirestore(auth.app);
      await setDoc(doc(db, "products", newProduct.id), newProduct);
    } catch(e) { console.error(e); }
  };

  const editProduct = async (id, updatedData) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updatedData } : p));
    try {
      const db = getFirestore(auth.app);
      await setDoc(doc(db, "products", id), updatedData, { merge: true });
    } catch(e) { console.error(e); }
  };

  const placeOrder = async (details) => {
    const orderId = 'ORD' + Date.now();
    const newOrder = { id: orderId, date: new Date().toLocaleString(), status: 'Pending', ...details };

    setProducts(prev => prev.map(p => {
      const cartItem = details.items.find(i => i.id === p.id);
      if (cartItem) {
        const newStock = Math.max(0, p.stock - cartItem.quantity);
        try {
          const db = getFirestore(auth.app);
          setDoc(doc(db, "products", p.id), { stock: newStock }, { merge: true });
        } catch(e) { console.error(e); }
        return { ...p, stock: newStock };
      }
      return p;
    }));
    setOrders(prev => [newOrder, ...prev]);
    setCart([]);
    try {
      const db = getFirestore(auth.app);
      await setDoc(doc(db, "orders", orderId), newOrder);
    } catch(e) { console.error("Error saving order to Firestore:", e); }
  };
  const updateOrderStatus = async (id, status, partnerEmail = null) => {
    let updatedFields = { status };
    if (partnerEmail) {
      updatedFields.deliveryPartnerEmail = partnerEmail;
      const partner = deliveryPartners.find(d => d.email === partnerEmail);
      if (partner) {
        updatedFields.deliveryPartner = { name: partner.name, phone: partner.phone };
      }
    }

    setOrders(prev => prev.map(o => {
      if (o.id === id) {
        return { ...o, ...updatedFields };
      }
      return o;
    }));

    try {
      const db = getFirestore(auth.app);
      await updateDoc(doc(db, "orders", id), updatedFields);
    } catch (error) {
      console.error("Error updating order status in Firestore:", error);
    }
  };

  // --- ZEPTO STYLE CART LOGIC ---
  // Add a specific pack (e.g. 500g). Quantity = Number of packs.
  const addToCart = (name, packPrice, qtyToAdd = 1, image, variantId) => {
    const product = products.find(p => p.id === variantId);
    setCart(prev => {
      const existing = prev.find(item => item.id === variantId);
      const currentQty = existing ? existing.quantity : 0;
      const newQty = currentQty + qtyToAdd;
      
      if (product && newQty > (product.stock || 0)) {
        showToast(`Only ${product.stock || 0} kg available in stock.`);
        return prev;
      }
      if (newQty > 20) { showToast("Max 20 packs allowed."); return prev; }
      
      const newTotal = packPrice * newQty;
      
      if (existing) {
        return prev.map(i => i.id === variantId ? {...i, quantity: newQty, total: newTotal} : i);
      }
      return [...prev, {id: variantId, name, price: packPrice, quantity: newQty, total: newTotal, image}];
    })
  };

  const decreaseCartQuantity = (variantId, qtyToSubtract = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === variantId);
      if (existing) {
        const newQty = existing.quantity - qtyToSubtract;
        if (newQty > 0) {
          return prev.map(i => i.id === variantId ? {...i, quantity: newQty, total: existing.price * newQty} : i);
        }
        return prev.filter(i => i.id !== variantId);
      }
      return prev;
    })
  };

  const removeFromCart = (variantId) => setCart(cart.filter(i => i.id !== variantId));
  const getCartTotal = () => cart.reduce((s, i) => s + i.total, 0);
  const toggleWishlist = (product) => setWishlist(prev => prev.some(i => i.id === product.id) ? prev.filter(i => i.id !== product.id) : [...prev, product]);

  return (
    <StoreContext.Provider value={{ 
      currentUser, setCurrentUser, updateUser, deleteUser, registerUser, registerDelivery, loginUser, logout, deliveryPartners, approveDelivery,
      userLocation, setUserLocation, searchQuery, setSearchQuery,
      products, toggleProductStatus, addNewProduct, deleteProduct, editProduct,
      orders, placeOrder, updateOrderStatus, salesHistory, showToast,
      cart, addToCart, removeFromCart, getCartTotal, decreaseCartQuantity, wishlist, toggleWishlist,
      checkEmailExists, resetPassword
    }}>
      {children}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div layout key={toast.id} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="pointer-events-auto bg-gray-900 text-white shadow-xl p-4 rounded-xl flex items-center gap-4 min-w-[300px] border border-gray-700">
              <p className="text-[14px] font-bold flex-1">{toast.message}</p>
              <button onClick={() => removeToast(toast.id)} className="text-gray-400 hover:text-white">✕</button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </StoreContext.Provider>
  );
}
export const useStore = () => useContext(StoreContext);
import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getFirestore, collection, getDocs, doc, setDoc, deleteDoc, query, where, updateDoc, onSnapshot, increment, runTransaction } from"firebase/firestore";
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
  const [pendingOrderId, setPendingOrderId] = useState(null);

  // Fetch Products from Firebase on App Load
  useEffect(() => {
    const db = getFirestore(auth.app);

    // Real-time listener for products
    const unsubscribeProducts = onSnapshot(collection(db, "products"), (snapshot) => {
      if (!snapshot.empty) {
        const fbProducts = snapshot.docs.map(doc => doc.data());
        setProducts(fbProducts);
      } else {
        console.log("No products found in Firestore.");
        setProducts([]); // Set to empty array if collection is empty
      }
    }, (error) => {
      console.error("Error fetching products in real-time:", error);
    });

    // The delivery partners don't need to be real-time for now, so a single fetch is fine.
    // If they did, this would also be converted to an onSnapshot listener.

        // Fetch Delivery Partners from Firebase
        const fetchPartners = async () => {
          try {
            const db = getFirestore(auth.app);
            const q = query(collection(db,"users"), where("role","==","delivery"));
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

    // Cleanup listener on component unmount
    return () => unsubscribeProducts();
  }, []); // Empty dependency array ensures this runs only once on mount

  // Fetch Orders from Firebase in Real-time
  useEffect(() => {
    const db = getFirestore(auth.app);
    const unsubscribe = onSnapshot(collection(db,"orders"), (snapshot) => {
      if (!snapshot.empty) {
        const fbOrders = snapshot.docs.map(doc => doc.data());
        // Sort orders so newest are first (using the timestamp embedded in ID)
        fbOrders.sort((a, b) => {
          const timeA = parseInt((a.id || '').replace('ORD', '')) || 0;
          const timeB = parseInt((b.id || '').replace('ORD', '')) || 0;
          return timeB - timeA;
        });
        setOrders(fbOrders);

      } else {
        setOrders([]);
      }
    }, (error) => console.error("Error fetching orders:", error));
    return () => unsubscribe();
  }, []);

  // Fetch Sales History from Firebase in Real-time for the last 30 days
  useEffect(() => {
    const db = getFirestore(auth.app);
    const salesCollection = collection(db, 'sales');

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const q = query(salesCollection, where("timestamp",">=", thirtyDaysAgo));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      // Each time we get an update, we'll rebuild the history from scratch
      const newHistoryMap = new Map();
      for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        d.setHours(0, 0, 0, 0);
        const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        newHistoryMap.set(dateStr, { name: dateStr, date: dateStr, sales: 0, revenue: 0, orders: 0 });
      }

      snapshot.forEach(doc => {
        const sale = doc.data();
        // Ensure timestamp exists and is valid before proceeding
        if (sale.timestamp && sale.timestamp.toDate) {
            const saleDate = sale.timestamp.toDate();
            const dateStr = saleDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            if (newHistoryMap.has(dateStr)) {
                // Overwrite the zeroed-out day with the actual sales data from Firestore
                newHistoryMap.set(dateStr, { ...sale, name: dateStr, date: dateStr });
            }
        }
      });
      setSalesHistory(Array.from(newHistoryMap.values()));
    }, (error) => {
      console.error("Error fetching sales history:", error);
    });

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
  const updateUser = (updatedUser) => {
    setCurrentUser(updatedUser);
    setUsersDB(prev => prev.map(u => u.email === updatedUser.email ? updatedUser : u));
  };
  const deleteUser = (email) => {
    setUsersDB(prev => prev.filter(u => u.email !== email));
    logout();
  };
  
  const logout = () => {
    auth.signOut();
    setCurrentUser(null)
  };

  // Admin Methods
  const approveDelivery = async (email) => {
    setDeliveryPartners(prev => prev.map(d => d.email === email ? { ...d, status: 'Approved' } : d));
    try {
      const db = getFirestore(auth.app);
      const q = query(collection(db,"users"), where("email","==", email), where("role","==","delivery"));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(async (document) => {
        await updateDoc(doc(db,"users", document.id), { status: 'Approved' });
      });
    } catch(e) { console.error("Error updating approval in Firestore:", e); }
  };

  const toggleProductStatus = async (id) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, disabled: !p.disabled } : p));
    const product = products.find(p => p.id === id);
    if (product) {
      try {
        const db = getFirestore(auth.app);
        await setDoc(doc(db,"products", id), { disabled: !product.disabled }, { merge: true });
      } catch(e) { console.error(e); }
    }
  };

  const deleteProduct = async (id) => {
    if(window.confirm("Delete this item?")) {
      setProducts(prev => prev.filter(p => p.id !== id));
      setCart(prev => prev.filter(item => !item.id.startsWith(id))); // Remove variants
      try {
        const db = getFirestore(auth.app);
        await deleteDoc(doc(db,"products", id));
      } catch(e) { console.error(e); }
    }
  };

  const addNewProduct = async (product) => {
    // The product object is now fully-formed from the AdminAddProduct component.
    // This function just handles adding it to state and Firestore.
    setProducts(prev => [product, ...prev]);
    try {
      const db = getFirestore(auth.app);
      await setDoc(doc(db,"products", product.id), product);
    } catch(e) { console.error(e); }
  };

  const editProduct = async (id, updatedData) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updatedData } : p));
    try {
      const db = getFirestore(auth.app);
      await setDoc(doc(db,"products", id), updatedData, { merge: true });
    } catch(e) { console.error(e); }
  };

  const isPlacingOrder = useRef(false);

  const placeOrder = async (details) => {
    // 1. Aggressive Anti-Duplicate Protection using a ref-based lock
    if (isPlacingOrder.current) return { success: false, msg: 'An order is already being processed.' };
    if (!details || !details.items || details.items.length === 0) return { success: false, msg: 'Cart is empty' };

    isPlacingOrder.current = true; // Set the lock
    const orderId = 'ORD' + Date.now();
    setPendingOrderId(orderId); // For UI feedback

    try {
      const db = getFirestore(auth.app);
      const now = new Date();

      const newOrder = { 
        ...details, 
        id: orderId, 
        createdAt: now.toISOString(), 
        date: now.toLocaleString(), 
        status: 'Pending' 
      };
      
      // 2. Create the order document in Firebase
      await setDoc(doc(db,"orders", orderId), newOrder);

      // 3. Clear the cart AFTER the order is confirmed
      setCart([]);

      // 4. Update Stock in Local State & Firebase
      setProducts(prev => prev.map(p => {
        const cartItem = details.items.find(i => i.id === p.id);
        if (cartItem) {
          return { ...p, stock: Math.max(0, (p.stock || 0) - cartItem.quantity) };
        }
        return p;
      }));

      details.items.forEach(cartItem => {
        const product = products.find(p => p.id === cartItem.id);
        if (product) {
          const newStock = Math.max(0, (product.stock || 0) - cartItem.quantity);
          setDoc(doc(db,"products", product.id), { stock: newStock }, { merge: true }).catch(console.error);
        }
      });

      // 5. Update the sales figures (non-blocking)
      const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const salesDocRef = doc(db,"sales", dateStr);
      setDoc(salesDocRef, {
        sales: increment(details.total || 0),
        revenue: increment(details.total || 0),
        orders: increment(1),
        name: dateStr, date: dateStr, timestamp: now
      }, { merge: true }).catch(console.error);

      return { success: true, orderId };
    } catch (e) {
      console.error("Error placing order:", e);
      return { success: false, msg: 'Database error' };
    } finally {
      isPlacingOrder.current = false; // Release the lock
      setPendingOrderId(null);
    }
  };
  const updateOrderStatus = async (id, status, partnerEmail = null) => {
    const orderToUpdate = orders.find(o => o.id === id);
    if (!orderToUpdate) {
      console.error("Order not found for status update:", id);
      return;
    }

    let updatedFields = { status };
    if (partnerEmail) {
      updatedFields.deliveryPartnerEmail = partnerEmail;
      const partner = deliveryPartners.find(d => d.email === partnerEmail);
      if (partner) {
        updatedFields.deliveryPartner = { name: partner.name, phone: partner.phone };
      }
    }

    try {
      const db = getFirestore(auth.app);
      await updateDoc(doc(db,"orders", id), updatedFields);

      // If order is cancelled, and it was not cancelled before, decrement sales
      if (status === 'Cancelled' && orderToUpdate.status !== 'Cancelled') {
        let orderDate = new Date(orderToUpdate.createdAt || orderToUpdate.date);
        if (isNaN(orderDate) && orderToUpdate.date) {
            const datePart = String(orderToUpdate.date).split(',')[0].trim();
            const parts = datePart.split(/[\/\-]/);
            if (parts.length === 3) {
                orderDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}T00:00:00`);
            }
        }

        if (!isNaN(orderDate)) {
            const dateStr = orderDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            const salesDocRef = doc(db,"sales", dateStr);
            const saleUpdate = {
                sales: increment(-orderToUpdate.total),
                revenue: increment(-orderToUpdate.total),
                orders: increment(-1)
            };
            await setDoc(salesDocRef, saleUpdate, { merge: true });
        }
      }
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
      currentUser, setCurrentUser, updateUser, deleteUser, logout, deliveryPartners, approveDelivery,
      userLocation, setUserLocation, searchQuery, setSearchQuery,
      products, toggleProductStatus, addNewProduct, deleteProduct, editProduct,
      orders, pendingOrderId, placeOrder, updateOrderStatus, salesHistory, showToast,
      cart, addToCart, removeFromCart, getCartTotal, decreaseCartQuantity, wishlist, toggleWishlist,
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
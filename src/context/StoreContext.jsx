import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import initialProducts from '../data/products.json';
import initialOrders from '../data/orders.json';
import initialUsers from '../data/users.json';

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
  const [usersDB, setUsersDB] = useState(() => safeJSONParse('usersDB', initialUsers));
  const [deliveryPartners, setDeliveryPartners] = useState(() => safeJSONParse('deliveryPartners', []));
  const [userLocation, setUserLocation] = useState(() => localStorage.getItem('userLocation') || 'Ahmedabad, Gujarat');
  const [searchQuery, setSearchQuery] = useState('');

  const [products, setProducts] = useState(() => safeJSONParse('products', initialProducts)); 
  const [orders, setOrders] = useState(() => safeJSONParse('orders', initialOrders));
  const [cart, setCart] = useState(() => safeJSONParse('cart', []));
  const [wishlist, setWishlist] = useState(() => safeJSONParse('wishlist', []));
  const [salesHistory, setSalesHistory] = useState(() => safeJSONParse('salesHistory', []));
  const [toasts, setToasts] = useState([]);
  const [pendingOrderId, setPendingOrderId] = useState(null);

  // Fetch Delivery Partners from Webhook on App Load
  useEffect(() => {
    if (currentUser?.role !== 'admin') return;
    
    const fetchMongoPartners = async () => {
      try {
        const res = await fetch(import.meta.env.VITE_WEBHOOK_GET_PARTNERS_URL);
        if (res.ok) {
          const rawData = await res.json();
          let mdbPartners = Array.isArray(rawData) ? rawData : (rawData && Object.keys(rawData).length > 0 ? [rawData] : []);
          
          mdbPartners = mdbPartners.map(p => {
            let normalizedStatus = "Pending";
            if (p.status) {
              const s = String(p.status).toLowerCase().trim();
              if (s === 'pending') normalizedStatus = 'Pending';
              else if (s === 'approve' || s === 'approved') normalizedStatus = 'Approved';
              else if (s === 'reject' || s === 'rejected') normalizedStatus = 'Rejected';
              else normalizedStatus = p.status;
            }

            return {
              ...p,
              name: p.name || 'Unknown Partner',
              status: normalizedStatus,
              role: p.role || 'delivery',
              deliveryMode: p.deliveryMode || p.type || 'online' 
            };
          });
          
          setDeliveryPartners(mdbPartners);
        }
      } catch (err) { }
    };
    
    fetchMongoPartners();
  }, [currentUser]);

  // Compute Sales History dynamically if empty
  useEffect(() => {
    if (salesHistory.length === 0) {
      const newHistoryMap = new Map();
      for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        d.setHours(0, 0, 0, 0);
        const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        newHistoryMap.set(dateStr, { name: dateStr, date: dateStr, sales: 0, revenue: 0, orders: 0 });
      }

      orders.forEach(order => {
        if (order.status !== 'Cancelled') {
          let orderDate = new Date(order.createdAt || order.date);
          if (isNaN(orderDate.getTime()) && order.date) {
            const datePart = String(order.date).split(',')[0].trim();
            const parts = datePart.split(/[\/\-]/);
            if (parts.length === 3) {
              orderDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}T00:00:00`);
            }
          }
          if (!isNaN(orderDate.getTime())) {
            const dateStr = orderDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            if (newHistoryMap.has(dateStr)) {
              const entry = newHistoryMap.get(dateStr);
              entry.sales += Number(order.total || 0);
              entry.revenue += Number(order.total || 0);
              entry.orders += 1;
              newHistoryMap.set(dateStr, entry);
            }
          }
        }
      });
      setSalesHistory(Array.from(newHistoryMap.values()));
    }
  }, [orders]);

  // Persist state changes to Local Storage
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
      localStorage.setItem('products', JSON.stringify(products));
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
  }, [currentUser, usersDB, deliveryPartners, products, orders, cart, wishlist, salesHistory, userLocation]);

  const showToast = (message) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message }]);
    setTimeout(() => removeToast(id), 4000);
  };
  const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  // User Actions
  const updateUser = (updatedUser) => {
    setCurrentUser(updatedUser);
    setUsersDB(prev => {
      const exists = prev.some(u => u.email === updatedUser.email);
      if (exists) {
        return prev.map(u => u.email === updatedUser.email ? updatedUser : u);
      }
      return [...prev, updatedUser];
    });
  };
  const deleteUser = (email) => {
    setUsersDB(prev => prev.filter(u => u.email !== email));
    logout();
  };
  
  const logout = () => {
    setCurrentUser(null);
    setCart([]);
    setWishlist([]);
  };

  // Admin Methods
  const approveDelivery = async (email) => {
    setDeliveryPartners(prev => prev.map(d => d.email === email ? { ...d, status: 'Approved' } : d));
  };

  const deleteDeliveryPartner = (email) => {
    setDeliveryPartners(prev => prev.filter(d => d.email !== email));
  };

  const toggleProductStatus = async (id) => {
    let isDisabled;
    setProducts(prev => {
      const updated = prev.map(p => {
        if (p.id === id) {
          isDisabled = !p.disabled;
          return { ...p, disabled: isDisabled };
        }
        return p;
      });
      return updated;
    });

    if (typeof isDisabled === 'undefined') return;

    try {
      fetch(import.meta.env.VITE_WEBHOOK_PRODUCT_SYNC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update',
          product: { id: id, disabled: isDisabled }
        }),
      }).catch(e => console.error("Webhook failed for product status toggle:", e));
    } catch(e) { console.error("Error toggling product status:", e); }
  };

  const deleteProduct = async (id) => {
    if(window.confirm("Delete this item?")) {
      setProducts(prev => prev.filter(p => p.id !== id));
      setCart(prev => prev.filter(item => !item.id.startsWith(id))); 
      try {
        fetch(import.meta.env.VITE_WEBHOOK_PRODUCT_SYNC_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'delete',
            product: { id: id }
          }),
        }).catch(e => console.error("Webhook failed for delete product:", e));
      } catch(e) { console.error("Error deleting product:", e); }
    }
  };

  const addNewProduct = async (product) => {
    setProducts(prev => [product, ...prev]);
    try {
      fetch(import.meta.env.VITE_WEBHOOK_PRODUCT_SYNC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          product: product
        }),
      }).catch(e => console.error("Webhook failed for add product:", e));
    } catch(e) { console.error("Error adding new product:", e); }
  };

  const editProduct = async (id, updatedData) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updatedData } : p));
    try {
      const keys = Object.keys(updatedData);
      const isStockUpdate = keys.includes('stock') && (keys.length === 1 || (keys.length === 2 && keys.includes('disabled')));

      if (isStockUpdate) {
        fetch(import.meta.env.VITE_WEBHOOK_PRODUCT_SYNC_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'stock_change',
            product: { id: id, stock: Math.round(updatedData.stock * 100) / 100 }
          }),
        }).catch(error => console.error("Webhook failed for admin stock refill:", error));
      } else {
        fetch(import.meta.env.VITE_WEBHOOK_PRODUCT_SYNC_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'update',
            product: { ...updatedData, id: id }
          }),
        }).catch(error => console.error("Webhook failed for general edit:", error));
      }
    } catch(e) { console.error("Error editing product:", e); }
  };

  const isPlacingOrder = useRef(false);

  const placeOrder = async (details) => {
    if (isPlacingOrder.current) return { success: false, msg: 'An order is already being processed.' };
    if (!details || !details.items || details.items.length === 0) return { success: false, msg: 'Cart is empty' };

    isPlacingOrder.current = true;
    const orderId = 'ORD' + Date.now();
    setPendingOrderId(orderId);

    try {
      const now = new Date();
      const newOrder = { 
        ...details, 
        id: orderId, 
        createdAt: now.toISOString(), 
        date: now.toLocaleString(), 
        status: 'Pending' 
      };
      
      setOrders(prev => [newOrder, ...prev]);

      try {
        await fetch(import.meta.env.VITE_WEBHOOK_PRODUCT_SYNC_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "order",
            ...newOrder
          })
        });
      } catch (error) {
        console.error("Error sending order to n8n webhook:", error);
      }

      setCart([]);

      // Update Stock locally
      setProducts(prev => prev.map(p => {
        const cartItem = details.items.find(i => i.id === p.id);
        if (cartItem) {
          return { ...p, stock: Math.round(Math.max(0, (p.stock || 0) - cartItem.quantity) * 100) / 100 };
        }
        return p;
      }));

      // Update sales figures locally
      const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      setSalesHistory(prev => {
        let exists = false;
        const mapped = prev.map(day => {
          if (day.date === dateStr) {
            exists = true;
            return {
              ...day,
              sales: day.sales + Number(details.total || 0),
              revenue: day.revenue + Number(details.total || 0),
              orders: day.orders + 1
            };
          }
          return day;
        });
        if (!exists) {
          mapped.push({
            name: dateStr,
            date: dateStr,
            sales: Number(details.total || 0),
            revenue: Number(details.total || 0),
            orders: 1
          });
        }
        return mapped;
      });

      return { success: true, orderId };
    } catch (e) {
      console.error("Error placing order:", e);
      return { success: false, msg: 'Database error' };
    } finally {
      isPlacingOrder.current = false;
      setPendingOrderId(null);
    }
  };

  const updateOrderStatus = async (id, status, partnerEmail = null) => {
    let updatedOrder = null;
    const updatedOrders = orders.map(o => {
      if (o.id === id) {
        let updatedFields = { ...o, status };
        if (partnerEmail) {
          updatedFields.deliveryPartnerEmail = partnerEmail;
          const partner = deliveryPartners.find(d => d.email === partnerEmail);
          if (partner) {
            updatedFields.deliveryPartner = { name: partner.name, phone: partner.phone };
          }
        }
        updatedOrder = updatedFields;
        return updatedFields;
      }
      return o;
    });

    if (!updatedOrder) {
      console.error("Order not found for status update:", id);
      return;
    }

    setOrders(updatedOrders);

    try {
      if (status === 'Out for Delivery') {
        fetch(import.meta.env.VITE_WEBHOOK_PRODUCT_SYNC_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'order',
            ...updatedOrder
          })
        })
        .then(async (res) => {
          const text = await res.text();
          if (!text) return;
          try {
            const data = JSON.parse(text);
            const otp = data?.deliveryOtp || data?.otp || data?.[0]?.deliveryOtp || data?.output?.deliveryOtp || data?.body?.deliveryOtp;
            if (otp) {
              setOrders(prev => prev.map(o => o.id === id ? { ...o, deliveryOtp: String(otp) } : o));
            }
          } catch(err) { console.error("Could not parse n8n response for OTP", err); }
        })
        .catch(e => console.error("Webhook failed for out_for_delivery:", e));
      }

      if (status === 'Delivered') {
        fetch(import.meta.env.VITE_WEBHOOK_PRODUCT_SYNC_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'order',
            ...updatedOrder
          })
        }).catch(e => console.error("Webhook failed for delivered:", e));
      }

      const orderToUpdate = orders.find(o => o.id === id);
      if (status === 'Cancelled' && orderToUpdate && orderToUpdate.status !== 'Cancelled') {
        let orderDate = new Date(orderToUpdate.createdAt || orderToUpdate.date);
        if (isNaN(orderDate.getTime()) && orderToUpdate.date) {
            const datePart = String(orderToUpdate.date).split(',')[0].trim();
            const parts = datePart.split(/[\/\-]/);
            if (parts.length === 3) {
                orderDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}T00:00:00`);
            }
        }

        if (!isNaN(orderDate.getTime())) {
            const dateStr = orderDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            setSalesHistory(prev => prev.map(day => {
              if (day.date === dateStr) {
                return {
                  ...day,
                  sales: day.sales - Number(orderToUpdate.total || 0),
                  revenue: day.revenue - Number(orderToUpdate.total || 0),
                  orders: day.orders - 1
                };
              }
              return day;
            }));
        }
      }
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  const addToCart = (name, packPrice, qtyToAdd = 1, image, variantId) => {
    const product = products.find(p => p.id === variantId);
    setCart(prev => {
      const existing = prev.find(item => item.id === variantId);
      const currentQty = existing ? existing.quantity : 0;
      const newQty = Math.round((currentQty + qtyToAdd) * 100) / 100;
      
      if (product && newQty > (product.stock || 0)) {
        showToast(`Only ${product.stock || 0} kg available in stock.`);
        return prev;
      }
      if (newQty > 20) { showToast("Max 20 packs allowed."); return prev; }
      
      const newTotal = Math.round(packPrice * newQty * 100) / 100;
      
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
        const newQty = Math.round((existing.quantity - qtyToSubtract) * 100) / 100;
        if (newQty > 0) {
          return prev.map(i => i.id === variantId ? {...i, quantity: newQty, total: Math.round(existing.price * newQty * 100) / 100} : i);
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
      currentUser, setCurrentUser, updateUser, deleteUser, logout, deliveryPartners, approveDelivery, deleteDeliveryPartner,
      userLocation, setUserLocation, searchQuery, setSearchQuery,
      products, toggleProductStatus, addNewProduct, deleteProduct, editProduct,
      orders, pendingOrderId, placeOrder, updateOrderStatus, salesHistory, showToast,
      cart, addToCart, removeFromCart, getCartTotal, decreaseCartQuantity, wishlist, toggleWishlist,
    }}>
      {children}
      <div className="fixed top-4 left-4 right-4 sm:left-auto sm:right-4 z-[9999] flex flex-col gap-2 pointer-events-none items-center sm:items-end">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div layout key={toast.id} initial={{ opacity: 0, y: -20, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20, scale: 0.9 }} className="pointer-events-auto bg-slate-900/95 backdrop-blur-sm text-white shadow-xl px-4 py-3 sm:p-4 rounded-xl flex items-center gap-3 w-full sm:w-auto sm:min-w-[280px] max-w-sm border border-slate-700">
              <p className="text-[13px] sm:text-[14px] font-bold flex-1 text-center sm:text-left leading-snug">{toast.message}</p>
              <button onClick={() => removeToast(toast.id)} className="text-slate-400 hover:text-white shrink-0 p-1 bg-slate-800 rounded-full w-6 h-6 flex items-center justify-center transition-colors"><span className="text-[10px] font-black">✕</span></button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </StoreContext.Provider>
  );
}
export const useStore = () => useContext(StoreContext);
import { createContext, useContext, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const defaultProducts = [
  { id: 'f1', category: 'Fruits', name: 'Apple', price: 160, image: '/fruits/apple.png', desc: 'Crisp, sweet, and sourced from high-altitude orchards.', disabled: false },
  { id: 'f2', category: 'Fruits', name: 'Banana', price: 60, image: '/fruits/banana.png', desc: 'Naturally sweet and rich in essential potassium.', disabled: false },
  { id: 'v1', category: 'Vegetables', name: 'Broccoli', price: 80, image: '/vegetables/broccoli.png', desc: 'Fresh, vibrant green broccoli rich in vitamins.', disabled: false },
  { id: 'p1', category: 'Pulses', name: 'Moong Dal', price: 110, image: '/pulses/moong.png', desc: 'Premium quality, unpolished yellow moong dal.', disabled: false }
  // Add the rest of your 42 products here...
];

const StoreContext = createContext();

export function StoreProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => JSON.parse(localStorage.getItem('currentUser')) || null);
  const [usersDB, setUsersDB] = useState(() => JSON.parse(localStorage.getItem('usersDB')) || []);
  const [deliveryPartners, setDeliveryPartners] = useState(() => JSON.parse(localStorage.getItem('deliveryPartners')) || []);
  
  // ZEPTO-STYLE LOCATION
  const [userLocation, setUserLocation] = useState(() => localStorage.getItem('userLocation') || 'Ahmedabad, Gujarat');

  const [products, setProducts] = useState(() => {
    const saved = JSON.parse(localStorage.getItem('products')) || defaultProducts;
    return saved.map(p => ({ ...p, stock: p.stock ?? 150, sold: p.sold ?? 0 }));
  });
  const [orders, setOrders] = useState(() => JSON.parse(localStorage.getItem('orders')) || []);
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem('cart')) || []);
  const [wishlist, setWishlist] = useState(() => JSON.parse(localStorage.getItem('wishlist')) || []);
  const [salesHistory, setSalesHistory] = useState(() => JSON.parse(localStorage.getItem('salesHistory')) || []);
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    localStorage.setItem('usersDB', JSON.stringify(usersDB));
    localStorage.setItem('deliveryPartners', JSON.stringify(deliveryPartners));
    localStorage.setItem('products', JSON.stringify(products));
    localStorage.setItem('orders', JSON.stringify(orders));
    localStorage.setItem('cart', JSON.stringify(cart));
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    localStorage.setItem('salesHistory', JSON.stringify(salesHistory));
    localStorage.setItem('userLocation', userLocation);
  }, [currentUser, usersDB, deliveryPartners, products, orders, cart, wishlist, salesHistory, userLocation]);

  const showToast = (message) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message }]);
    setTimeout(() => removeToast(id), 5000);
  };
  const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  const registerUser = (name, email, phone, address, password) => {
    if (usersDB.find(u => u.email === email)) return { success: false, msg: 'Email already exists!' };
    const newUser = { name, email, phone, address, password, role: 'user' };
    setUsersDB([...usersDB, newUser]);
    setCurrentUser(newUser);
    return { success: true };
  };

  const registerDelivery = (name, email, phone, address, password) => {
    if (deliveryPartners.find(d => d.email === email)) return { success: false, msg: 'Email already exists!' };
    const newPartner = { name, email, phone, address, password, role: 'delivery', status: 'Pending' };
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
    if (user) { setCurrentUser(user); return { success: true }; }
    return { success: false, msg: 'Invalid Email or Password' };
  };

  const logout = () => setCurrentUser(null);
  const approveDelivery = (email) => setDeliveryPartners(prev => prev.map(d => d.email === email ? { ...d, status: 'Approved' } : d));
  const toggleProductStatus = (id) => setProducts(prev => prev.map(p => p.id === id ? { ...p, disabled: !p.disabled } : p));
  const deleteProduct = (id) => {
    if(window.confirm("Delete this item?")) {
      setProducts(prev => prev.filter(p => p.id !== id));
      setCart(prev => prev.filter(item => item.id !== id));
      setWishlist(prev => prev.filter(item => item.id !== id));
    }
  };
  const addNewProduct = (product) => setProducts(prev => [{ ...product, id: `new_${Date.now()}`, disabled: false, stock: 150, sold: 0 }, ...prev]);
  const editProduct = (id, updatedData) => setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updatedData } : p));
  const restockProduct = (id, amount = 150) => setProducts(prev => prev.map(p => p.id === id ? { ...p, stock: amount, sold: 0, disabled: false } : p));
  
  const placeOrder = (details) => {
    setOrders([{ id: 'ORD' + Date.now(), date: new Date().toLocaleString(), status: 'Pending', ...details }, ...orders]);
    const newSales = details.items.map(item => ({
      id: 'SALE_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      productName: item.name, weight: item.quantity, date: new Date().toLocaleString(),
      customerName: details.customer.name, customerPhone: details.customer.phone
    }));
    setSalesHistory(prev => [...newSales, ...prev]);
    setProducts(prev => prev.map(p => {
      const item = details.items.find(i => i.id === p.id);
      if (item) {
        const newStock = Math.max(0, p.stock - item.quantity);
        return { ...p, stock: newStock, sold: p.sold + item.quantity, disabled: newStock <= 0 };
      }
      return p;
    }));
    setCart([]);
  };

  const updateOrderStatus = (id, status) => setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));

  const calculatePrice = (basePrice, quantity) => {
    let price;
    if (quantity < 0.5) price = basePrice * quantity * 1.20;
    else if (quantity < 1) price = basePrice * quantity * 1.15;
    else if (quantity < 5) price = basePrice * quantity;
    else if (quantity < 10) price = basePrice * quantity * 0.95;
    else price = basePrice * quantity * 0.90;
    return Math.round(price);
  };

  const addToCart = (name, price, quantity = 1, image, id) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === id);
      const currentQty = existing ? existing.quantity : 0;
      const newQty = Math.round((currentQty + quantity) * 100) / 100;
      const product = products.find(p => p.id === id);
      if (product && newQty > product.stock) { showToast(`Only ${product.stock}kg available.`); return prev; }
      if (newQty > 20) { showToast("Max 20kg per product."); return prev; }
      const newTotal = calculatePrice(price, newQty);
      if (existing) return prev.map(i => i.id === id ? {...i, quantity: newQty, total: newTotal} : i);
      return [...prev, {id, name, price, quantity: newQty, total: newTotal, image}];
    })
  };

  const decreaseCartQuantity = (id, amount = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === id);
      if (existing) {
        const newQty = Math.round((existing.quantity - amount) * 100) / 100;
        if (newQty > 0) {
          const newTotal = calculatePrice(existing.price, newQty);
          return prev.map(i => i.id === id ? {...i, quantity: newQty, total: newTotal} : i);
        }
        return prev.filter(i => i.id !== id);
      }
      return prev;
    })
  };

  const removeFromCart = (name) => setCart(cart.filter(i => i.name !== name));
  const getCartTotal = () => cart.reduce((s, i) => s + i.total, 0);
  const toggleWishlist = (product) => setWishlist(wishlist.find(i => i.name === product.name) ? wishlist.filter(i => i.name !== product.name) : [...wishlist, product]);

  return (
    <StoreContext.Provider value={{ 
      currentUser, registerUser, registerDelivery, loginUser, logout, deliveryPartners, approveDelivery,
      userLocation, setUserLocation,
      products, toggleProductStatus, addNewProduct, deleteProduct, editProduct, restockProduct,
      orders, placeOrder, updateOrderStatus, salesHistory, showToast,
      cart, addToCart, removeFromCart, getCartTotal, decreaseCartQuantity, wishlist, toggleWishlist, calculatePrice
    }}>
      {children}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div layout key={toast.id} initial={{ opacity: 0, x: 50, scale: 0.9 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: 20, scale: 0.9 }} className="pointer-events-auto bg-slate-900 text-white shadow-xl p-4 rounded-2xl flex items-center gap-4 min-w-[300px]">
              <p className="text-sm font-bold flex-1">{toast.message}</p>
              <button onClick={() => removeToast(toast.id)} className="text-slate-400 hover:text-white">✕</button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </StoreContext.Provider>
  );
}
export const useStore = () => useContext(StoreContext);
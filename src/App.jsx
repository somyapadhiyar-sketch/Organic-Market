import { Routes, Route, Navigate, useLocation } from"react-router-dom";
import { useStore } from"./context/StoreContext";
import Home from"./pages/Home";
import Fruits from"./pages/Fruits";
import Vegetables from"./pages/Vegetables";
import Pulses from"./pages/Pulses";
import Oils from"./pages/Oils";
import Cart from"./pages/Cart";
import ProductDetails from"./pages/ProductDetails";
import Payment from"./pages/Payment";
import About from"./pages/About";
import Orders from"./pages/Orders";
import Profile from"./pages/Profile";
import Auth from"./pages/Auth";
import Wishlist from"./pages/Wishlist";
import Admin from"./pages/Admin";
import AdminAddProduct from"./pages/AdminAddProduct";
import AdminEditProduct from"./pages/AdminEditProduct";
import Delivery from"./pages/Delivery";
import ChatWidget from"./components/ChatWidget";
import Login from"./pages/Login";
import Signup from"./pages/Signup";
import DeliverySignup from"./pages/DeliverySignup";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { currentUser } = useStore();
  if (!currentUser) return <Navigate to="/login/user" replace />;
  if (allowedRoles && !allowedRoles.includes(currentUser.role)) return <Navigate to="/home" replace />;
  return children;
};

function App() {
  const location = useLocation();
  const onAuthPage = location.pathname.startsWith('/login') || location.pathname.startsWith('/signup');

  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/home" />} />
        
        <Route path="/home" element={<Home />} />
        <Route path="/user/fruits" element={<Fruits />} />
        <Route path="/user/vegetables" element={<Vegetables />} />
        <Route path="/user/pulses" element={<Pulses />} />
        <Route path="/user/oil" element={<Oils />} />
        <Route path="/user/cart" element={<Cart />} />
        <Route path="/user/wishlist" element={<Wishlist />} />
        <Route path="/user/product/:name" element={<ProductDetails />} />
        <Route path="/user/payment" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
        <Route path="/user/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
        <Route path="/user/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/user/about" element={<About />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<Navigate to="/admin/sales" />} />
        <Route path="/admin/:section" element={<ProtectedRoute allowedRoles={['admin']}><Admin /></ProtectedRoute>} />
        <Route path="/admin/add-product" element={<ProtectedRoute allowedRoles={['admin']}><AdminAddProduct /></ProtectedRoute>} />
        <Route path="/admin/edit-product/:id" element={<ProtectedRoute allowedRoles={['admin']}><AdminEditProduct /></ProtectedRoute>} />
        
        {/* Delivery Routes */}
        <Route path="/delivery" element={<ProtectedRoute allowedRoles={['delivery']}><Delivery /></ProtectedRoute>} />

        {/* Auth Routes */}
        <Route path="/signup" element={<Signup />} />
        <Route path="/signup/delivery" element={<DeliverySignup />} />
        <Route path="/login" element={<Navigate to="/login/user" replace />} />
        <Route path="/login/:role" element={<Login />} />
      </Routes>
      {!onAuthPage && <ChatWidget />}
    </>
  );
}
export default App;
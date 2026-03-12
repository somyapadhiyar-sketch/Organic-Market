import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useStore } from "./context/StoreContext";
import Home from "./pages/Home";
import Fruits from "./pages/Fruits";
import Vegetables from "./pages/Vegetables";
import Pulses from "./pages/Pulses";
import Cart from "./pages/Cart";
import ProductDetails from "./pages/ProductDetails";
import Payment from "./pages/Payment";
import About from "./pages/About";
import Auth from "./pages/Auth";
import Wishlist from "./pages/Wishlist";
import Admin from "./pages/Admin";
import AdminAddProduct from "./pages/AdminAddProduct";
import AdminEditProduct from "./pages/AdminEditProduct";
import Delivery from "./pages/Delivery";
import ChatWidget from "./components/ChatWidget";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { currentUser } = useStore();
  if (!currentUser) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(currentUser.role)) return <Navigate to="/" />;
  return children;
};

function App() {
  const location = useLocation();
  const onAuthPage = location.pathname.startsWith('/login') || location.pathname.startsWith('/signup');

  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/user/home" />} />
        
        <Route path="/user/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/user/fruits" element={<ProtectedRoute><Fruits /></ProtectedRoute>} />
        <Route path="/user/vegetables" element={<ProtectedRoute><Vegetables /></ProtectedRoute>} />
        <Route path="/user/pulses" element={<ProtectedRoute><Pulses /></ProtectedRoute>} />
        <Route path="/user/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
        <Route path="/user/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
        <Route path="/user/product/:name" element={<ProtectedRoute><ProductDetails /></ProtectedRoute>} />
        <Route path="/user/payment" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
        <Route path="/user/about" element={<ProtectedRoute><About /></ProtectedRoute>} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<Navigate to="/admin/fruits" />} />
        <Route path="/admin/:section" element={<ProtectedRoute allowedRoles={['admin']}><Admin /></ProtectedRoute>} />
        <Route path="/admin/add-product" element={<ProtectedRoute allowedRoles={['admin']}><AdminAddProduct /></ProtectedRoute>} />
        <Route path="/admin/edit-product/:id" element={<ProtectedRoute allowedRoles={['admin']}><AdminEditProduct /></ProtectedRoute>} />
        
        {/* Delivery Routes */}
        <Route path="/delivery" element={<ProtectedRoute allowedRoles={['delivery']}><Delivery /></ProtectedRoute>} />

        {/* Auth Routes */}
        <Route path="/login" element={<Auth />} />
        <Route path="/login/:role" element={<Auth />} />
        <Route path="/signup/:role" element={<Auth />} />
      </Routes>
      {!onAuthPage && <ChatWidget />}
    </>
  );
}
export default App;




/*import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SignupPage1 from './SignupPage1';
import LoginPage1 from './LoginPage1';
import Dashboard from './Dashboard';

function App() {
  return (
    <Router>
      <Routes>
        {/* Redirects base URL to signup 
        <Route path="/" element={<Navigate to="/signup" />} />
        <Route path="/signup" element={<SignupPage1 />} />
        <Route path="/login" element={<LoginPage1 />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}
    
export default App;*/


// import { Routes, Route } from 'react-router-dom'
// import { useEffect } from 'react' 
// import { useCart } from './context/CartContext' 
// import Home from './pages/Home'
// import Fruits from './pages/Fruits'
// import Vegetables from './pages/Vegetables'
// import Pulses from './pages/Pulses'
// import Cart from './pages/Cart'
// import About from './pages/About'
// import Payment from './pages/Payment'
// import ProductDetails from './pages/ProductDetails'


// function App() {
//   const { cart } = useCart()

  
//   useEffect(() => {
//     if (cart.length > 0) {
//       document.title = `(${cart.length}) Cart | Organic Market`
//     } else {
//       document.title = "Organic Market - Fresh & Healthy"
//     }
//   }, [cart]) 

//   return (
//     <Routes>
//       <Route path="/" element={<Home />} />
//       <Route path="/fruits" element={<Fruits />} />
//       <Route path="/vegetables" element={<Vegetables />} />
//       <Route path="/pulses" element={<Pulses />} />
//       <Route path="/cart" element={<Cart />} />
//       <Route path="/about" element={<About />} />
//       <Route path="/payment" element={<Payment />} />
//       <Route path="/product/:name" element={<ProductDetails />} />
//     </Routes>
//   )
// }

// export default App




// import React from 'react'
// import ReactDOM from 'react-dom/client'
// import App from './App.jsx'
// import './index.css'
// import { BrowserRouter } from 'react-router-dom'
// import { CartProvider } from './context/CartContext'

// ReactDOM.createRoot(document.getElementById('root')).render(
//   <React.StrictMode>
//     <BrowserRouter>
//       <CartProvider>
//         <App />
//       </CartProvider> 
//     </BrowserRouter>
//   </React.StrictMode>,
// )
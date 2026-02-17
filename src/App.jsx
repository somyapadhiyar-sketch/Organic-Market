import { Routes, Route } from 'react-router-dom'
import { useEffect } from 'react' // Import useEffect
import { useCart } from './context/CartContext' // Import Cart Context
import Home from './pages/Home'
import Fruits from './pages/Fruits'
import Vegetables from './pages/Vegetables'
import Pulses from './pages/Pulses'
import Cart from './pages/Cart'
import About from './pages/About'
import Payment from './pages/Payment'
import ProductDetails from './pages/ProductDetails'

function App() {
  const { cart } = useCart()

  // 1. USE EFFECT: Updates the browser tab title whenever 'cart' changes
  useEffect(() => {
    if (cart.length > 0) {
      document.title = `(${cart.length}) Cart | Organic Market`
    } else {
      document.title = "Organic Market - Fresh & Healthy"
    }
  }, [cart]) // Dependency array: runs only when 'cart' updates

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/fruits" element={<Fruits />} />
      <Route path="/vegetables" element={<Vegetables />} />
      <Route path="/pulses" element={<Pulses />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/about" element={<About />} />
      <Route path="/payment" element={<Payment />} />
      <Route path="/product/:name" element={<ProductDetails />} />
    </Routes>
  )
}

export default App
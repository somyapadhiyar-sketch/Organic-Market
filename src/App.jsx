import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Fruits from './pages/Fruits'
import Vegetables from './pages/Vegetables'
import Pulses from './pages/Pulses'
import Cart from './pages/Cart'
import About from './pages/About'
import Payment from './pages/Payment'
import Apple from './pages/Apple'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/fruits" element={<Fruits />} />
      <Route path="/vegetables" element={<Vegetables />} />
      <Route path="/pulses" element={<Pulses />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/about" element={<About />} />
      <Route path="/payment" element={<Payment />} />
      <Route path="/apple" element={<Apple />} />
    </Routes>
  )
}

export default App

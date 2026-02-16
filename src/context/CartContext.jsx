import { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext()

export function CartProvider({ children }) {
  const [cart, setCart] = useState([])

  useEffect(() => {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      setCart(JSON.parse(savedCart))
    }
  }, [])

  const saveCartToLocalStorage = (newCart) => {
    localStorage.setItem('cart', JSON.stringify(newCart))
  }

  const addToCart = (name, pricePerKg, weight) => {
    const total = pricePerKg * weight
    const existingItem = cart.find(item => item.name === name && item.weight === weight)

    if (existingItem) {
      const updatedCart = cart.map(item =>
        item.name === name && item.weight === weight
          ? { ...item, quantity: item.quantity + 1, total: item.total + total }
          : item
      )
      setCart(updatedCart)
      saveCartToLocalStorage(updatedCart)
    } else {
      const newCart = [...cart, { name, weight, pricePerKg, total, quantity: 1 }]
      setCart(newCart)
      saveCartToLocalStorage(newCart)
    }
  }

  const removeFromCart = (name, weight) => {
    const updatedCart = cart.filter(item => !(item.name === name && item.weight === weight))
    setCart(updatedCart)
    saveCartToLocalStorage(updatedCart)
  }

  const clearCart = () => {
    setCart([])
    saveCartToLocalStorage([])
  }

  const getCartTotal = () => {
    return cart.reduce((sum, item) => sum + item.total, 0)
  }

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, getCartTotal }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

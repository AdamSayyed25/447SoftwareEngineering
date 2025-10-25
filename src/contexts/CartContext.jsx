import React, { createContext, useContext, useEffect, useState } from 'react'

const CartContext = createContext()
export function useCart() { return useContext(CartContext) }

export default function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cart')) || [] }
    catch { return [] }
  })

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items))
  }, [items])

  function add(item) {
    setItems(prev => {
      const found = prev.find(p => p.id === item.id)
      if (found) return prev.map(p => p.id === item.id ? { ...p, qty: p.qty + 1 } : p)
      return [...prev, { ...item, qty: 1 }]
    })
  }

  function remove(id) { setItems(prev => prev.filter(p => p.id !== id)) }
  function updateQty(id, qty) { setItems(prev => prev.map(p => p.id === id ? { ...p, qty } : p)) }
  function clear() { setItems([]) }

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0)

  return (
    <CartContext.Provider value={{ items, add, remove, updateQty, clear, subtotal }}>
      {children}
    </CartContext.Provider>
  )
}

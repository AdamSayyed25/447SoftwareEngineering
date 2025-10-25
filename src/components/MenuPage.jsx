import React from 'react'
import { useParams } from 'react-router-dom'
import { MENUS, LOCATIONS } from '../data/mockData'
import { useCart } from '../contexts/CartContext'

export default function MenuPage() {
  const { locationId } = useParams()
  const menu = MENUS[locationId] || []
  const loc = LOCATIONS.find(l => l.id === locationId)
  const { add } = useCart()

  return (
    <div className="page menu-page">
      <h2>{loc?.name || 'Menu'}</h2>
      <div className="menu-grid">
        {menu.map(item => (
          <div className="menu-card" key={item.id}>
            <h4>{item.name}</h4>
            <p className="desc">{item.desc}</p>
            <div className="menu-bottom">
              <strong>${item.price.toFixed(2)}</strong>
              <button onClick={() => add(item)}>Add to Cart</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

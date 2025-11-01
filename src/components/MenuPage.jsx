import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { menuAPI, locationsAPI } from '../services/api'
import { useCart } from '../contexts/CartContext'
import { vibrate, HAPTIC_PATTERNS } from '../utils/haptic'

export default function MenuPage() {
  const { locationId } = useParams()
  const [menu, setMenu] = useState([])
  const [location, setLocation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [addedItem, setAddedItem] = useState(null)
  const { add } = useCart()

  function handleAdd(item) {
    add(item)
    vibrate(HAPTIC_PATTERNS.LIGHT)
    setAddedItem(item.id)
    setTimeout(() => setAddedItem(null), 1500)
  }

  useEffect(() => {
    loadMenu()
    loadLocation()
  }, [locationId])

  async function loadMenu() {
    try {
      const data = await menuAPI.getByLocation(locationId)
      setMenu(data)
    } catch (err) {
      console.error('Failed to load menu:', err)
      setError('Failed to load menu')
    } finally {
      setLoading(false)
    }
  }

  async function loadLocation() {
    try {
      const data = await locationsAPI.getById(locationId)
      setLocation(data)
    } catch (err) {
      console.error('Failed to load location:', err)
    }
  }

  if (loading) return <div className="page">Loading menu...</div>
  if (error) return <div className="page"><p className="error">{error}</p></div>

  return (
    <div className="page menu-page">
      <h2>{location?.name || 'Menu'}</h2>
      {menu.length === 0 ? (
        <p>No menu items available for this location.</p>
      ) : (
        <div className="menu-grid">
          {menu.map(item => (
            <div className="menu-card" key={item.id}>
              <h4>{item.name}</h4>
              <p className="desc">{item.description}</p>
              <div className="menu-bottom">
                <strong>${item.price.toFixed(2)}</strong>
                <button 
                  onClick={() => handleAdd(item)}
                  className={addedItem === item.id ? 'adding' : ''}
                >
                  {addedItem === item.id ? '✓ Added!' : 'Add to Cart'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

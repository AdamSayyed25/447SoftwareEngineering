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

  if (!location) return <div className="page">Location not found</div>

  return (
    <div className="page menu-page">
      {location.image_url && (
        <div className="location-banner" style={{ backgroundImage: `url(${location.image_url})` }}>
          <div className="banner-overlay"></div>
        </div>
      )}

      <div className="location-header">
        <div className="header-content">
          <h2>{location.name}</h2>
          <div className="location-meta">
            <span className="category">{location.category}</span>
            <span className="dot">•</span>
            <span>{location.hours}</span>
            <span className="dot">•</span>
            <span>{location.address}</span>
          </div>

          {!location.is_active && (
            <div className="status-banner closed">
              Temporarily Closed
            </div>
          )}

          {location.description && <p className="description">{location.description}</p>}

          {location.tags && location.tags.length > 0 && (
            <div className="tags-list">
              {location.tags.map(t => <span key={t} className="tag">{t}</span>)}
            </div>
          )}
        </div>
      </div>

      {menu.length === 0 ? (
        <div className="empty-menu">
          <p>No menu items available for this location.</p>
          {!location.is_active && <p>Check back later when we reopen!</p>}
        </div>
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
                  disabled={!location.is_active}
                >
                  {!location.is_active ? 'Closed' : (addedItem === item.id ? '✓ Added!' : 'Add to Cart')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

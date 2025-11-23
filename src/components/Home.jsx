import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { locationsAPI } from '../services/api'

export default function Home() {
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadLocations()
  }, [])

  async function loadLocations() {
    try {
      const data = await locationsAPI.getAll()
      setLocations(data)
    } catch (err) {
      console.error('Failed to load locations:', err)
      setError('Failed to load dining locations')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="page">Loading locations...</div>
  if (error) return <div className="page"><p className="error">{error}</p></div>

  return (
    <div className="page home">
      <section className="hero">
        <h2>Campus Dining</h2>
        <p>Browse UMBC dining locations and simulated menus.</p>
      </section>

      <section>
        <h3>Dining Locations</h3>
        <div className="locations">
          {locations.map(loc => (
            <div key={loc.id} className={`loc-card ${!loc.is_active ? 'inactive' : ''}`}>
              {loc.image_url && (
                <div className="loc-image" style={{ backgroundImage: `url(${loc.image_url})` }}>
                  {!loc.is_active && <div className="closed-overlay">Closed</div>}
                </div>
              )}
              <div className="loc-content">
                <div className="loc-header">
                  <h4>{loc.name}</h4>
                  <span className="category-badge">{loc.category}</span>
                </div>
                <small>{loc.address} • {loc.hours}</small>
                {loc.description && <p className="loc-desc">{loc.description}</p>}

                {loc.tags && loc.tags.length > 0 && (
                  <div className="loc-tags">
                    {loc.tags.slice(0, 3).map(t => <span key={t}>{t}</span>)}
                  </div>
                )}

                <div className="loc-actions">
                  <Link to={`/menu/${loc.id}`} className="btn-view">
                    {loc.is_active ? 'View Menu' : 'View Details'}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

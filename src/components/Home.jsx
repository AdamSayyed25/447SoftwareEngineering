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
            <div key={loc.id} className="loc-card">
              <h4>{loc.name}</h4>
              <small>{loc.address} • {loc.hours}</small>
              <div className="loc-actions">
                <Link to={`/menu/${loc.id}`}>View Menu</Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

import React from 'react'
import { Link } from 'react-router-dom'
import { LOCATIONS } from '../data/mockData'

export default function Home() {
  return (
    <div className="page home">
      <section className="hero">
        <h2>Campus Dining</h2>
        <p>Browse UMBC dining locations and simulated menus.</p>
      </section>

      <section>
        <h3>Dining Locations</h3>
        <div className="locations">
          {LOCATIONS.map(loc => (
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

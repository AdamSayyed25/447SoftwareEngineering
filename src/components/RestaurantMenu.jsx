import React, { useEffect, useState } from 'react'
import { restaurantAPI } from '../services/api'

export default function RestaurantMenu() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    id: '',
    name: '',
    description: '',
    price: '',
    category: 'main',
    image_url: '',
    is_available: true
  })
  const [saving, setSaving] = useState(false)

  async function load() {
    try {
      const data = await restaurantAPI.getMenu()
      setItems(data)
    } catch (e) {
      setError('Failed to load menu')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const onChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm({ ...form, [e.target.name]: value })
  }

  async function addItem(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        id: form.id.trim(),
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        category: form.category,
        image_url: form.image_url,
        is_available: form.is_available
      }
      await restaurantAPI.addMenuItem(payload)
      setForm({
        id: '',
        name: '',
        description: '',
        price: '',
        category: 'main',
        image_url: '',
        is_available: true
      })
      await load()
    } catch (e) {
      alert('Failed to add item')
    } finally {
      setSaving(false)
    }
  }

  async function updateItem(itemId, update) {
    try {
      await restaurantAPI.updateMenuItem(itemId, update)
      await load()
    } catch (e) {
      alert('Failed to update item')
    }
  }

  async function deleteItem(itemId) {
    if (!confirm('Delete this item?')) return
    try {
      await restaurantAPI.deleteMenuItem(itemId)
      await load()
    } catch (e) {
      alert('Failed to delete item')
    }
  }

  if (loading) return <div>Loading menu...</div>

  return (
    <div className="menu-management">
      <div className="dashboard-header">
        <h3>Menu Management</h3>
        <button className="btn-secondary" onClick={load}>Refresh</button>
      </div>

      {error && <div className="error">{error}</div>}

      <form onSubmit={addItem} className="checkout-form" style={{ marginBottom: 30, background: '#f8f9fa', padding: 20, borderRadius: 8 }}>
        <h4>Add New Item</h4>
        <div className="form-row" style={{ display: 'flex', gap: 15 }}>
          <label style={{ flex: 1 }}>
            ID
            <input name="id" value={form.id} onChange={onChange} required placeholder="e.g. burger-01" />
          </label>
          <label style={{ flex: 2 }}>
            Name
            <input name="name" value={form.name} onChange={onChange} required placeholder="e.g. Classic Burger" />
          </label>
        </div>

        <label>
          Description
          <input name="description" value={form.description} onChange={onChange} placeholder="Ingredients, allergens..." />
        </label>

        <div className="form-row" style={{ display: 'flex', gap: 15 }}>
          <label style={{ flex: 1 }}>
            Price ($)
            <input name="price" type="number" step="0.01" value={form.price} onChange={onChange} required />
          </label>
          <label style={{ flex: 1 }}>
            Category
            <select name="category" value={form.category} onChange={onChange}>
              <option value="main">Main</option>
              <option value="appetizer">Appetizer</option>
              <option value="dessert">Dessert</option>
              <option value="drink">Drink</option>
            </select>
          </label>
        </div>

        <label>
          Image URL
          <input name="image_url" value={form.image_url} onChange={onChange} placeholder="https://..." />
        </label>

        <label className="checkbox-label">
          <input
            type="checkbox"
            name="is_available"
            checked={form.is_available}
            onChange={onChange}
          />
          Available for order
        </label>

        <button type="submit" className="btn-primary" disabled={saving} style={{ marginTop: 10 }}>
          {saving ? 'Saving...' : 'Add Item'}
        </button>
      </form>

      <section>
        <h3>Existing Items ({items.length})</h3>
        <div className="orders-list">
          {items.map(it => (
            <div key={it.id} className={`order-card ${!it.is_available ? 'unavailable' : ''}`} style={{ opacity: it.is_available ? 1 : 0.7 }}>
              <div className="order-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {it.image_url && <img src={it.image_url} alt={it.name} style={{ width: 40, height: 40, borderRadius: 4, objectFit: 'cover' }} />}
                  <div>
                    <h4>{it.name}</h4>
                    <span className="muted" style={{ fontSize: '0.8em' }}>{it.category} • ${Number(it.price).toFixed(2)}</span>
                  </div>
                </div>
                <span className={`status-badge ${it.is_available ? 'status-delivered' : 'status-cancelled'}`}>
                  {it.is_available ? 'Available' : 'Unavailable'}
                </span>
              </div>

              <div className="order-info">
                <p className="muted">{it.description}</p>
                <div className="action-buttons" style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <button
                    className="btn-secondary small"
                    onClick={() => updateItem(it.id, { is_available: !it.is_available })}
                  >
                    {it.is_available ? 'Mark Unavailable' : 'Mark Available'}
                  </button>
                  <button
                    className="btn-secondary small"
                    onClick={() => {
                      const newPrice = prompt('New price', it.price);
                      if (newPrice) updateItem(it.id, { price: Number(newPrice) });
                    }}
                  >
                    Edit Price
                  </button>
                  <button className="accept-btn small" onClick={() => deleteItem(it.id)}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

import React, { useEffect, useState } from 'react'
import { restaurantAPI } from '../services/api'

export default function RestaurantMenu() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ id: '', name: '', description: '', price: '' })
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

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  async function addItem(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        id: form.id.trim(),
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price)
      }
      await restaurantAPI.addMenuItem(payload)
      setForm({ id: '', name: '', description: '', price: '' })
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

  if (loading) return <div className="page">Loading...</div>

  return (
    <div className="page">
      <div className="dashboard-header">
        <h2>Menu Management</h2>
        <button className="btn-secondary" onClick={load}>Refresh</button>
      </div>

      {error && <div className="error">{error}</div>}

      <form onSubmit={addItem} className="checkout-form" style={{ marginBottom: 20 }}>
        <h3>Add New Item</h3>
        <label>
          ID
          <input name="id" value={form.id} onChange={onChange} required />
        </label>
        <label>
          Name
          <input name="name" value={form.name} onChange={onChange} required />
        </label>
        <label>
          Description
          <input name="description" value={form.description} onChange={onChange} />
        </label>
        <label>
          Price
          <input name="price" type="number" step="0.01" value={form.price} onChange={onChange} required />
        </label>
        <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Add Item'}</button>
      </form>

      <section>
        <h3>Existing Items</h3>
        <div className="orders-list">
          {items.map(it => (
            <div key={it.id} className="order-card">
              <div className="order-header">
                <h4>{it.name} (${Number(it.price).toFixed(2)})</h4>
                <span className="status-badge">{it.id}</span>
              </div>
              <div className="order-info">
                <p className="muted">{it.description}</p>
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <button className="btn-secondary" onClick={() => updateItem(it.id, { name: prompt('New name', it.name) || it.name })}>Rename</button>
                  <button className="btn-secondary" onClick={() => updateItem(it.id, { price: Number(prompt('New price', it.price) || it.price) })}>Change Price</button>
                  <button className="accept-btn" onClick={() => deleteItem(it.id)}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

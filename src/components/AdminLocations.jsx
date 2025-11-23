import React, { useEffect, useState } from 'react';
import { adminAPI } from '../services/api';

export default function AdminLocations() {
  const [locations, setLocations] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingLoc, setEditingLoc] = useState(null);
  const [isNew, setIsNew] = useState(false);
  const [message, setMessage] = useState('');

  async function load() {
    try {
      const [locsData, usersData] = await Promise.all([
        adminAPI.getLocations(),
        adminAPI.getUsers()
      ]);
      setLocations(locsData);
      setUsers(usersData);
    } catch (e) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    try {
      const locData = {
        ...editingLoc,
        tags: typeof editingLoc.tags === 'string'
          ? editingLoc.tags.split(',').map(t => t.trim()).filter(Boolean)
          : editingLoc.tags
      };

      if (isNew) {
        const newLoc = await adminAPI.createLocation(locData);
        setLocations([...locations, { ...newLoc, menu_items_count: 0 }]);
        setMessage('Location created successfully');
      } else {
        const updatedLoc = await adminAPI.updateLocation(editingLoc.id, locData);
        setLocations(locations.map(l => l.id === updatedLoc.id ? { ...updatedLoc, menu_items_count: l.menu_items_count } : l));
        setMessage('Location updated successfully');
      }

      // Refresh to get updated user assignments
      load();

      setEditingLoc(null);
      setIsNew(false);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to save location');
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Are you sure? This will delete the location and ALL its menu items.')) return;

    try {
      await adminAPI.deleteLocation(id);
      setLocations(locations.filter(l => l.id !== id));
      setMessage('Location deleted successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError('Failed to delete location');
    }
  }

  function startEdit(loc) {
    // Find staff assigned to this location
    const assignedStaff = users.find(u => u.restaurant_location_id === loc.id && u.role === 'restaurant_staff');

    setEditingLoc({
      ...loc,
      tags: loc.tags ? loc.tags.join(', ') : '',
      assigned_staff_id: assignedStaff ? assignedStaff.id : ''
    });
    setIsNew(false);
  }

  function startNew() {
    setEditingLoc({
      id: '', name: '', address: '', hours: '',
      image_url: '', description: '', category: 'Dining',
      is_active: true, contact_email: '', tags: '',
      assigned_staff_id: ''
    });
    setIsNew(true);
  }

  // Filter users for staff dropdown
  const staffUsers = users.filter(u => u.role === 'restaurant_staff');

  if (loading) return <div className="page">Loading...</div>;

  return (
    <div className="page">
      <div className="dashboard-header">
        <h2>Locations Management</h2>
        <button className="btn-primary" onClick={startNew}>+ Add Location</button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {message && <div className="success-message">{message}</div>}

      <div className="orders-list">
        {locations.map(l => {
          const assignedStaff = users.find(u => u.restaurant_location_id === l.id && u.role === 'restaurant_staff');
          return (
            <div key={l.id} className="order-card">
              <div className="order-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {l.image_url && <img src={l.image_url} alt={l.name} style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} />}
                  <div>
                    <h4>{l.name}</h4>
                    {!l.is_active && <span className="status-badge inactive">Inactive</span>}
                  </div>
                </div>
                <div className="card-actions">
                  <button className="btn-small btn-secondary" onClick={() => startEdit(l)}>Edit</button>
                  <button className="btn-small btn-danger" onClick={() => handleDelete(l.id)}>Delete</button>
                </div>
              </div>
              <div className="order-info">
                <p><strong>ID:</strong> {l.id}</p>
                <p><strong>Category:</strong> {l.category}</p>
                <p><strong>Address:</strong> {l.address}</p>
                <p><strong>Hours:</strong> {l.hours}</p>
                {assignedStaff && <p><strong>Manager:</strong> {assignedStaff.username}</p>}
                {l.description && <p className="muted">{l.description}</p>}
                {l.tags && l.tags.length > 0 && (
                  <div className="tags-list">
                    {l.tags.map(t => <span key={t} className="tag">{t}</span>)}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {editingLoc && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '600px' }}>
            <h3>{isNew ? 'Add New Location' : 'Edit Location'}</h3>
            <form onSubmit={handleSave}>
              <div className="form-row">
                <div className="form-group">
                  <label>ID (Unique)</label>
                  <input
                    type="text"
                    value={editingLoc.id}
                    onChange={e => setEditingLoc({ ...editingLoc, id: e.target.value })}
                    disabled={!isNew}
                    required
                    placeholder="e.g., starbucks"
                  />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <input
                    type="text"
                    value={editingLoc.category}
                    onChange={e => setEditingLoc({ ...editingLoc, category: e.target.value })}
                    placeholder="e.g., Cafe"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={editingLoc.name}
                  onChange={e => setEditingLoc({ ...editingLoc, name: e.target.value })}
                  required
                  placeholder="e.g., Starbucks"
                />
              </div>

              <div className="form-group">
                <label>Assign Staff Manager</label>
                <select
                  value={editingLoc.assigned_staff_id}
                  onChange={e => setEditingLoc({ ...editingLoc, assigned_staff_id: e.target.value })}
                >
                  <option value="">-- Select Staff --</option>
                  {staffUsers.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.username} {u.restaurant_location_id ? `(Currently: ${u.restaurant_location_id})` : '(Unassigned)'}
                    </option>
                  ))}
                </select>
                <small className="muted">Assigning will link this staff member to this location.</small>
              </div>

              <div className="form-group">
                <label>Image URL</label>
                <input
                  type="text"
                  value={editingLoc.image_url}
                  onChange={e => setEditingLoc({ ...editingLoc, image_url: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
                {editingLoc.image_url && (
                  <div style={{ marginTop: '5px' }}>
                    <img src={editingLoc.image_url} alt="Preview" style={{ height: '60px', borderRadius: '4px' }} onError={(e) => e.target.style.display = 'none'} />
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={editingLoc.description}
                  onChange={e => setEditingLoc({ ...editingLoc, description: e.target.value })}
                  placeholder="Short description..."
                  rows="2"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Address</label>
                  <input
                    type="text"
                    value={editingLoc.address}
                    onChange={e => setEditingLoc({ ...editingLoc, address: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Hours</label>
                  <input
                    type="text"
                    value={editingLoc.hours}
                    onChange={e => setEditingLoc({ ...editingLoc, hours: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Contact Email</label>
                <input
                  type="email"
                  value={editingLoc.contact_email}
                  onChange={e => setEditingLoc({ ...editingLoc, contact_email: e.target.value })}
                  placeholder="manager@example.com"
                />
              </div>

              <div className="form-group">
                <label>Tags (comma separated)</label>
                <input
                  type="text"
                  value={editingLoc.tags}
                  onChange={e => setEditingLoc({ ...editingLoc, tags: e.target.value })}
                  placeholder="Vegan, Late Night, Coffee"
                />
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={editingLoc.is_active}
                    onChange={e => setEditingLoc({ ...editingLoc, is_active: e.target.checked })}
                  />
                  Active (Visible to customers)
                </label>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setEditingLoc(null)}>Cancel</button>
                <button type="submit" className="btn-primary">Save Location</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

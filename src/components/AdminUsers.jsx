import React, { useEffect, useState } from 'react';
import { adminAPI } from '../services/api';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [message, setMessage] = useState('');

  async function load() {
    try {
      const data = await adminAPI.getUsers();
      setUsers(data);
    } catch (e) {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleUpdateUser(e) {
    e.preventDefault();
    try {
      const updatedUser = await adminAPI.updateUser(editingUser.id, {
        role: editingUser.role,
        is_active: editingUser.is_active,
        restaurant_location_id: editingUser.restaurant_location_id
      });

      setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
      setEditingUser(null);
      setMessage('User updated successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError('Failed to update user');
    }
  }

  async function handleResetPassword(userId) {
    if (!window.confirm('Are you sure you want to reset this user\'s password?')) return;

    try {
      const result = await adminAPI.resetUserPassword(userId);
      alert(`Password reset successfully.\nTemporary Password: ${result.temp_password}`);
    } catch (err) {
      setError('Failed to reset password');
    }
  }

  if (loading) return <div className="page">Loading...</div>;

  return (
    <div className="page">
      <div className="dashboard-header">
        <h2>User Management</h2>
        <button className="btn-secondary" onClick={load}>Refresh</button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {message && <div className="success-message">{message}</div>}

      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Role</th>
              <th>Status</th>
              <th>Restaurant</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>{u.username}</td>
                <td>
                  <span className={`role-badge role-${u.role}`}>{u.role}</span>
                </td>
                <td>
                  <span className={`status-badge ${u.is_active ? 'active' : 'inactive'}`}>
                    {u.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>{u.restaurant_location_id || '-'}</td>
                <td>{new Date(u.created_at).toLocaleDateString()}</td>
                <td>
                  <button
                    className="btn-small btn-secondary"
                    onClick={() => setEditingUser(u)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn-small btn-danger"
                    onClick={() => handleResetPassword(u.id)}
                    style={{ marginLeft: '8px' }}
                  >
                    Reset Pwd
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingUser && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Edit User: {editingUser.username}</h3>
            <form onSubmit={handleUpdateUser}>
              <div className="form-group">
                <label>Role</label>
                <select
                  value={editingUser.role}
                  onChange={e => setEditingUser({ ...editingUser, role: e.target.value })}
                >
                  <option value="customer">Customer</option>
                  <option value="driver">Driver</option>
                  <option value="restaurant_staff">Restaurant Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="form-group">
                <label>Status</label>
                <select
                  value={editingUser.is_active}
                  onChange={e => setEditingUser({ ...editingUser, is_active: e.target.value === 'true' })}
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>

              {editingUser.role === 'restaurant_staff' && (
                <div className="form-group">
                  <label>Restaurant Location ID</label>
                  <input
                    type="text"
                    value={editingUser.restaurant_location_id || ''}
                    onChange={e => setEditingUser({ ...editingUser, restaurant_location_id: e.target.value })}
                    placeholder="e.g., caton"
                  />
                </div>
              )}

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setEditingUser(null)}>Cancel</button>
                <button type="submit" className="btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { restaurantAPI } from '../services/api';

export default function RestaurantSettings() {
    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [form, setForm] = useState({
        description: '',
        hours: '',
        image_url: '',
        is_active: true
    });

    useEffect(() => {
        load();
    }, []);

    async function load() {
        try {
            const data = await restaurantAPI.getLocation();
            setLocation(data);
            setForm({
                description: data.description || '',
                hours: data.hours || '',
                image_url: data.image_url || '',
                is_active: data.is_active
            });
        } catch (e) {
            setError('Failed to load location details');
        } finally {
            setLoading(false);
        }
    }

    async function handleSave(e) {
        e.preventDefault();
        try {
            const updated = await restaurantAPI.updateLocation(form);
            setLocation(updated);
            setMessage('Settings saved successfully');
            setTimeout(() => setMessage(''), 3000);
        } catch (e) {
            setError('Failed to save settings');
        }
    }

    if (loading) return <div>Loading settings...</div>;
    if (!location) return <div className="error">Location not found</div>;

    return (
        <div className="settings-panel">
            <h3>Location Settings</h3>
            {error && <div className="error-message">{error}</div>}
            {message && <div className="success-message">{message}</div>}

            <form onSubmit={handleSave}>
                <div className="form-group">
                    <label>Restaurant Name</label>
                    <input value={location.name} disabled className="muted-input" />
                    <small className="muted">Contact admin to change name</small>
                </div>

                <div className="form-group">
                    <label>Description</label>
                    <textarea
                        value={form.description}
                        onChange={e => setForm({ ...form, description: e.target.value })}
                        rows="3"
                        placeholder="Describe your restaurant..."
                    />
                </div>

                <div className="form-group">
                    <label>Operating Hours</label>
                    <input
                        value={form.hours}
                        onChange={e => setForm({ ...form, hours: e.target.value })}
                        placeholder="e.g. 9:00 AM - 9:00 PM"
                    />
                </div>

                <div className="form-group">
                    <label>Banner Image URL</label>
                    <input
                        value={form.image_url}
                        onChange={e => setForm({ ...form, image_url: e.target.value })}
                        placeholder="https://example.com/image.jpg"
                    />
                    {form.image_url && (
                        <img
                            src={form.image_url}
                            alt="Preview"
                            style={{ marginTop: 10, height: 100, borderRadius: 8, objectFit: 'cover' }}
                            onError={(e) => e.target.style.display = 'none'}
                        />
                    )}
                </div>

                <div className="form-group checkbox-group">
                    <label>
                        <input
                            type="checkbox"
                            checked={form.is_active}
                            onChange={e => setForm({ ...form, is_active: e.target.checked })}
                        />
                        Store Active (Accepting Orders)
                    </label>
                </div>

                <button type="submit" className="btn-primary">Save Changes</button>
            </form>
        </div>
    );
}

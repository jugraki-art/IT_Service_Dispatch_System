import React, { useState, useEffect } from 'react';
import {
  checkBackendHealth,
  getItems,
  createItem,
  toggleItemStatus,
  deleteItem,
  type BackendStatus,
  type Item,
} from './services/api';
import './App.css';

export function App() {
  const [backendHealth, setBackendHealth] = useState<BackendStatus | null>(null);
  const [backendLoading, setBackendLoading] = useState<boolean>(true);
  const [backendError, setBackendError] = useState<string | null>(null);

  const [items, setItems] = useState<Item[]>([]);
  const [loadingItems, setLoadingItems] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  const fetchHealth = async () => {
    setBackendLoading(true);
    try {
      const data = await checkBackendHealth();
      setBackendHealth(data);
      setBackendError(null);
    } catch (err: any) {
      setBackendHealth(null);
      setBackendError(err.message || 'Unable to connect to NestJS backend');
    } finally {
      setBackendLoading(false);
    }
  };

  const fetchItems = async () => {
    setLoadingItems(true);
    try {
      const data = await getItems();
      setItems(data);
    } catch (err) {
      console.error('Failed to load items', err);
    } finally {
      setLoadingItems(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    fetchItems();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      const newItem = await createItem({ title: title.trim(), description: description.trim() });
      setItems((prev) => [newItem, ...prev]);
      setTitle('');
      setDescription('');
    } catch (err: any) {
      alert(`Error creating item: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (id: number) => {
    try {
      const updated = await toggleItemStatus(id);
      setItems((prev) => prev.map((item) => (item.id === id ? updated : item)));
    } catch (err: any) {
      alert(`Error toggling item: ${err.message}`);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      await deleteItem(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err: any) {
      alert(`Error deleting item: ${err.message}`);
    }
  };

  return (
    <div className="container">
      <header className="header">
        <div className="badge-row">
          <span className="badge react-badge">⚛️ React 19 + TypeScript</span>
          <span className="badge nest-badge">🦅 Nest.js 12</span>
          <span className="badge mysql-badge">🐬 MySQL (XAMPP)</span>
        </div>
        <h1 className="title">Fullstack Application</h1>
        <p className="subtitle">
          Located in <code>htdocs/react-nest-project</code> &bull; Configured with TypeORM and Vite
        </p>
      </header>

      {/* System Status Cards */}
      <div className="status-grid">
        <div className="card status-card">
          <div className="card-header">
            <h3>Frontend Status</h3>
            <span className="indicator status-online">Online</span>
          </div>
          <p className="card-desc">Vite Dev Server</p>
          <div className="meta">
            <span>Port: <strong>5173</strong></span>
            <span>Framework: <strong>React 19 + TS</strong></span>
          </div>
        </div>

        <div className="card status-card">
          <div className="card-header">
            <h3>NestJS Backend</h3>
            {backendLoading ? (
              <span className="indicator status-pending">Checking...</span>
            ) : backendHealth ? (
              <span className="indicator status-online">Connected</span>
            ) : (
              <span className="indicator status-offline">Offline</span>
            )}
          </div>
          <p className="card-desc">
            {backendHealth?.message || (backendError ? 'Failed to reach API at :5000' : 'Nest.js API')}
          </p>
          <div className="meta">
            <span>Port: <strong>5000</strong></span>
            <button className="small-button" onClick={fetchHealth} disabled={backendLoading}>
              Refresh
            </button>
          </div>
        </div>

        <div className="card status-card">
          <div className="card-header">
            <h3>MySQL Database</h3>
            {backendHealth ? (
              <span className="indicator status-online">Connected</span>
            ) : (
              <span className="indicator status-pending">Via Backend</span>
            )}
          </div>
          <p className="card-desc">
            {backendHealth?.database || 'Database: react_nest_db'}
          </p>
          <div className="meta">
            <span>Port: <strong>3306 (XAMPP)</strong></span>
            <span>ORM: <strong>TypeORM</strong></span>
          </div>
        </div>
      </div>

      {/* Interactive MySQL Data Section */}
      <div className="main-content">
        <div className="card">
          <div className="card-header">
            <h2>MySQL Data Verification Demo</h2>
            <button className="button-secondary" onClick={fetchItems} disabled={loadingItems}>
              {loadingItems ? 'Refreshing...' : '🔄 Refresh Data'}
            </button>
          </div>
          <p className="section-intro">
            Test full-stack connectivity below. Adding or toggling items directly commits to the <code>items</code> table in your XAMPP MySQL database.
          </p>

          <form className="item-form" onSubmit={handleCreate}>
            <div className="form-row">
              <input
                type="text"
                className="input"
                placeholder="Item title (e.g. Test MySQL write)..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <input
                type="text"
                className="input input-desc"
                placeholder="Optional description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <button type="submit" className="button-primary" disabled={submitting || !backendHealth}>
                {submitting ? 'Saving...' : '+ Add Item'}
              </button>
            </div>
            {!backendHealth && (
              <p className="notice-warning">
                Start the backend server (<code>npm run start:dev</code> in backend folder) to interact with the database.
              </p>
            )}
          </form>

          <div className="items-container">
            {items.length === 0 ? (
              <div className="empty-state">
                <p>No items found in the MySQL database yet.</p>
                <small>Create an item above to test full-stack write and read!</small>
              </div>
            ) : (
              <ul className="items-list">
                {items.map((item) => (
                  <li key={item.id} className={`item-row ${item.isCompleted ? 'completed' : ''}`}>
                    <div className="item-left">
                      <input
                        type="checkbox"
                        checked={item.isCompleted}
                        onChange={() => handleToggle(item.id)}
                        className="checkbox"
                      />
                      <div>
                        <div className="item-title">{item.title}</div>
                        {item.description && <div className="item-description">{item.description}</div>}
                        <div className="item-date">
                          Created: {new Date(item.createdAt).toLocaleString()} &bull; ID: #{item.id}
                        </div>
                      </div>
                    </div>
                    <button className="delete-button" onClick={() => handleDelete(item.id)} title="Delete item">
                      🗑️
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Developer Guide Card */}
        <div className="card guide-card">
          <h2>🚀 Quick Start & Project Details</h2>
          <div className="guide-grid">
            <div className="guide-box">
              <h4>1. Backend (Nest.js)</h4>
              <p>Path: <code>backend/</code></p>
              <div className="code-block">
                cd backend<br />
                npm run start:dev
              </div>
              <p>Runs on: <a href="http://localhost:5000/api" target="_blank" rel="noreferrer">http://localhost:5000/api</a></p>
            </div>

            <div className="guide-box">
              <h4>2. Frontend (React + Vite)</h4>
              <p>Path: <code>frontend/</code></p>
              <div className="code-block">
                cd frontend<br />
                npm run dev
              </div>
              <p>Runs on: <a href="http://localhost:5173" target="_blank" rel="noreferrer">http://localhost:5173</a></p>
            </div>

            <div className="guide-box">
              <h4>3. MySQL (XAMPP)</h4>
              <p>Database: <code>react_nest_db</code></p>
              <div className="code-block">
                Host: 127.0.0.1:3306<br />
                User: root (password: empty)
              </div>
              <p>phpMyAdmin: <a href="http://localhost/phpmyadmin" target="_blank" rel="noreferrer">http://localhost/phpmyadmin</a></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

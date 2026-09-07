import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { NotificationDrawer } from './components/NotificationDrawer';
import { AuthPortal } from './components/AuthPortal';
import { UserPortal } from './components/UserPortal';
import { AdminPortal } from './components/AdminPortal';
import { ITGuyPortal } from './components/ITGuyPortal';
import './App.css';

const MainView: React.FC = () => {
  const { currentUser, loading } = useApp();

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          gap: '1rem',
          color: '#64748b',
          background: '#f8fafc',
        }}
      >
        <div
          style={{
            width: '42px',
            height: '42px',
            border: '4px solid #e2e8f0',
            borderTopColor: '#2563eb',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        <p style={{ fontWeight: 600 }}>Connecting to Secure IT Dispatch System...</p>
      </div>
    );
  }

  // Not logged in -> Show Auth Portal
  if (!currentUser) {
    return <AuthPortal />;
  }

  // Role-Isolated Unique View
  return (
    <div className="app-container">
      <Header />
      <main className="main-content">
        {currentUser.role === 'admin' && <AdminPortal />}
        {currentUser.role === 'it_guy' && <ITGuyPortal />}
        {currentUser.role === 'user' && <UserPortal />}
      </main>
      <NotificationDrawer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainView />
    </AppProvider>
  );
}

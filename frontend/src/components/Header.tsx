import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Server,
  Bell,
  LogOut,
  Shield,
  Wrench,
  User,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    currentUser,
    technicians,
    unreadCount,
    isNotifDrawerOpen,
    setIsNotifDrawerOpen,
    odds,
    logout,
  } = useApp();

  if (!currentUser) return null;

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return (
          <span
            style={{
              background: '#faf5ff',
              color: '#7c3aed',
              border: '1px solid #d8b4fe',
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              letterSpacing: '0.025em',
            }}
          >
            <Shield size={13} />
            <span>ADMINISTRATOR</span>
          </span>
        );
      case 'it_guy':
        return (
          <span
            style={{
              background: '#ecfdf5',
              color: '#065f46',
              border: '1px solid #a7f3d0',
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              letterSpacing: '0.025em',
            }}
          >
            <Wrench size={13} />
            <span>IT SERVICEMAN</span>
          </span>
        );
      default:
        return (
          <span
            style={{
              background: '#eff6ff',
              color: '#1e40af',
              border: '1px solid #bfdbfe',
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              letterSpacing: '0.025em',
            }}
          >
            <User size={13} />
            <span>SERVICE REQUESTER</span>
          </span>
        );
    }
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* Brand */}
        <div className="brand-section">
          <div className="brand-icon">
            <Server size={22} />
          </div>
          <div>
            <div className="brand-title">IT Service Dispatch</div>
            <div className="brand-subtitle">
              Role-Secured Operational Platform
            </div>
          </div>
        </div>

        {/* Live Metrics */}
        {odds && currentUser.role === 'admin' && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '0.8rem',
              fontWeight: 600,
            }}
          >
            <span style={{ color: '#7c3aed' }}>Round {odds.roundNumber}</span>
            <span style={{ color: '#cbd5e1' }}>•</span>
            <span style={{ color: '#059669' }}>{odds.totalUnoccupied} Free Technicians</span>
            <span style={{ color: '#cbd5e1' }}>•</span>
            <span style={{ color: '#d97706' }}>
              {technicians.filter((t) => t.status === 'occupied').length} On Job
            </span>
          </div>
        )}

        {/* User Identity & Logout Actions */}
        <div className="nav-actions">
          {/* Active User Info */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              padding: '4px 12px 4px 6px',
              borderRadius: '10px',
            }}
          >
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.name}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid #2563eb',
              }}
            />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a', lineHeight: 1.2 }}>
                {currentUser.name}
              </div>
              {currentUser.role !== 'it_guy' && (
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  {currentUser.department}
                </div>
              )}
            </div>
            {getRoleBadge(currentUser.role)}
          </div>

          {/* Notification Bell */}
          <button
            className="icon-btn"
            title="Notifications"
            onClick={() => setIsNotifDrawerOpen(!isNotifDrawerOpen)}
          >
            <Bell size={18} />
            {unreadCount > 0 && <span className="badge-dot">{unreadCount}</span>}
          </button>

          {/* Log Out */}
          <button
            className="btn btn-secondary btn-sm"
            onClick={logout}
            title="Sign out of your account"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#dc2626' }}
          >
            <LogOut size={16} />
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </header>
  );
};

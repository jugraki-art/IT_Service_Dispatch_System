import React from 'react';
import { useApp } from '../context/AppContext';
import { X, CheckCheck, Bell, Zap, CheckCircle2, AlertTriangle, MessageSquare } from 'lucide-react';

export const NotificationDrawer: React.FC = () => {
  const {
    notifications,
    isNotifDrawerOpen,
    setIsNotifDrawerOpen,
    markNotifRead,
    markAllNotifsRead,
  } = useApp();

  if (!isNotifDrawerOpen) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'dispatch':
        return <Zap size={18} style={{ color: '#2563eb' }} />;
      case 'completion':
        return <CheckCircle2 size={18} style={{ color: '#f59e0b' }} />;
      case 'termination':
        return <CheckCircle2 size={18} style={{ color: '#10b981' }} />;
      case 'alert':
        return <AlertTriangle size={18} style={{ color: '#ef4444' }} />;
      default:
        return <MessageSquare size={18} style={{ color: '#6366f1' }} />;
    }
  };

  const formatTime = (dateStr: string) => {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    const hours = Math.floor(diff / 60);
    return `${hours}h ago`;
  };

  return (
    <div className="drawer-overlay" onClick={() => setIsNotifDrawerOpen(false)}>
      <div className="drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bell size={20} style={{ color: '#2563eb' }} />
            <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>
              Notifications ({notifications.filter((n) => !n.isRead).length} Unread)
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              className="btn btn-secondary btn-sm"
              title="Mark all as read"
              onClick={() => markAllNotifsRead()}
            >
              <CheckCheck size={14} />
              <span>Mark All Read</span>
            </button>
            <button
              className="icon-btn"
              onClick={() => setIsNotifDrawerOpen(false)}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="drawer-body">
          {notifications.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '3rem 1rem',
                color: '#94a3b8',
              }}
            >
              <Bell size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
              <p>No notifications yet</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`notification-item ${!n.isRead ? 'unread' : ''}`}
                onClick={() => !n.isRead && markNotifRead(n.id)}
                style={{ cursor: n.isRead ? 'default' : 'pointer' }}
              >
                <div style={{ marginTop: '2px' }}>{getIcon(n.type)}</div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '3px',
                    }}
                  >
                    <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                      {n.title}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                      {formatTime(n.createdAt)}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.825rem', color: '#475569', lineHeight: 1.35 }}>
                    {n.message}
                  </p>
                  {n.ticketNumber && (
                    <span
                      style={{
                        display: 'inline-block',
                        marginTop: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: '#2563eb',
                        fontFamily: 'monospace',
                      }}
                    >
                      {n.ticketNumber}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

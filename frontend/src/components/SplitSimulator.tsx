import React from 'react';
import { UserPortal } from './UserPortal';
import { AdminPortal } from './AdminPortal';
import { ITGuyPortal } from './ITGuyPortal';
import { Columns3, User, Shield, Wrench } from 'lucide-react';

export const SplitSimulator: React.FC = () => {
  return (
    <div>
      {/* Simulator Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          color: '#ffffff',
          borderRadius: '12px',
          padding: '1rem 1.5rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              background: '#3b82f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Columns3 size={20} color="#ffffff" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: '#ffffff' }}>
              Multi-Actor Real-Time Tri-Role Split Simulator
            </h3>
            <p style={{ fontSize: '0.825rem', color: '#94a3b8', margin: 0 }}>
              Live tripartite view demonstrating instant state propagation across Requester, Admin Coordinator, and IT Serviceman.
            </p>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.8rem',
            background: 'rgba(255, 255, 255, 0.1)',
            padding: '6px 12px',
            borderRadius: '8px',
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#10b981',
              boxShadow: '0 0 8px #10b981',
            }}
          />
          <span>Real-Time Synchronized State</span>
        </div>
      </div>

      {/* 3 Columns */}
      <div className="split-grid">
        {/* Column 1: Requester */}
        <div className="split-column">
          <div className="split-col-header" style={{ color: '#2563eb' }}>
            <div className="split-col-title">
              <User size={18} />
              <span>1. Requester Portal (User)</span>
            </div>
            <span className="badge badge-pending_admin">Intake & Sign-Off</span>
          </div>
          <UserPortal />
        </div>

        {/* Column 2: Admin */}
        <div className="split-column">
          <div className="split-col-header" style={{ color: '#7c3aed' }}>
            <div className="split-col-title">
              <Shield size={18} />
              <span>2. Admin Command Center</span>
            </div>
            <span className="badge badge-in_progress">Odds & Dispatch</span>
          </div>
          <AdminPortal />
        </div>

        {/* Column 3: IT Serviceman */}
        <div className="split-column">
          <div className="split-col-header" style={{ color: '#059669' }}>
            <div className="split-col-title">
              <Wrench size={18} />
              <span>3. IT Serviceman Workspace</span>
            </div>
            <span className="badge badge-unoccupied">Execution Console</span>
          </div>
          <ITGuyPortal />
        </div>
      </div>
    </div>
  );
};

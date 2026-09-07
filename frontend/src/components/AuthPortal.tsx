import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Shield,
  User,
  Wrench,
  Lock,
  Mail,
  KeyRound,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export const AuthPortal: React.FC = () => {
  const { login, register } = useApp();

  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<'user' | 'it_guy'>('user');
  const [regDept, setRegDept] = useState('Financial Operations');
  const [regPhone, setRegPhone] = useState('+1 (555) 000-0000');
  const [regBuilding, setRegBuilding] = useState('Building 2');
  const [regFloor, setRegFloor] = useState('Floor 3');
  const [regRoom, setRegRoom] = useState('Room 304');
  const [regRoleTitle, setRegRoleTitle] = useState('Field IT Specialist');
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);
    try {
      await login(loginEmail, loginPassword);
    } catch (err: any) {
      setLoginError(
        err.response?.data?.message || 'Invalid email or password. Please verify credentials.',
      );
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegLoading(true);
    setRegError(null);
    try {
      await register({
        name: regName,
        email: regEmail,
        password: regPassword,
        role: regRole,
        department: regDept,
        phone: regPhone,
        building: regBuilding,
        floor: regFloor,
        room: regRoom,
        roleTitle: regRole === 'it_guy' ? regRoleTitle : undefined,
      });
    } catch (err: any) {
      setRegError(
        err.response?.data?.message || 'Registration failed. Please check your details.',
      );
    } finally {
      setRegLoading(false);
    }
  };

  const fillQuickLogin = (email: string, pass: string) => {
    setLoginEmail(email);
    setLoginPassword(pass);
    setLoginError(null);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
      }}
    >
      <div
        style={{
          maxWidth: '540px',
          width: '100%',
          background: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          overflow: 'hidden',
        }}
      >
        {/* Header Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
            color: '#ffffff',
            padding: '2rem 1.75rem',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              border: '1px solid rgba(255, 255, 255, 0.3)',
            }}
          >
            <Shield size={30} color="#ffffff" />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
            IT Service Dispatch System
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#bfdbfe', marginTop: '6px' }}>
            Role-Secured Operational Platform & Fair Odds Management
          </p>
        </div>

        {/* Tab Switcher */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid #e2e8f0',
            background: '#f8fafc',
          }}
        >
          <button
            type="button"
            onClick={() => setMode('login')}
            style={{
              flex: 1,
              padding: '1rem',
              fontWeight: 700,
              fontSize: '0.95rem',
              border: 'none',
              background: mode === 'login' ? '#ffffff' : 'transparent',
              color: mode === 'login' ? '#2563eb' : '#64748b',
              borderBottom: mode === 'login' ? '3px solid #2563eb' : '3px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <Lock size={16} />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            style={{
              flex: 1,
              padding: '1rem',
              fontWeight: 700,
              fontSize: '0.95rem',
              border: 'none',
              background: mode === 'register' ? '#ffffff' : 'transparent',
              color: mode === 'register' ? '#2563eb' : '#64748b',
              borderBottom: mode === 'register' ? '3px solid #2563eb' : '3px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <User size={16} />
            <span>Create Account</span>
          </button>
        </div>

        {/* Form Body */}
        <div style={{ padding: '1.75rem' }}>
          {/* TAB 1: LOGIN */}
          {mode === 'login' && (
            <div>
              {loginError && (
                <div
                  style={{
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    color: '#991b1b',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <AlertCircle size={18} />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit}>
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Mail size={14} style={{ color: '#2563eb' }} />
                    <span>Email Address</span>
                  </label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="Enter your registered email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <KeyRound size={14} style={{ color: '#2563eb' }} />
                    <span>Password</span>
                  </label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Enter your password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', marginTop: '0.5rem' }}
                  disabled={loginLoading}
                >
                  <span>{loginLoading ? 'Authenticating...' : 'Sign In to My Portal'}</span>
                  <ArrowRight size={18} />
                </button>
              </form>

              {/* Known Credentials Quick-Fill Section */}
              <div style={{ marginTop: '1.75rem', borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem' }}>
                <div
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: '#64748b',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Sparkles size={14} style={{ color: '#f59e0b' }} />
                  <span>Quick Access Credentials (Click to Autofill):</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {/* Admin */}
                  <div
                    onClick={() => fillQuickLogin('admin@dispatch.corp', 'Admin@2026!')}
                    style={{
                      background: '#eff6ff',
                      border: '1px solid #bfdbfe',
                      borderRadius: '8px',
                      padding: '0.6rem 0.85rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.15s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Shield size={16} style={{ color: '#1e40af' }} />
                      <div>
                        <strong style={{ fontSize: '0.85rem', color: '#1e40af' }}>
                          Administrator (Single Account)
                        </strong>
                        <div style={{ fontSize: '0.75rem', color: '#3b82f6' }}>
                          admin@dispatch.corp • Pass: Admin@2026!
                        </div>
                      </div>
                    </div>
                    <span className="badge badge-pending_admin" style={{ fontSize: '0.7rem' }}>
                      Admin Only
                    </span>
                  </div>

                  {/* Requester */}
                  <div
                    onClick={() => fillQuickLogin('sarah@dispatch.corp', 'user123')}
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '0.6rem 0.85rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.15s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <User size={16} style={{ color: '#2563eb' }} />
                      <div>
                        <strong style={{ fontSize: '0.85rem', color: '#0f172a' }}>
                          Service Requester (Sarah Jenkins)
                        </strong>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          sarah@dispatch.corp • Pass: user123
                        </div>
                      </div>
                    </div>
                    <span className="badge badge-assigned" style={{ fontSize: '0.7rem' }}>
                      Requester
                    </span>
                  </div>

                  {/* IT Serviceman */}
                  <div
                    onClick={() => fillQuickLogin('marcus@dispatch.corp', 'tech123')}
                    style={{
                      background: '#ecfdf5',
                      border: '1px solid #a7f3d0',
                      borderRadius: '8px',
                      padding: '0.6rem 0.85rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.15s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Wrench size={16} style={{ color: '#065f46' }} />
                      <div>
                        <strong style={{ fontSize: '0.85rem', color: '#065f46' }}>
                          IT Serviceman (Marcus Vance)
                        </strong>
                        <div style={{ fontSize: '0.75rem', color: '#059669' }}>
                          marcus@dispatch.corp • Pass: tech123
                        </div>
                      </div>
                    </div>
                    <span className="badge badge-unoccupied" style={{ fontSize: '0.7rem' }}>
                      Technician
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: REGISTER */}
          {mode === 'register' && (
            <div>
              {regError && (
                <div
                  style={{
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    color: '#991b1b',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <AlertCircle size={18} />
                  <span>{regError}</span>
                </div>
              )}

              {/* Explicit Admin Security Notice */}
              <div
                style={{
                  background: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  borderRadius: '8px',
                  padding: '0.75rem 1rem',
                  fontSize: '0.825rem',
                  color: '#1e40af',
                  marginBottom: '1.25rem',
                  lineHeight: 1.4,
                }}
              >
                🔒 <strong>Administrative Security Policy:</strong> Self-registration is strictly restricted to <strong>Service Requesters</strong> and <strong>IT Servicemen</strong>. Administrator privileges are pre-configured and cannot be selected during sign-up.
              </div>

              <form onSubmit={handleRegisterSubmit}>
                {/* Role Selector: Only IT Guy or Requester! */}
                <div className="form-group">
                  <label className="form-label">Select Account Role (Required):</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div
                      onClick={() => setRegRole('user')}
                      style={{
                        border: regRole === 'user' ? '2px solid #2563eb' : '1px solid #cbd5e1',
                        background: regRole === 'user' ? '#eff6ff' : '#ffffff',
                        padding: '0.85rem',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.15s',
                      }}
                    >
                      <User size={24} style={{ color: regRole === 'user' ? '#2563eb' : '#64748b', margin: '0 auto 4px' }} />
                      <div style={{ fontWeight: 700, fontSize: '0.875rem', color: regRole === 'user' ? '#1e40af' : '#1e293b' }}>
                        Service Requester
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                        Staff needing IT support
                      </div>
                    </div>

                    <div
                      onClick={() => setRegRole('it_guy')}
                      style={{
                        border: regRole === 'it_guy' ? '2px solid #10b981' : '1px solid #cbd5e1',
                        background: regRole === 'it_guy' ? '#ecfdf5' : '#ffffff',
                        padding: '0.85rem',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.15s',
                      }}
                    >
                      <Wrench size={24} style={{ color: regRole === 'it_guy' ? '#10b981' : '#64748b', margin: '0 auto 4px' }} />
                      <div style={{ fontWeight: 700, fontSize: '0.875rem', color: regRole === 'it_guy' ? '#065f46' : '#1e293b' }}>
                        IT Serviceman
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                        Field support engineer
                      </div>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Robert Taylor"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-row form-group">
                  <div>
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="name@company.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">Password</label>
                    <input
                      type="password"
                      className="form-input"
                      placeholder="Minimum 6 characters"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-row form-group">
                  <div>
                    <label className="form-label">Department</label>
                    <input
                      type="text"
                      className="form-input"
                      value={regDept}
                      onChange={(e) => setRegDept(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">Phone</label>
                    <input
                      type="text"
                      className="form-input"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {regRole === 'it_guy' && (
                  <div className="form-group">
                    <label className="form-label">Technical Specialty / Role Title</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Senior Network Specialist, Hardware Technician"
                      value={regRoleTitle}
                      onChange={(e) => setRegRoleTitle(e.target.value)}
                      required
                    />
                  </div>
                )}

                <div className="form-row form-group">
                  <div>
                    <label className="form-label">Building</label>
                    <input
                      type="text"
                      className="form-input"
                      value={regBuilding}
                      onChange={(e) => setRegBuilding(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">Floor</label>
                    <input
                      type="text"
                      className="form-input"
                      value={regFloor}
                      onChange={(e) => setRegFloor(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">Room</label>
                    <input
                      type="text"
                      className="form-input"
                      value={regRoom}
                      onChange={(e) => setRegRoom(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', marginTop: '0.5rem' }}
                  disabled={regLoading}
                >
                  <CheckCircle2 size={18} />
                  <span>{regLoading ? 'Creating Account...' : 'Create Account & Enter Portal'}</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

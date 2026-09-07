import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { type RequestUrgency } from '../services/api';
import {
  Send,
  Sparkles,
  Clock,
  MapPin,
  Star,
  CheckCircle2,
  Wrench,
  HelpCircle,
  ShieldCheck,
} from 'lucide-react';

export const UserPortal: React.FC = () => {
  const {
    currentUser,
    requests,
    createRequest,
    terminateSession,
    terminationModalTicket,
    setTerminationModalTicket,
  } = useApp();

  if (!currentUser) return null;

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Hardware');
  const [urgency, setUrgency] = useState<RequestUrgency>('medium');
  const [building, setBuilding] = useState(currentUser.building);
  const [floor, setFloor] = useState(currentUser.floor);
  const [room, setRoom] = useState(currentUser.room);
  const [submitting, setSubmitting] = useState(false);

  // Termination Modal State
  const [rating, setRating] = useState<number>(5);
  const [feedback, setFeedback] = useState('');
  const [isTerminating, setIsTerminating] = useState(false);

  // Filter requests for this user
  const userRequests = requests.filter((r) => r.requesterId === currentUser.id);

  // Find any ticket awaiting user termination
  const pendingTerminationTicket = userRequests.find(
    (r) => r.status === 'completed_by_it',
  );

  const presets = [
    {
      label: '🖥️ Monitor Flickering',
      title: 'Secondary monitor flickers intermittently',
      category: 'Hardware',
      urgency: 'high' as RequestUrgency,
      desc: 'External monitor blacking out every 3 minutes while running business applications.',
    },
    {
      label: '📶 WiFi Dropping',
      title: 'Workstation loses office WiFi association',
      category: 'Network & WiFi',
      urgency: 'high' as RequestUrgency,
      desc: 'Signal drops repeatedly during calls and client meetings.',
    },
    {
      label: '🖨️ Printer Jam',
      title: 'Department printer tray feeder jammed',
      category: 'Printer & Peripherals',
      urgency: 'medium' as RequestUrgency,
      desc: 'Paper misfeed error displayed on floor main multifunction printer.',
    },
    {
      label: '🔊 AV Zoom Echo',
      title: 'Conference room audio echo and feedback loop',
      category: 'Audio/Visual',
      urgency: 'medium' as RequestUrgency,
      desc: 'Microphone ceiling array capturing speaker feedback in Teams/Zoom.',
    },
    {
      label: '🔑 VPN & Access Lock',
      title: 'Corporate VPN token synchronization failure',
      category: 'Access & Security',
      urgency: 'critical' as RequestUrgency,
      desc: 'User locked out of corporate subnet and remote gateway.',
    },
  ];

  const applyPreset = (preset: (typeof presets)[0]) => {
    setTitle(preset.title);
    setCategory(preset.category);
    setUrgency(preset.urgency);
    setDescription(preset.desc);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setSubmitting(true);
    try {
      await createRequest({
        title,
        description,
        category,
        urgency,
        locationBuilding: building,
        locationFloor: floor,
        locationRoom: room,
      });
      setTitle('');
      setDescription('');
    } catch (err) {
      console.error('Error creating request:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmTermination = async () => {
    if (!terminationModalTicket) return;
    setIsTerminating(true);
    try {
      await terminateSession(terminationModalTicket.id, rating, feedback);
      setFeedback('');
      setRating(5);
    } catch (err) {
      console.error('Error terminating session:', err);
    } finally {
      setIsTerminating(false);
    }
  };

  const renderStepper = (status: string) => {
    const steps = [
      { key: 'pending_admin', label: 'Requested' },
      { key: 'assigned', label: 'Dispatched' },
      { key: 'in_progress', label: 'On-Site' },
      { key: 'completed_by_it', label: 'Completed' },
      { key: 'session_terminated', label: 'Closed' },
    ];

    const getStepIndex = (s: string) => {
      switch (s) {
        case 'pending_admin':
          return 0;
        case 'assigned':
          return 1;
        case 'in_progress':
          return 2;
        case 'completed_by_it':
          return 3;
        case 'session_terminated':
          return 4;
        default:
          return 0;
      }
    };

    const currentIndex = getStepIndex(status);

    return (
      <div className="stepper">
        {steps.map((step, idx) => {
          const isDone = idx < currentIndex || status === 'session_terminated';
          const isActive = idx === currentIndex;
          return (
            <div
              key={step.key}
              className={`step-node ${isDone ? 'completed' : ''} ${isActive ? 'active' : ''}`}
            >
              <div className="step-circle">{isDone ? '✓' : idx + 1}</div>
              <span className="step-label">{step.label}</span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Requester Identity Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '1rem 1.25rem',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img
            src={currentUser.avatarUrl}
            alt={currentUser.name}
            style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
          />
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>
              {currentUser.name}
            </h2>
            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
              {currentUser.department} • {currentUser.building}, {currentUser.room}
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span className="badge badge-unoccupied">Verified Requester</span>
          <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
            {userRequests.length} Total Submissions
          </div>
        </div>
      </div>

      {/* Golden Action Required Banner if ticket awaits session termination */}
      {pendingTerminationTicket && (
        <div className="alert-banner alert-banner-golden">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Sparkles size={28} style={{ color: '#d97706', flexShrink: 0 }} />
            <div>
              <div className="alert-banner-title">
                Action Required: IT Serviceman Finished Repair on {pendingTerminationTicket.ticketNumber}
              </div>
              <div style={{ fontSize: '0.875rem', marginTop: '2px' }}>
                Technician <strong>{pendingTerminationTicket.assignedTechnicianName}</strong> completed the work. Please inspect your hardware/system, submit a rating, and terminate the session to release the technician back to available status.
              </div>
            </div>
          </div>
          <button
            className="btn btn-warning"
            style={{ whiteSpace: 'nowrap', fontWeight: 700 }}
            onClick={() => setTerminationModalTicket(pendingTerminationTicket)}
          >
            <ShieldCheck size={16} />
            <span>Terminate & Rate</span>
          </button>
        </div>
      )}

      {/* Intake Form */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <Send size={18} style={{ color: '#2563eb' }} />
            <span>Submit IT Service Request</span>
          </div>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
            Auto-dispatched via Fair Odds System
          </span>
        </div>

        {/* Quick Issue Presets */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div
            style={{
              fontSize: '0.8rem',
              fontWeight: 600,
              color: '#64748b',
              marginBottom: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Sparkles size={14} style={{ color: '#2563eb' }} />
            <span>Quick Issue Presets (Click to autofill):</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {presets.map((p, i) => (
              <button
                key={i}
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => applyPreset(p)}
                style={{ fontSize: '0.8rem' }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Issue Summary / Title</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Workstation secondary monitor flickering"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-row form-group">
            <div>
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="Hardware">Hardware</option>
                <option value="Software">Software</option>
                <option value="Network & WiFi">Network & WiFi</option>
                <option value="Printer & Peripherals">Printer & Peripherals</option>
                <option value="Access & Security">Access & Security</option>
                <option value="Audio/Visual">Audio/Visual</option>
              </select>
            </div>
            <div>
              <label className="form-label">Urgency Level</label>
              <select
                className="form-select"
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as RequestUrgency)}
              >
                <option value="low">Low (Standard SLA)</option>
                <option value="medium">Medium (Within 2 hrs)</option>
                <option value="high">High (Urgent Workflow Blocker)</option>
                <option value="critical">Critical (Executive / System Down)</option>
              </select>
            </div>
          </div>

          <div className="form-row form-group">
            <div>
              <label className="form-label">Building</label>
              <input
                type="text"
                className="form-input"
                value={building}
                onChange={(e) => setBuilding(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="form-label">Floor</label>
              <input
                type="text"
                className="form-input"
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="form-label">Room / Cubicle</label>
              <input
                type="text"
                className="form-input"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Detailed Symptoms & Description</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="Describe what occurred, any error messages, and troubleshooting steps already tried..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting || !title.trim()}
            >
              <Send size={16} />
              <span>{submitting ? 'Submitting...' : 'Submit Service Request'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* My Service Requests */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <Clock size={18} style={{ color: '#2563eb' }} />
            <span>My Service Tickets ({userRequests.length})</span>
          </div>
        </div>

        {userRequests.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '3rem 1rem',
              color: '#94a3b8',
            }}
          >
            <HelpCircle size={40} style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
            <p style={{ fontWeight: 600 }}>No requests submitted yet</p>
            <p style={{ fontSize: '0.85rem' }}>
              Fill out the form above to dispatch an available IT serviceman.
            </p>
          </div>
        ) : (
          userRequests.map((req) => (
            <div key={req.id} className="ticket-item">
              <div className="ticket-top">
                <div>
                  <span className="ticket-id">{req.ticketNumber}</span>
                  <div className="ticket-title">{req.title}</div>
                </div>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <span className={`badge badge-${req.status}`}>
                    {req.status.replace(/_/g, ' ')}
                  </span>
                  <span className={`badge badge-urgent-${req.urgency}`}>
                    {req.urgency}
                  </span>
                </div>
              </div>

              <div className="ticket-desc">{req.description}</div>

              {/* Visual Progress Stepper */}
              {renderStepper(req.status)}

              {/* Status Details */}
              {req.assignedTechnicianName && (
                <div
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '0.75rem 1rem',
                    margin: '0.75rem 0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Wrench size={18} style={{ color: '#2563eb' }} />
                    <span style={{ fontSize: '0.85rem', color: '#475569' }}>
                      Assigned IT Serviceman:
                    </span>
                    <strong style={{ fontSize: '0.85rem', color: '#0f172a' }}>
                      {req.assignedTechnicianName}
                    </strong>
                    {req.assignedTechnicianPhone && (
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        ({req.assignedTechnicianPhone})
                      </span>
                    )}
                  </div>

                  {req.status === 'completed_by_it' && (
                    <button
                      className="btn btn-warning btn-sm"
                      onClick={() => setTerminationModalTicket(req)}
                    >
                      <ShieldCheck size={14} />
                      <span>Terminate Session & Rate</span>
                    </button>
                  )}
                </div>
              )}

              {/* Resolution Notes Review if completed */}
              {req.resolutionNotes && (
                <div
                  style={{
                    background: '#ecfdf5',
                    border: '1px solid #a7f3d0',
                    borderRadius: '8px',
                    padding: '0.75rem 1rem',
                    margin: '0.5rem 0',
                    fontSize: '0.85rem',
                    color: '#065f46',
                  }}
                >
                  <strong>Technician Resolution Notes:</strong> {req.resolutionNotes}
                </div>
              )}

              {/* User Rating Display if closed */}
              {req.userRating && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    margin: '0.5rem 0',
                    fontSize: '0.85rem',
                    color: '#475569',
                  }}
                >
                  <span>Your Rating:</span>
                  <div style={{ display: 'flex', gap: '2px', color: '#f59e0b' }}>
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        fill={i < (req.userRating || 0) ? '#f59e0b' : 'none'}
                        color="#f59e0b"
                      />
                    ))}
                  </div>
                  {req.userFeedback && (
                    <span style={{ fontStyle: 'italic', color: '#64748b' }}>
                      "{req.userFeedback}"
                    </span>
                  )}
                </div>
              )}

              <div className="ticket-meta">
                <div className="ticket-meta-item">
                  <MapPin size={14} />
                  <span>
                    {req.locationBuilding} • {req.locationFloor} • {req.locationRoom}
                  </span>
                </div>
                <div className="ticket-meta-item">
                  <Clock size={14} />
                  <span>Submitted {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="ticket-meta-item">
                  <span>Category: {req.category}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Session Termination & Rating Modal */}
      {terminationModalTicket && (
        <div
          className="modal-overlay"
          onClick={() => setTerminationModalTicket(null)}
        >
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div className="modal-title">
                  Formal Session Termination & Sign-Off
                </div>
                <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '2px' }}>
                  Ticket {terminationModalTicket.ticketNumber}: {terminationModalTicket.title}
                </div>
              </div>
              <button
                className="icon-btn"
                onClick={() => setTerminationModalTicket(null)}
              >
                ✕
              </button>
            </div>

            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '1.25rem',
              }}
            >
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
                Technician's Repair Summary:
              </div>
              <p
                style={{
                  fontSize: '0.9rem',
                  color: '#1e293b',
                  marginTop: '4px',
                  fontStyle: 'italic',
                }}
              >
                "{terminationModalTicket.resolutionNotes || 'Repairs completed and hardware verified on-site.'}"
              </p>
              <div
                style={{
                  fontSize: '0.8rem',
                  color: '#64748b',
                  marginTop: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <CheckCircle2 size={14} style={{ color: '#10b981' }} />
                <span>Assigned Technician: {terminationModalTicket.assignedTechnicianName}</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Rate Service Quality (1 to 5 Stars):</label>
              <div className="star-rating">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`star ${star <= rating ? 'filled' : ''}`}
                    onClick={() => setRating(star)}
                  >
                    ★
                  </span>
                ))}
                <span
                  style={{
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    marginLeft: '8px',
                    alignSelf: 'center',
                    color: '#2563eb',
                  }}
                >
                  {rating} of 5 Stars
                </span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                Feedback & Notes on Resolution (Optional)
              </label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="e.g. Marcus arrived within 10 minutes and resolved the dual monitor flickering immediately!"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              />
            </div>

            <div
              style={{
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: '8px',
                padding: '0.75rem 1rem',
                marginBottom: '1.25rem',
                fontSize: '0.85rem',
                color: '#1e40af',
              }}
            >
              ℹ️ <strong>System Enforcement Notice:</strong> Clicking confirm will close this ticket, record your review, and return technician <strong>{terminationModalTicket.assignedTechnicianName}</strong> to <strong>UNOCCUPIED</strong> status so they can assist other employees.
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '8px',
              }}
            >
              <button
                className="btn btn-secondary"
                onClick={() => setTerminationModalTicket(null)}
              >
                Cancel
              </button>
              <button
                className="btn btn-success"
                onClick={handleConfirmTermination}
                disabled={isTerminating}
              >
                <CheckCircle2 size={16} />
                <span>
                  {isTerminating ? 'Releasing Technician...' : 'Confirm & Free Technician'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  CheckCircle2,
  Clock,
  Star,
  Zap,
  Building,
  AlertTriangle,
  PlayCircle,
  FileCheck,
} from 'lucide-react';

export const ITGuyPortal: React.FC = () => {
  const {
    currentITGuy,
    requests,
    startService,
    completeService,
  } = useApp();

  const [resolutionNotes, setResolutionNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!currentITGuy) {
    return <div>No technician selected.</div>;
  }

  // Find active task for this technician
  const activeTask = requests.find(
    (r) =>
      r.assignedTechnicianId === currentITGuy.id &&
      r.status !== 'session_terminated',
  );

  // Past completed tickets for this technician
  const pastTasks = requests.filter(
    (r) =>
      r.assignedTechnicianId === currentITGuy.id &&
      r.status === 'session_terminated',
  );

  const handleStartWork = async () => {
    if (!activeTask) return;
    setIsSubmitting(true);
    try {
      await startService(activeTask.id);
    } catch (err) {
      console.error('Error starting service:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteWork = async () => {
    if (!activeTask || !resolutionNotes.trim()) return;
    setIsSubmitting(true);
    try {
      await completeService(activeTask.id, resolutionNotes);
      setResolutionNotes('');
    } catch (err) {
      console.error('Error completing service:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Technician Identity Header */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <img
            src={currentITGuy.avatarUrl}
            alt={currentITGuy.name}
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '2px solid #2563eb',
            }}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, margin: 0 }}>
                {currentITGuy.name}
              </h2>
              <span className={`badge badge-${currentITGuy.status}`}>
                {currentITGuy.status.toUpperCase()}
              </span>
            </div>
            <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '2px' }}>
              {currentITGuy.roleTitle} • {currentITGuy.department}
            </div>
          </div>
        </div>

        {/* Technician Selector & Live Metrics */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
              <Star size={16} fill="#f59e0b" color="#f59e0b" />
              <strong style={{ fontSize: '1.1rem' }}>{currentITGuy.rating}</strong>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                ({currentITGuy.ratingsCount} reviews)
              </span>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
              {currentITGuy.totalCompletedJobs} Completed Jobs
            </div>
          </div>

          <div style={{ borderLeft: '1px solid #e2e8f0', paddingLeft: '1rem' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '2px' }}>
              Technician Account:
            </div>
            <span className="badge badge-unoccupied" style={{ fontSize: '0.75rem' }}>
              Active Duty
            </span>
          </div>
        </div>
      </div>

      {/* Technician Status Message */}
      {currentITGuy.status === 'absent' && (
        <div className="alert-banner" style={{ background: '#fef2f2', border: '1px solid #ef4444', color: '#991b1b' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertTriangle size={24} />
            <div>
              <strong>You are Currently Marked ABSENT by Admin</strong>
              <div style={{ fontSize: '0.85rem' }}>
                You are excluded from the dispatch odds queue. When you return to work, your supervisor (Admin Alex Mercer) will restore your status to UNOCCUPIED.
              </div>
            </div>
          </div>
        </div>
      )}

      {currentITGuy.status === 'unoccupied' && !activeTask && (
        <div className="alert-banner" style={{ background: '#ecfdf5', border: '1px solid #10b981', color: '#065f46' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CheckCircle2 size={24} />
            <div>
              <strong>Status: UNOCCUPIED & Available for Dispatch</strong>
              <div style={{ fontSize: '0.85rem' }}>
                You are registered in the Fair Odds Rotation pool. As soon as the Admin approves a dispatch, an alert will ring on this console.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ACTIVE DISPATCH CONSOLE */}
      {activeTask && (
        <div className="card" style={{ border: '2px solid #2563eb' }}>
          <div className="card-header" style={{ background: '#eff6ff', margin: '-1.5rem -1.5rem 1.25rem -1.5rem', padding: '1rem 1.5rem' }}>
            <div className="card-title" style={{ color: '#1e40af' }}>
              <Zap size={20} style={{ color: '#2563eb' }} />
              <span>Active Dispatch Assignment: {activeTask.ticketNumber}</span>
            </div>
            <span className={`badge badge-${activeTask.status}`}>
              {activeTask.status.replace(/_/g, ' ').toUpperCase()}
            </span>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
              {activeTask.title}
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.4 }}>
              {activeTask.description}
            </p>
          </div>

          {/* Location & Contact Card */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1.25rem',
            }}
          >
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                SERVICE REQUESTER
              </div>
              <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>
                {activeTask.requesterName}
              </strong>
              <div style={{ fontSize: '0.8rem', color: '#475569' }}>
                {activeTask.requesterDept}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#2563eb', marginTop: '2px' }}>
                {activeTask.requesterPhone}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                ON-SITE DESTINATION
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
                <Building size={16} style={{ color: '#2563eb' }} />
                <span>{activeTask.locationBuilding}</span>
              </div>
              <div style={{ fontSize: '0.85rem', color: '#475569' }}>
                {activeTask.locationFloor} • <strong>{activeTask.locationRoom}</strong>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                CLASSIFICATION
              </div>
              <div style={{ fontSize: '0.85rem', color: '#0f172a', fontWeight: 600, marginTop: '2px' }}>
                {activeTask.category}
              </div>
              <span className={`badge badge-urgent-${activeTask.urgency}`} style={{ marginTop: '4px' }}>
                Priority: {activeTask.urgency.toUpperCase()}
              </span>
            </div>
          </div>

          {/* ACTION STAGE 1: TICKET IS ASSIGNED -> ACKNOWLEDGE & START WORK */}
          {activeTask.status === 'assigned' && (
            <div
              style={{
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: '8px',
                padding: '1.25rem',
                textAlign: 'center',
              }}
            >
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e40af', marginBottom: '6px' }}>
                Step 1: Acknowledge & Arrive On-Site
              </h4>
              <p style={{ fontSize: '0.85rem', color: '#3b82f6', marginBottom: '1rem' }}>
                Click below when you arrive at {activeTask.locationRoom} ({activeTask.locationBuilding}) to notify requester {activeTask.requesterName} that service has commenced.
              </p>
              <button
                className="btn btn-primary"
                style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}
                onClick={handleStartWork}
                disabled={isSubmitting}
              >
                <PlayCircle size={20} />
                <span>{isSubmitting ? 'Updating...' : 'Acknowledge & Start Service'}</span>
              </button>
            </div>
          )}

          {/* ACTION STAGE 2: TICKET IS IN_PROGRESS -> SUBMIT RESOLUTION NOTES */}
          {activeTask.status === 'in_progress' && (
            <div
              style={{
                background: '#faf5ff',
                border: '1px solid #e9d5ff',
                borderRadius: '8px',
                padding: '1.25rem',
              }}
            >
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#6b21a8', marginBottom: '6px' }}>
                Step 2: Technical Resolution & Completion
              </h4>
              <p style={{ fontSize: '0.85rem', color: '#7c3aed', marginBottom: '1rem' }}>
                Perform troubleshooting, repair hardware/software, and enter your technical diagnostic and resolution notes below.
              </p>

              <div className="form-group">
                <label className="form-label" style={{ color: '#581c87' }}>
                  Technical Diagnostic & Resolution Notes (Required):
                </label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  placeholder="e.g. Diagnosed loose Thunderbolt dock cable. Replaced with certified shielded cable. Verified dual 4K display output and ran stability test."
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  className="btn btn-success"
                  onClick={handleCompleteWork}
                  disabled={isSubmitting || !resolutionNotes.trim()}
                >
                  <FileCheck size={18} />
                  <span>{isSubmitting ? 'Submitting...' : 'Mark Service as Completed'}</span>
                </button>
              </div>
            </div>
          )}

          {/* ACTION STAGE 3: TICKET IS COMPLETED_BY_IT -> HOLDING STATE */}
          {activeTask.status === 'completed_by_it' && (
            <div
              style={{
                background: '#fffbeb',
                border: '1px solid #f59e0b',
                borderRadius: '8px',
                padding: '1.25rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Clock size={28} style={{ color: '#d97706', flexShrink: 0 }} />
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#92400e', margin: 0 }}>
                    Holding State: Awaiting Requester Session Termination
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: '#b45309', marginTop: '4px', lineHeight: 1.4 }}>
                    You have marked your technical work completed! Per organizational system rules, your status remains <strong>OCCUPIED</strong> until the service requester (<strong>{activeTask.requesterName}</strong>) inspects the repair, submits a rating, and terminates the session.
                  </p>
                  <div style={{ fontSize: '0.8rem', color: '#92400e', marginTop: '6px' }}>
                    <strong>Logged Notes:</strong> "{activeTask.resolutionNotes}"
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Completed Jobs History */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <CheckCircle2 size={18} style={{ color: '#10b981' }} />
            <span>My Service History & Ratings ({pastTasks.length})</span>
          </div>
        </div>

        {pastTasks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
            <p>No closed tickets yet in this session.</p>
          </div>
        ) : (
          pastTasks.map((t) => (
            <div key={t.id} className="ticket-item">
              <div className="ticket-top">
                <div>
                  <span className="ticket-id">{t.ticketNumber}</span>
                  <div className="ticket-title">{t.title}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ display: 'flex', color: '#f59e0b' }}>
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        fill={i < (t.userRating || 0) ? '#f59e0b' : 'none'}
                        color="#f59e0b"
                      />
                    ))}
                  </div>
                  <span className="badge badge-session_terminated">Closed</span>
                </div>
              </div>

              <div style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '6px' }}>
                <strong>Requester Feedback:</strong> "{t.userFeedback || 'Service signed off successfully.'}"
              </div>

              <div style={{ fontSize: '0.8rem', color: '#065f46', background: '#ecfdf5', padding: '6px 10px', borderRadius: '6px' }}>
                <strong>Your Notes:</strong> {t.resolutionNotes}
              </div>

              <div className="ticket-meta">
                <span>Requester: {t.requesterName}</span>
                <span>Location: {t.locationBuilding} {t.locationRoom}</span>
                <span>Terminated: {new Date(t.terminatedAt || t.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

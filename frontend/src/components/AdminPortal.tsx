import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Shield,
  Users,
  Clock,
  UserCheck,
  UserX,
  AlertTriangle,
  Zap,
  RotateCcw,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { type RankedITGuy, type ServiceRequest } from '../services/api';

export const AdminPortal: React.FC = () => {
  const {
    technicians,
    requests,
    odds,
    dispatchTechnician,
    toggleAttendance,
    auditLogs,
    dispatchModalTicket,
    setDispatchModalTicket,
  } = useApp();

  const [selectedTechId, setSelectedTechId] = useState<string | null>(null);
  const [dispatching, setDispatching] = useState(false);
  const [activeTab, setActiveTab] = useState<'queue' | 'roster' | 'audit'>('queue');

  // KPI Computations
  const unoccupiedTechs = technicians.filter((t) => t.status === 'unoccupied');
  const occupiedTechs = technicians.filter((t) => t.status === 'occupied');
  const absentTechs = technicians.filter((t) => t.status === 'absent');
  const pendingRequests = requests.filter((r) => r.status === 'pending_admin');

  // Open modal for a ticket
  const handleOpenDispatchModal = (ticket: ServiceRequest) => {
    setDispatchModalTicket(ticket);
    if (odds && odds.candidates.length > 0) {
      // Default to the highest odds candidate!
      setSelectedTechId(odds.candidates[0].technicianId);
    } else {
      setSelectedTechId(null);
    }
  };

  const handleConfirmDispatch = async () => {
    if (!dispatchModalTicket || !selectedTechId) return;
    setDispatching(true);
    try {
      await dispatchTechnician(dispatchModalTicket.id, selectedTechId);
      setSelectedTechId(null);
    } catch (err) {
      console.error('Error dispatching technician:', err);
    } finally {
      setDispatching(false);
    }
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
      {/* Executive KPI Grid */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-info">
            <h4>Free & Unoccupied</h4>
            <div className="kpi-value" style={{ color: '#059669' }}>
              {unoccupiedTechs.length}
            </div>
          </div>
          <div className="kpi-icon-box" style={{ background: '#ecfdf5', color: '#10b981' }}>
            <UserCheck size={24} />
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-info">
            <h4>Occupied (On-Job)</h4>
            <div className="kpi-value" style={{ color: '#d97706' }}>
              {occupiedTechs.length}
            </div>
          </div>
          <div className="kpi-icon-box" style={{ background: '#fffbeb', color: '#f59e0b' }}>
            <Zap size={24} />
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-info">
            <h4>Absent / Off-Duty</h4>
            <div className="kpi-value" style={{ color: '#dc2626' }}>
              {absentTechs.length}
            </div>
          </div>
          <div className="kpi-icon-box" style={{ background: '#fef2f2', color: '#ef4444' }}>
            <UserX size={24} />
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-info">
            <h4>Pending Triage</h4>
            <div className="kpi-value" style={{ color: '#2563eb' }}>
              {pendingRequests.length}
            </div>
          </div>
          <div className="kpi-icon-box" style={{ background: '#eff6ff', color: '#2563eb' }}>
            <Clock size={24} />
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-info">
            <h4>Active Round</h4>
            <div className="kpi-value" style={{ color: '#7c3aed' }}>
              {odds?.roundNumber || 1}
            </div>
          </div>
          <div className="kpi-icon-box" style={{ background: '#faf5ff', color: '#8b5cf6' }}>
            <RotateCcw size={24} />
          </div>
        </div>
      </div>

      {/* Admin Section Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '1.25rem' }}>
        <button
          className={`btn ${activeTab === 'queue' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('queue')}
        >
          <Clock size={16} />
          <span>Pending Dispatch Queue ({pendingRequests.length})</span>
        </button>
        <button
          className={`btn ${activeTab === 'roster' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('roster')}
        >
          <Users size={16} />
          <span>Servicemen Roster & Attendance ({technicians.length})</span>
        </button>
        <button
          className={`btn ${activeTab === 'audit' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('audit')}
        >
          <Shield size={16} />
          <span>System Audit Trail</span>
        </button>
      </div>

      {/* TAB 1: PENDING QUEUE */}
      {activeTab === 'queue' && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Clock size={18} style={{ color: '#2563eb' }} />
              <span>Pending IT Dispatch Requests ({pendingRequests.length})</span>
            </div>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Unoccupied Technicians Available: <strong>{unoccupiedTechs.length}</strong>
            </span>
          </div>

          {pendingRequests.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '3rem 1rem',
                color: '#94a3b8',
              }}
            >
              <CheckCircle2 size={40} style={{ margin: '0 auto 0.75rem', color: '#10b981' }} />
              <p style={{ fontWeight: 600, color: '#1e293b' }}>
                All Requests Dispatched!
              </p>
              <p style={{ fontSize: '0.85rem' }}>
                Incoming user tickets will appear here for fair odds evaluation and dispatch.
              </p>
            </div>
          ) : (
            pendingRequests.map((req) => (
              <div key={req.id} className="ticket-item">
                <div className="ticket-top">
                  <div>
                    <span className="ticket-id">{req.ticketNumber}</span>
                    <div className="ticket-title">{req.title}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <span className={`badge badge-urgent-${req.urgency || 'medium'}`}>
                      {(req.urgency || 'medium').toUpperCase()}
                    </span>
                    <span className="badge badge-pending_admin">Awaiting Dispatch</span>
                  </div>
                </div>

                <div className="ticket-desc">{req.description}</div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1rem',
                    background: '#f8fafc',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    margin: '0.75rem 0',
                  }}
                >
                  <div style={{ fontSize: '0.85rem' }}>
                    <strong>Requester:</strong> {req.requesterName} ({req.requesterDept})
                    <span style={{ margin: '0 8px', color: '#cbd5e1' }}>|</span>
                    <strong>Location:</strong> {req.locationBuilding}, {req.locationFloor}, {req.locationRoom}
                  </div>

                  <button
                    className="btn btn-primary"
                    onClick={() => handleOpenDispatchModal(req)}
                    disabled={unoccupiedTechs.length === 0}
                  >
                    <Zap size={16} />
                    <span>Evaluate & Dispatch IT Guy</span>
                  </button>
                </div>

                {unoccupiedTechs.length === 0 && (
                  <div
                    style={{
                      fontSize: '0.8rem',
                      color: '#dc2626',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <AlertTriangle size={14} />
                    <span>All IT servicemen are currently occupied or absent. Technicians will re-enter queue upon session termination.</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: SERVICEMEN ROSTER & ATTENDANCE MANAGEMENT */}
      {activeTab === 'roster' && (
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">
                <Users size={18} style={{ color: '#2563eb' }} />
                <span>IT Servicemen Roster & Supervisor Attendance Control</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                Only Administrators can change technician status to Absent or restore them back to Unoccupied.
              </p>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Technician</th>
                  <th>Current Status</th>
                  <th>Round {odds?.roundNumber || 1} Turn</th>
                  <th>Completed</th>
                  <th>Admin Attendance Action</th>
                </tr>
              </thead>
              <tbody>
                {technicians.map((tech) => {
                  const isAssignedInRound = tech.currentRoundAssignments > 0;
                  return (
                    <tr key={tech.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <img
                            src={tech.avatarUrl}
                            alt={tech.name}
                            style={{
                              width: '38px',
                              height: '38px',
                              borderRadius: '50%',
                              objectFit: 'cover',
                            }}
                          />
                          <div>
                            <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>
                              {tech.name}
                            </strong>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                              {tech.phone}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className={`badge badge-${tech.status}`}>
                          {tech.status.toUpperCase()}
                        </span>
                      </td>

                      <td>
                        {tech.status === 'absent' ? (
                          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                            Excluded (Absent)
                          </span>
                        ) : isAssignedInRound ? (
                          <span
                            style={{
                              fontSize: '0.8rem',
                              color: '#d97706',
                              fontWeight: 600,
                            }}
                          >
                            Dispatched ({tech.currentRoundAssignments}x)
                          </span>
                        ) : (
                          <span
                            style={{
                              fontSize: '0.8rem',
                              color: '#059669',
                              fontWeight: 600,
                            }}
                          >
                            ⭐ Fresh Turn Available
                          </span>
                        )}
                      </td>

                      <td>
                        <strong style={{ fontSize: '0.85rem' }}>
                          {tech.totalCompletedJobs} jobs
                        </strong>
                      </td>

                      <td>
                        {/* Admin-Only Attendance Actions */}
                        {tech.status === 'unoccupied' && (
                          <button
                            className="btn btn-danger btn-sm"
                            title="Mark technician absent (leaves duty / sick / out of area)"
                            onClick={() => toggleAttendance(tech.id, 'absent')}
                          >
                            <UserX size={14} />
                            <span>Mark Absent</span>
                          </button>
                        )}

                        {tech.status === 'absent' && (
                          <button
                            className="btn btn-success btn-sm"
                            title="Mark technician back to work"
                            onClick={() => toggleAttendance(tech.id, 'unoccupied')}
                          >
                            <UserCheck size={14} />
                            <span>Mark Back to Work</span>
                          </button>
                        )}

                        {tech.status === 'occupied' && (
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '0.8rem',
                              color: '#64748b',
                            }}
                          >
                            <Lock size={14} style={{ color: '#d97706' }} />
                            <span>Locked (Attending Job)</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Shield size={18} style={{ color: '#2563eb' }} />
              <span>Immutable System Audit Trail</span>
            </div>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Real-Time Activity Stream
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Actor</th>
                  <th>Role</th>
                  <th>Action</th>
                  <th>Event Details</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log) => (
                  <tr key={log.id}>
                    <td style={{ fontSize: '0.8rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                      {new Date(log.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>
                    <td>
                      <strong style={{ fontSize: '0.85rem' }}>{log.actorName}</strong>
                    </td>
                    <td>
                      <span className="badge badge-session_terminated">{log.actorRole}</span>
                    </td>
                    <td>
                      <code style={{ fontSize: '0.8rem' }}>{log.action}</code>
                    </td>
                    <td style={{ fontSize: '0.85rem', color: '#334155' }}>{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* FAIR ROUND-ROBIN ODDS EVALUATION & DISPATCH MODAL */}
      {dispatchModalTicket && odds && (
        <div
          className="modal-overlay"
          onClick={() => setDispatchModalTicket(null)}
        >
          <div
            className="modal-dialog"
            style={{ maxWidth: '720px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <div className="modal-title">
                  ⚡ Fair Odds Dispatch Evaluation
                </div>
                <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '2px' }}>
                  Target Ticket: <strong>{dispatchModalTicket.ticketNumber}</strong> • {dispatchModalTicket.title}
                </div>
              </div>
              <button
                className="icon-btn"
                onClick={() => setDispatchModalTicket(null)}
              >
                ✕
              </button>
            </div>

            {/* Requester & Location Summary */}
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '0.75rem 1rem',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.85rem',
              }}
            >
              <div>
                <strong>Requester:</strong> {dispatchModalTicket.requesterName} ({dispatchModalTicket.requesterDept})
              </div>
              <div>
                <strong>Destination:</strong> {dispatchModalTicket.locationBuilding} • {dispatchModalTicket.locationRoom}
              </div>
            </div>

            {/* Algorithmic Logic Explanation Callout */}
            <div
              style={{
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: '8px',
                padding: '0.75rem 1rem',
                marginBottom: '1.25rem',
                fontSize: '0.825rem',
                color: '#1e40af',
                lineHeight: 1.4,
              }}
            >
              <strong>Fair Iteration Round-Robin Rules Applied:</strong>
              <ul style={{ margin: '4px 0 0 1.25rem', padding: 0 }}>
                <li>Candidates are strictly filtered for <strong>UNOCCUPIED</strong> technicians.</li>
                <li>The first technician displayed has the <strong>HIGHEST ODDS</strong> (selected earlier / longest idle awaiting turn).</li>
                <li>When assigned, their odds drop dramatically until all other eligible servicemen complete their turn in Round {odds.roundNumber}.</li>
              </ul>
            </div>

            {/* Ranked Candidates List */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: '#334155',
                  marginBottom: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span>Available Servicemen Ordered by Highest Odds:</span>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Round {odds.roundNumber} ({odds.candidates.length} Available)
                </span>
              </div>

              {odds.candidates.length === 0 ? (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '2rem',
                    color: '#94a3b8',
                    background: '#f8fafc',
                    borderRadius: '8px',
                  }}
                >
                  <AlertTriangle size={32} style={{ margin: '0 auto 0.5rem', color: '#ef4444' }} />
                  <p style={{ fontWeight: 600, color: '#1e293b' }}>
                    No Unoccupied Technicians Available
                  </p>
                  <p style={{ fontSize: '0.85rem' }}>
                    All technicians are currently occupied or absent.
                  </p>
                </div>
              ) : (
                odds.candidates.map((candidate: RankedITGuy) => {
                  const isSelected = selectedTechId === candidate.technicianId;
                  return (
                    <div
                      key={candidate.technicianId}
                      className={`odds-card ${candidate.isHighestOdds ? 'top-recommendation' : ''}`}
                      onClick={() => setSelectedTechId(candidate.technicianId)}
                      style={{
                        cursor: 'pointer',
                        borderColor: isSelected ? '#2563eb' : undefined,
                        boxShadow: isSelected ? '0 0 0 2px #2563eb' : undefined,
                      }}
                    >
                      <input
                        type="radio"
                        name="technicianSelect"
                        checked={isSelected}
                        onChange={() => setSelectedTechId(candidate.technicianId)}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      />

                      <div className={`odds-rank-badge ${candidate.isHighestOdds ? 'top' : ''}`}>
                        #{candidate.rank}
                      </div>

                      <img
                        src={candidate.avatarUrl}
                        alt={candidate.name}
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                        }}
                      />

                      <div className="odds-info">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>
                            {candidate.name}
                          </strong>
                          {candidate.isHighestOdds && (
                            <span className="badge badge-assigned" style={{ fontSize: '0.7rem' }}>
                              ⭐ Top Odds
                            </span>
                          )}
                          {candidate.hasBeenAssignedInRound && (
                            <span className="badge badge-occupied" style={{ fontSize: '0.7rem' }}>
                              Decayed Odds (Already Dispatched in Round)
                            </span>
                          )}
                        </div>

                        <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                          Idle: {candidate.idleMinutesFormatted}
                        </div>

                        <div className="odds-percentage-bar-bg">
                          <div
                            className="odds-percentage-bar-fill"
                            style={{ width: `${candidate.oddsPercentage}%` }}
                          />
                        </div>

                        <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '4px' }}>
                          {candidate.explanation}
                        </div>
                      </div>

                      <div className="odds-value-display">
                        <div className="odds-pct-text">{candidate.oddsPercentage}%</div>
                        <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Selection Odds</div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Actions */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderTop: '1px solid #f1f5f9',
                paddingTop: '1rem',
              }}
            >
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Pushing notification will dispatch technician immediately.
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  className="btn btn-secondary"
                  onClick={() => setDispatchModalTicket(null)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleConfirmDispatch}
                  disabled={!selectedTechId || dispatching}
                >
                  <Zap size={16} />
                  <span>
                    {dispatching ? 'Assigning...' : 'Push Notification & Assign'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

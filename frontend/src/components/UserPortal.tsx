import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import {
  Send,
  Sparkles,
  Clock,
  MapPin,
  CheckCircle2,
  Wrench,
  HelpCircle,
  ShieldCheck,
} from "lucide-react";

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

  // Single Input Form State
  const [issueDescription, setIssueDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Termination Modal State
  const [isTerminating, setIsTerminating] = useState(false);

  // Filter requests for this user
  const userRequests = requests.filter((r) => r.requesterId === currentUser.id);

  // Find any ticket awaiting user termination
  const pendingTerminationTicket = userRequests.find(
    (r) => r.status === "completed_by_it" || r.status === "pending_verification",
  );

  const presets = [
    {
      label: "🖥️ Monitor Flickering",
      desc: "Workstation secondary monitor flickers intermittently. External monitor blacking out every 3 minutes while running business applications.",
    },
    {
      label: "📶 WiFi Dropping",
      desc: "Workstation loses office WiFi association repeatedly during client calls and meetings.",
    },
    {
      label: "🖨️ Printer Jam",
      desc: "Department printer tray feeder jammed. Paper misfeed error displayed on floor main multifunction printer.",
    },
    {
      label: "🔊 AV Zoom Echo",
      desc: "Conference room audio echo and feedback loop. Microphone ceiling array capturing speaker feedback in Teams/Zoom.",
    },
    {
      label: "🔑 VPN & Access Lock",
      desc: "Corporate VPN token synchronization failure. User locked out of corporate subnet and remote gateway.",
    },
  ];

  const applyPreset = (preset: (typeof presets)[0]) => {
    setIssueDescription(preset.desc);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueDescription.trim()) return;

    setSubmitting(true);
    try {
      await createRequest({
        description: issueDescription.trim(),
      });
      setIssueDescription("");
    } catch (err) {
      console.error("Error creating request:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmTermination = async () => {
    if (!terminationModalTicket) return;
    const ticketId =
      terminationModalTicket.id || (terminationModalTicket as any).requestId;
    if (!ticketId) return;

    setIsTerminating(true);
    try {
      await terminateSession(ticketId);
    } catch (err) {
      console.error("Error terminating session:", err);
    } finally {
      setIsTerminating(false);
    }
  };

  const renderStepper = (status: string) => {
    const steps = [
      { key: "pending_admin", label: "Requested" },
      { key: "assigned", label: "Dispatched" },
      { key: "in_progress", label: "On-Site" },
      { key: "completed_by_it", label: "Completed" },
      { key: "session_terminated", label: "Closed" },
    ];

    const getStepIndex = (s: string) => {
      switch (s) {
        case "pending_admin":
        case "pending":
          return 0;
        case "assigned":
          return 1;
        case "in_progress":
          return 2;
        case "completed_by_it":
        case "pending_verification":
          return 3;
        case "session_terminated":
        case "completed":
          return 4;
        default:
          return 0;
      }
    };

    const currentIndex = getStepIndex(status);

    return (
      <div className="stepper">
        {steps.map((step, idx) => {
          const isDone =
            idx < currentIndex ||
            status === "session_terminated" ||
            status === "completed";
          const isActive = idx === currentIndex;
          return (
            <div
              key={step.key}
              className={`step-node ${isDone ? "completed" : ""} ${isActive ? "active" : ""}`}
            >
              <div className="step-circle">{isDone ? "✓" : idx + 1}</div>
              <span className="step-label">{step.label}</span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
      {/* Requester Identity Banner */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "12px",
          padding: "1rem 1.25rem",
          marginBottom: "1.5rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <img
            src={currentUser.avatarUrl}
            alt={currentUser.name}
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              objectFit: "cover",
            }}
          />
          <div>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 700, margin: 0 }}>
              {currentUser.name}
            </h2>
            <div style={{ fontSize: "0.85rem", color: "#64748b" }}>
              {currentUser.department} • {currentUser.building},{" "}
              {currentUser.room}
            </div>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div
            style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "4px" }}
          >
            {userRequests.length} Total Submissions
          </div>
        </div>
      </div>

      {/* Golden Action Required Banner if ticket awaits session termination */}
      {pendingTerminationTicket && (
        <div className="alert-banner alert-banner-golden">
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Sparkles size={28} style={{ color: "#d97706", flexShrink: 0 }} />
            <div>
              <div className="alert-banner-title">
                Action Required: IT Serviceman Finished Repair on{" "}
                {pendingTerminationTicket.ticketNumber}
              </div>
              <div style={{ fontSize: "0.875rem", marginTop: "2px" }}>
                Technician{" "}
                <strong>
                  {pendingTerminationTicket.assignedTechnicianName}
                </strong>{" "}
                completed the work. Please inspect your system and terminate the
                session to release the technician back to available status.
              </div>
            </div>
          </div>
          <button
            className="btn btn-warning"
            style={{ whiteSpace: "nowrap", fontWeight: 700 }}
            onClick={() => setTerminationModalTicket(pendingTerminationTicket)}
          >
            <ShieldCheck size={16} />
            <span>Terminate Session</span>
          </button>
        </div>
      )}

      {/* Intake Form */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <Send size={18} style={{ color: "#2563eb" }} />
            <span>Submit IT Service Request</span>
          </div>
          <span style={{ fontSize: "0.8rem", color: "#64748b" }}>
            Auto-dispatched via Fair Odds System
          </span>
        </div>

        {/* Quick Issue Presets */}
        <div style={{ marginBottom: "1.25rem" }}>
          <div
            style={{
              fontSize: "0.8rem",
              fontWeight: 600,
              color: "#64748b",
              marginBottom: "0.5rem",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <Sparkles size={14} style={{ color: "#2563eb" }} />
            <span>Quick Issue Presets (Click to autofill):</span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {presets.map((p, i) => (
              <button
                key={i}
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => applyPreset(p)}
                style={{ fontSize: "0.8rem" }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Simplified Single Input Submission Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">
              Describe your issue or service request
            </label>
            <textarea
              className="form-textarea"
              rows={4}
              placeholder="Describe what occurred, any error messages, and troubleshooting steps already tried..."
              value={issueDescription}
              onChange={(e) => setIssueDescription(e.target.value)}
              required
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting || !issueDescription.trim()}
            >
              <Send size={16} />
              <span>
                {submitting ? "Submitting..." : "Submit Service Request"}
              </span>
            </button>
          </div>
        </form>
      </div>

      {/* My Service Requests */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <Clock size={18} style={{ color: "#2563eb" }} />
            <span>My Service Tickets ({userRequests.length})</span>
          </div>
        </div>

        {userRequests.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "3rem 1rem",
              color: "#94a3b8",
            }}
          >
            <HelpCircle
              size={40}
              style={{ margin: "0 auto 0.75rem", opacity: 0.5 }}
            />
            <p style={{ fontWeight: 600 }}>No requests submitted yet</p>
            <p style={{ fontSize: "0.85rem" }}>
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
                <div
                  style={{ display: "flex", gap: "6px", alignItems: "center" }}
                >
                  <span className={`badge badge-${req.status}`}>
                    {req.status === "session_terminated"
                      ? "COMPLETED"
                      : req.status.replace(/_/g, " ")}
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
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    padding: "0.75rem 1rem",
                    margin: "0.75rem 0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "8px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <Wrench size={18} style={{ color: "#2563eb" }} />
                    <span style={{ fontSize: "0.85rem", color: "#475569" }}>
                      Assigned IT Serviceman:
                    </span>
                    <strong style={{ fontSize: "0.85rem", color: "#0f172a" }}>
                      {req.assignedTechnicianName}
                    </strong>
                    {req.assignedTechnicianPhone && (
                      <span style={{ fontSize: "0.8rem", color: "#64748b" }}>
                        ({req.assignedTechnicianPhone})
                      </span>
                    )}
                  </div>

                  {(req.status === "assigned" ||
                    req.status === "in_progress" ||
                    req.status === "completed_by_it" ||
                    req.status === "pending_verification") && (
                    <button
                      className="btn btn-warning btn-sm"
                      onClick={() => setTerminationModalTicket(req)}
                    >
                      <ShieldCheck size={14} />
                      <span>Terminate Session</span>
                    </button>
                  )}
                </div>
              )}

              {/* Resolution Notes Review if completed */}
              {req.resolutionNotes && (
                <div
                  style={{
                    background: "#ecfdf5",
                    border: "1px solid #a7f3d0",
                    borderRadius: "8px",
                    padding: "0.75rem 1rem",
                    margin: "0.5rem 0",
                    fontSize: "0.85rem",
                    color: "#065f46",
                  }}
                >
                  <strong>Technician Resolution Notes:</strong>{" "}
                  {req.resolutionNotes}
                </div>
              )}

              <div className="ticket-meta">
                <div className="ticket-meta-item">
                  <MapPin size={14} />
                  <span>
                    {req.locationBuilding} • {req.locationFloor} •{" "}
                    {req.locationRoom}
                  </span>
                </div>
                <div className="ticket-meta-item">
                  <Clock size={14} />
                  <span>
                    Submitted{" "}
                    {new Date(req.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Session Termination Modal */}
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
                <div
                  style={{
                    fontSize: "0.85rem",
                    color: "#64748b",
                    marginTop: "2px",
                  }}
                >
                  Ticket {terminationModalTicket.ticketNumber}:{" "}
                  {terminationModalTicket.title}
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
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                padding: "1rem",
                marginBottom: "1.25rem",
              }}
            >
              <div
                style={{
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  color: "#334155",
                }}
              >
                Technician's Repair Summary:
              </div>
              <p
                style={{
                  fontSize: "0.9rem",
                  color: "#1e293b",
                  marginTop: "4px",
                  fontStyle: "italic",
                }}
              >
                "
                {terminationModalTicket.resolutionNotes ||
                  "Repairs completed and hardware verified on-site."}
                "
              </p>
              <div
                style={{
                  fontSize: "0.8rem",
                  color: "#64748b",
                  marginTop: "6px",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <CheckCircle2 size={14} style={{ color: "#10b981" }} />
                <span>
                  Assigned Technician:{" "}
                  {terminationModalTicket.assignedTechnicianName}
                </span>
              </div>
            </div>

            <div
              style={{
                background: "#eff6ff",
                border: "1px solid #bfdbfe",
                borderRadius: "8px",
                padding: "0.75rem 1rem",
                marginBottom: "1.25rem",
                fontSize: "0.85rem",
                color: "#1e40af",
              }}
            >
              ℹ️ <strong>System Enforcement Notice:</strong> Clicking confirm
              will close this ticket and return technician{" "}
              <strong>{terminationModalTicket.assignedTechnicianName}</strong>{" "}
              to <strong>UNOCCUPIED</strong> status so they can assist other
              employees.
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "8px",
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
                  {isTerminating
                    ? "Releasing Technician..."
                    : "Confirm & Free Technician"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

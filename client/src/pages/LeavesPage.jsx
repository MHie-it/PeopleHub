import { useCallback, useEffect, useMemo, useState } from "react";
import { DataState } from "../components/DataState";
import { PageHeader } from "../components/PageHeader";
import { useAuth } from "../hooks/useAuth";
import { extractErrorMessage } from "../lib/errors";
import { formatDate } from "../lib/formatters";
import { APP_ROLES, hasRole } from "../lib/roles";
import {
  bossActionLeave,
  createLeave,
  getLeaves,
  leaderActionLeave } from
"../services/leaveService";

const leaveTypes = ["ANNUAL", "SICK", "UNPAID", "OTHER"];

const LEAVE_TYPE_LABELS = {
  ANNUAL: "Annual",
  SICK: "Sick",
  UNPAID: "Unpaid",
  OTHER: "Other"
};

const leaderActionRoles = [
APP_ROLES.LEADER,
APP_ROLES.MANAGER,
APP_ROLES.HR,
APP_ROLES.ADMIN,
APP_ROLES.ADMIN_UPPER];



const leavePrivilegedRoles = [
APP_ROLES.HR,
APP_ROLES.ADMIN,
APP_ROLES.ADMIN_UPPER,
APP_ROLES.MANAGER,
APP_ROLES.LEADER,
APP_ROLES.DIRECTOR,
APP_ROLES.BOSS];


const bossActionRoles = [APP_ROLES.DIRECTOR, APP_ROLES.BOSS];

function leaveTypeLabel(code) {
  return LEAVE_TYPE_LABELS[code] || code || "—";
}

function leaveStatusClass(status) {
  const s = (status || "").toUpperCase();
  if (s === "APPROVED") {
    return "leave-status leave-status--approved";
  }
  if (s === "PENDING") {
    return "leave-status leave-status--pending";
  }
  if (s === "PENDING_HR") {
    return "leave-status leave-status--pending-hr";
  }
  if (s === "REJECTED_MANAGER" || s === "REJECTED_HR") {
    return "leave-status leave-status--rejected";
  }
  return "leave-status leave-status--neutral";
}

function LeaveCalendarIcon() {
  return (
    <svg className="leaves-page-icon" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 9h18M8 5V3M16 5V3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="12" cy="14" r="1.5" fill="currentColor" />
    </svg>);

}

export function LeavesPage() {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    leaveType: "ANNUAL",
    fromDate: "",
    toDate: "",
    reason: ""
  });

  const seesAllLeaves = hasRole(user, leavePrivilegedRoles);
  const canLeaderApprove = hasRole(user, leaderActionRoles);
  const canBossApprove = hasRole(user, bossActionRoles);

  const countLabel = useMemo(() => {
    const n = leaves.length;
    if (n === 0) {
      return "";
    }
    return n === 1 ? "1 request" : `${n} requests`;
  }, [leaves.length]);

  const loadLeaves = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const payload = await getLeaves();
      setLeaves(payload?.data || []);
    } catch (loadError) {
      setError(extractErrorMessage(loadError, "Unable to load leave requests"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLeaves();
  }, [loadLeaves]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  async function handleCreateLeave(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      await createLeave(form);
      setForm({ leaveType: "ANNUAL", fromDate: "", toDate: "", reason: "" });
      setMessage("Leave request submitted.");
      await loadLeaves();
    } catch (submitError) {
      setError(extractErrorMessage(submitError, "Unable to create leave request"));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLeaderAction(id, action) {
    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      const note = window.prompt("Optional note (leader step)", "") || "";
      await leaderActionLeave(id, { action, note });
      setMessage(
        action === "APPROVE" ? "Moved to HR/Boss for approval." : "Rejected at leader step."
      );
      await loadLeaves();
    } catch (actionError) {
      setError(extractErrorMessage(actionError, `Unable to ${action}`));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleBossAction(id, action) {
    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      const note = window.prompt("Optional note (boss/HR step)", "") || "";
      await bossActionLeave(id, { action, note });
      setMessage(action === "APPROVE" ? "Request approved." : "Request rejected.");
      await loadLeaves();
    } catch (actionError) {
      setError(extractErrorMessage(actionError, `Unable to ${action}`));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="page-card leaves-page">
      <div className="leaves-page-intro">
        <div className="leaves-page-intro-visual" aria-hidden>
          <LeaveCalendarIcon />
        </div>
        <div className="leaves-page-intro-text">
          <PageHeader
            title="Leave requests"
            subtitle={
            seesAllLeaves ?
            "View and process requests as Leader, HR, or Boss." :
            "Only your own leave requests are shown. Submit a new request below."
            } />
          
          {countLabel ? <p className="leaves-count-pill">{countLabel}</p> : null}
        </div>
      </div>

      <div className="leave-form-panel">
        <h3 className="leave-form-panel__title">New leave request</h3>
        <form className="form-grid leave-form-grid" onSubmit={handleCreateLeave}>
          <label>
            Leave type
            <select name="leaveType" value={form.leaveType} onChange={handleChange} required>
              {leaveTypes.map((item) =>
              <option key={item} value={item}>
                  {leaveTypeLabel(item)}
                </option>
              )}
            </select>
          </label>

          <label>
            From date
            <input type="date" name="fromDate" value={form.fromDate} onChange={handleChange} required />
          </label>

          <label>
            To date
            <input type="date" name="toDate" value={form.toDate} onChange={handleChange} required />
          </label>

          <label className="full-width">
            Reason
            <input name="reason" value={form.reason} onChange={handleChange} placeholder="Optional" />
          </label>

          <div className="full-width actions-inline">
            <button type="submit" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit leave request"}
            </button>
          </div>
        </form>
      </div>

      {message ? <p className="status-note success">{message}</p> : null}

      <DataState
        loading={loading}
        error={error}
        empty={!loading && !error && leaves.length === 0}
        emptyMessage={seesAllLeaves ? "No leave requests yet." : "You have no leave requests yet."}>
        
        {seesAllLeaves ?
        <div className="table-scroll leaves-table-wrap">
            <table className="leaves-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Type</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Days</th>
                  <th>Status</th>
                  <th>Reason</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {leaves.map((leave) =>
              <tr key={leave._id}>
                    <td>
                      <span className="leaves-emp-name">{leave.employee?.fullName || "—"}</span>
                      <span className="leaves-emp-code">{leave.employee?.employeeCode || ""}</span>
                    </td>
                    <td>{leaveTypeLabel(leave.leaveType)}</td>
                    <td>{formatDate(leave.fromDate)}</td>
                    <td>{formatDate(leave.toDate)}</td>
                    <td>{leave.totalDays ?? "—"}</td>
                    <td>
                      <span className={leaveStatusClass(leave.status)}>{leave.status || "—"}</span>
                    </td>
                    <td className="leaves-reason-cell">{leave.reason || "—"}</td>
                    <td>
                      <div className="actions-inline">
                        {leave.status === "PENDING" && canLeaderApprove ?
                    <>
                            <button
                        type="button"
                        disabled={submitting}
                        onClick={() => handleLeaderAction(leave._id, "APPROVE")}>
                        
                              Leader approve
                            </button>
                            <button
                        type="button"
                        className="ghost-button"
                        disabled={submitting}
                        onClick={() => handleLeaderAction(leave._id, "REJECT")}>
                        
                              Leader reject
                            </button>
                          </> :
                    null}

                        {leave.status === "PENDING_HR" && canBossApprove ?
                    <>
                            <button
                        type="button"
                        disabled={submitting}
                        onClick={() => handleBossAction(leave._id, "APPROVE")}>
                        
                              Boss approve
                            </button>
                            <button
                        type="button"
                        className="ghost-button"
                        disabled={submitting}
                        onClick={() => handleBossAction(leave._id, "REJECT")}>
                        
                              Boss reject
                            </button>
                          </> :
                    null}
                      </div>
                    </td>
                  </tr>
              )}
              </tbody>
            </table>
          </div> :

        <div className="leave-cards">
            {leaves.map((leave) =>
          <article className="leave-card" key={leave._id}>
                <header className="leave-card__head">
                  <div>
                    <p className="leave-card__label">Leave type</p>
                    <p className="leave-card__type">{leaveTypeLabel(leave.leaveType)}</p>
                  </div>
                  <span className={leaveStatusClass(leave.status)}>{leave.status || "—"}</span>
                </header>
                <div className="leave-card__body">
                  <div className="leave-card__stat">
                    <span className="leave-card__dt">From</span>
                    <span className="leave-card__dd">{formatDate(leave.fromDate)}</span>
                  </div>
                  <div className="leave-card__stat">
                    <span className="leave-card__dt">To</span>
                    <span className="leave-card__dd">{formatDate(leave.toDate)}</span>
                  </div>
                  <div className="leave-card__stat leave-card__stat--days">
                    <span className="leave-card__dt">Days</span>
                    <span className="leave-card__dd leave-card__days">{leave.totalDays ?? "—"}</span>
                  </div>
                </div>
                {leave.reason ?
            <footer className="leave-card__notes">
                    <span className="leave-card__notes-label">Reason</span>
                    <p>{leave.reason}</p>
                  </footer> :
            null}
              </article>
          )}
          </div>
        }
      </DataState>
    </section>);

}
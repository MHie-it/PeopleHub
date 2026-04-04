import { useEffect, useState } from "react";
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
  leaderActionLeave,
} from "../services/leaveService";

const leaveTypes = ["ANNUAL", "SICK", "UNPAID", "OTHER"];
const leaderActionRoles = [
  APP_ROLES.LEADER,
  APP_ROLES.MANAGER,
  APP_ROLES.HR,
  APP_ROLES.ADMIN,
  APP_ROLES.ADMIN_UPPER,
  APP_ROLES.DIRECTOR,
  APP_ROLES.BOSS,
];
const bossActionRoles = [APP_ROLES.DIRECTOR, APP_ROLES.BOSS];

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
    reason: "",
  });

  const canLeaderApprove = hasRole(user, leaderActionRoles);
  const canBossApprove = hasRole(user, bossActionRoles);

  async function loadLeaves() {
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
  }

  useEffect(() => {
    loadLeaves();
  }, []);

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
      setMessage("Leave request created successfully.");
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
      const note = window.prompt("Optional note for leader action", "") || "";
      await leaderActionLeave(id, { action, note });
      setMessage(`Leader action ${action} applied.`);
      await loadLeaves();
    } catch (actionError) {
      setError(extractErrorMessage(actionError, `Unable to ${action} leave request`));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleBossAction(id, action) {
    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      const note = window.prompt("Optional note for boss action", "") || "";
      await bossActionLeave(id, { action, note });
      setMessage(`Boss action ${action} applied.`);
      await loadLeaves();
    } catch (actionError) {
      setError(extractErrorMessage(actionError, `Unable to ${action} leave request`));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="page-card">
      <PageHeader title="Leave Requests" subtitle="Data source: /leaves" />

      <form className="form-grid" onSubmit={handleCreateLeave}>
        <label>
          Leave type
          <select name="leaveType" value={form.leaveType} onChange={handleChange} required>
            {leaveTypes.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
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
          <input name="reason" value={form.reason} onChange={handleChange} placeholder="Optional reason" />
        </label>

        <div className="full-width actions-inline">
          <button type="submit" disabled={submitting}>
            {submitting ? "Submitting..." : "Create leave request"}
          </button>
        </div>
      </form>

      {error ? <p className="status-note error">{error}</p> : null}
      {message ? <p className="status-note success">{message}</p> : null}

      <DataState
        loading={loading}
        error={error}
        empty={!loading && !error && leaves.length === 0}
        emptyMessage="No leave requests found."
      >
        <div className="table-scroll">
          <table>
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
              {leaves.map((leave) => (
                <tr key={leave._id}>
                  <td>{leave.employee?.fullName || leave.employee?._id || "-"}</td>
                  <td>{leave.leaveType || "-"}</td>
                  <td>{formatDate(leave.fromDate)}</td>
                  <td>{formatDate(leave.toDate)}</td>
                  <td>{leave.totalDays ?? "-"}</td>
                  <td>{leave.status || "-"}</td>
                  <td>{leave.reason || "-"}</td>
                  <td>
                    <div className="actions-inline">
                      {leave.status === "PENDING" && canLeaderApprove ? (
                        <>
                          <button
                            type="button"
                            disabled={submitting}
                            onClick={() => handleLeaderAction(leave._id, "APPROVE")}
                          >
                            Leader approve
                          </button>
                          <button
                            type="button"
                            className="ghost-button"
                            disabled={submitting}
                            onClick={() => handleLeaderAction(leave._id, "REJECT")}
                          >
                            Leader reject
                          </button>
                        </>
                      ) : null}

                      {leave.status === "PENDING_HR" && canBossApprove ? (
                        <>
                          <button
                            type="button"
                            disabled={submitting}
                            onClick={() => handleBossAction(leave._id, "APPROVE")}
                          >
                            Boss approve
                          </button>
                          <button
                            type="button"
                            className="ghost-button"
                            disabled={submitting}
                            onClick={() => handleBossAction(leave._id, "REJECT")}
                          >
                            Boss reject
                          </button>
                        </>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DataState>
    </section>
  );
}

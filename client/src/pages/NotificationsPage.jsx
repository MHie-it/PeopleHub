import { useEffect, useState } from "react";
import { DataState } from "../components/DataState";
import { PageHeader } from "../components/PageHeader";
import { useAuth } from "../hooks/useAuth";
import { useSocket } from "../context/SocketContext";
import { extractErrorMessage } from "../lib/errors";
import { formatDateTime } from "../lib/formatters";
import { APP_ROLES, hasRole } from "../lib/roles";
import {
  createNotification,
  createGlobalNotification,
  getNotificationsByUser,
  markNotificationRead
} from
  "../services/notificationService";

const notificationTypes = [
  "LEAVE_REQUEST_CREATED",
  "LEAVE_REQUEST_APPROVED",
  "LEAVE_REQUEST_REJECTED",
  "PAYROLL_GENERATED",
  "SYSTEM"];


export function NotificationsPage() {
  const { user } = useAuth();
  const socket = useSocket();
  const userId = user?._id || "";

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [sendGlobal, setSendGlobal] = useState(false);
  const [error, setError] = useState("");
  const canSendGlobal = hasRole(user, [APP_ROLES.HR, APP_ROLES.ADMIN, APP_ROLES.MANAGER, APP_ROLES.BOSS, APP_ROLES.DIRECTOR]);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    receiver: userId,
    type: "SYSTEM",
    title: "",
    message: ""
  });

  useEffect(() => {
    setForm((previous) => ({ ...previous, receiver: userId }));
  }, [userId]);

  useEffect(() => {
    if (!socket) return;

    function handleNewNotification(notifi) {
      setNotifications((prev) => [notifi, ...prev]);
    }

    socket.on("notification", handleNewNotification);
    return () => {
      socket.off("notification", handleNewNotification);
    };
  }, [socket]);

  async function loadNotifications() {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const payload = await getNotificationsByUser(userId);
      setNotifications(payload?.data || []);
    } catch (loadError) {
      setError(extractErrorMessage(loadError, "Unable to load notifications"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotifications();
  }, [userId]);

  function handleFormChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  async function handleCreateNotification(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      if (sendGlobal && canSendGlobal) {
        await createGlobalNotification({ type: form.type, title: form.title, message: form.message });
        setMessage("Broadcast notification sent successfully.");
      } else {
        await createNotification({ ...form, receiver: form.receiver || userId });
        setMessage("Notification created successfully.");
      }

      setForm({ receiver: userId, type: "SYSTEM", title: "", message: "" });
      setSendGlobal(false);
      await loadNotifications();
    } catch (submitError) {
      setError(extractErrorMessage(submitError, "Unable to create notification"));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleMarkRead(id) {
    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      await markNotificationRead(id);
      setMessage("Notification marked as read.");
      await loadNotifications();
    } catch (actionError) {
      setError(extractErrorMessage(actionError, "Unable to mark notification as read"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="page-card">
      <PageHeader title="Notifications" subtitle="Data source: /notifi" />

      {hasRole(user, [APP_ROLES.ADMIN, APP_ROLES.HR, APP_ROLES.MANAGER, APP_ROLES.BOSS, APP_ROLES.DIRECTOR, APP_ROLES.LEADER]) && (
        <form className="form-grid" onSubmit={handleCreateNotification}>
          {canSendGlobal && (
            <label className="full-width" style={{ flexDirection: "row", alignItems: "center", gap: "0.5rem" }}>
              <input type="checkbox" checked={sendGlobal} onChange={(e) => setSendGlobal(e.target.checked)} />
              <span>Broadcast to all employees (Send to all)</span>
            </label>
          )}
          <label>
            Receiver user ID
            <input name="receiver" value={sendGlobal ? "ALL USERS" : form.receiver} onChange={handleFormChange} required={!sendGlobal} disabled={sendGlobal} />
          </label>
          <label>
            Type
            <select name="type" value={form.type} onChange={handleFormChange}>
              {notificationTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </label>
          <label className="full-width">
            Title
            <input name="title" value={form.title} onChange={handleFormChange} required />
          </label>
          <label className="full-width">
            Message
            <textarea name="message" value={form.message} onChange={handleFormChange} required />
          </label>
          <div className="full-width actions-inline">
            <button type="submit" disabled={submitting}>
              {submitting ? "Creating..." : "Create notification"}
            </button>
          </div>
        </form>
      )}

      {error ? <p className="status-note error">{error}</p> : null}
      {message ? <p className="status-note success">{message}</p> : null}

      <DataState
        loading={loading}
        error={error}
        empty={!loading && !error && notifications.length === 0}
        emptyMessage="No notifications found for this user.">

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Message</th>
                <th>Type</th>
                <th>Created</th>
                <th>Read</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {notifications.map((notification) =>
                <tr key={notification._id}>
                  <td>{notification.title || "-"}</td>
                  <td>{notification.message || "-"}</td>
                  <td>{notification.type || "SYSTEM"}</td>
                  <td>{formatDateTime(notification.createdAt)}</td>
                  <td>{notification.isRead ? "Yes" : "No"}</td>
                  <td>
                    {!notification.isRead ?
                      <button
                        type="button"
                        disabled={submitting}
                        onClick={() => handleMarkRead(notification._id)}>

                        Mark read
                      </button> :

                      "-"
                    }
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </DataState>
    </section>);

}
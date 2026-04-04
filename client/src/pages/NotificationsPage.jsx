import { useEffect, useState } from "react";
import { DataState } from "../components/DataState";
import { PageHeader } from "../components/PageHeader";
import { useAuth } from "../hooks/useAuth";
import { extractErrorMessage } from "../lib/errors";
import { formatDateTime } from "../lib/formatters";
import {
  createNotification,
  getNotificationsByUser,
  markNotificationRead,
} from "../services/notificationService";

const notificationTypes = [
  "LEAVE_REQUEST_CREATED",
  "LEAVE_REQUEST_APPROVED",
  "LEAVE_REQUEST_REJECTED",
  "PAYROLL_GENERATED",
  "SYSTEM",
];

export function NotificationsPage() {
  const { user } = useAuth();
  const userId = user?._id || "";

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    receiver: userId,
    type: "SYSTEM",
    title: "",
    message: "",
  });

  useEffect(() => {
    setForm((previous) => ({ ...previous, receiver: userId }));
  }, [userId]);

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
      await createNotification({ ...form, receiver: form.receiver || userId });
      setForm({ receiver: userId, type: "SYSTEM", title: "", message: "" });
      setMessage("Notification created successfully.");
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

      <form className="form-grid" onSubmit={handleCreateNotification}>
        <label>
          Receiver user ID
          <input name="receiver" value={form.receiver} onChange={handleFormChange} required />
        </label>

        <label>
          Type
          <select name="type" value={form.type} onChange={handleFormChange}>
            {notificationTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
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

      {error ? <p className="status-note error">{error}</p> : null}
      {message ? <p className="status-note success">{message}</p> : null}

      <DataState
        loading={loading}
        error={error}
        empty={!loading && !error && notifications.length === 0}
        emptyMessage="No notifications found for this user."
      >
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
              {notifications.map((notification) => (
                <tr key={notification._id}>
                  <td>{notification.title || "-"}</td>
                  <td>{notification.message || "-"}</td>
                  <td>{notification.type || "SYSTEM"}</td>
                  <td>{formatDateTime(notification.createdAt)}</td>
                  <td>{notification.isRead ? "Yes" : "No"}</td>
                  <td>
                    {!notification.isRead ? (
                      <button
                        type="button"
                        disabled={submitting}
                        onClick={() => handleMarkRead(notification._id)}
                      >
                        Mark read
                      </button>
                    ) : (
                      "-"
                    )}
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

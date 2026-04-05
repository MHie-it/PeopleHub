import { useEffect, useState } from "react";
import { DataState } from "../components/DataState";
import { PageHeader } from "../components/PageHeader";
import { useAuth } from "../hooks/useAuth";
import { extractErrorMessage } from "../lib/errors";
import { getRoles } from "../services/roleService";
import { deleteUser, getUsers, updateUser } from "../services/userService";

export function UsersPage() {
  const { user } = useAuth();

  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState("");
  const [editForm, setEditForm] = useState({
    email: "",
    fullName: "",
    role: "",
    status: false,
    password: "",
  });

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const [usersRes, rolesPayload] = await Promise.all([getUsers(), getRoles()]);
      setUsers(Array.isArray(usersRes?.data) ? usersRes.data : []);
      setRoles(Array.isArray(rolesPayload) ? rolesPayload.filter((r) => !r.isDeleted) : []);
    } catch (loadError) {
      setError(extractErrorMessage(loadError, "Unable to load users"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function startEdit(row) {
    setEditingId(row._id);
    setEditForm({
      email: row.email || "",
      fullName: row.fullName || "",
      role: row.role?._id || "",
      status: Boolean(row.status),
      password: "",
    });
  }

  function cancelEdit() {
    setEditingId("");
    setEditForm({ email: "", fullName: "", role: "", status: false, password: "" });
  }

  function handleEditChange(event) {
    const { name, value, type, checked } = event.target;
    if (type === "checkbox") {
      setEditForm((previous) => ({ ...previous, [name]: checked }));
    } else {
      setEditForm((previous) => ({ ...previous, [name]: value }));
    }
  }

  async function handleEditSubmit(event, id) {
    event.preventDefault();
    setError("");

    try {
      const payload = {
        email: editForm.email.trim(),
        fullName: editForm.fullName,
        role: editForm.role,
        status: editForm.status,
      };
      if (editForm.password.trim()) {
        payload.password = editForm.password.trim();
      }
      await updateUser(id, payload);
      cancelEdit();
      await loadData();
    } catch (submitError) {
      setError(extractErrorMessage(submitError, "Unable to update user"));
    }
  }

  async function handleDelete(id) {
    const confirmed = window.confirm("Vô hiệu hóa tài khoản này? (soft delete)");
    if (!confirmed) {
      return;
    }

    setError("");

    try {
      await deleteUser(id);
      await loadData();
    } catch (deleteError) {
      setError(extractErrorMessage(deleteError, "Unable to delete user"));
    }
  }

  const myId = user?._id ? String(user._id) : "";

  return (
    <section className="page-card">
      <PageHeader
        title="Users"
        subtitle="Quản lý tài khoản: admin, Manager, Boss — API /users"
      />

      {error ? <p className="status-note error">{error}</p> : null}

      <DataState
        loading={loading}
        error={error && !users.length ? error : ""}
        empty={!loading && !error && users.length === 0}
        emptyMessage="Chưa có người dùng."
      >
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Full name</th>
                <th>Role</th>
                <th>Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((row) => (
                <tr key={row._id}>
                  <td>{row.username}</td>
                  <td>
                    {editingId === row._id ? (
                      <input name="email" value={editForm.email} onChange={handleEditChange} />
                    ) : (
                      row.email
                    )}
                  </td>
                  <td>
                    {editingId === row._id ? (
                      <input name="fullName" value={editForm.fullName} onChange={handleEditChange} />
                    ) : (
                      row.fullName || "—"
                    )}
                  </td>
                  <td>
                    {editingId === row._id ? (
                      <select name="role" value={editForm.role} onChange={handleEditChange} required>
                        <option value="">Chọn role</option>
                        {roles.map((r) => (
                          <option key={r._id} value={r._id}>
                            {r.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      row.role?.name || "—"
                    )}
                  </td>
                  <td>
                    {editingId === row._id ? (
                      <label className="checkbox-inline">
                        <input
                          type="checkbox"
                          name="status"
                          checked={editForm.status}
                          onChange={handleEditChange}
                        />
                        <span>Enabled</span>
                      </label>
                    ) : row.status ? (
                      "Yes"
                    ) : (
                      "No"
                    )}
                  </td>
                  <td className="actions-inline">
                    {editingId === row._id ? (
                      <>
                        <label className="full-width" style={{ display: "block", marginBottom: "0.35rem" }}>
                          New password (optional)
                          <input
                            type="password"
                            name="password"
                            value={editForm.password}
                            onChange={handleEditChange}
                            placeholder="Leave blank to keep"
                            autoComplete="new-password"
                          />
                        </label>
                        <button type="button" onClick={(event) => handleEditSubmit(event, row._id)}>
                          Save
                        </button>
                        <button type="button" className="ghost-button" onClick={cancelEdit}>
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button type="button" onClick={() => startEdit(row)}>
                          Edit
                        </button>
                        <button
                          type="button"
                          className="link-danger"
                          disabled={myId === String(row._id)}
                          onClick={() => handleDelete(row._id)}
                          title={myId === String(row._id) ? "Cannot delete your own account" : undefined}
                        >
                          Delete
                        </button>
                      </>
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

import { useEffect, useState } from "react";
import { DataState } from "../components/DataState";
import { PageHeader } from "../components/PageHeader";
import { useAuth } from "../hooks/useAuth";
import { extractErrorMessage } from "../lib/errors";
import { canMutateRoles } from "../lib/permissions";
import { createRole, deleteRole, getRoles, updateRole } from "../services/roleService";

const roleOptions = ["admin", "HR", "Manager", "Employee"];

export function RolesPage() {
  const { user } = useAuth();
  const canEdit = canMutateRoles(user);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "Employee", description: "" });
  const [editingId, setEditingId] = useState("");
  const [editForm, setEditForm] = useState({ name: "", description: "" });

  async function loadRoles() {
    setLoading(true);
    setError("");

    try {
      const payload = await getRoles();
      setRoles(Array.isArray(payload) ? payload : []);
    } catch (loadError) {
      setError(extractErrorMessage(loadError, "Unable to load roles"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRoles();
  }, []);

  function handleCreateChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  async function handleCreateSubmit(event) {
    event.preventDefault();
    setError("");

    try {
      await createRole(form);
      setForm({ name: "Employee", description: "" });
      await loadRoles();
    } catch (submitError) {
      setError(extractErrorMessage(submitError, "Unable to create role"));
    }
  }

  function startEdit(role) {
    setEditingId(role._id);
    setEditForm({ name: role.name, description: role.description || "" });
  }

  function cancelEdit() {
    setEditingId("");
    setEditForm({ name: "", description: "" });
  }

  function handleEditChange(event) {
    const { name, value } = event.target;
    setEditForm((previous) => ({ ...previous, [name]: value }));
  }

  async function handleEditSubmit(event, id) {
    event.preventDefault();
    setError("");

    try {
      await updateRole(id, editForm);
      cancelEdit();
      await loadRoles();
    } catch (submitError) {
      setError(extractErrorMessage(submitError, "Unable to update role"));
    }
  }

  async function handleDelete(id) {
    const confirmed = window.confirm("Soft-delete this role?");
    if (!confirmed) {
      return;
    }

    setError("");

    try {
      await deleteRole(id);
      await loadRoles();
    } catch (deleteError) {
      setError(extractErrorMessage(deleteError, "Unable to delete role"));
    }
  }

  return (
    <section className="page-card">
      <PageHeader
        title="Roles"
        subtitle={
          canEdit
            ? "Data source: /role (admin: full CRUD)"
            : "View only: Boss/HR cannot add, edit, or delete roles on this UI."
        }
      />

      {canEdit ? (
        <form className="form-grid" onSubmit={handleCreateSubmit}>
          <label>
            Role name
            <select name="name" value={form.name} onChange={handleCreateChange}>
              {roleOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="full-width">
            Description
            <input name="description" value={form.description} onChange={handleCreateChange} />
          </label>

          <div className="full-width actions-inline">
            <button type="submit">Create role</button>
          </div>
        </form>
      ) : null}

      {error ? <p className="status-note error">{error}</p> : null}

      <DataState
        loading={loading}
        error={error}
        empty={!loading && !error && roles.length === 0}
        emptyMessage="No roles returned by backend."
      >
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => (
                <tr key={role._id}>
                  <td>
                    {editingId === role._id ? (
                      <select name="name" value={editForm.name} onChange={handleEditChange}>
                        {roleOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    ) : (
                      role.name
                    )}
                  </td>
                  <td>
                    {editingId === role._id ? (
                      <input
                        name="description"
                        value={editForm.description}
                        onChange={handleEditChange}
                      />
                    ) : (
                      role.description || "-"
                    )}
                  </td>
                  <td className="actions-inline">
                    {!canEdit ? (
                      <span className="status-note">—</span>
                    ) : editingId === role._id ? (
                      <>
                        <button type="button" onClick={(event) => handleEditSubmit(event, role._id)}>
                          Save
                        </button>
                        <button type="button" className="ghost-button" onClick={cancelEdit}>
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button type="button" onClick={() => startEdit(role)}>
                          Edit
                        </button>
                        <button type="button" className="link-danger" onClick={() => handleDelete(role._id)}>
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

import { useEffect, useState } from "react";
import { DataState } from "../components/DataState";
import { PageHeader } from "../components/PageHeader";
import { useAuth } from "../hooks/useAuth";
import { extractErrorMessage } from "../lib/errors";
import { canWriteDepartments } from "../lib/permissions";
import {
  createDepartment,
  deleteDepartment,
  getDepartments,
  updateDepartment,
} from "../services/departmentService";

export function DepartmentsPage() {
  const { user } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState({ code: "", name: "", description: "" });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState("");
  const [editForm, setEditForm] = useState({ code: "", name: "", description: "" });

  const canWrite = canWriteDepartments(user);

  async function loadDepartments() {
    setLoading(true);
    setError("");
    try {
      const payload = await getDepartments();
      setDepartments(payload?.data || []);
    } catch (loadError) {
      setError(extractErrorMessage(loadError, "Unable to load departments"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDepartments();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  function handleEditChange(event) {
    const { name, value } = event.target;
    setEditForm((previous) => ({ ...previous, [name]: value }));
  }

  function startEdit(row) {
    setEditingId(row._id);
    setEditForm({
      code: row.code || "",
      name: row.name || "",
      description: row.description || "",
    });
  }

  function cancelEdit() {
    setEditingId("");
    setEditForm({ code: "", name: "", description: "" });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await createDepartment(form);
      setForm({ code: "", name: "", description: "" });
      await loadDepartments();
    } catch (submitError) {
      setError(extractErrorMessage(submitError, "Unable to create department"));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleEditSubmit(event, id) {
    event.preventDefault();
    setError("");

    try {
      await updateDepartment(id, {
        code: editForm.code,
        name: editForm.name,
        description: editForm.description,
      });
      cancelEdit();
      await loadDepartments();
    } catch (submitError) {
      setError(extractErrorMessage(submitError, "Unable to update department"));
    }
  }

  async function handleDelete(id) {
    const confirmed = window.confirm("Xóa phòng ban này? (soft delete)");
    if (!confirmed) {
      return;
    }

    setError("");

    try {
      await deleteDepartment(id);
      cancelEdit();
      await loadDepartments();
    } catch (deleteError) {
      setError(extractErrorMessage(deleteError, "Unable to delete department"));
    }
  }

  return (
    <section className="page-card">
      <PageHeader
        title="Departments"
        subtitle="Danh sách, tạo, sửa, xóa — /departments/list, create, update/:id, delete/:id"
      />

      {canWrite ? (
        <form className="form-grid" onSubmit={handleSubmit}>
          <label>
            Code
            <input
              name="code"
              value={form.code}
              onChange={handleChange}
              placeholder="HR"
              required
            />
          </label>

          <label>
            Name
            <input name="name" value={form.name} onChange={handleChange} required />
          </label>

          <label className="full-width">
            Description
            <input name="description" value={form.description} onChange={handleChange} />
          </label>

          <div className="full-width actions-inline">
            <button type="submit" disabled={submitting}>
              {submitting ? "Creating..." : "Create department"}
            </button>
          </div>
        </form>
      ) : (
        <p className="status-note">Your current role can only view the list when backend permits it.</p>
      )}

      {error ? <p className="status-note error">{error}</p> : null}

      <DataState
        loading={loading}
        error={error && !departments.length ? error : ""}
        empty={!loading && !error && departments.length === 0}
        emptyMessage="No departments returned by backend."
      >
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Description</th>
                {canWrite ? <th>Actions</th> : null}
              </tr>
            </thead>
            <tbody>
              {departments.map((department) => (
                <tr key={department._id}>
                  <td>
                    {editingId === department._id ? (
                      <input name="code" value={editForm.code} onChange={handleEditChange} required />
                    ) : (
                      department.code
                    )}
                  </td>
                  <td>
                    {editingId === department._id ? (
                      <input name="name" value={editForm.name} onChange={handleEditChange} required />
                    ) : (
                      department.name
                    )}
                  </td>
                  <td>
                    {editingId === department._id ? (
                      <input
                        name="description"
                        value={editForm.description}
                        onChange={handleEditChange}
                      />
                    ) : (
                      department.description || "-"
                    )}
                  </td>
                  {canWrite ? (
                    <td className="actions-inline">
                      {editingId === department._id ? (
                        <>
                          <button type="button" onClick={(event) => handleEditSubmit(event, department._id)}>
                            Save
                          </button>
                          <button type="button" className="ghost-button" onClick={cancelEdit}>
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button type="button" onClick={() => startEdit(department)}>
                            Edit
                          </button>
                          <button type="button" className="link-danger" onClick={() => handleDelete(department._id)}>
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DataState>
    </section>
  );
}

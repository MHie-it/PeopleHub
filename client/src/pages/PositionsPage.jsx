import { useEffect, useState } from "react";
import { DataState } from "../components/DataState";
import { PageHeader } from "../components/PageHeader";
import { useAuth } from "../hooks/useAuth";
import { extractErrorMessage } from "../lib/errors";
import { canWritePositions } from "../lib/permissions";
import { getDepartments } from "../services/departmentService";
import {
  createPosition,
  deletePosition,
  getPositions,
  updatePosition,
} from "../services/positionService";

function deriveDepartmentsFromPositions(positions) {
  const map = new Map();

  positions.forEach((position) => {
    const department = position.department;
    if (!department) {
      return;
    }

    if (typeof department === "object" && department._id) {
      map.set(department._id, { _id: department._id, name: department.name || department._id });
    }
  });

  return Array.from(map.values());
}

export function PositionsPage() {
  const { user } = useAuth();
  const canWrite = canWritePositions(user);

  const [positions, setPositions] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState({
    code: "",
    title: "",
    department: "",
    level: "Junior",
    description: "",
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState("");
  const [editForm, setEditForm] = useState({
    code: "",
    title: "",
    department: "",
    level: "Junior",
    description: "",
  });

  async function loadPositions() {
    setLoading(true);
    setError("");

    try {
      const [positionsPayload, departmentsResult] = await Promise.allSettled([getPositions(), getDepartments()]);

      if (positionsPayload.status !== "fulfilled") {
        throw positionsPayload.reason;
      }

      const list = positionsPayload.value || [];
      setPositions(list);

      if (departmentsResult.status === "fulfilled") {
        setDepartments(departmentsResult.value?.data || []);
      } else {
        setDepartments(deriveDepartmentsFromPositions(list));
      }
    } catch (loadError) {
      setError(extractErrorMessage(loadError, "Unable to load positions"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPositions();
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
    const deptId =
      typeof row.department === "object" && row.department?._id
        ? row.department._id
        : row.department || "";
    setEditingId(row._id);
    setEditForm({
      code: row.code || "",
      title: row.title || "",
      department: String(deptId),
      level: row.level || "Junior",
      description: row.description || "",
    });
  }

  function cancelEdit() {
    setEditingId("");
    setEditForm({ code: "", title: "", department: "", level: "Junior", description: "" });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await createPosition(form);
      setForm({ code: "", title: "", department: "", level: "Junior", description: "" });
      await loadPositions();
    } catch (submitError) {
      setError(extractErrorMessage(submitError, "Unable to create position"));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleEditSubmit(event, id) {
    event.preventDefault();
    setError("");

    try {
      await updatePosition(id, {
        code: editForm.code,
        title: editForm.title,
        department: editForm.department,
        level: editForm.level,
        description: editForm.description,
      });
      cancelEdit();
      await loadPositions();
    } catch (submitError) {
      setError(extractErrorMessage(submitError, "Unable to update position"));
    }
  }

  async function handleDelete(id) {
    const confirmed = window.confirm("Xóa chức vụ này? (soft delete)");
    if (!confirmed) {
      return;
    }

    setError("");

    try {
      await deletePosition(id);
      cancelEdit();
      await loadPositions();
    } catch (deleteError) {
      setError(extractErrorMessage(deleteError, "Unable to delete position"));
    }
  }

  function departmentField(name, value, onChange, required) {
    if (departments.length > 0) {
      return (
        <select name={name} value={value} onChange={onChange} required={required}>
          <option value="">Select department</option>
          {departments.map((department) => (
            <option key={department._id} value={department._id}>
              {department.name}
            </option>
          ))}
        </select>
      );
    }

    return (
      <input
        name={name}
        value={value}
        onChange={onChange}
        placeholder="Department ObjectId"
        required={required}
      />
    );
  }

  const levelSelect = (value, onChange) => (
    <select name="level" value={value} onChange={onChange}>
      <option value="Intern">Intern</option>
      <option value="Junior">Junior</option>
      <option value="Middle">Middle</option>
      <option value="Senior">Senior</option>
      <option value="Lead">Lead</option>
      <option value="Manager">Manager</option>
      <option value="Director">Director</option>
    </select>
  );

  return (
    <section className="page-card">
      <PageHeader title="Positions" subtitle="GET/POST/PUT/DELETE /positions" />

      {canWrite ? (
        <form className="form-grid" onSubmit={handleSubmit}>
          <label>
            Code
            <input name="code" value={form.code} onChange={handleChange} placeholder="DEV_L2" required />
          </label>

          <label>
            Title
            <input name="title" value={form.title} onChange={handleChange} required />
          </label>

          <label>
            Department
            {departmentField("department", form.department, handleChange, true)}
          </label>

          <label>
            Level
            {levelSelect(form.level, handleChange)}
          </label>

          <label className="full-width">
            Description
            <input name="description" value={form.description} onChange={handleChange} />
          </label>

          <div className="full-width actions-inline">
            <button type="submit" disabled={submitting}>
              {submitting ? "Creating..." : "Create position"}
            </button>
          </div>
        </form>
      ) : null}

      {error ? <p className="status-note error">{error}</p> : null}

      <DataState
        loading={loading}
        error={error && !positions.length ? error : ""}
        empty={!loading && !error && positions.length === 0}
        emptyMessage="No positions returned by backend."
      >
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Title</th>
                <th>Department</th>
                <th>Level</th>
                <th>Description</th>
                {canWrite ? <th>Actions</th> : null}
              </tr>
            </thead>
            <tbody>
              {positions.map((position) => (
                <tr key={position._id}>
                  <td>
                    {editingId === position._id ? (
                      <input name="code" value={editForm.code} onChange={handleEditChange} required />
                    ) : (
                      position.code
                    )}
                  </td>
                  <td>
                    {editingId === position._id ? (
                      <input name="title" value={editForm.title} onChange={handleEditChange} required />
                    ) : (
                      position.title
                    )}
                  </td>
                  <td>
                    {editingId === position._id ? (
                      departmentField("department", editForm.department, handleEditChange, true)
                    ) : (
                      position.department?.name || "-"
                    )}
                  </td>
                  <td>
                    {editingId === position._id ? (
                      levelSelect(editForm.level, handleEditChange)
                    ) : (
                      position.level || "-"
                    )}
                  </td>
                  <td>
                    {editingId === position._id ? (
                      <input
                        name="description"
                        value={editForm.description}
                        onChange={handleEditChange}
                      />
                    ) : (
                      position.description || "-"
                    )}
                  </td>
                  {canWrite ? (
                    <td className="actions-inline">
                      {editingId === position._id ? (
                        <>
                          <button type="button" onClick={(event) => handleEditSubmit(event, position._id)}>
                            Save
                          </button>
                          <button type="button" className="ghost-button" onClick={cancelEdit}>
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button type="button" onClick={() => startEdit(position)}>
                            Edit
                          </button>
                          <button type="button" className="link-danger" onClick={() => handleDelete(position._id)}>
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

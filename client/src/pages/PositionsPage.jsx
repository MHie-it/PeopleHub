import { useEffect, useState } from "react";
import { DataState } from "../components/DataState";
import { PageHeader } from "../components/PageHeader";
import { useAuth } from "../hooks/useAuth";
import { extractErrorMessage } from "../lib/errors";
import { APP_ROLES, hasRole } from "../lib/roles";
import { getDepartments } from "../services/departmentService";
import { createPosition, getPositions } from "../services/positionService";

const writableRoles = [APP_ROLES.ADMIN, APP_ROLES.HR, APP_ROLES.MANAGER];

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
  const canWrite = hasRole(user, writableRoles);

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

  return (
    <section className="page-card">
      <PageHeader title="Positions" subtitle="Data source: /positions" />

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
            {departments.length > 0 ? (
              <select name="department" value={form.department} onChange={handleChange} required>
                <option value="">Select department</option>
                {departments.map((department) => (
                  <option key={department._id} value={department._id}>
                    {department.name}
                  </option>
                ))}
              </select>
            ) : (
              <input
                name="department"
                value={form.department}
                onChange={handleChange}
                placeholder="Department ObjectId"
                required
              />
            )}
          </label>

          <label>
            Level
            <select name="level" value={form.level} onChange={handleChange}>
              <option value="Intern">Intern</option>
              <option value="Junior">Junior</option>
              <option value="Middle">Middle</option>
              <option value="Senior">Senior</option>
              <option value="Lead">Lead</option>
              <option value="Manager">Manager</option>
              <option value="Director">Director</option>
            </select>
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

      <DataState
        loading={loading}
        error={error}
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
              </tr>
            </thead>
            <tbody>
              {positions.map((position) => (
                <tr key={position._id}>
                  <td>{position.code}</td>
                  <td>{position.title}</td>
                  <td>{position.department?.name || "-"}</td>
                  <td>{position.level || "-"}</td>
                  <td>{position.description || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DataState>
    </section>
  );
}

import { useEffect, useState } from "react";
import { DataState } from "../components/DataState";
import { PageHeader } from "../components/PageHeader";
import { useAuth } from "../hooks/useAuth";
import { extractErrorMessage } from "../lib/errors";
import { canWriteDepartments } from "../lib/permissions";
import { createDepartment, getDepartments } from "../services/departmentService";

export function DepartmentsPage() {
  const { user } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState({ code: "", name: "", description: "" });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

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

  return (
    <section className="page-card">
      <PageHeader
        title="Departments"
        subtitle="Data source: /departments/list and /departments/create"
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

      <DataState
        loading={loading}
        error={error}
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
              </tr>
            </thead>
            <tbody>
              {departments.map((department) => (
                <tr key={department._id}>
                  <td>{department.code}</td>
                  <td>{department.name}</td>
                  <td>{department.description || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DataState>
    </section>
  );
}

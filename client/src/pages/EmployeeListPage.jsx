import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { DataState } from "../components/DataState";
import { PageHeader } from "../components/PageHeader";
import { useAuth } from "../hooks/useAuth";
import { extractErrorMessage } from "../lib/errors";
import { formatDate } from "../lib/formatters";
import { canAccessEmployees, canCreateOrDeleteEmployee } from "../lib/permissions";
import { deleteEmployee, getEmployees } from "../services/employeeService";

export function EmployeeListPage() {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState("");

  async function loadEmployees() {
    setLoading(true);
    setError("");

    try {
      const payload = await getEmployees();
      setEmployees(payload?.data || []);
    } catch (loadError) {
      setError(extractErrorMessage(loadError, "Unable to load employees"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!canAccessEmployees(user)) {
      setLoading(false);
      setError("You do not have permission to access /employees.");
      return;
    }

    loadEmployees();
  }, [user]);

  async function handleDelete(id) {
    const confirmed = window.confirm("Soft-delete this employee?");
    if (!confirmed) {
      return;
    }

    setDeletingId(id);
    try {
      await deleteEmployee(id);
      await loadEmployees();
    } catch (deleteError) {
      setError(extractErrorMessage(deleteError, "Unable to delete employee"));
    } finally {
      setDeletingId("");
    }
  }

  return (
    <section className="page-card">
      <PageHeader
        title="Employees"
        subtitle="Data source: GET /employees"
        actions={
          canCreateOrDeleteEmployee(user) ? (
            <Link className="button-like" to="/employees/new">
              Create employee
            </Link>
          ) : null
        }
      />

      <DataState
        loading={loading}
        error={error}
        empty={!loading && !error && employees.length === 0}
        emptyMessage="No employee records returned from backend."
      >
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Department</th>
                <th>Position</th>
                <th>Join date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => (
                <tr key={employee._id}>
                  <td>{employee.employeeCode}</td>
                  <td>{employee.fullName}</td>
                  <td>{employee.department?.name || "-"}</td>
                  <td>{employee.position?.title || "-"}</td>
                  <td>{formatDate(employee.joinDate)}</td>
                  <td>{employee.employmentStatus || "-"}</td>
                  <td className="actions-inline">
                    <Link to={`/employees/${employee._id}`}>View</Link>
                    <Link to={`/employees/${employee._id}/edit`}>Edit</Link>
                    {canCreateOrDeleteEmployee(user) ? (
                      <button
                        type="button"
                        className="link-danger"
                        disabled={deletingId === employee._id}
                        onClick={() => handleDelete(employee._id)}
                      >
                        {deletingId === employee._id ? "Deleting..." : "Delete"}
                      </button>
                    ) : null}
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

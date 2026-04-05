import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { DataState } from "../components/DataState";
import { PageHeader } from "../components/PageHeader";
import { useAuth } from "../hooks/useAuth";
import { extractErrorMessage } from "../lib/errors";
import { formatDate, formatDateTime } from "../lib/formatters";
import { canEditEmployeeRecord } from "../lib/permissions";
import { getEmployeeById } from "../services/employeeService";

export function EmployeeDetailPage() {
  const { user } = useAuth();
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadDetail() {
      setLoading(true);
      setError("");
      try {
        const payload = await getEmployeeById(id);
        if (active) {
          setEmployee(payload?.data || null);
        }
      } catch (loadError) {
        if (active) {
          setError(extractErrorMessage(loadError, "Unable to load employee detail"));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadDetail();

    return () => {
      active = false;
    };
  }, [id]);

  return (
    <section className="page-card">
      <PageHeader
        title="Employee detail"
        subtitle="Data source: GET /employees/:id"
        actions={
          <div className="actions-inline">
            <Link to="/employees">Back</Link>
            {canEditEmployeeRecord(user) ? (
              <Link className="button-like" to={`/employees/${id}/edit`}>
                Edit
              </Link>
            ) : null}
          </div>
        }
      />

      <DataState
        loading={loading}
        error={error}
        empty={!loading && !error && !employee}
        emptyMessage="Employee record not found."
      >
        {employee ? (
          <div className="kv-grid">
            <p>
              <span>Employee code</span>
              <strong>{employee.employeeCode}</strong>
            </p>
            <p>
              <span>Full name</span>
              <strong>{employee.fullName}</strong>
            </p>
            <p>
              <span>Email</span>
              <strong>{employee.user?.email || "-"}</strong>
            </p>
            <p>
              <span>Department</span>
              <strong>{employee.department?.name || "-"}</strong>
            </p>
            <p>
              <span>Position</span>
              <strong>{employee.position?.title || "-"}</strong>
            </p>
            <p>
              <span>Manager</span>
              <strong>{employee.manager?.fullName || "-"}</strong>
            </p>
            <p>
              <span>Join date</span>
              <strong>{formatDate(employee.joinDate)}</strong>
            </p>
            <p>
              <span>Status</span>
              <strong>{employee.employmentStatus || "-"}</strong>
            </p>
            <p>
              <span>Created</span>
              <strong>{formatDateTime(employee.createdAt)}</strong>
            </p>
            <p>
              <span>Updated</span>
              <strong>{formatDateTime(employee.updatedAt)}</strong>
            </p>
          </div>
        ) : null}
      </DataState>
    </section>
  );
}

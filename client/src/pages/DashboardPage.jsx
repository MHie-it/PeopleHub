import { useEffect, useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { extractErrorMessage } from "../lib/errors";
import { getEmployees } from "../services/employeeService";
import { getDepartments } from "../services/departmentService";
import { getPositions } from "../services/positionService";
import { getRoles } from "../services/roleService";
import { useAuth } from "../hooks/useAuth";

function countFromPayload(payload) {
  if (Array.isArray(payload)) {
    return payload.length;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data.length;
  }

  return null;
}

export function DashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    employees: null,
    departments: null,
    positions: null,
    roles: null,
  });

  useEffect(() => {
    let active = true;

    async function loadStats() {
      setLoading(true);
      setError("");

      try {
        const [employeesRes, departmentsRes, positionsRes, rolesRes] = await Promise.allSettled([
          getEmployees(),
          getDepartments(),
          getPositions(),
          getRoles(),
        ]);

        if (!active) {
          return;
        }

        setStats({
          employees: employeesRes.status === "fulfilled" ? countFromPayload(employeesRes.value) : null,
          departments: departmentsRes.status === "fulfilled" ? countFromPayload(departmentsRes.value) : null,
          positions: positionsRes.status === "fulfilled" ? countFromPayload(positionsRes.value) : null,
          roles: rolesRes.status === "fulfilled" ? countFromPayload(rolesRes.value) : null,
        });
      } catch (loadError) {
        if (active) {
          setError(extractErrorMessage(loadError, "Unable to load dashboard metrics"));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadStats();

    return () => {
      active = false;
    };
  }, []);

  const cards = [
    { label: "Employees", value: stats.employees },
    { label: "Departments", value: stats.departments },
    { label: "Positions", value: stats.positions },
    { label: "Roles", value: stats.roles },
  ];

  return (
    <section className="page-card">
      <PageHeader
        title="Operational Overview"
        subtitle="Live values are pulled from your current backend APIs and database records."
      />

      <div className="hero-inline">
        <div>
          <p className="hero-label">Current user</p>
          <h3>{user?.fullName || user?.username || "Unknown"}</h3>
          <p>Role: {user?.role?.name || "N/A"}</p>
        </div>
        <div className="hero-tip">
          <p>
            Tip: if a card shows N/A, this account does not have permission for that endpoint or the API is
            unavailable.
          </p>
        </div>
      </div>

      {error ? <p className="status-note error">{error}</p> : null}

      <div className="metric-grid">
        {cards.map((card) => (
          <article key={card.label} className="metric-card">
            <p>{card.label}</p>
            <h3>{loading ? "..." : card.value ?? "N/A"}</h3>
          </article>
        ))}
      </div>
    </section>
  );
}

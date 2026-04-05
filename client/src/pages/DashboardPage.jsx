import { useEffect, useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { useAuth } from "../hooks/useAuth";
import { extractErrorMessage } from "../lib/errors";
import {
  canAccessDepartments,
  canAccessEmployees,
  canAccessPositions,
  canViewRoles,
} from "../lib/permissions";
import { getEmployees } from "../services/employeeService";
import { getDepartments } from "../services/departmentService";
import { getPositions } from "../services/positionService";
import { getRoles } from "../services/roleService";

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

      const tasks = [];

      if (canAccessEmployees(user)) {
        tasks.push(
          getEmployees()
            .then((value) => ({ key: "employees", value }))
            .catch(() => ({ key: "employees", value: null })),
        );
      }

      if (canAccessDepartments(user)) {
        tasks.push(
          getDepartments()
            .then((value) => ({ key: "departments", value }))
            .catch(() => ({ key: "departments", value: null })),
        );
      }

      if (canAccessPositions(user)) {
        tasks.push(
          getPositions()
            .then((value) => ({ key: "positions", value }))
            .catch(() => ({ key: "positions", value: null })),
        );
      }

      if (canViewRoles(user)) {
        tasks.push(
          getRoles()
            .then((value) => ({ key: "roles", value }))
            .catch(() => ({ key: "roles", value: null })),
        );
      }

      try {
        const results = tasks.length > 0 ? await Promise.all(tasks) : [];
        if (!active) {
          return;
        }

        const next = {
          employees: null,
          departments: null,
          positions: null,
          roles: null,
        };

        results.forEach((entry) => {
          if (!entry) {
            return;
          }
          next[entry.key] = entry.value === null ? null : countFromPayload(entry.value);
        });

        setStats(next);
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
  }, [user]);

  const cards = [
    canAccessEmployees(user) ? { label: "Employees", value: stats.employees } : null,
    canAccessDepartments(user) ? { label: "Departments", value: stats.departments } : null,
    canAccessPositions(user) ? { label: "Positions", value: stats.positions } : null,
    canViewRoles(user) ? { label: "Roles", value: stats.roles } : null,
  ].filter(Boolean);

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

      {cards.length === 0 ? (
        <p className="status-note">No directory metrics are available for your role on this screen.</p>
      ) : (
        <div className="metric-grid">
          {cards.map((card) => (
            <article key={card.label} className="metric-card">
              <p>{card.label}</p>
              <h3>{loading ? "..." : card.value ?? "N/A"}</h3>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

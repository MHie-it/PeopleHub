import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { APP_ROLES, hasRole } from "../lib/roles";

const primaryNavItems = [
  { to: "/", label: "Overview" },
  {
    to: "/employees",
    label: "Employees",
    roles: [APP_ROLES.ADMIN, APP_ROLES.ADMIN_UPPER, APP_ROLES.HR, APP_ROLES.MANAGER],
  },
  {
    to: "/departments",
    label: "Departments",
    roles: [APP_ROLES.ADMIN, APP_ROLES.ADMIN_UPPER, APP_ROLES.MANAGER],
  },
  { to: "/positions", label: "Positions" },
  { to: "/roles", label: "Roles" },
  {
    to: "/attendance",
    label: "Attendance",
    roles: [APP_ROLES.ADMIN, APP_ROLES.ADMIN_UPPER, APP_ROLES.MANAGER, APP_ROLES.EMPLOYEE],
  },
  { to: "/leave", label: "Leave" },
  {
    to: "/payroll",
    label: "Payroll",
    roles: [APP_ROLES.ADMIN, APP_ROLES.ADMIN_UPPER, APP_ROLES.HR, APP_ROLES.DIRECTOR, APP_ROLES.BOSS],
  },
  { to: "/salary", label: "Salary" },
  { to: "/notifications", label: "Notifications" },
];

const unavailableItems = [{ to: "/contracts", label: "Contracts" }];

function canDisplayItem(user, item) {
  if (!item.roles) {
    return true;
  }
  return hasRole(user, item.roles);
}

export function AppShell() {
  const { user, logout } = useAuth();

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <div className="brand-block">
          <p className="brand-kicker">PeopleHub</p>
          <h1>Command Center</h1>
          <p>React frontend wired directly to your existing backend APIs.</p>
        </div>

        <nav className="nav-group" aria-label="Primary navigation">
          <p className="nav-title">Operations</p>
          {primaryNavItems
            .filter((item) => canDisplayItem(user, item))
            .map((item) => (
              <NavLink key={item.to} to={item.to} end={item.to === "/"} className="nav-link">
                {item.label}
              </NavLink>
            ))}
        </nav>

        <nav className="nav-group" aria-label="Unavailable API modules">
          <p className="nav-title">Pending APIs</p>
          {unavailableItems.map((item) => (
            <NavLink key={item.to} to={item.to} className="nav-link muted">
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <section className="app-main">
        <header className="topbar">
          <div>
            <p className="topbar-label">Signed in as</p>
            <p className="topbar-name">{user?.fullName || user?.username || "Unknown user"}</p>
          </div>

          <div className="topbar-actions">
            <span className="role-chip">{user?.role?.name || "No role"}</span>
            <button type="button" className="ghost-button" onClick={logout}>
              Logout
            </button>
          </div>
        </header>

        <main className="page-content">
          <Outlet />
        </main>
      </section>
    </div>
  );
}

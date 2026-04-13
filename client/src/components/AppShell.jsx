import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useEffect, useState } from "react";
import {
  canAccessContracts,
  canAccessDepartments,
  canAccessEmployees,
  canAccessNotifications,
  canAccessPayroll,
  canAccessPositions,
  canAccessUsers,
  canUseAttendance,
  canViewRoles } from
"../lib/permissions";

const primaryNavItems = [
  { to: "/employees", label: "Employees", check: canAccessEmployees },
  { to: "/departments", label: "Departments", check: canAccessDepartments },
  { to: "/positions", label: "Positions", check: canAccessPositions },
  { to: "/users", label: "Users", check: canAccessUsers },
  { to: "/roles", label: "Roles", check: canViewRoles },
  { to: "/attendance", label: "Attendance", check: canUseAttendance },
  { to: "/leave", label: "Leave" },
  { to: "/payroll", label: "Payroll", check: canAccessPayroll },
  { to: "/salary", label: "Salary" },
  { to: "/notifications", label: "Notifications", check: canAccessNotifications },
  { to: "/contracts", label: "Contracts", check: canAccessContracts },
];

const unavailableItems = [];

function canDisplayItem(user, item) {
  if (!item.check) {
    return true;
  }
  return item.check(user);
}

export function AppShell() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Đóng sidebar khi navigate sang trang khác
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Chặn scroll body khi sidebar mở trên mobile
  useEffect(() => {
    if (sidebarOpen) {
      document.body.classList.add("sidebar-lock");
    } else {
      document.body.classList.remove("sidebar-lock");
    }
    return () => document.body.classList.remove("sidebar-lock");
  }, [sidebarOpen]);

  return (
    <div className="app-shell">
      {/* Overlay backdrop cho mobile */}
      {sidebarOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside className={`app-sidebar${sidebarOpen ? " is-open" : ""}`}>
        {/* Nút đóng bên trong sidebar (mobile) */}
        <button
          className="sidebar-close-btn"
          type="button"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close navigation"
        >
          ✕
        </button>

        <div className="brand-block">
          <p className="brand-kicker">PeopleHub</p>
          <h1>Command Center</h1>
        </div>

        <nav className="nav-group nav-scrollable" aria-label="Primary navigation">
          <p className="nav-title">Operations</p>
          {primaryNavItems.
          filter((item) => canDisplayItem(user, item)).
          map((item) =>
          <NavLink key={item.to} to={item.to} end={item.to === "/"} className="nav-link">
                {item.label}
              </NavLink>
          )}
        </nav>

        {unavailableItems.length > 0 ?
        <nav className="nav-group" aria-label="Unavailable API modules">
            <p className="nav-title">Pending APIs</p>
            {unavailableItems.map((item) =>
          <NavLink key={item.to} to={item.to} className="nav-link muted">
                {item.label}
              </NavLink>
          )}
          </nav> :
        null}
      </aside>

      <section className="app-main">
        <header className="topbar">
          {/* Hamburger button — chỉ hiện trên mobile */}
          <button
            className="hamburger-btn"
            type="button"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open navigation"
            aria-expanded={sidebarOpen}
          >
            <span className="hamburger-icon">
              <span />
              <span />
              <span />
            </span>
          </button>

          <div className="topbar-identity">
            <p className="topbar-label">Signed in as</p>
            <p className="topbar-name">{user?.fullName || user?.username || "Unknown user"}</p>
          </div>

          <div className="topbar-actions">
            <NavLink to="/profile" className="ghost-button">
              Profile
            </NavLink>
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
    </div>);

}
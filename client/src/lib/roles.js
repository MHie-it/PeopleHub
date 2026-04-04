export const APP_ROLES = {
  ADMIN: "admin",
  ADMIN_UPPER: "Admin",
  HR: "HR",
  MANAGER: "Manager",
  EMPLOYEE: "Employee",
  LEADER: "Leader",
  DIRECTOR: "Director",
  BOSS: "Boss",
};

export function getRoleName(user) {
  return user?.role?.name || "";
}

function normalizeRole(roleName) {
  if (roleName === APP_ROLES.ADMIN || roleName === APP_ROLES.ADMIN_UPPER) {
    return APP_ROLES.ADMIN;
  }

  return roleName;
}

export function hasRole(user, allowedRoles) {
  const normalizedUserRole = normalizeRole(getRoleName(user));
  const normalizedAllowedRoles = allowedRoles.map((role) => normalizeRole(role));

  return normalizedAllowedRoles.includes(normalizedUserRole);
}

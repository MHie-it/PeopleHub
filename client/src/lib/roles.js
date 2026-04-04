export const APP_ROLES = {
  ADMIN: "admin",
  HR: "HR",
  MANAGER: "Manager",
  EMPLOYEE: "Employee",
};

export function getRoleName(user) {
  return user?.role?.name || "";
}

export function hasRole(user, allowedRoles) {
  const roleName = getRoleName(user);
  return allowedRoles.includes(roleName);
}

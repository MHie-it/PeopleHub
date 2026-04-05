import { APP_ROLES, getRoleName, hasRole } from "./roles";


export const ADMIN_LIKE = [APP_ROLES.ADMIN, APP_ROLES.ADMIN_UPPER];

export const HR_BOSS_DIRECTOR = [APP_ROLES.HR, APP_ROLES.BOSS, APP_ROLES.DIRECTOR];


export const FULL_MGMT_ROLES = [...ADMIN_LIKE, ...HR_BOSS_DIRECTOR, APP_ROLES.MANAGER];


export const EMPLOYEE_DIRECTORY_ROLES = [...FULL_MGMT_ROLES, APP_ROLES.LEADER];

export function isAdmin(user) {
  return hasRole(user, ADMIN_LIKE);
}


export function canMutateRoles(user) {
  return isAdmin(user);
}

export function canViewRoles(user) {
  return hasRole(user, [...ADMIN_LIKE, ...HR_BOSS_DIRECTOR]);
}

export function canAccessEmployees(user) {
  return hasRole(user, EMPLOYEE_DIRECTORY_ROLES);
}

export function canCreateOrDeleteEmployee(user) {
  return hasRole(user, FULL_MGMT_ROLES);
}

export function canEditEmployeeRecord(user) {
  return hasRole(user, EMPLOYEE_DIRECTORY_ROLES);
}

export function canAccessDepartments(user) {
  return hasRole(user, [...ADMIN_LIKE, APP_ROLES.MANAGER, ...HR_BOSS_DIRECTOR]);
}

export function canWriteDepartments(user) {
  return hasRole(user, [...ADMIN_LIKE, APP_ROLES.MANAGER, ...HR_BOSS_DIRECTOR]);
}

export function canAccessPositions(user) {
  return hasRole(user, [...FULL_MGMT_ROLES]);
}

export function canWritePositions(user) {
  return hasRole(user, [...ADMIN_LIKE, APP_ROLES.HR, APP_ROLES.MANAGER, ...HR_BOSS_DIRECTOR]);
}

export function canAccessPayroll(user) {
  return hasRole(user, [...ADMIN_LIKE, APP_ROLES.HR, ...HR_BOSS_DIRECTOR]);
}

export function canAccessNotifications(user) {
  return true;
}

export function canAccessContracts(user) {
  return Boolean(user);
}

/** User accounts admin UI + /users API: admin, Manager, Boss */
export function canAccessUsers(user) {
  return hasRole(user, [...ADMIN_LIKE, APP_ROLES.MANAGER, APP_ROLES.BOSS]);
}

export function canUseAttendance(user) {
  return hasRole(user, [
    APP_ROLES.ADMIN,
    APP_ROLES.ADMIN_UPPER,
    APP_ROLES.MANAGER,
    APP_ROLES.EMPLOYEE,
    APP_ROLES.LEADER,
    APP_ROLES.HR,
    APP_ROLES.BOSS,
    APP_ROLES.DIRECTOR,
  ]);
}


export function attendanceNeedsEmployeePicker(user) {
  return getRoleName(user) !== APP_ROLES.EMPLOYEE;
}

const routeChecks = {
  "/": () => true,
  "/employees": canAccessEmployees,
  "/employees/new": canCreateOrDeleteEmployee,
  "/departments": canAccessDepartments,
  "/positions": canAccessPositions,
  "/roles": canViewRoles,
  "/attendance": canUseAttendance,
  "/leave": () => true,
  "/payroll": canAccessPayroll,
  "/salary": () => true,
  "/notifications": canAccessNotifications,
  "/contracts": canAccessContracts,
  "/users": canAccessUsers,
  "/profile": () => true,
};

export function canAccessPath(pathname, user) {
  const normalized = pathname.replace(/\/$/, "") || "/";
  const check = routeChecks[normalized];
  if (check) {
    return check(user);
  }
  if (normalized.startsWith("/employees/") && normalized.endsWith("/edit")) {
    return canEditEmployeeRecord(user);
  }
  if (normalized.startsWith("/employees/")) {
    return canAccessEmployees(user);
  }
  return true;
}

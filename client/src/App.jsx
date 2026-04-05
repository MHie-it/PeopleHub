import { Route, Routes } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { PublicOnly, RequireAuth, RequirePermission } from "./components/RouteGuards";
import {
  canAccessContracts,
  canAccessDepartments,
  canAccessEmployees,
  canAccessNotifications,
  canAccessPayroll,
  canAccessPositions,
  canCreateOrDeleteEmployee,
  canEditEmployeeRecord,
  canUseAttendance,
  canViewRoles,
} from "./lib/permissions";
import { AttendancePage } from "./pages/AttendancePage";
import { ContractsPage } from "./pages/ContractsPage";
import { DashboardPage } from "./pages/DashboardPage";
import { DepartmentsPage } from "./pages/DepartmentsPage";
import { EmployeeDetailPage } from "./pages/EmployeeDetailPage";
import { EmployeeFormPage } from "./pages/EmployeeFormPage";
import { EmployeeListPage } from "./pages/EmployeeListPage";
import { LeavesPage } from "./pages/LeavesPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { NotificationsPage } from "./pages/NotificationsPage";
import { PayrollPage } from "./pages/PayrollPage";
import { PositionsPage } from "./pages/PositionsPage";
import { ProfilePage } from "./pages/ProfilePage";
import { RolesPage } from "./pages/RolesPage";
import { SalaryPage } from "./pages/SalaryPage";
import { ChangePasswordPage } from "./pages/auth/ChangePasswordPage";
import { ForgotPasswordPage } from "./pages/auth/ForgotPasswordPage";
import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";

function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicOnly>
            <LoginPage />
          </PublicOnly>
        }
      />
      <Route
        path="/register"
        element={
          <PublicOnly>
            <RegisterPage />
          </PublicOnly>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <PublicOnly>
            <ForgotPasswordPage />
          </PublicOnly>
        }
      />
      <Route
        path="/change-password"
        element={
          <PublicOnly>
            <ChangePasswordPage />
          </PublicOnly>
        }
      />

      <Route
        path="/"
        element={
          <RequireAuth>
            <AppShell />
          </RequireAuth>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route
          path="employees"
          element={
            <RequirePermission check={canAccessEmployees}>
              <EmployeeListPage />
            </RequirePermission>
          }
        />
        <Route
          path="employees/new"
          element={
            <RequirePermission check={canCreateOrDeleteEmployee}>
              <EmployeeFormPage />
            </RequirePermission>
          }
        />
        <Route
          path="employees/:id"
          element={
            <RequirePermission check={canAccessEmployees}>
              <EmployeeDetailPage />
            </RequirePermission>
          }
        />
        <Route
          path="employees/:id/edit"
          element={
            <RequirePermission check={canEditEmployeeRecord}>
              <EmployeeFormPage />
            </RequirePermission>
          }
        />
        <Route
          path="departments"
          element={
            <RequirePermission check={canAccessDepartments}>
              <DepartmentsPage />
            </RequirePermission>
          }
        />
        <Route
          path="positions"
          element={
            <RequirePermission check={canAccessPositions}>
              <PositionsPage />
            </RequirePermission>
          }
        />
        <Route
          path="roles"
          element={
            <RequirePermission check={canViewRoles}>
              <RolesPage />
            </RequirePermission>
          }
        />
        <Route
          path="attendance"
          element={
            <RequirePermission check={canUseAttendance}>
              <AttendancePage />
            </RequirePermission>
          }
        />
        <Route path="leave" element={<LeavesPage />} />
        <Route
          path="payroll"
          element={
            <RequirePermission check={canAccessPayroll}>
              <PayrollPage />
            </RequirePermission>
          }
        />
        <Route path="salary" element={<SalaryPage />} />
        <Route
          path="notifications"
          element={
            <RequirePermission check={canAccessNotifications}>
              <NotificationsPage />
            </RequirePermission>
          }
        />
        <Route
          path="contracts"
          element={
            <RequirePermission check={canAccessContracts}>
              <ContractsPage />
            </RequirePermission>
          }
        />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;

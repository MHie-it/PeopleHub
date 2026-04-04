import { Route, Routes } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { PublicOnly, RequireAuth } from "./components/RouteGuards";
import { ApiUnavailablePage } from "./pages/ApiUnavailablePage";
import { AttendancePage } from "./pages/AttendancePage";
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
        <Route path="employees" element={<EmployeeListPage />} />
        <Route path="employees/new" element={<EmployeeFormPage />} />
        <Route path="employees/:id" element={<EmployeeDetailPage />} />
        <Route path="employees/:id/edit" element={<EmployeeFormPage />} />
        <Route path="departments" element={<DepartmentsPage />} />
        <Route path="positions" element={<PositionsPage />} />
        <Route path="roles" element={<RolesPage />} />
        <Route path="attendance" element={<AttendancePage />} />
        <Route path="leave" element={<LeavesPage />} />
        <Route path="payroll" element={<PayrollPage />} />
        <Route path="salary" element={<SalaryPage />} />
        <Route path="notifications" element={<NotificationsPage />} />

        <Route path="contracts" element={<ApiUnavailablePage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;

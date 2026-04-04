import { useEffect, useMemo, useState } from "react";
import { DataState } from "../components/DataState";
import { PageHeader } from "../components/PageHeader";
import { useAuth } from "../hooks/useAuth";
import { extractErrorMessage } from "../lib/errors";
import { APP_ROLES, hasRole } from "../lib/roles";
import { getEmployees } from "../services/employeeService";
import { calculatePayroll, sendPayrollEmail } from "../services/payrollService";

const payrollRoles = [
  APP_ROLES.HR,
  APP_ROLES.ADMIN,
  APP_ROLES.ADMIN_UPPER,
  APP_ROLES.DIRECTOR,
  APP_ROLES.BOSS,
];

export function PayrollPage() {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [payrollRows, setPayrollRows] = useState([]);
  const [manualPayrollId, setManualPayrollId] = useState("");
  const [form, setForm] = useState({
    employeeId: "",
    month: String(new Date().getMonth() + 1),
    year: String(new Date().getFullYear()),
    bonus: "0",
  });

  const canAccessPayroll = hasRole(user, payrollRoles);

  useEffect(() => {
    if (!canAccessPayroll) {
      return;
    }

    async function loadEmployeeOptions() {
      setLoadingEmployees(true);
      try {
        const payload = await getEmployees();
        const list = payload?.data || [];
        setEmployees(list);
        if (list.length > 0) {
          setForm((previous) => ({ ...previous, employeeId: previous.employeeId || list[0]._id }));
        }
      } catch {
        // Payroll API allows manual employeeId input when list endpoint is restricted.
        setEmployees([]);
      } finally {
        setLoadingEmployees(false);
      }
    }

    loadEmployeeOptions();
  }, [canAccessPayroll]);

  const employeeNameById = useMemo(() => {
    const map = new Map();
    employees.forEach((employee) => {
      map.set(employee._id, `${employee.fullName || "Unknown"} (${employee.employeeCode || "-"})`);
    });
    return map;
  }, [employees]);

  function handleFormChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  async function handleCalculate(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      const payload = {
        employeeId: form.employeeId,
        month: Number(form.month),
        year: Number(form.year),
        bonus: Number(form.bonus || 0),
      };

      const result = await calculatePayroll(payload);
      const createdPayroll = result?.data;

      if (createdPayroll) {
        setPayrollRows((previous) => {
          const filtered = previous.filter((row) => row._id !== createdPayroll._id);
          return [createdPayroll, ...filtered];
        });
      }

      setMessage("Payroll calculated successfully.");
    } catch (submitError) {
      setError(extractErrorMessage(submitError, "Unable to calculate payroll"));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSendEmail(payrollId) {
    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      await sendPayrollEmail(payrollId);
      setMessage("Salary email sent successfully.");
      setManualPayrollId("");
    } catch (actionError) {
      setError(extractErrorMessage(actionError, "Unable to send payroll email"));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSendManual(event) {
    event.preventDefault();

    if (!manualPayrollId.trim()) {
      setError("Payroll ID is required.");
      return;
    }

    await handleSendEmail(manualPayrollId.trim());
  }

  if (!canAccessPayroll) {
    return (
      <section className="page-card">
        <PageHeader title="Payroll" subtitle="Data source: /payrolls" />
        <p className="status-note">Your current role does not have payroll permissions.</p>
      </section>
    );
  }

  return (
    <section className="page-card">
      <PageHeader title="Payroll" subtitle="Data source: /payrolls/calculate and /payrolls/:id/send-email" />

      <form className="form-grid" onSubmit={handleCalculate}>
        {employees.length > 0 ? (
          <label>
            Employee
            <select name="employeeId" value={form.employeeId} onChange={handleFormChange} required>
              {employees.map((employee) => (
                <option key={employee._id} value={employee._id}>
                  {employee.fullName || employee.user?.username || employee._id}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <label>
            Employee ID
            <input
              name="employeeId"
              value={form.employeeId}
              onChange={handleFormChange}
              placeholder="Input employee ObjectId"
              required
            />
          </label>
        )}

        <label>
          Month
          <input type="number" min="1" max="12" name="month" value={form.month} onChange={handleFormChange} required />
        </label>

        <label>
          Year
          <input type="number" min="2000" name="year" value={form.year} onChange={handleFormChange} required />
        </label>

        <label>
          Bonus
          <input type="number" name="bonus" value={form.bonus} onChange={handleFormChange} />
        </label>

        <div className="full-width actions-inline">
          <button type="submit" disabled={submitting || loadingEmployees}>
            {submitting ? "Calculating..." : "Calculate payroll"}
          </button>
        </div>
      </form>

      <form className="form-grid" onSubmit={handleSendManual}>
        <label className="full-width">
          Send Email By Payroll ID
          <input
            value={manualPayrollId}
            onChange={(event) => setManualPayrollId(event.target.value)}
            placeholder="Input payroll ObjectId"
          />
        </label>

        <div className="full-width actions-inline">
          <button type="submit" disabled={submitting}>
            {submitting ? "Sending..." : "Send salary email"}
          </button>
        </div>
      </form>

      {error ? <p className="status-note error">{error}</p> : null}
      {message ? <p className="status-note success">{message}</p> : null}

      <DataState
        loading={loadingEmployees}
        error={false}
        empty={payrollRows.length === 0}
        emptyMessage="No payroll calculations in current session yet."
      >
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Payroll ID</th>
                <th>Employee</th>
                <th>Month/Year</th>
                <th>Working Days</th>
                <th>Base Salary</th>
                <th>Bonus</th>
                <th>Penalty</th>
                <th>Total Salary</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {payrollRows.map((row) => (
                <tr key={row._id}>
                  <td>{row._id}</td>
                  <td>
                    {typeof row.employee === "string"
                      ? employeeNameById.get(row.employee) || row.employee
                      : row.employee?.fullName || row.employee?._id || "-"}
                  </td>
                  <td>{row.month}/{row.year}</td>
                  <td>{row.workingDays ?? "-"}</td>
                  <td>{row.baseSalary ?? "-"}</td>
                  <td>{row.bonus ?? "-"}</td>
                  <td>{row.penalty ?? "-"}</td>
                  <td>{row.totalSalary ?? "-"}</td>
                  <td>{row.status || "-"}</td>
                  <td>
                    <button type="button" disabled={submitting} onClick={() => handleSendEmail(row._id)}>
                      Send email
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DataState>
    </section>
  );
}

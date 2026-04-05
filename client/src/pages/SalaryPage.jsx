import { useEffect, useMemo, useState } from "react";
import { DataState } from "../components/DataState";
import { PageHeader } from "../components/PageHeader";
import { useAuth } from "../hooks/useAuth";
import { extractErrorMessage } from "../lib/errors";
import { formatDate } from "../lib/formatters";
import { APP_ROLES, hasRole } from "../lib/roles";
import { getEmployees, getMyEmployeeProfile } from "../services/employeeService";
import { getSalaryHistory, setSalary } from "../services/salaryService";

const setSalaryRoles = [APP_ROLES.DIRECTOR, APP_ROLES.BOSS];

export function SalaryPage() {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [salaryHistory, setSalaryHistory] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    baseSalary: "",
    allowance: "0",
    bonus: "0",
    deduction: "0",
    note: ""
  });

  const canSetSalary = hasRole(user, setSalaryRoles);

  useEffect(() => {
    async function loadEmployeeOptions() {
      setLoadingEmployees(true);
      setError("");

      try {
        const payload = await getEmployees();
        const list = payload?.data || [];

        if (list.length > 0) {
          setEmployees(list);
          setSelectedEmployeeId(list[0]._id);
          return;
        }
      } catch {

      }

      try {
        const myProfilePayload = await getMyEmployeeProfile();
        const profile = myProfilePayload?.data || null;
        if (profile) {
          setEmployees([profile]);
          setSelectedEmployeeId(profile._id);
          return;
        }
      } catch {

      }

      setEmployees([]);
    }

    loadEmployeeOptions().finally(() => {
      setLoadingEmployees(false);
    });
  }, []);

  useEffect(() => {
    if (!selectedEmployeeId) {
      setSalaryHistory([]);
      return;
    }

    async function loadHistory() {
      setLoadingHistory(true);
      setError("");

      try {
        const payload = await getSalaryHistory(selectedEmployeeId);
        setSalaryHistory(payload?.data || []);
      } catch (loadError) {
        setError(extractErrorMessage(loadError, "Unable to load salary history"));
      } finally {
        setLoadingHistory(false);
      }
    }

    loadHistory();
  }, [selectedEmployeeId]);

  const selectedEmployeeLabel = useMemo(() => {
    const selected = employees.find((employee) => employee._id === selectedEmployeeId);
    if (!selected) {
      return "";
    }

    return `${selected.fullName || "Unknown"} (${selected.employeeCode || "-"})`;
  }, [employees, selectedEmployeeId]);

  async function handleSetSalary(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      await setSalary({
        employeeId: selectedEmployeeId,
        baseSalary: Number(form.baseSalary),
        allowance: Number(form.allowance || 0),
        bonus: Number(form.bonus || 0),
        deduction: Number(form.deduction || 0),
        note: form.note
      });

      setMessage("Salary configured successfully.");
      setForm({ baseSalary: "", allowance: "0", bonus: "0", deduction: "0", note: "" });

      const refreshed = await getSalaryHistory(selectedEmployeeId);
      setSalaryHistory(refreshed?.data || []);
    } catch (submitError) {
      setError(extractErrorMessage(submitError, "Unable to set salary"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="page-card">
      <PageHeader title="Salary" subtitle="Data source: /salary" />

      {employees.length > 0 ?
      <label>
          Employee
          <select value={selectedEmployeeId} onChange={(event) => setSelectedEmployeeId(event.target.value)}>
            {employees.map((employee) =>
          <option key={employee._id} value={employee._id}>
                {employee.fullName || employee.user?.username || employee._id}
              </option>
          )}
          </select>
        </label> :

      <label>
          Employee ID
          <input
          value={selectedEmployeeId}
          onChange={(event) => setSelectedEmployeeId(event.target.value)}
          placeholder="Input employee ObjectId" />
        
        </label>
      }

      {selectedEmployeeLabel ? <p className="status-note">Selected: {selectedEmployeeLabel}</p> : null}

      {canSetSalary ?
      <form className="form-grid" onSubmit={handleSetSalary}>
          <label>
            Base salary
            <input
            type="number"
            value={form.baseSalary}
            onChange={(event) => setForm((previous) => ({ ...previous, baseSalary: event.target.value }))}
            required />
          
          </label>

          <label>
            Allowance
            <input
            type="number"
            value={form.allowance}
            onChange={(event) => setForm((previous) => ({ ...previous, allowance: event.target.value }))} />
          
          </label>

          <label>
            Bonus
            <input
            type="number"
            value={form.bonus}
            onChange={(event) => setForm((previous) => ({ ...previous, bonus: event.target.value }))} />
          
          </label>

          <label>
            Deduction
            <input
            type="number"
            value={form.deduction}
            onChange={(event) => setForm((previous) => ({ ...previous, deduction: event.target.value }))} />
          
          </label>

          <label className="full-width">
            Note
            <input
            value={form.note}
            onChange={(event) => setForm((previous) => ({ ...previous, note: event.target.value }))} />
          
          </label>

          <div className="full-width actions-inline">
            <button type="submit" disabled={submitting || !selectedEmployeeId}>
              {submitting ? "Saving..." : "Set salary"}
            </button>
          </div>
        </form> :

      <p className="status-note">Only Director/Boss roles can set salary values. You can still view history.</p>
      }

      {error ? <p className="status-note error">{error}</p> : null}
      {message ? <p className="status-note success">{message}</p> : null}

      <DataState
        loading={loadingEmployees || loadingHistory}
        error={false}
        empty={!selectedEmployeeId || salaryHistory.length === 0}
        emptyMessage="No salary history found for selected employee.">
        
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Effective From</th>
                <th>Base Salary</th>
                <th>Allowance</th>
                <th>Bonus</th>
                <th>Deduction</th>
                <th>Net Salary</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              {salaryHistory.map((salary) =>
              <tr key={salary._id}>
                  <td>{formatDate(salary.effectiveFrom)}</td>
                  <td>{salary.baseSalary ?? "-"}</td>
                  <td>{salary.allowance ?? "-"}</td>
                  <td>{salary.bonus ?? "-"}</td>
                  <td>{salary.deduction ?? "-"}</td>
                  <td>{salary.netSalary ?? "-"}</td>
                  <td>{salary.note || "-"}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </DataState>
    </section>);

}
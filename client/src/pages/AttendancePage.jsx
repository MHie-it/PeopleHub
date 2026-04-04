import { useEffect, useMemo, useState } from "react";
import { DataState } from "../components/DataState";
import { PageHeader } from "../components/PageHeader";
import { useAuth } from "../hooks/useAuth";
import { extractErrorMessage } from "../lib/errors";
import { formatDateTime } from "../lib/formatters";
import { APP_ROLES, hasRole } from "../lib/roles";
import { checkIn, checkOut } from "../services/attendanceService";
import { getEmployees } from "../services/employeeService";

const allowedRoles = [APP_ROLES.ADMIN, APP_ROLES.MANAGER, APP_ROLES.EMPLOYEE];

export function AttendancePage() {
  const { user } = useAuth();
  const roleName = user?.role?.name;
  const canUseAttendance = hasRole(user, allowedRoles);
  const needsEmployeePick = roleName === APP_ROLES.ADMIN || roleName === APP_ROLES.MANAGER;

  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [record, setRecord] = useState(null);

  useEffect(() => {
    let active = true;

    async function loadEmployees() {
      if (!needsEmployeePick) {
        return;
      }

      setLoadingEmployees(true);
      setError("");

      try {
        const payload = await getEmployees();
        if (!active) {
          return;
        }

        const list = payload?.data || [];
        setEmployees(list);

        if (list.length > 0 && !selectedEmployee) {
          const firstUserId = list[0]?.user?._id || "";
          setSelectedEmployee(firstUserId);
        }
      } catch (loadError) {
        if (active) {
          setError(extractErrorMessage(loadError, "Unable to load employee options"));
        }
      } finally {
        if (active) {
          setLoadingEmployees(false);
        }
      }
    }

    loadEmployees();

    return () => {
      active = false;
    };
  }, [needsEmployeePick, selectedEmployee]);

  const options = useMemo(() => {
    return employees
      .map((employee) => ({
        id: employee.user?._id,
        label: `${employee.fullName} (${employee.employeeCode})`,
      }))
      .filter((option) => option.id);
  }, [employees]);

  async function runAction(actionType) {
    if (!canUseAttendance) {
      setError("Your role does not have attendance permission.");
      return;
    }

    if (needsEmployeePick && !selectedEmployee) {
      setError("Select an employee first.");
      return;
    }

    setProcessing(true);
    setError("");
    setMessage("");

    try {
      const payload = needsEmployeePick ? { employeeId: selectedEmployee } : {};
      const response = actionType === "checkIn" ? await checkIn(payload) : await checkOut(payload);
      setRecord(response?.data || null);
      setMessage(response?.message || "Action completed.");
    } catch (actionError) {
      setError(extractErrorMessage(actionError, "Unable to complete attendance action"));
    } finally {
      setProcessing(false);
    }
  }

  if (!canUseAttendance) {
    return (
      <section className="page-card">
        <PageHeader title="Attendance" subtitle="Data source: /attendance/check-in and /attendance/check-out" />
        <p className="status-note error">Your role does not have access to attendance actions.</p>
      </section>
    );
  }

  return (
    <section className="page-card">
      <PageHeader title="Attendance" subtitle="Live attendance actions against backend." />

      <DataState loading={loadingEmployees} error={error} empty={false}>
        <div className="form-grid">
          {needsEmployeePick ? (
            <label>
              Target employee
              <select value={selectedEmployee} onChange={(event) => setSelectedEmployee(event.target.value)}>
                {options.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <p className="status-note">Employee role will check in/out for its own account.</p>
          )}

          <div className="actions-inline full-width">
            <button type="button" disabled={processing} onClick={() => runAction("checkIn")}>
              {processing ? "Processing..." : "Check in"}
            </button>
            <button type="button" disabled={processing} onClick={() => runAction("checkOut")}>
              {processing ? "Processing..." : "Check out"}
            </button>
          </div>
        </div>
      </DataState>

      {message ? <p className="status-note success">{message}</p> : null}

      {record ? (
        <div className="kv-grid">
          <p>
            <span>Attendance date</span>
            <strong>{record.attendanceDate || "-"}</strong>
          </p>
          <p>
            <span>Check in</span>
            <strong>{formatDateTime(record.checkInAt)}</strong>
          </p>
          <p>
            <span>Check out</span>
            <strong>{formatDateTime(record.checkOutAt)}</strong>
          </p>
          <p>
            <span>Worked hours</span>
            <strong>{record.workedHours ?? "-"}</strong>
          </p>
        </div>
      ) : null}
    </section>
  );
}

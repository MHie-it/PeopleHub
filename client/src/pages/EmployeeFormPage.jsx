import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "../components/PageHeader";
import { useAuth } from "../hooks/useAuth";
import { extractErrorMessage } from "../lib/errors";
import { toDateInputValue } from "../lib/formatters";
import { APP_ROLES, hasRole } from "../lib/roles";
import { getDepartments } from "../services/departmentService";
import {
  createEmployee,
  getEmployeeById,
  getEmployees,
  updateEmployee,
} from "../services/employeeService";
import { getPositions } from "../services/positionService";
import { getRoles } from "../services/roleService";

const allowedRoles = [APP_ROLES.ADMIN, APP_ROLES.HR, APP_ROLES.MANAGER];

const initialForm = {
  username: "",
  password: "",
  email: "",
  roleId: "",
  employeeCode: "",
  fullName: "",
  dateOfBirth: "",
  gender: "OTHER",
  phone: "",
  address: "",
  department: "",
  position: "",
  manager: "",
  joinDate: "",
  employmentStatus: "ACTIVE",
};

function deriveDepartmentsFromPositions(positions) {
  const map = new Map();

  positions.forEach((position) => {
    const department = position.department;
    if (!department) {
      return;
    }

    if (typeof department === "object" && department._id) {
      map.set(department._id, { _id: department._id, name: department.name || department._id });
    } else if (typeof department === "string") {
      map.set(department, { _id: department, name: department });
    }
  });

  return Array.from(map.values());
}

export function EmployeeFormPage() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const { user } = useAuth();

  const [form, setForm] = useState(initialForm);
  const [meta, setMeta] = useState({
    departments: [],
    positions: [],
    managers: [],
    roles: [],
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const hasPermission = hasRole(user, allowedRoles);

  useEffect(() => {
    let active = true;

    async function loadData() {
      setLoading(true);
      setError("");

      if (!hasPermission) {
        setLoading(false);
        setError("You do not have permission for employee create/update.");
        return;
      }

      try {
        const [positionsRes, employeesRes, rolesRes, departmentsRes] = await Promise.allSettled([
          getPositions(),
          getEmployees(),
          getRoles(),
          getDepartments(),
        ]);

        if (!active) {
          return;
        }

        const positions = positionsRes.status === "fulfilled" ? positionsRes.value || [] : [];
        const managers = employeesRes.status === "fulfilled" ? employeesRes.value?.data || [] : [];
        const roles = rolesRes.status === "fulfilled" ? rolesRes.value || [] : [];
        const departments =
          departmentsRes.status === "fulfilled"
            ? departmentsRes.value?.data || []
            : deriveDepartmentsFromPositions(positions);

        setMeta({ departments, positions, managers, roles });

        if (isEditMode) {
          const payload = await getEmployeeById(id);
          const employee = payload?.data;
          if (employee) {
            setForm((previous) => ({
              ...previous,
              fullName: employee.fullName || "",
              dateOfBirth: toDateInputValue(employee.dateOfBirth),
              gender: employee.gender || "OTHER",
              phone: employee.phone || "",
              address: employee.address || "",
              department: employee.department?._id || "",
              position: employee.position?._id || "",
              manager: employee.manager?._id || "",
              joinDate: toDateInputValue(employee.joinDate),
              employmentStatus: employee.employmentStatus || "ACTIVE",
            }));
          }
        }
      } catch (loadError) {
        if (active) {
          setError(extractErrorMessage(loadError, "Unable to load form dependencies"));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      active = false;
    };
  }, [id, isEditMode, hasPermission]);

  const managerOptions = useMemo(() => {
    return meta.managers.filter((manager) => manager._id !== id);
  }, [meta.managers, id]);

  function handleChange(event) {
    const { name, value } = event.target;

    if (name === "position") {
      const position = meta.positions.find((item) => item._id === value);
      const positionDepartment =
        typeof position?.department === "object"
          ? position.department?._id
          : position?.department;

      setForm((previous) => ({
        ...previous,
        position: value,
        department: positionDepartment || previous.department,
      }));
      return;
    }

    setForm((previous) => ({ ...previous, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const position = meta.positions.find((item) => item._id === form.position);
      const positionDepartment =
        typeof position?.department === "object"
          ? position.department?._id
          : position?.department;

      const department = form.department || positionDepartment || "";
      if (!department) {
        throw new Error("Department is required.");
      }

      if (isEditMode) {
        const updatePayload = {
          fullName: form.fullName,
          dateOfBirth: form.dateOfBirth || null,
          gender: form.gender,
          phone: form.phone,
          address: form.address,
          department,
          position: form.position,
          manager: form.manager || null,
          joinDate: form.joinDate,
          employmentStatus: form.employmentStatus,
        };

        await updateEmployee(id, updatePayload);
        setSuccess("Employee profile updated successfully.");
      } else {
        const createPayload = {
          username: form.username,
          password: form.password,
          email: form.email,
          roleId: form.roleId || undefined,
          employeeCode: form.employeeCode,
          fullName: form.fullName,
          dateOfBirth: form.dateOfBirth || null,
          gender: form.gender,
          phone: form.phone,
          address: form.address,
          department,
          position: form.position,
          manager: form.manager || null,
          joinDate: form.joinDate,
        };

        await createEmployee(createPayload);
        setSuccess("Employee created successfully.");
        setForm(initialForm);
      }

      setTimeout(() => {
        navigate("/employees");
      }, 600);
    } catch (submitError) {
      setError(extractErrorMessage(submitError, "Unable to submit employee form"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="page-card">
      <PageHeader
        title={isEditMode ? "Edit Employee" : "Create Employee"}
        subtitle={
          isEditMode
            ? "Updates employee profile through PUT /employees/:id"
            : "Creates user + employee through POST /employees/create"
        }
        actions={<Link to="/employees">Back to list</Link>}
      />

      {loading ? <p className="status-note">Loading form dependencies...</p> : null}
      {error ? <p className="status-note error">{error}</p> : null}
      {success ? <p className="status-note success">{success}</p> : null}

      {!loading && hasPermission ? (
        <form className="form-grid" onSubmit={handleSubmit}>
          {!isEditMode ? (
            <>
              <label>
                Username
                <input name="username" value={form.username} onChange={handleChange} required />
              </label>

              <label>
                Email
                <input type="email" name="email" value={form.email} onChange={handleChange} required />
              </label>

              <label>
                Password
                <input type="password" name="password" value={form.password} onChange={handleChange} required />
              </label>

              <label>
                Employee code
                <input
                  name="employeeCode"
                  value={form.employeeCode}
                  onChange={handleChange}
                  placeholder="EMP001"
                  required
                />
              </label>

              <label>
                Role (optional)
                <select name="roleId" value={form.roleId} onChange={handleChange}>
                  <option value="">Default Employee</option>
                  {meta.roles.map((role) => (
                    <option key={role._id} value={role._id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </label>
            </>
          ) : null}

          <label>
            Full name
            <input name="fullName" value={form.fullName} onChange={handleChange} required />
          </label>

          <label>
            Date of birth
            <input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} />
          </label>

          <label>
            Gender
            <select name="gender" value={form.gender} onChange={handleChange}>
              <option value="MALE">MALE</option>
              <option value="FEMALE">FEMALE</option>
              <option value="OTHER">OTHER</option>
            </select>
          </label>

          <label>
            Phone
            <input name="phone" value={form.phone} onChange={handleChange} />
          </label>

          <label className="full-width">
            Address
            <input name="address" value={form.address} onChange={handleChange} />
          </label>

          <label>
            Position
            <select name="position" value={form.position} onChange={handleChange} required>
              <option value="">Select position</option>
              {meta.positions.map((position) => (
                <option key={position._id} value={position._id}>
                  {position.title}
                </option>
              ))}
            </select>
          </label>

          <label>
            Department
            {meta.departments.length > 0 ? (
              <select name="department" value={form.department} onChange={handleChange} required>
                <option value="">Select department</option>
                {meta.departments.map((department) => (
                  <option key={department._id} value={department._id}>
                    {department.name}
                  </option>
                ))}
              </select>
            ) : (
              <input
                name="department"
                value={form.department}
                onChange={handleChange}
                placeholder="Department ObjectId"
                required
              />
            )}
          </label>

          <label>
            Manager
            <select name="manager" value={form.manager} onChange={handleChange}>
              <option value="">No manager</option>
              {managerOptions.map((manager) => (
                <option key={manager._id} value={manager._id}>
                  {manager.fullName} ({manager.employeeCode})
                </option>
              ))}
            </select>
          </label>

          <label>
            Join date
            <input type="date" name="joinDate" value={form.joinDate} onChange={handleChange} required />
          </label>

          {isEditMode ? (
            <label>
              Employment status
              <select name="employmentStatus" value={form.employmentStatus} onChange={handleChange}>
                <option value="PROBATION">PROBATION</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
                <option value="RESIGNED">RESIGNED</option>
                <option value="TERMINATED">TERMINATED</option>
              </select>
            </label>
          ) : null}

          <div className="full-width actions-inline">
            <button type="submit" disabled={submitting}>
              {submitting ? "Submitting..." : isEditMode ? "Update employee" : "Create employee"}
            </button>
          </div>
        </form>
      ) : null}
    </section>
  );
}

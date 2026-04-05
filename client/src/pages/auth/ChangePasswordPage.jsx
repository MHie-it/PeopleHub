import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { extractErrorMessage } from "../../lib/errors";
import { AuthCard } from "../../components/AuthCard";

export function ChangePasswordPage() {
  const { changePassword } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await changePassword(form);
      setSuccess(response?.message || "Password changed.");
      setForm({ email: form.email, password: "" });
    } catch (submitError) {
      setError(extractErrorMessage(submitError, "Unable to change password"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      title="Change password"
      subtitle="Directly uses /auth/change-password endpoint."
      error={error}
      success={success}
      links={[{ to: "/login", label: "Back to sign in" }]}>
      
      <form className="form-stack" onSubmit={handleSubmit}>
        <label>
          Email
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required />
          
        </label>

        <label>
          New Password
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required />
          
        </label>

        <button type="submit" disabled={loading}>
          {loading ? "Updating..." : "Change password"}
        </button>
      </form>
    </AuthCard>);

}
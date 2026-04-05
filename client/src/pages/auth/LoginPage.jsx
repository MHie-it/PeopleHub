import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { extractErrorMessage } from "../../lib/errors";
import { AuthCard } from "../../components/AuthCard";

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      await login(form);
      navigate("/");
    } catch (submitError) {
      setError(extractErrorMessage(submitError, "Unable to sign in"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      title="Sign in"
      subtitle="Connect to your real PeopleHub backend instance."
      error={error}
      links={[
      { to: "/register", label: "Create account" },
      { to: "/forgot-password", label: "Forgot password" }]
      }>
      
      <form className="form-stack" onSubmit={handleSubmit}>
        <label>
          Username or Email
          <input
            name="username"
            value={form.username}
            onChange={handleChange}
            placeholder="admin or admin@example.com"
            required />
          
        </label>

        <label>
          Password
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required />
          
        </label>

        <button type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </button>

        <p className="form-hint">
          Need password reset after login? Use <Link to="/change-password">change password</Link>.
        </p>
      </form>
    </AuthCard>);

}
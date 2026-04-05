import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { extractErrorMessage } from "../../lib/errors";
import { AuthCard } from "../../components/AuthCard";

export function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await forgotPassword({ email });
      setSuccess(response?.message || "Request sent.");
    } catch (submitError) {
      setError(extractErrorMessage(submitError, "Unable to process request"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      title="Forgot password"
      subtitle="Calls /auth/forgot-password directly."
      error={error}
      success={success}
      links={[{ to: "/login", label: "Back to sign in" }]}>
      
      <form className="form-stack" onSubmit={handleSubmit}>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required />
          
        </label>

        <button type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Send reset request"}
        </button>
      </form>
    </AuthCard>);

}
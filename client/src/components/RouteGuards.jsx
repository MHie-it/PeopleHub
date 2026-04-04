import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function CenterMessage({ title, description }) {
  return (
    <div className="center-message">
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  );
}

export function RequireAuth({ children }) {
  const { token, isBootstrapping } = useAuth();

  if (isBootstrapping) {
    return (
      <CenterMessage
        title="Preparing your workspace"
        description="We are validating your session token with the backend."
      />
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export function PublicOnly({ children }) {
  const { token, isBootstrapping } = useAuth();

  if (isBootstrapping) {
    return (
      <CenterMessage
        title="Loading"
        description="Just a second while we verify your identity."
      />
    );
  }

  if (token) {
    return <Navigate to="/" replace />;
  }

  return children;
}

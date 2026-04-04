import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="center-message">
      <h2>Page not found</h2>
      <p>The route you entered does not exist in this frontend.</p>
      <Link to="/">Go back to dashboard</Link>
    </div>
  );
}

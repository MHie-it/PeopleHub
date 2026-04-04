import { useLocation } from "react-router-dom";
import { PageHeader } from "../components/PageHeader";

const labels = {
  "/contracts": "Contracts",
  "/leave": "Leave",
  "/payroll": "Payroll",
  "/salary": "Salary",
  "/notifications": "Notifications",
};

export function ApiUnavailablePage() {
  const location = useLocation();
  const moduleLabel = labels[location.pathname] || "This module";

  return (
    <section className="page-card">
      <PageHeader
        title={`${moduleLabel} API Not Available`}
        subtitle="Frontend intentionally does not mock endpoints that do not exist in backend routes yet."
      />
      <p>
        The backend currently has schema definitions but no controller/route pair for this module. Once the
        backend endpoints are implemented, this page can be switched to live data calls immediately.
      </p>
    </section>
  );
}

export function DataState({ loading, error, empty, emptyMessage, children }) {
  if (loading) {
    return <p className="status-note">Loading data from backend...</p>;
  }

  if (error) {
    return <p className="status-note error">{error}</p>;
  }

  if (empty) {
    return <p className="status-note">{emptyMessage || "No records found."}</p>;
  }

  return children;
}

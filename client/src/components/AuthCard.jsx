import { Link } from "react-router-dom";

export function AuthCard({
  title,
  subtitle,
  error,
  success,
  children,
  links = []
}) {
  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <p className="auth-kicker">PeopleHub</p>
        <h1>{title}</h1>
        <p>{subtitle}</p>

        {error ? <p className="status-note error">{error}</p> : null}
        {success ? <p className="status-note success">{success}</p> : null}

        {children}

        {links.length > 0 ?
        <div className="auth-links">
            {links.map((link) =>
          <Link key={link.to} to={link.to}>
                {link.label}
              </Link>
          )}
          </div> :
        null}
      </div>
    </div>);

}
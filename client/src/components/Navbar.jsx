import { Link, useLocation } from "react-router-dom";

function Navbar() {
  const location = useLocation();

  return (
    <aside className="sidebar">
      <div className="logo">
        SH
      </div>

      <nav className="sidebar-nav">

        <Link
          className={location.pathname === "/" ? "active" : ""}
          to="/"
        >
          🏠
        </Link>

        <Link
          className={location.pathname === "/dashboard" ? "active" : ""}
          to="/dashboard"
        >
          📊
        </Link>

        <Link
          className={location.pathname === "/upload-resume" ? "active" : ""}
          to="/upload-resume"
        >
          📄
        </Link>

        <Link
          className={location.pathname === "/login" ? "active" : ""}
          to="/login"
        >
          👤
        </Link>

      </nav>
    </aside>
  );
}

export default Navbar;
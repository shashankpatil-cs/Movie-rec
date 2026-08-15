import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <NavLink to="/" className="brand">
          <span className="brand-bulbs">
            <span />
            <span />
            <span />
          </span>
          CinePredict AI
        </NavLink>

        <nav className="nav-links">
          {/* Navigation links only shown to logged-in users */}
          {user && (
            <>
              <NavLink to="/" end className={({ isActive }) => (isActive ? "active" : "")}>
                Showcase
              </NavLink>

              <NavLink to="/watched" className={({ isActive }) => (isActive ? "active" : "")}>
                Watched
              </NavLink>

              {/* Explore: for regular users — admins have TMDB search in their panel */}
              {user.role !== "admin" && (
                <NavLink to="/explore" className={({ isActive }) => (isActive ? "active" : "")}>
                  Explore
                </NavLink>
              )}

              <NavLink to="/recommender" className={({ isActive }) => (isActive ? "active" : "")}>
                Recommender
              </NavLink>

              <NavLink to="/rating-comparison" className={({ isActive }) => (isActive ? "active" : "")}>
                Model Lab
              </NavLink>

              {user.role === "admin" && (
                <NavLink to="/admin" className={({ isActive }) => (isActive ? "active" : "")}>
                  Admin
                </NavLink>
              )}
            </>
          )}

          {user ? (
            <>
              <span className="badge-admin" style={{ color: "var(--text-muted)", borderColor: "var(--border)" }}>
                {user.username}
              </span>
              <button className="pill-btn" onClick={handleLogout}>
                Log out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="pill-btn">
                Log in
              </NavLink>
              <NavLink to="/register" className="pill-btn solid">
                Join
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

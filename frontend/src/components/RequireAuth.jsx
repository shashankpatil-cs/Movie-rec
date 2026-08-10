import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Redirects unauthenticated visitors to the home landing page.
 * Use this to protect routes that require a login (but not admin).
 */
export default function RequireAuth({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="loading-strip">Checking credentials…</div>;
  if (!user) return <Navigate to="/" replace />;

  return children;
}

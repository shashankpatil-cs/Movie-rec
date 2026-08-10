import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (user) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(username, password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err?.response?.data?.detail || "Couldn't log you in. Check your details.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container">
      <div className="form-card">
        <h2>Welcome back</h2>
        <div className="sub">Log in to rate and review films.</div>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="username">Username</label>
            <input id="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button className="btn primary" style={{ width: "100%" }} disabled={busy}>
            {busy ? "Logging in…" : "Log in"}
          </button>
        </form>

        <div className="form-foot">
          New here? <Link to="/register">Create an account</Link>
        </div>
      </div>
    </div>
  );
}

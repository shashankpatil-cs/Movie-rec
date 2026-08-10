import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

/* ------------------------------------------------------------------ */
/*  Sub-component: Movies tab                                           */
/* ------------------------------------------------------------------ */
function MoviesTab() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editRating, setEditRating] = useState(0);
  const [editReview, setEditReview] = useState("");
  const [editFeatured, setEditFeatured] = useState(false);
  const [error, setError] = useState("");

  function load() {
    setLoading(true);
    api
      .get("/movies", { params: { sort: "newest" } })
      .then((res) => setMovies(res.data))
      .catch(() => setError("Couldn't load movies."))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  function startEdit(m) {
    setEditingId(m.id);
    setEditRating(m.admin_rating);
    setEditReview(m.admin_review || "");
    setEditFeatured(m.is_featured);
  }

  async function saveEdit(id) {
    try {
      await api.put(`/admin/movies/${id}`, {
        admin_rating: editRating,
        admin_review: editReview,
        is_featured: editFeatured,
      });
      setEditingId(null);
      load();
    } catch {
      setError("Couldn't save changes.");
    }
  }

  async function remove(id, title) {
    if (!window.confirm(`Remove "${title}" from the showcase?`)) return;
    try {
      await api.delete(`/admin/movies/${id}`);
      load();
    } catch {
      setError("Couldn't delete that movie.");
    }
  }

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <p style={{ color: "var(--text-muted)", maxWidth: 520, margin: 0 }}>
          Add new films from TMDB, adjust your own rating and review, or retire a movie from the showcase.
        </p>
        <Link to="/admin/add" className="btn primary">
          + Add movie
        </Link>
      </div>

      {error && <div className="error-msg">{error}</div>}
      {loading && <div className="loading-strip">Loading…</div>}

      {!loading && movies.length === 0 && (
        <div className="empty-state">
          <h3>Showcase is empty</h3>
          <p>Search TMDB and add the first film.</p>
        </div>
      )}

      {!loading && movies.length > 0 && (
        <table className="admin-table">
          <thead>
            <tr>
              <th></th>
              <th>Title</th>
              <th>My rating</th>
              <th>Audience</th>
              <th>Featured</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {movies.map((m) => (
              <tr key={m.id}>
                <td>
                  {m.poster_url ? (
                    <img src={m.poster_url} className="admin-thumb" alt="" />
                  ) : (
                    <div className="admin-thumb" />
                  )}
                </td>
                <td>{m.title}</td>
                <td>
                  {editingId === m.id ? (
                    <input
                      type="number"
                      min="0"
                      max="10"
                      step="0.5"
                      value={editRating}
                      onChange={(e) => setEditRating(parseFloat(e.target.value))}
                      style={{
                        width: 70,
                        background: "var(--bg-alt)",
                        color: "var(--text)",
                        border: "1px solid var(--border)",
                        borderRadius: 6,
                        padding: "6px 8px",
                      }}
                    />
                  ) : (
                    m.admin_rating.toFixed(1)
                  )}
                </td>
                <td>
                  {m.average_user_rating != null
                    ? `${m.average_user_rating.toFixed(1)} (${m.user_rating_count})`
                    : "—"}
                </td>
                <td>
                  {editingId === m.id ? (
                    <input
                      type="checkbox"
                      checked={editFeatured}
                      onChange={(e) => setEditFeatured(e.target.checked)}
                    />
                  ) : m.is_featured ? (
                    "Yes"
                  ) : (
                    "—"
                  )}
                </td>
                <td>
                  {editingId === m.id ? (
                    <div style={{ display: "flex", gap: 8 }}>
                      <button className="btn primary" onClick={() => saveEdit(m.id)}>
                        Save
                      </button>
                      <button className="btn" onClick={() => setEditingId(null)}>
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: "flex", gap: 8 }}>
                      <button className="btn" onClick={() => startEdit(m)}>
                        Edit
                      </button>
                      <button className="btn danger" onClick={() => remove(m.id, m.title)}>
                        Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {editingId && (
        <div className="field" style={{ maxWidth: 560, marginTop: 18 }}>
          <label>Review for the movie you&apos;re editing</label>
          <textarea value={editReview} onChange={(e) => setEditReview(e.target.value)} />
        </div>
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Sub-component: Users tab                                            */
/* ------------------------------------------------------------------ */
function UsersTab() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function load() {
    setLoading(true);
    api
      .get("/admin/users")
      .then((res) => setUsers(res.data))
      .catch(() => setError("Couldn't load users."))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function deleteUser(id, username) {
    if (!window.confirm(`Permanently delete account "${username}" and all their ratings? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/users/${id}`);
      setSuccess(`User "${username}" has been deleted.`);
      setError("");
      load();
    } catch (err) {
      setError(err?.response?.data?.detail || "Couldn't delete user.");
      setSuccess("");
    }
  }

  const getRoleChip = (role) => (
    <span
      style={{
        display: "inline-block",
        padding: "2px 10px",
        borderRadius: 20,
        fontSize: 11,
        fontFamily: "var(--font-mono)",
        letterSpacing: "0.5px",
        textTransform: "uppercase",
        background: role === "admin" ? "rgba(227,179,65,0.15)" : "rgba(255,255,255,0.06)",
        color: role === "admin" ? "var(--gold)" : "var(--text-muted)",
        border: `1px solid ${role === "admin" ? "var(--gold-dim)" : "var(--border)"}`,
      }}
    >
      {role}
    </span>
  );

  const getRatingBar = (avg) => {
    if (avg == null) return <span style={{ color: "var(--text-faint)" }}>—</span>;
    const pct = (avg / 10) * 100;
    const color = avg >= 7 ? "var(--gold)" : avg >= 5 ? "#6ab0e3" : "var(--red)";
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div
          style={{
            flex: 1,
            height: 4,
            background: "var(--border)",
            borderRadius: 2,
            minWidth: 60,
            maxWidth: 80,
          }}
        >
          <div
            style={{
              width: `${pct}%`,
              height: "100%",
              borderRadius: 2,
              background: color,
              transition: "width 0.4s ease",
            }}
          />
        </div>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color }}>{avg.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <>
      <p style={{ color: "var(--text-muted)", margin: "0 0 16px" }}>
        All registered accounts — view their contribution count, average rating they give, and manage their access.
      </p>

      {error && <div className="error-msg">{error}</div>}
      {success && <div className="success-msg">{success}</div>}
      {loading && <div className="loading-strip">Loading…</div>}

      {!loading && users.length === 0 && (
        <div className="empty-state">
          <h3>No users yet</h3>
          <p>Users will appear here once they register.</p>
        </div>
      )}

      {!loading && users.length > 0 && (
        <table className="admin-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Joined</th>
              <th>Contributions</th>
              <th>Avg rating</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, idx) => (
              <tr key={u.id} style={{ opacity: u.role === "admin" ? 0.7 : 1 }}>
                <td style={{ color: "var(--text-faint)", fontFamily: "var(--font-mono)", fontSize: 12 }}>
                  {idx + 1}
                </td>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        background:
                          u.role === "admin"
                            ? "linear-gradient(135deg, var(--gold-dim), var(--gold))"
                            : "linear-gradient(135deg, #2a2f38, #3a4049)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 13,
                        fontWeight: 700,
                        color: u.role === "admin" ? "#16130a" : "var(--text-muted)",
                        flexShrink: 0,
                      }}
                    >
                      {u.username[0].toUpperCase()}
                    </div>
                    <span style={{ fontWeight: 500 }}>{u.username}</span>
                  </div>
                </td>
                <td style={{ color: "var(--text-muted)", fontSize: 13 }}>{u.email}</td>
                <td>{getRoleChip(u.role)}</td>
                <td style={{ color: "var(--text-faint)", fontFamily: "var(--font-mono)", fontSize: 12 }}>
                  {new Date(u.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </td>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 15,
                        fontWeight: 700,
                        color: u.rating_count > 0 ? "var(--text)" : "var(--text-faint)",
                      }}
                    >
                      {u.rating_count}
                    </span>
                    <span style={{ color: "var(--text-faint)", fontSize: 12 }}>
                      {u.rating_count === 1 ? "rating" : "ratings"}
                    </span>
                  </div>
                </td>
                <td>{getRatingBar(u.average_rating)}</td>
                <td>
                  {u.role !== "admin" ? (
                    <button
                      className="btn danger"
                      id={`delete-user-${u.id}`}
                      style={{ fontSize: 12, padding: "5px 12px" }}
                      onClick={() => deleteUser(u.id, u.username)}
                    >
                      Delete
                    </button>
                  ) : (
                    <span style={{ color: "var(--text-faint)", fontSize: 12, fontFamily: "var(--font-mono)" }}>
                      protected
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {!loading && users.length > 0 && (
        <div
          style={{
            marginTop: 16,
            padding: "10px 14px",
            background: "var(--surface)",
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--border)",
            fontSize: 12,
            color: "var(--text-faint)",
            fontFamily: "var(--font-mono)",
            display: "flex",
            gap: 24,
          }}
        >
          <span>
            Total users: <strong style={{ color: "var(--text)" }}>{users.length}</strong>
          </span>
          <span>
            Active contributors:{" "}
            <strong style={{ color: "var(--gold)" }}>
              {users.filter((u) => u.rating_count > 0).length}
            </strong>
          </span>
          <span>
            Total ratings:{" "}
            <strong style={{ color: "var(--text)" }}>
              {users.reduce((sum, u) => sum + u.rating_count, 0)}
            </strong>
          </span>
        </div>
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Main AdminDashboard — tabbed layout                                 */
/* ------------------------------------------------------------------ */
export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("movies");

  const tabs = [
    { id: "movies", label: "🎬 Showcase" },
    { id: "users", label: "👥 Users" },
  ];

  return (
    <div className="container" style={{ paddingBottom: 60 }}>
      <div className="section-label" style={{ marginTop: 40 }}>
        Admin &middot; Dashboard
      </div>

      {/* Tab bar */}
      <div
        style={{
          display: "flex",
          gap: 4,
          marginTop: 20,
          marginBottom: 28,
          borderBottom: "1px solid var(--border)",
          paddingBottom: 0,
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            id={`admin-tab-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            style={{
              background: "none",
              border: "none",
              borderBottom: activeTab === tab.id ? "2px solid var(--gold)" : "2px solid transparent",
              color: activeTab === tab.id ? "var(--gold)" : "var(--text-muted)",
              fontFamily: "var(--font-mono)",
              fontSize: 13,
              letterSpacing: "0.5px",
              padding: "10px 20px",
              cursor: "pointer",
              transition: "color 0.2s, border-color 0.2s",
              marginBottom: -1,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "movies" && <MoviesTab />}
      {activeTab === "users" && <UsersTab />}
    </div>
  );
}

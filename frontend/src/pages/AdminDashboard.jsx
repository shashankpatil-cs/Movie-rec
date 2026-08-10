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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--gold)", fontWeight: 700, marginBottom: 4 }}>
            Total Movies Added &amp; Rated by Admin: {movies.length}
          </div>
          <p style={{ color: "var(--text-muted)", maxWidth: 520, margin: 0, fontSize: 13 }}>
            Add new films from TMDB, adjust your personal rating and review, or remove movies from the showcase.
          </p>
        </div>
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

  const regularUsers = users.filter((u) => u.role !== "admin");

  return (
    <>
      <p style={{ color: "var(--text-muted)", margin: "0 0 16px" }}>
        All registered audience accounts — view contribution counts, average ratings given, and manage user access.
      </p>

      {error && <div className="error-msg">{error}</div>}
      {success && <div className="success-msg">{success}</div>}
      {loading && <div className="loading-strip">Loading…</div>}

      {!loading && regularUsers.length === 0 && (
        <div className="empty-state">
          <h3>No registered users yet</h3>
          <p>Audience accounts will appear here once users register.</p>
        </div>
      )}

      {!loading && regularUsers.length > 0 && (
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
            {regularUsers.map((u, idx) => (
              <tr key={u.id}>
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
                        background: "linear-gradient(135deg, #2a2f38, #3a4049)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 13,
                        fontWeight: 700,
                        color: "var(--text-muted)",
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
                  <button
                    className="btn danger"
                    id={`delete-user-${u.id}`}
                    style={{ fontSize: 12, padding: "5px 12px" }}
                    onClick={() => deleteUser(u.id, u.username)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {!loading && regularUsers.length > 0 && (
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
            Total audience users: <strong style={{ color: "var(--text)" }}>{regularUsers.length}</strong>
          </span>
          <span>
            Active contributors:{" "}
            <strong style={{ color: "var(--gold)" }}>
              {regularUsers.filter((u) => u.rating_count > 0).length}
            </strong>
          </span>
          <span>
            Total user ratings:{" "}
            <strong style={{ color: "var(--text)" }}>
              {regularUsers.reduce((sum, u) => sum + u.rating_count, 0)}
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
  const [stats, setStats] = useState({ users: 0, movies: 0, contributors: 0, ratings: 0 });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/admin/users").catch(() => ({ data: [] })),
      api.get("/movies").catch(() => ({ data: [] })),
    ]).then(([usersRes, moviesRes]) => {
      const allUsers = usersRes.data || [];
      const regularUsers = allUsers.filter((u) => u.role !== "admin");
      const moviesList = moviesRes.data || [];

      const totalUsers = regularUsers.length;
      const totalMovies = moviesList.length;
      const activeContributors = regularUsers.filter((u) => u.rating_count > 0).length;
      const totalRatings = regularUsers.reduce((sum, u) => sum + (u.rating_count || 0), 0);

      setStats({
        users: totalUsers,
        movies: totalMovies,
        contributors: activeContributors,
        ratings: totalRatings,
      });
      setLoadingStats(false);
    });
  }, []);


  const tabs = [
    { id: "movies", label: `🎬 Admin Section (${stats.movies})` },
    { id: "users", label: `👥 Users (${stats.users})` },
  ];

  return (
    <div className="container" style={{ paddingBottom: 60 }}>
      <div className="section-label" style={{ marginTop: 40 }}>
        Admin &middot; Control Panel
      </div>

      {/* ── Top Overview Stat Cards ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 16,
          marginTop: 20,
          marginBottom: 28,
        }}
      >
        {/* Card 1: Total Users */}
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--gold-dim)",
            borderRadius: "var(--radius-sm)",
            padding: "16px 20px",
            boxShadow: "0 8px 20px -8px rgba(227,179,65,0.08)",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              letterSpacing: "1px",
              textTransform: "uppercase",
              color: "var(--gold)",
              marginBottom: 4,
            }}
          >
            Registered Audience Accounts
          </div>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 32,
              fontWeight: 700,
              color: "var(--text)",
              lineHeight: 1,
            }}
          >
            {loadingStats ? "…" : stats.users}
          </div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>
            Total Registered Users
          </div>
        </div>

        {/* Card 2: Total Movies Added & Rated by Admin */}
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--gold-dim)",
            borderRadius: "var(--radius-sm)",
            padding: "16px 20px",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              letterSpacing: "1px",
              textTransform: "uppercase",
              color: "var(--gold)",
              marginBottom: 4,
            }}
          >
            Admin Curated Catalog
          </div>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 32,
              fontWeight: 700,
              color: "var(--gold)",
              lineHeight: 1,
            }}
          >
            {loadingStats ? "…" : stats.movies}
          </div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>
            Total Movies Added &amp; Rated by Admin
          </div>
        </div>


        {/* Card 3: Active Contributors */}
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-sm)",
            padding: "16px 20px",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              letterSpacing: "1px",
              textTransform: "uppercase",
              color: "#6ab0e3",
              marginBottom: 4,
            }}
          >
            Engaged Audience
          </div>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 32,
              fontWeight: 700,
              color: "#6ab0e3",
              lineHeight: 1,
            }}
          >
            {loadingStats ? "…" : stats.contributors}
          </div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>
            Active Contributors
          </div>
        </div>

        {/* Card 4: Total User Ratings */}
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-sm)",
            padding: "16px 20px",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              letterSpacing: "1px",
              textTransform: "uppercase",
              color: "var(--text-faint)",
              marginBottom: 4,
            }}
          >
            Submitted Reviews
          </div>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 32,
              fontWeight: 700,
              color: "var(--text)",
              lineHeight: 1,
            }}
          >
            {loadingStats ? "…" : stats.ratings}
          </div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>
            Total User Ratings
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div
        style={{
          display: "flex",
          gap: 4,
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


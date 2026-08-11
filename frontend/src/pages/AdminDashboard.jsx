import { useEffect, useState, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
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
/*  Sub-component: Ratings tab  (movie-grouped)                         */
/* ------------------------------------------------------------------ */
function RatingsTab() {
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [filter, setFilter] = useState("");
  const [expandedMovies, setExpandedMovies] = useState(new Set());
  const [expandedReview, setExpandedReview] = useState(null);

  function load() {
    setLoading(true);
    api
      .get("/admin/ratings")
      .then((res) => setRatings(res.data))
      .catch(() => setError("Couldn't load ratings."))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function deleteRating(id) {
    if (!window.confirm("Permanently delete this rating?")) return;
    try {
      await api.delete(`/admin/ratings/${id}`);
      setSuccess("Rating deleted.");
      setError("");
      load();
    } catch {
      setError("Couldn't delete rating.");
      setSuccess("");
    }
  }

  function toggleMovie(movieId) {
    setExpandedMovies((prev) => {
      const next = new Set(prev);
      if (next.has(movieId)) next.delete(movieId);
      else next.add(movieId);
      return next;
    });
  }

  // Group ratings by movie
  const movieMap = {};
  for (const r of ratings) {
    if (!movieMap[r.movie_id]) {
      movieMap[r.movie_id] = {
        movie_id: r.movie_id,
        movie_title: r.movie_title,
        poster_url: r.poster_url,
        ratings: [],
      };
    }
    movieMap[r.movie_id].ratings.push(r);
  }
  let movies = Object.values(movieMap);

  // Filter by search term (movie title or username)
  const q = filter.toLowerCase();
  if (q) {
    movies = movies
      .map((m) => ({
        ...m,
        ratings: m.ratings.filter(
          (r) =>
            r.username.toLowerCase().includes(q) ||
            m.movie_title.toLowerCase().includes(q)
        ),
      }))
      .filter((m) => m.ratings.length > 0);
  }

  // Sort movies alphabetically
  movies.sort((a, b) => a.movie_title.localeCompare(b.movie_title));

  function avgRating(ratingsList) {
    if (!ratingsList.length) return null;
    return ratingsList.reduce((s, r) => s + r.rating, 0) / ratingsList.length;
  }

  function ratingColor(v) {
    if (v >= 7) return "var(--gold)";
    if (v >= 5) return "#6ab0e3";
    return "var(--red)";
  }

  function Stars({ value }) {
    const filled = Math.round(value / 2);
    return (
      <span style={{ color: "var(--gold)", letterSpacing: 1, fontSize: 12 }}>
        {Array.from({ length: 5 }, (_, i) => (i < filled ? "★" : "☆")).join("")}
      </span>
    );
  }

  const totalRatings = ratings.length;

  return (
    <>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
        <p style={{ color: "var(--text-muted)", margin: 0, fontSize: 13, maxWidth: 520 }}>
          Audience ratings grouped by movie — see every user who rated each film.
        </p>
        <input
          type="text"
          placeholder="Filter by movie or user…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{
            background: "var(--bg-alt)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            color: "var(--text)",
            padding: "8px 14px",
            fontSize: 13,
            minWidth: 220,
            outline: "none",
          }}
        />
      </div>

      {error && <div className="error-msg">{error}</div>}
      {success && <div className="success-msg">{success}</div>}
      {loading && <div className="loading-strip">Loading…</div>}

      {!loading && movies.length === 0 && (
        <div className="empty-state">
          <h3>{filter ? "No matching results" : "No ratings yet"}</h3>
          <p>{filter ? "Try a different search term." : "Users haven't rated any movies yet."}</p>
        </div>
      )}

      {!loading && movies.length > 0 && (
        <>
          {/* Summary bar */}
          <div
            style={{
              marginBottom: 16,
              padding: "10px 14px",
              background: "var(--surface)",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border)",
              fontSize: 12,
              color: "var(--text-faint)",
              fontFamily: "var(--font-mono)",
              display: "flex",
              gap: 24,
              flexWrap: "wrap",
            }}
          >
            <span>Movies rated: <strong style={{ color: "var(--text)" }}>{movies.length}</strong></span>
            <span>Total ratings: <strong style={{ color: "var(--gold)" }}>{movies.reduce((s, m) => s + m.ratings.length, 0)}</strong></span>
            <span>Unique raters: <strong style={{ color: "var(--text)" }}>{new Set(ratings.map((r) => r.user_id)).size}</strong></span>
          </div>

          {/* Movie cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {movies.map((m) => {
              const avg = avgRating(m.ratings);
              const isOpen = expandedMovies.has(m.movie_id);
              return (
                <div
                  key={m.movie_id}
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius)",
                    overflow: "hidden",
                    transition: "box-shadow 0.2s",
                  }}
                >
                  {/* Movie header row — click to expand/collapse */}
                  <div
                    onClick={() => toggleMovie(m.movie_id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      padding: "14px 18px",
                      cursor: "pointer",
                      userSelect: "none",
                    }}
                  >
                    {/* Poster */}
                    {m.poster_url ? (
                      <img
                        src={m.poster_url}
                        alt=""
                        style={{ width: 44, height: 62, objectFit: "cover", borderRadius: 4, flexShrink: 0 }}
                      />
                    ) : (
                      <div style={{ width: 44, height: 62, borderRadius: 4, background: "var(--bg-alt)", flexShrink: 0 }} />
                    )}

                    {/* Title + avg */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 15, color: "var(--text)", marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {m.movie_title}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                        {avg != null && (
                          <span
                            style={{
                              fontFamily: "var(--font-mono)",
                              fontWeight: 700,
                              fontSize: 18,
                              color: ratingColor(avg),
                            }}
                          >
                            {avg.toFixed(1)}
                            <span style={{ fontSize: 11, color: "var(--text-faint)", fontWeight: 400, marginLeft: 2 }}>/10</span>
                          </span>
                        )}
                        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                          {m.ratings.length} {m.ratings.length === 1 ? "rating" : "ratings"}
                        </span>
                      </div>
                    </div>

                    {/* Chevron */}
                    <span
                      style={{
                        fontSize: 18,
                        color: "var(--text-faint)",
                        transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.25s ease",
                        flexShrink: 0,
                      }}
                    >
                      ▾
                    </span>
                  </div>

                  {/* Expanded user ratings */}
                  {isOpen && (
                    <div style={{ borderTop: "1px solid var(--border)" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                        <thead>
                          <tr style={{ background: "rgba(255,255,255,0.02)" }}>
                            <th style={{ padding: "8px 18px", textAlign: "left", fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.8px", textTransform: "uppercase", color: "var(--text-faint)", fontWeight: 500, borderBottom: "1px solid var(--border-soft)" }}>User</th>
                            <th style={{ padding: "8px 14px", textAlign: "center", fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.8px", textTransform: "uppercase", color: "var(--text-faint)", fontWeight: 500, borderBottom: "1px solid var(--border-soft)" }}>Rating</th>
                            <th style={{ padding: "8px 14px", textAlign: "center", fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.8px", textTransform: "uppercase", color: "var(--text-faint)", fontWeight: 500, borderBottom: "1px solid var(--border-soft)" }}>Stars</th>
                            <th style={{ padding: "8px 14px", textAlign: "left", fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.8px", textTransform: "uppercase", color: "var(--text-faint)", fontWeight: 500, borderBottom: "1px solid var(--border-soft)" }}>Date</th>
                            <th style={{ padding: "8px 14px", borderBottom: "1px solid var(--border-soft)" }}></th>
                          </tr>
                        </thead>
                        <tbody>
                          {m.ratings.map((r) => (
                            <>
                              <tr
                                key={r.id}
                                style={{ borderBottom: "1px solid var(--border-soft)", cursor: r.review ? "pointer" : "default" }}
                                onClick={() => r.review && setExpandedReview(expandedReview === r.id ? null : r.id)}
                              >
                                {/* User */}
                                <td style={{ padding: "10px 18px" }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                                    <div
                                      style={{
                                        width: 28,
                                        height: 28,
                                        borderRadius: "50%",
                                        background: "linear-gradient(135deg, #2a2f38, #3a4049)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: 12,
                                        fontWeight: 700,
                                        color: "var(--text-muted)",
                                        flexShrink: 0,
                                      }}
                                    >
                                      {r.username[0].toUpperCase()}
                                    </div>
                                    <span style={{ fontWeight: 500 }}>{r.username}</span>
                                  </div>
                                </td>

                                {/* Score */}
                                <td style={{ padding: "10px 14px", textAlign: "center" }}>
                                  <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 16, color: ratingColor(r.rating) }}>
                                    {r.rating.toFixed(1)}
                                  </span>
                                  <span style={{ color: "var(--text-faint)", fontSize: 11 }}>/10</span>
                                </td>

                                {/* Stars */}
                                <td style={{ padding: "10px 14px", textAlign: "center" }}>
                                  <Stars value={r.rating} />
                                </td>

                                {/* Date */}
                                <td style={{ padding: "10px 14px", color: "var(--text-faint)", fontFamily: "var(--font-mono)", fontSize: 11, whiteSpace: "nowrap" }}>
                                  {new Date(r.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                                </td>

                                {/* Actions */}
                                <td style={{ padding: "10px 14px" }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                    {r.review && (
                                      <button
                                        className="btn"
                                        style={{ fontSize: 11, padding: "3px 9px" }}
                                        onClick={(e) => { e.stopPropagation(); setExpandedReview(expandedReview === r.id ? null : r.id); }}
                                      >
                                        {expandedReview === r.id ? "Hide" : "Review"}
                                      </button>
                                    )}
                                    <button
                                      className="btn danger"
                                      style={{ fontSize: 11, padding: "3px 9px" }}
                                      onClick={(e) => { e.stopPropagation(); deleteRating(r.id); }}
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </td>
                              </tr>

                              {/* Expandable review */}
                              {expandedReview === r.id && r.review && (
                                <tr key={`${r.id}-rev`}>
                                  <td colSpan={5} style={{ padding: "0 18px 14px 55px" }}>
                                    <div
                                      style={{
                                        background: "rgba(255,255,255,0.03)",
                                        border: "1px solid var(--border)",
                                        borderRadius: "var(--radius-sm)",
                                        padding: "10px 14px",
                                        fontSize: 13,
                                        color: "var(--text-muted)",
                                        lineHeight: 1.7,
                                        fontStyle: "italic",
                                      }}
                                    >
                                      &ldquo;{r.review}&rdquo;
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}



/* ------------------------------------------------------------------ */
/*  Sub-component: ML Evaluation tab                                    */
/* ------------------------------------------------------------------ */
const MODEL_META = [
  { key: "content_based", label: "Content-Based", color: "var(--gold)", bg: "rgba(227,179,65,0.10)", icon: "🎭" },
  { key: "collaborative", label: "Collaborative", color: "#6ab0e3", bg: "rgba(106,176,232,0.10)", icon: "👥" },
  { key: "hybrid",        label: "Hybrid",        color: "#c97ee8", bg: "rgba(201,126,232,0.10)", icon: "🚀" },
];

const METRIC_COLS = [
  { key: "precision@5",  label: "Precision@5",  desc: "Hit rate in top 5" },
  { key: "recall@5",    label: "Recall@5",    desc: "Coverage in top 5" },
  { key: "precision@10", label: "Precision@10", desc: "Hit rate in top 10" },
  { key: "recall@10",   label: "Recall@10",   desc: "Coverage in top 10" },
  { key: "mae",          label: "MAE",          desc: "Mean Absolute Error (CF only)" },
  { key: "rmse",         label: "RMSE",         desc: "Root Mean Sq. Error (CF only)" },
];

function MetricBar({ value, max, color }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div style={{ flex: 1, height: 6, background: "var(--border)", borderRadius: 3, overflow: "hidden" }}>
      <div
        style={{
          width: `${pct}%`,
          height: "100%",
          background: color,
          borderRadius: 3,
          transition: "width 0.8s cubic-bezier(0.34,1.56,0.64,1)",
        }}
      />
    </div>
  );
}

function MLEvaluationTab() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    setLoading(true);
    api
      .get("/admin/ml-evaluation")
      .then((res) => setData(res.data))
      .catch(() => setError("Could not load ML evaluation data."))
      .finally(() => setLoading(false));
  }, []);

  function refresh() {
    hasFetched.current = false;
    setData(null);
    setLoading(true);
    setError("");
    api
      .get("/admin/ml-evaluation")
      .then((res) => setData(res.data))
      .catch(() => setError("Could not load ML evaluation data."))
      .finally(() => setLoading(false));
  }

  if (loading) return <div className="loading-strip">Running ML evaluation… this may take a moment.</div>;
  if (error) return <div className="error-msg">{error}</div>;
  if (!data) return null;

  const isInsufficient = data.status === "insufficient_data";

  // For bar chart normalisation per metric column
  function maxForMetric(metricKey) {
    if (!data.models) return 1;
    const vals = MODEL_META.map((m) => data.models[m.key]?.[metricKey]).filter((v) => v != null);
    return vals.length ? Math.max(...vals) : 1;
  }

  return (
    <div>
      {/* Header row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--gold)", marginBottom: 6 }}>
            🔬 ML Model Evaluation · Leave-One-Out Cross-Validation
          </div>
          <p style={{ margin: 0, fontSize: 13, color: "var(--text-muted)", maxWidth: 620 }}>
            {data.message}
          </p>
          <div style={{ display: "flex", gap: 20, marginTop: 10, flexWrap: "wrap" }}>
            {[
              { label: "Users Evaluated", value: data.total_users_evaluated },
              { label: "Movies in Catalog", value: data.total_movies },
              { label: "Total Ratings", value: data.total_ratings },
            ].map(({ label, value }) => (
              <div key={label} style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--text-faint)" }}>
                <span style={{ color: "var(--text-muted)" }}>{label}: </span>
                <strong style={{ color: "var(--text)" }}>{value}</strong>
              </div>
            ))}
          </div>
        </div>
        <button className="btn" onClick={refresh} style={{ fontSize: 12, padding: "8px 16px" }}>
          ↻ Re-evaluate
        </button>
      </div>

      {isInsufficient ? (
        <div
          style={{
            background: "rgba(227,179,65,0.07)",
            border: "1px solid var(--gold-dim)",
            borderRadius: "var(--radius)",
            padding: "28px 32px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
          <h3 style={{ fontFamily: "var(--font-display)", margin: "0 0 8px", color: "var(--text)" }}>Not Enough Data Yet</h3>
          <p style={{ color: "var(--text-muted)", fontSize: 13, maxWidth: 480, margin: "0 auto" }}>
            Leave-one-out evaluation requires at least <strong>2 users</strong> each with{" "}
            <strong>3+ ratings</strong> and at least <strong>1 rating ≥ 7</strong>.{" "}
            Add more movies and encourage audience members to rate them.
          </p>
        </div>
      ) : (
        <>
          {/* Model comparison table */}
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr>
                  <th style={{ padding: "10px 14px", textAlign: "left", fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "1px", textTransform: "uppercase", color: "var(--text-faint)", borderBottom: "1px solid var(--border)", whiteSpace: "nowrap" }}>
                    Model
                  </th>
                  {METRIC_COLS.map((col) => (
                    <th
                      key={col.key}
                      title={col.desc}
                      style={{ padding: "10px 14px", textAlign: "right", fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "1px", textTransform: "uppercase", color: "var(--text-faint)", borderBottom: "1px solid var(--border)", whiteSpace: "nowrap", cursor: "help" }}
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MODEL_META.map((model) => {
                  const metrics = data.models[model.key] || {};
                  return (
                    <tr key={model.key} style={{ borderBottom: "1px solid var(--border-soft)" }}>
                      <td style={{ padding: "14px 14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 8,
                              background: model.bg,
                              border: `1px solid ${model.color}40`,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 16,
                              flexShrink: 0,
                            }}
                          >
                            {model.icon}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: model.color, fontSize: 13 }}>{model.label}</div>
                            <div style={{ fontSize: 11, color: "var(--text-faint)", fontFamily: "var(--font-mono)" }}>{model.key.replace(/_/g, "-")}</div>
                          </div>
                        </div>
                      </td>
                      {METRIC_COLS.map((col) => {
                        const val = metrics[col.key];
                        const isError = col.key === "mae" || col.key === "rmse";
                        const cfOnly = isError && model.key !== "collaborative";
                        return (
                          <td key={col.key} style={{ padding: "14px 14px", textAlign: "right" }}>
                            {cfOnly ? (
                              <span style={{ color: "var(--text-faint)", fontSize: 12 }}>—</span>
                            ) : val == null ? (
                              <span style={{ color: "var(--text-faint)", fontSize: 12 }}>N/A</span>
                            ) : (
                              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                                <span
                                  style={{
                                    fontFamily: "var(--font-mono)",
                                    fontWeight: 700,
                                    fontSize: 14,
                                    color: isError
                                      ? val <= 1 ? "var(--gold)" : val <= 2 ? "#6ab0e3" : "var(--red)"
                                      : val >= 0.5 ? "var(--gold)" : val >= 0.2 ? "#6ab0e3" : "var(--text-muted)",
                                  }}
                                >
                                  {isError ? val.toFixed(3) : (val * 100).toFixed(1) + "%"}
                                </span>
                                <div style={{ width: 80 }}>
                                  <MetricBar
                                    value={val}
                                    max={isError ? Math.max(maxForMetric(col.key), 1) : 1}
                                    color={model.color}
                                  />
                                </div>
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Metric legend */}
          <div
            style={{
              marginTop: 24,
              padding: "16px 20px",
              background: "var(--surface)",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border)",
            }}
          >
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "1px", textTransform: "uppercase", color: "var(--text-faint)", marginBottom: 10 }}>
              Metric Definitions
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "8px 24px" }}>
              {METRIC_COLS.map((col) => (
                <div key={col.key} style={{ fontSize: 12 }}>
                  <span style={{ fontFamily: "var(--font-mono)", color: "var(--gold)", fontWeight: 600 }}>{col.label}:</span>{" "}
                  <span style={{ color: "var(--text-muted)" }}>{col.desc}</span>
                </div>
              ))}
              <div style={{ fontSize: 12 }}>
                <span style={{ fontFamily: "var(--font-mono)", color: "var(--gold)", fontWeight: 600 }}>Method:</span>{" "}
                <span style={{ color: "var(--text-muted)" }}>Leave-one-out — each user's highest-rated film is held out as the relevant item, then we check if each model recommends it in its top-K results.</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main AdminDashboard — tabbed layout                                 */
/* ------------------------------------------------------------------ */
export default function AdminDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();

  const VALID_TABS = ["movies", "users", "ratings", "ml_eval"];

  const [activeTab, setActiveTabState] = useState(() => {
    const tabFromUrl = searchParams.get("tab");
    if (VALID_TABS.includes(tabFromUrl)) return tabFromUrl;
    const tabFromStorage = localStorage.getItem("admin_active_tab");
    if (VALID_TABS.includes(tabFromStorage)) return tabFromStorage;
    return "movies";
  });

  function handleTabChange(tabId) {
    setActiveTabState(tabId);
    setSearchParams({ tab: tabId }, { replace: true });
    localStorage.setItem("admin_active_tab", tabId);
  }

  useEffect(() => {
    const tabFromUrl = searchParams.get("tab");
    if (tabFromUrl && VALID_TABS.includes(tabFromUrl)) {
      setActiveTabState(tabFromUrl);
      localStorage.setItem("admin_active_tab", tabFromUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

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
    { id: "movies",  label: `🎬 Admin Section (${stats.movies})` },
    { id: "users",   label: `👥 Users (${stats.users})` },
    { id: "ratings", label: `⭐ Ratings (${stats.ratings})` },
    { id: "ml_eval", label: "🔬 ML Evaluation" },
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
            onClick={() => handleTabChange(tab.id)}
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

      {activeTab === "movies"  && <MoviesTab />}
      {activeTab === "users"   && <UsersTab />}
      {activeTab === "ratings" && <RatingsTab />}
      {activeTab === "ml_eval" && <MLEvaluationTab />}
    </div>
  );
}


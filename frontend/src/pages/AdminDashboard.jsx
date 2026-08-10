import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

export default function AdminDashboard() {
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
    <div className="container" style={{ paddingBottom: 60 }}>
      <div className="section-label" style={{ marginTop: 40 }}>
        Admin &middot; Showcase management
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <p style={{ color: "var(--text-muted)", maxWidth: 520 }}>
          Add new films from TMDB, adjust your own rating and review, or retire a movie from
          the showcase.
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
          <label>Review for the movie you're editing</label>
          <textarea value={editReview} onChange={(e) => setEditReview(e.target.value)} />
        </div>
      )}
    </div>
  );
}

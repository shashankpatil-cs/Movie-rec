import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import StarRating from "../components/StarRating";

export default function AdminAddMovie() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");

  const [selected, setSelected] = useState(null);
  const [rating, setRating] = useState(8);
  const [review, setReview] = useState("");
  const [featured, setFeatured] = useState(false);
  const [saving, setSaving] = useState(false);

  async function search(e) {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    setError("");
    try {
      const res = await api.get("/admin/tmdb/search", { params: { q: query } });
      setResults(res.data);
    } catch (err) {
      setError(err?.response?.data?.detail || "TMDB search failed. Check the API key on the server.");
    } finally {
      setSearching(false);
    }
  }

  function pick(movie) {
    setSelected(movie);
    setResults([]);
  }

  async function addMovie(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await api.post("/admin/movies", {
        tmdb_id: selected.tmdb_id,
        title: selected.title,
        overview: selected.overview,
        release_date: selected.release_date,
        poster_path: selected.poster_path,
        backdrop_path: selected.backdrop_path,
        tmdb_rating: selected.tmdb_rating,
        admin_rating: rating,
        admin_review: review,
        is_featured: featured,
      });
      navigate(`/movies/${res.data.id}`);
    } catch (err) {
      setError(err?.response?.data?.detail || "Couldn't add this movie.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="container" style={{ paddingBottom: 60 }}>
      <div className="section-label" style={{ marginTop: 40 }}>
        Admin &middot; Add a movie
      </div>

      {error && <div className="error-msg">{error}</div>}

      {!selected && (
        <>
          <form onSubmit={search} className="toolbar" style={{ marginTop: 0, marginBottom: 24 }}>
            <div className="search-input-wrap" style={{ flex: "1 1 320px" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                placeholder="Search TMDB for a title..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <button className="btn primary" disabled={searching}>
              {searching ? "Searching…" : "Search"}
            </button>
          </form>

          {results.map((m) => (
            <div className="tmdb-result-card" key={m.tmdb_id}>
              {m.poster_url ? <img src={m.poster_url} alt="" /> : <div className="admin-thumb" />}
              <div className="tmdb-result-info">
                <h4>{m.title}</h4>
                <p>
                  {m.release_date ? m.release_date.slice(0, 4) : "—"}
                  {m.tmdb_rating ? ` · TMDB ${m.tmdb_rating.toFixed(1)}` : ""}
                </p>
              </div>
              <button className="btn primary" onClick={() => pick(m)}>
                Select
              </button>
            </div>
          ))}
        </>
      )}

      {selected && (
        <div className="form-card" style={{ margin: 0, maxWidth: 560 }}>
          <h2>{selected.title}</h2>
          <div className="sub">
            {selected.release_date ? selected.release_date.slice(0, 4) : "—"}
            {selected.tmdb_rating ? ` · TMDB ${selected.tmdb_rating.toFixed(1)}` : ""}
          </div>

          <form onSubmit={addMovie}>
            <div className="field">
              <label>Your rating (0&ndash;10)</label>
              <StarRating value={rating} onChange={setRating} disabled={saving} />
            </div>
            <div className="field">
              <label htmlFor="admin-review">Your review</label>
              <textarea
                id="admin-review"
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Why does this belong in the showcase?"
              />
            </div>
            <div className="field" style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <input
                type="checkbox"
                id="featured"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                style={{ width: "auto" }}
              />
              <label htmlFor="featured" style={{ marginBottom: 0 }}>
                Mark as featured
              </label>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
              <button className="btn primary" disabled={saving}>
                {saving ? "Adding…" : "Add to showcase"}
              </button>
              <button type="button" className="btn" onClick={() => setSelected(null)}>
                Back to search
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

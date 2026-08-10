import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";
import StarRating from "../components/StarRating";
import { useAuth } from "../context/AuthContext";

export default function MovieDetail() {
  const { id } = useParams();
  const { user } = useAuth();

  const [movie, setMovie] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [myRating, setMyRating] = useState(7);
  const [myReview, setMyReview] = useState("");
  const [hasRated, setHasRated] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  function loadAll() {
    setLoading(true);
    Promise.all([api.get(`/movies/${id}`), api.get(`/movies/${id}/ratings`)])
      .then(([movieRes, ratingsRes]) => {
        setMovie(movieRes.data);
        setRatings(ratingsRes.data);
      })
      .catch(() => setError("Couldn't find that movie."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (!user) return;
    api
      .get(`/movies/${id}/my-rating`)
      .then((res) => {
        setMyRating(res.data.rating);
        setMyReview(res.data.review || "");
        setHasRated(true);
      })
      .catch(() => setHasRated(false));
  }, [id, user]);

  async function submitRating(e) {
    e.preventDefault();
    setSaving(true);
    setSaveMsg("");
    try {
      await api.post(`/movies/${id}/rate`, { rating: myRating, review: myReview });
      setSaveMsg("Your rating was saved.");
      setHasRated(true);
      loadAll();
    } catch (err) {
      setSaveMsg(err?.response?.data?.detail || "Couldn't save your rating.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="loading-strip">Rolling the film…</div>;
  if (error || !movie) return <div className="container"><div className="error-msg">{error}</div></div>;

  const genres = (movie.genres || "").split(",").map((g) => g.trim()).filter(Boolean);

  return (
    <div className="container">
      <div className="detail-hero">
        <div className="detail-poster">
          {movie.poster_url ? (
            <img src={movie.poster_url} alt={`${movie.title} poster`} />
          ) : (
            <div className="no-poster" style={{ padding: 24 }}>
              {movie.title}
            </div>
          )}
        </div>

        <div>
          <div className="hero-eyebrow">
            {movie.is_featured ? "Featured pick" : "In the showcase"}
          </div>
          <h1 className="detail-title">{movie.title}</h1>

          <div className="detail-meta-row">
            <span className="admin-score" style={{ position: "static" }}>
              {movie.admin_rating?.toFixed(1)}
            </span>
            <span style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: 13 }}>
              {movie.release_date ? movie.release_date.slice(0, 4) : "—"}
              {movie.runtime ? ` · ${movie.runtime} min` : ""}
              {movie.average_user_rating != null
                ? ` · Audience ${movie.average_user_rating.toFixed(1)} (${movie.user_rating_count})`
                : " · No audience ratings yet"}
            </span>
          </div>

          {genres.length > 0 && (
            <div className="genre-tags" style={{ marginBottom: 16 }}>
              {genres.map((g) => (
                <span key={g} className="genre-tag">
                  {g}
                </span>
              ))}
            </div>
          )}

          <p className="overview-text">{movie.overview}</p>

          {movie.admin_review && (
            <div className="review-card">
              <div className="review-label">Why it's here — the admin's take</div>
              <p>{movie.admin_review}</p>
            </div>
          )}
        </div>
      </div>

      <div className="section-label">Your rating</div>

      {user ? (
        <div className="form-card" style={{ margin: "0 0 40px", maxWidth: 560 }}>
          {saveMsg && (
            <div className={hasRated ? "success-msg" : "error-msg"}>{saveMsg}</div>
          )}
          <form onSubmit={submitRating}>
            <div className="field">
              <label>Score (0&ndash;10)</label>
              <StarRating value={myRating} onChange={setMyRating} disabled={saving} />
            </div>
            <div className="field">
              <label htmlFor="review">Review (optional)</label>
              <textarea
                id="review"
                value={myReview}
                onChange={(e) => setMyReview(e.target.value)}
                placeholder="What did you think?"
              />
            </div>
            <button className="btn primary" disabled={saving}>
              {saving ? "Saving…" : hasRated ? "Update rating" : "Submit rating"}
            </button>
          </form>
        </div>
      ) : (
        <div className="empty-state" style={{ padding: "30px 20px" }}>
          <p>
            <a href="/login" className="pill-btn solid" style={{ display: "inline-block" }}>
              Log in to rate this film
            </a>
          </p>
        </div>
      )}

      <div className="section-label">Audience reviews ({ratings.length})</div>
      <div style={{ paddingBottom: 60 }}>
        {ratings.length === 0 && (
          <p style={{ color: "var(--text-faint)" }}>No one has rated this yet — be the first.</p>
        )}
        {ratings.map((r) => (
          <div className="user-review-row" key={r.id}>
            <span className="who">{r.username || "viewer"}</span>
            <div style={{ flex: 1 }}>{r.review || <em style={{ color: "var(--text-faint)" }}>No written review</em>}</div>
            <span className="score">{r.rating.toFixed(1)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

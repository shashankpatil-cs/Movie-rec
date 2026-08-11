import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
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
      setSaveMsg("Rating saved!");
      setHasRated(true);
      loadAll();
    } catch (err) {
      setSaveMsg(err?.response?.data?.detail || "Couldn't save rating.");
    } finally {
      setSaving(false);
    }
  }

  async function removeRating() {
    if (!window.confirm("Remove your rating?")) return;
    setSaving(true);
    setSaveMsg("");
    try {
      await api.delete(`/movies/${id}/rate`);
      setSaveMsg("Rating removed.");
      setHasRated(false);
      setMyReview("");
      setMyRating(7);
      loadAll();
    } catch (err) {
      setSaveMsg(err?.response?.data?.detail || "Couldn't remove rating.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteUserRating(ratingId, authorName) {
    if (!window.confirm(`Delete rating by ${authorName || "viewer"}?`)) return;
    try {
      await api.delete(`/admin/ratings/${ratingId}`);
      loadAll();
    } catch (err) {
      alert(err?.response?.data?.detail || "Couldn't delete rating.");
    }
  }

  if (loading) return <div className="loading-strip">Loading movie…</div>;
  if (error || !movie)
    return (
      <div className="container" style={{ paddingTop: 30 }}>
        <div className="error-msg">{error}</div>
      </div>
    );

  const genres = (movie.genres || "")
    .split(",")
    .map((g) => g.trim())
    .filter(Boolean);

  const isAudienceUnlocked =
    movie.is_audience_unlocked || (movie.user_rating_count >= 3 && movie.average_user_rating != null);

  return (
    <div className="container" style={{ padding: "32px 24px 60px", maxWidth: 960 }}>
      {/* ── Movie Hero Header (Proper Poster + Movie Details) ── */}
      <div
        style={{
          display: "flex",
          gap: 28,
          marginBottom: 32,
          alignItems: "flex-start",
          flexWrap: "wrap",
        }}
      >
        {/* Proper Proportioned Poster Image */}
        <div
          style={{
            width: 220,
            height: 330,
            flexShrink: 0,
            borderRadius: "var(--radius)",
            overflow: "hidden",
            border: "1px solid var(--border)",
            boxShadow: "0 14px 30px -10px rgba(0,0,0,0.5)",
            background: "var(--surface)",
            position: "relative",
          }}
        >
          {movie.poster_url ? (
            <img
              src={movie.poster_url}
              alt={`${movie.title} poster`}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <div className="no-poster" style={{ padding: 16, fontSize: 18, height: "100%", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
              {movie.title}
            </div>
          )}

          {movie.is_featured && (
            <span
              className="featured-tag"
              style={{ position: "absolute", top: 10, left: 10, fontSize: 10, padding: "3px 8px" }}
            >
              ⭐ Featured
            </span>
          )}
        </div>

        {/* Movie Details */}
        <div style={{ flex: 1, minWidth: 280, display: "flex", flexDirection: "column", gap: 10 }}>
          <div className="hero-eyebrow" style={{ fontSize: 11, marginBottom: 0 }}>
            {movie.is_featured ? "Featured Pick" : "Admin Showcase Pick"}
          </div>

          {/* Title & Admin Rating Beside It */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(32px, 4vw, 44px)",
                lineHeight: 1.05,
                margin: 0,
                color: "var(--text)",
              }}
            >
              {movie.title}
            </h1>

            {movie.admin_rating != null && (
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  background: "rgba(227,179,65,0.12)",
                  border: "1px solid var(--gold)",
                  color: "var(--gold)",
                  borderRadius: "var(--radius-sm)",
                  padding: "4px 12px",
                  fontFamily: "var(--font-mono)",
                  fontWeight: 700,
                  fontSize: 16,
                  whiteSpace: "nowrap",
                }}
                title="Admin Rating"
              >
                <span>Admin ★</span>
                <span>{movie.admin_rating.toFixed(1)}</span>
              </div>
            )}
          </div>

          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 14,
              color: "var(--text-muted)",
            }}
          >
            {movie.release_date ? movie.release_date.slice(0, 4) : "—"}
            {movie.runtime ? ` · ${movie.runtime} min` : ""}
          </div>

          {genres.length > 0 && (
            <div className="genre-tags" style={{ margin: "4px 0" }}>
              {genres.map((g) => (
                <span key={g} className="genre-tag">
                  {g}
                </span>
              ))}
            </div>
          )}

          {movie.overview && (
            <p
              style={{
                color: "var(--text-muted)",
                fontSize: 15,
                lineHeight: 1.6,
                margin: "4px 0 0",
              }}
            >
              {movie.overview}
            </p>
          )}

          {/* Admin Review Directly Below Description */}
          {movie.admin_review && (
            <div
              style={{
                marginTop: 14,
                padding: "14px 18px",
                background: "var(--surface)",
                border: "1px solid var(--gold-dim)",
                borderLeft: "4px solid var(--gold)",
                borderRadius: "var(--radius-sm)",
                boxShadow: "0 6px 20px -8px rgba(227,179,65,0.08)",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  color: "var(--gold)",
                  fontWeight: 700,
                  marginBottom: 6,
                }}
              >
                Admin Review
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: 14.5,
                  lineHeight: 1.6,
                  color: "var(--text)",
                  whiteSpace: "pre-line",
                }}
              >
                &ldquo;{movie.admin_review}&rdquo;
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Audience Ratings & User Input Section ── */}
      <div className="section-label">👥 Audience Rating &amp; Reviews</div>


      {/* Audience Score Indicator Banner */}
      <div
        style={{
          background: isAudienceUnlocked ? "rgba(106,176,232,0.08)" : "var(--bg-alt)",
          border: `1px solid ${isAudienceUnlocked ? "rgba(106,176,232,0.25)" : "var(--border)"}`,
          borderRadius: "var(--radius)",
          padding: "18px 24px",
          marginBottom: 24,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "1px", textTransform: "uppercase", color: isAudienceUnlocked ? "#6ab0e3" : "var(--text-faint)", marginBottom: 2 }}>
            Community Rating
          </div>
          <div style={{ fontSize: 17, fontWeight: 600, color: "var(--text)" }}>
            {isAudienceUnlocked ? "Audience Average Score" : "Audience Rating Locked"}
          </div>
          <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>
            {isAudienceUnlocked
              ? `Calculated from ${movie.user_rating_count} user rating${movie.user_rating_count > 1 ? "s" : ""}`
              : `Requires at least 3 user ratings to unlock audience score (${movie.user_rating_count}/3 submitted)`}
          </div>
        </div>

        {isAudienceUnlocked ? (
          <div
            style={{
              background: "rgba(106,176,232,0.15)",
              border: "1.5px solid #6ab0e3",
              color: "#6ab0e3",
              borderRadius: "var(--radius-sm)",
              padding: "8px 16px",
              fontFamily: "var(--font-mono)",
              fontWeight: 700,
              fontSize: 20,
            }}
          >
            ★ {movie.average_user_rating?.toFixed(1)}
          </div>
        ) : (
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-sm)",
              padding: "8px 14px",
              color: "var(--text-muted)",
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span>🔒</span>
            <span>Needs 3+ ratings ({movie.user_rating_count}/3)</span>
          </div>
        )}
      </div>

      {/* User Input Rating & Review Card */}
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          padding: "22px 24px",
          marginBottom: 32,
        }}
      >
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, textTransform: "uppercase", letterSpacing: "1px", color: "var(--gold)", marginBottom: 14, fontWeight: 700 }}>
          Your Rating &amp; Review Input
        </div>

        {user ? (
          <form onSubmit={submitRating} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {saveMsg && (
              <div className={hasRated ? "success-msg" : "error-msg"} style={{ padding: "8px 12px", fontSize: 13 }}>
                {saveMsg}
              </div>
            )}

            <div>
              <label style={{ fontSize: 13, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>
                Your Rating (0 to 10):
              </label>
              <StarRating value={myRating} onChange={setMyRating} disabled={saving} />
            </div>

            <div>
              <label htmlFor="userReview" style={{ fontSize: 13, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>
                Your Review (optional):
              </label>
              <textarea
                id="userReview"
                value={myReview}
                onChange={(e) => setMyReview(e.target.value)}
                placeholder="What did you think of this film?"
                rows={3}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border)",
                  background: "var(--bg)",
                  color: "var(--text)",
                  fontSize: 14,
                }}
              />
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn primary" disabled={saving}>
                {saving ? "Saving…" : hasRated ? "Update Rating" : "Submit Rating"}
              </button>
              {hasRated && (
                <button type="button" className="btn danger" disabled={saving} onClick={removeRating}>
                  Remove Rating
                </button>
              )}
            </div>
          </form>
        ) : (
          <div className="empty-state" style={{ padding: "20px 16px", textAlign: "left" }}>
            <p style={{ margin: "0 0 12px", color: "var(--text-muted)", fontSize: 14 }}>
              Log in to leave your personal rating and written review.
            </p>
            <Link to="/login" className="pill-btn solid" style={{ display: "inline-block" }}>
              Log in to rate this film →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}






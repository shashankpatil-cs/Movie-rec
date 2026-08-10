import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/axios";

export default function ExploreMovieDetail() {
  const { tmdbId } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    api
      .get(`/explore/movie/${tmdbId}`)
      .then((res) => setMovie(res.data))
      .catch(() => setError("Couldn't find that movie on TMDB."))
      .finally(() => setLoading(false));
  }, [tmdbId]);

  if (loading) return <div className="loading-strip" style={{ paddingTop: 80 }}>Rolling the film…</div>;
  if (error || !movie)
    return (
      <div className="container" style={{ paddingTop: 60 }}>
        <div className="error-msg">{error || "Movie not found."}</div>
        <Link to="/explore" className="btn" style={{ marginTop: 16 }}>← Back to Explore</Link>
      </div>
    );

  const genres = (movie.genres || "").split(",").map((g) => g.trim()).filter(Boolean);
  const year = movie.release_date ? movie.release_date.slice(0, 4) : "—";
  const backdropUrl = movie.backdrop_path
    ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`
    : null;
  const score = movie.tmdb_rating ? movie.tmdb_rating.toFixed(1) : null;
  const scoreColor = movie.tmdb_rating >= 7 ? "var(--gold)" : movie.tmdb_rating >= 5 ? "#6ab0e3" : "var(--red)";

  return (
    <>
      {/* Backdrop banner */}
      {backdropUrl && (
        <div
          style={{
            width: "100%",
            height: 320,
            background: `linear-gradient(to bottom, rgba(14,17,22,0) 0%, rgba(14,17,22,0.7) 60%, var(--bg) 100%), url(${backdropUrl}) center/cover no-repeat`,
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "60%",
              background: "linear-gradient(to bottom, transparent, var(--bg))",
            }}
          />
        </div>
      )}

      <div className="container" style={{ paddingBottom: 60, marginTop: backdropUrl ? -60 : 40 }}>
        {/* Back link */}
        <Link
          to="/explore"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            color: "var(--text-muted)",
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            letterSpacing: "0.5px",
            textTransform: "uppercase",
            marginBottom: 24,
            textDecoration: "none",
          }}
        >
          ← Back to Explore
        </Link>

        {/* Read-only notice banner */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "rgba(106,176,232,0.08)",
            border: "1px solid rgba(106,176,232,0.2)",
            borderRadius: "var(--radius-sm)",
            padding: "10px 16px",
            marginBottom: 28,
            color: "#6ab0e3",
            fontSize: 13,
            fontFamily: "var(--font-mono)",
          }}
        >
          <span>ℹ</span>
          <span>
            This title is from the TMDB catalog — not in the admin&apos;s showcase. View only.
          </span>
        </div>

        {/* Hero layout */}
        <div className="detail-hero">
          {/* Poster */}
          <div className="detail-poster">
            {movie.poster_url ? (
              <img src={movie.poster_url} alt={`${movie.title} poster`} />
            ) : (
              <div className="no-poster" style={{ padding: 24 }}>
                {movie.title}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <div className="hero-eyebrow">TMDB Catalog &middot; Explore</div>
            <h1 className="detail-title">{movie.title}</h1>

            {movie.tagline && (
              <p
                style={{
                  fontStyle: "italic",
                  color: "var(--text-muted)",
                  marginTop: 0,
                  marginBottom: 14,
                  fontSize: 15,
                }}
              >
                &ldquo;{movie.tagline}&rdquo;
              </p>
            )}

            {/* Score + meta row */}
            <div className="detail-meta-row">
              {score && (
                <span
                  className="admin-score"
                  style={{
                    position: "static",
                    background: "rgba(20,60,120,0.6)",
                    color: scoreColor,
                    borderColor: `${scoreColor}40`,
                  }}
                >
                  {score}
                </span>
              )}
              <span
                style={{
                  color: "var(--text-muted)",
                  fontFamily: "var(--font-mono)",
                  fontSize: 13,
                }}
              >
                {year}
                {movie.runtime ? ` · ${movie.runtime} min` : ""}
                {movie.vote_count ? ` · ${movie.vote_count.toLocaleString()} votes on TMDB` : ""}
              </span>
            </div>

            {/* Genre tags */}
            {genres.length > 0 && (
              <div className="genre-tags" style={{ marginBottom: 16 }}>
                {genres.map((g) => (
                  <span key={g} className="genre-tag">
                    {g}
                  </span>
                ))}
              </div>
            )}

            {/* Overview */}
            <p className="overview-text">{movie.overview || "No overview available."}</p>

            {/* Extra metadata */}
            <div
              style={{
                marginTop: 20,
                display: "flex",
                flexWrap: "wrap",
                gap: "8px 24px",
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                color: "var(--text-faint)",
              }}
            >
              {movie.original_language && (
                <span>
                  Language:{" "}
                  <strong style={{ color: "var(--text-muted)", textTransform: "uppercase" }}>
                    {movie.original_language}
                  </strong>
                </span>
              )}
              {movie.production_countries?.length > 0 && (
                <span>
                  Country:{" "}
                  <strong style={{ color: "var(--text-muted)" }}>
                    {movie.production_countries.join(", ")}
                  </strong>
                </span>
              )}
              {movie.release_date && (
                <span>
                  Released:{" "}
                  <strong style={{ color: "var(--text-muted)" }}>
                    {new Date(movie.release_date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </strong>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Not in showcase note */}
        <div
          style={{
            marginTop: 40,
            padding: "24px",
            background: "var(--surface)",
            borderRadius: "var(--radius)",
            border: "1px solid var(--border)",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 32, marginBottom: 10 }}>🎟️</div>
          <h3
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 22,
              color: "var(--text-muted)",
              margin: "0 0 8px",
            }}
          >
            Not in the Showcase
          </h3>
          <p style={{ color: "var(--text-faint)", margin: "0 0 16px", fontSize: 14 }}>
            This title hasn&apos;t been curated by the admin yet. Head back to explore more films or
            check out the official showcase.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
            <Link to="/explore" className="btn">
              ← Keep Exploring
            </Link>
            <Link to="/" className="btn primary">
              View Showcase
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

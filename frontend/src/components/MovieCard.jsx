import { Link } from "react-router-dom";

export default function MovieCard({ movie }) {
  const year = movie.release_date ? movie.release_date.slice(0, 4) : "—";
  const genres = (movie.genres || "")
    .split(",")
    .map((g) => g.trim())
    .filter(Boolean)
    .slice(0, 3);

  const isAudienceUnlocked = movie.is_audience_unlocked || (movie.user_rating_count >= 3 && movie.average_user_rating != null);

  return (
    <Link to={`/movies/${movie.id}`} className="ticket-card">
      <div className="ticket-poster">
        {movie.is_featured && <span className="featured-tag">Featured</span>}
        {movie.admin_rating != null && (
          <span className="admin-score" title={`Admin Rating: ${movie.admin_rating.toFixed(1)}`}>
            {movie.admin_rating.toFixed(1)}
          </span>
        )}
        {movie.poster_url ? (
          <img src={movie.poster_url} alt={`${movie.title} poster`} loading="lazy" />
        ) : (
          <div className="no-poster">{movie.title}</div>
        )}
      </div>

      <div className="ticket-tear" />

      <div className="ticket-body">
        <div className="ticket-title">{movie.title}</div>
        <div className="ticket-meta">
          <span>{year}</span>
          {movie.runtime ? <span>&middot; {movie.runtime} min</span> : null}
        </div>

        {genres.length > 0 && (
          <div className="genre-tags">
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
              fontSize: 12,
              color: "var(--text-muted)",
              margin: "4px 0 0",
              lineHeight: 1.4,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {movie.overview}
          </p>
        )}

        <div className="ticket-footer">
          <span style={{ fontSize: 11, color: "var(--gold)", fontFamily: "var(--font-mono)" }}>
            Admin ★ {movie.admin_rating?.toFixed(1)}
          </span>
          <span className="user-score-dot" style={{ fontSize: 11, fontFamily: "var(--font-mono)" }}>
            {isAudienceUnlocked ? (
              <>
                <span className="dot" style={{ background: "var(--gold)" }} />
                <span>Audience ★ {movie.average_user_rating.toFixed(1)} ({movie.user_rating_count})</span>
              </>
            ) : (
              <span style={{ color: "var(--text-faint)" }}>
                🔒 3+ ratings req ({movie.user_rating_count}/3)
              </span>
            )}
          </span>
        </div>
      </div>
    </Link>
  );
}


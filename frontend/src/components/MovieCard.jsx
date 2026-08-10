import { Link } from "react-router-dom";

export default function MovieCard({ movie }) {
  const year = movie.release_date ? movie.release_date.slice(0, 4) : "—";
  const genres = (movie.genres || "")
    .split(",")
    .map((g) => g.trim())
    .filter(Boolean)
    .slice(0, 3);

  return (
    <Link to={`/movies/${movie.id}`} className="ticket-card">
      <div className="ticket-poster">
        {movie.is_featured && <span className="featured-tag">Featured</span>}
        <span className="admin-score">{movie.admin_rating?.toFixed(1)}</span>
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

        <div className="ticket-footer">
          <span>Admin pick</span>
          <span className="user-score-dot">
            <span className="dot" />
            {movie.average_user_rating != null
              ? `${movie.average_user_rating.toFixed(1)} (${movie.user_rating_count})`
              : "Unrated"}
          </span>
        </div>
      </div>
    </Link>
  );
}

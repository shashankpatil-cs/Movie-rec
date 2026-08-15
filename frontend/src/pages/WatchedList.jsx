import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

function formatRuntime(minutes) {
  if (!minutes) return "";
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hrs === 0) return `${mins}m`;
  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
}

export default function WatchedList() {
  const { user } = useAuth();
  const [watchedMovies, setWatchedMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [genreFilter, setGenreFilter] = useState("");
  const [sort, setSort] = useState("newest_rated");

  useEffect(() => {
    setLoading(true);
    api
      .get("/movies/my-watched")
      .then((res) => setWatchedMovies(res.data || []))
      .catch(() => setWatchedMovies([]))
      .finally(() => setLoading(false));
  }, []);

  // Compute summary statistics
  const stats = useMemo(() => {
    const totalCount = watchedMovies.length;
    if (totalCount === 0) return { totalCount: 0, totalMinutes: 0, avgRating: "—" };

    const totalMinutes = watchedMovies.reduce((acc, m) => acc + (m.runtime || 0), 0);
    const sumRatings = watchedMovies.reduce((acc, m) => acc + (m.my_rating || 0), 0);
    const avgRating = (sumRatings / totalCount).toFixed(1);

    return {
      totalCount,
      totalMinutes,
      avgRating,
      formattedTime: formatRuntime(totalMinutes),
    };
  }, [watchedMovies]);

  // Extract all unique genres present in user's watched list
  const availableGenres = useMemo(() => {
    const set = new Set();
    watchedMovies.forEach((m) => {
      if (m.genres) {
        m.genres.split(",").forEach((g) => {
          const trimmed = g.trim();
          if (trimmed) set.add(trimmed);
        });
      }
    });
    return Array.from(set).sort();
  }, [watchedMovies]);

  // Filter and sort
  const filteredMovies = useMemo(() => {
    return watchedMovies
      .filter((m) => {
        const matchesQuery = !query.trim() || m.title.toLowerCase().includes(query.trim().toLowerCase());
        const matchesGenre = !genreFilter || (m.genres && m.genres.toLowerCase().includes(genreFilter.toLowerCase()));
        return matchesQuery && matchesGenre;
      })
      .sort((a, b) => {
        if (sort === "newest_rated") {
          return new Date(b.rated_at) - new Date(a.rated_at);
        }
        if (sort === "my_rating_desc") {
          return (b.my_rating || 0) - (a.my_rating || 0);
        }
        if (sort === "my_rating_asc") {
          return (a.my_rating || 0) - (b.my_rating || 0);
        }
        if (sort === "runtime_desc") {
          return (b.runtime || 0) - (a.runtime || 0);
        }
        if (sort === "runtime_asc") {
          return (a.runtime || 0) - (b.runtime || 0);
        }
        if (sort === "title") {
          return a.title.localeCompare(b.title);
        }
        return 0;
      });
  }, [watchedMovies, query, genreFilter, sort]);

  return (
    <div style={{ paddingBottom: 60 }}>
      {/* ── Top Header Banner ── */}
      <div
        style={{
          background: "linear-gradient(180deg, var(--surface) 0%, var(--bg) 100%)",
          borderBottom: "1px solid var(--border)",
          padding: "36px 0 24px",
        }}
      >
        <div className="container">
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              letterSpacing: "2px",
              textTransform: "uppercase",
              color: "var(--gold)",
              marginBottom: 8,
            }}
          >
            Personal Diary &middot; {user?.username}&apos;s Collection
          </div>

          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(32px, 5vw, 48px)",
              lineHeight: 1.05,
              margin: "0 0 20px",
              color: "var(--text)",
            }}
          >
            My <span style={{ color: "var(--gold)" }}>Watched List</span>
          </h1>

          {/* Stats Bar */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: 16,
              marginTop: 18,
            }}
          >
            <div
              style={{
                background: "var(--surface-raised)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                padding: "16px 20px",
              }}
            >
              <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px" }}>
                Films Watched
              </div>
              <div style={{ fontSize: 26, fontWeight: 700, color: "var(--gold)", marginTop: 4 }}>
                {stats.totalCount}
              </div>
            </div>

            <div
              style={{
                background: "var(--surface-raised)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                padding: "16px 20px",
              }}
            >
              <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px" }}>
                Total Watch Time
              </div>
              <div style={{ fontSize: 26, fontWeight: 700, color: "var(--text)", marginTop: 4 }}>
                {stats.formattedTime || "0m"}
              </div>
            </div>

            <div
              style={{
                background: "var(--surface-raised)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                padding: "16px 20px",
              }}
            >
              <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px" }}>
                Avg Score Given
              </div>
              <div style={{ fontSize: 26, fontWeight: 700, color: "#34d399", marginTop: 4 }}>
                {stats.avgRating !== "—" ? `★ ${stats.avgRating}` : "—"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main List Container ── */}
      <div className="container" style={{ padding: "32px 24px 60px" }}>
        {/* Filters Toolbar */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 28 }}>
          <input
            type="text"
            placeholder="Search watched movies..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              padding: "10px 14px",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border)",
              background: "var(--surface)",
              color: "var(--text)",
              fontSize: 14,
              minWidth: 220,
              flex: "1 1 200px",
            }}
          />

          <select
            className="select-genre"
            value={genreFilter}
            onChange={(e) => setGenreFilter(e.target.value)}
            style={{ minWidth: 160 }}
          >
            <option value="">All Genres</option>
            {availableGenres.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>

          <select
            className="select-genre"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            style={{ minWidth: 210 }}
          >
            <option value="newest_rated">🕒 Recently Rated</option>
            <option value="my_rating_desc">⭐ My Rating: High to Low</option>
            <option value="my_rating_asc">⭐ My Rating: Low to High</option>
            <option value="runtime_desc">⏱️ Runtime: High to Low</option>
            <option value="runtime_asc">⏱️ Runtime: Low to High</option>
            <option value="title">🔤 Title (A–Z)</option>
          </select>
        </div>

        {loading && <div className="loading-strip">Loading your watched movies…</div>}

        {!loading && watchedMovies.length === 0 && (
          <div className="empty-state" style={{ padding: "64px 20px", textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 14 }}>🍿</div>
            <h3 style={{ fontSize: 22, margin: "0 0 10px" }}>No watched movies yet</h3>
            <p style={{ color: "var(--text-muted)", maxWidth: 460, margin: "0 auto 24px", lineHeight: 1.6 }}>
              When you rate a movie in the showcase, it will automatically appear here with your review and score!
            </p>
            <Link to="/" className="pill-btn solid">
              Browse Showcase & Rate Movies
            </Link>
          </div>
        )}

        {!loading && watchedMovies.length > 0 && filteredMovies.length === 0 && (
          <div className="empty-state" style={{ padding: "48px 20px", textAlign: "center" }}>
            <h3>No watched movies match your filter</h3>
            <p>Try clearing your search or genre filter.</p>
          </div>
        )}

        {/* Movies Grid */}
        {!loading && filteredMovies.length > 0 && (
          <div className="movie-grid">
            {filteredMovies.map((movie) => {
              const year = movie.release_date ? movie.release_date.slice(0, 4) : "—";
              const genres = (movie.genres || "")
                .split(",")
                .map((g) => g.trim())
                .filter(Boolean)
                .slice(0, 3);

              return (
                <Link to={`/movies/${movie.id}`} key={movie.id} className="ticket-card">
                  <div className="ticket-poster">
                    {/* User rating badge */}
                    <span
                      className="user-score-badge"
                      title={`Your Rating: ${movie.my_rating.toFixed(1)}`}
                      style={{
                        position: "absolute",
                        bottom: 8,
                        left: 8,
                        background: "rgba(16, 185, 129, 0.95)",
                        color: "#ffffff",
                        fontSize: 11,
                        fontWeight: 700,
                        padding: "3px 8px",
                        borderRadius: 4,
                        fontFamily: "var(--font-mono)",
                        letterSpacing: "0.5px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.6)",
                        backdropFilter: "blur(4px)",
                        zIndex: 2,
                      }}
                    >
                      You ★ {movie.my_rating.toFixed(1)}
                    </span>

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

                    {movie.my_review ? (
                      <div
                        style={{
                          fontSize: 12,
                          color: "var(--text-muted)",
                          background: "var(--surface)",
                          padding: "6px 8px",
                          borderRadius: 4,
                          borderLeft: "2px solid #34d399",
                          marginTop: 6,
                          fontStyle: "italic",
                          lineHeight: 1.4,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        &ldquo;{movie.my_review}&rdquo;
                      </div>
                    ) : movie.overview ? (
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
                    ) : null}

                    <div className="ticket-footer" style={{ marginTop: "auto", paddingTop: 8 }}>
                      <span style={{ fontSize: 11, color: "var(--gold)", fontFamily: "var(--font-mono)" }}>
                        Admin ★ {movie.admin_rating?.toFixed(1)}
                      </span>
                      <span style={{ fontSize: 11, color: "#34d399", fontFamily: "var(--font-mono)", fontWeight: 700 }}>
                        Rated ★ {movie.my_rating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

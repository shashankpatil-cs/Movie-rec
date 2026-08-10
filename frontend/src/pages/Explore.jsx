import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

export default function Explore() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const debounceRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    // Auto-focus input
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setHasSearched(false);
      setTotalResults(0);
      return;
    }

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      doSearch(query.trim(), 1);
    }, 400);

    return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  function doSearch(q, p) {
    setLoading(true);
    setError("");
    setPage(p);
    api
      .get("/explore/search", { params: { q, page: p } })
      .then((res) => {
        setResults(res.data.results || []);
        setTotalResults(res.data.total_results || 0);
        setTotalPages(res.data.total_pages || 1);
        setHasSearched(true);
      })
      .catch(() => setError("Couldn't reach TMDB. Is the backend running?"))
      .finally(() => setLoading(false));
  }

  function goPage(p) {
    if (p < 1 || p > totalPages) return;
    doSearch(query.trim(), p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <>
      {/* Hero / search header */}
      <section className="hero" style={{ paddingBottom: 48 }}>
        <div className="container">
          <div className="hero-eyebrow">TMDB Explorer &middot; Browse the full catalog</div>
          <h1>
            Discover any film
            <br />
            ever made.
          </h1>
          <p>
            Search over a million titles from TMDB — explore details, cast, and ratings for
            anything beyond the admin&apos;s curated showcase.
          </p>

          {/* Search box */}
          <div style={{ position: "relative", maxWidth: 560, marginTop: 28 }}>
            <span
              style={{
                position: "absolute",
                left: 16,
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: 18,
                pointerEvents: "none",
                userSelect: "none",
              }}
            >
              🔍
            </span>
            <input
              ref={inputRef}
              id="explore-search-input"
              type="text"
              placeholder="Search any movie title…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{
                width: "100%",
                background: "var(--surface-raised)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                color: "var(--text)",
                fontFamily: "var(--font-body)",
                fontSize: 16,
                padding: "14px 20px 14px 48px",
                outline: "none",
                transition: "border-color 0.2s, box-shadow 0.2s",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "var(--gold)";
                e.target.style.boxShadow = "0 0 0 3px rgba(227,179,65,0.12)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "var(--border)";
                e.target.style.boxShadow = "none";
              }}
            />
            {loading && (
              <span
                style={{
                  position: "absolute",
                  right: 16,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-faint)",
                  fontSize: 13,
                  fontFamily: "var(--font-mono)",
                }}
              >
                …
              </span>
            )}
          </div>
        </div>
      </section>

      <div className="container" style={{ paddingBottom: 60 }}>
        {/* Result count */}
        {hasSearched && !loading && (
          <div className="section-label" style={{ marginBottom: 16 }}>
            {totalResults > 0
              ? `${totalResults.toLocaleString()} results for "${query}"`
              : `No results for "${query}"`}
          </div>
        )}

        {error && <div className="error-msg">{error}</div>}

        {!hasSearched && !loading && (
          <div className="empty-state">
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎬</div>
            <h3>Start typing to explore</h3>
            <p>Search any movie from the TMDB database — blockbusters, indie gems, classics…</p>
          </div>
        )}

        {/* Results grid */}
        {results.length > 0 && (
          <div className="movie-grid">
            {results.map((m) => (
              <ExploreCard key={m.tmdb_id} movie={m} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {hasSearched && totalPages > 1 && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 12,
              marginTop: 36,
            }}
          >
            <button
              className="btn"
              disabled={page <= 1}
              onClick={() => goPage(page - 1)}
              style={{ opacity: page <= 1 ? 0.4 : 1 }}
            >
              ← Prev
            </button>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--text-muted)" }}>
              Page {page} of {Math.min(totalPages, 500)}
            </span>
            <button
              className="btn"
              disabled={page >= totalPages}
              onClick={() => goPage(page + 1)}
              style={{ opacity: page >= totalPages ? 0.4 : 1 }}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Small card for explore results (read-only, no admin score)         */
/* ------------------------------------------------------------------ */
function ExploreCard({ movie }) {
  const year = movie.release_date ? movie.release_date.slice(0, 4) : "—";
  const score = movie.tmdb_rating ? movie.tmdb_rating.toFixed(1) : null;

  return (
    <Link
      to={`/explore/${movie.tmdb_id}`}
      className="ticket-card"
      style={{ textDecoration: "none" }}
    >
      <div className="ticket-poster">
        {/* TMDB score in place of admin score */}
        {score && (
          <span
            className="admin-score"
            style={{ background: "rgba(20,60,120,0.88)", color: "#90c8f8", borderColor: "rgba(144,200,248,0.25)" }}
          >
            {score}
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
        </div>
        <div className="ticket-footer">
          <span style={{ color: "var(--text-faint)", fontSize: 11, fontFamily: "var(--font-mono)" }}>
            TMDB catalog
          </span>
          {score && (
            <span className="user-score-dot">
              <span className="dot" style={{ background: "#6ab0e3" }} />
              {score} TMDB
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

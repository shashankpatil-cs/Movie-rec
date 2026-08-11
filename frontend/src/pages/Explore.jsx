import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";

/* ------------------------------------------------------------------ */
/*  Utility: format vote count e.g. 23400 → "23.4K votes"             */
/* ------------------------------------------------------------------ */
function fmtVotes(n) {
  if (!n) return null;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M votes`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K votes`;
  return `${n} votes`;
}

/* ------------------------------------------------------------------ */
/*  SmartSearchBar — input + live suggestion dropdown                  */
/* ------------------------------------------------------------------ */
function SmartSearchBar({ query, onQueryChange, onSearch }) {
  const [suggestions, setSuggestions] = useState([]);
  const [showDrop, setShowDrop] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [sugLoading, setSugLoading] = useState(false);
  const sugDebounce = useRef(null);
  const wrapRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Auto-focus on mount
  useEffect(() => { inputRef.current?.focus(); }, []);

  // Fetch suggestions whenever query changes (debounced 280 ms)
  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      setShowDrop(false);
      setActiveIdx(-1);
      return;
    }
    clearTimeout(sugDebounce.current);
    sugDebounce.current = setTimeout(() => {
      setSugLoading(true);
      api
        .get("/explore/suggest", { params: { q: query.trim() } })
        .then((res) => {
          setSuggestions(res.data || []);
          setShowDrop(true);
          setActiveIdx(-1);
        })
        .catch(() => setSuggestions([]))
        .finally(() => setSugLoading(false));
    }, 280);
    return () => clearTimeout(sugDebounce.current);
  }, [query]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function onOutsideClick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setShowDrop(false);
      }
    }
    document.addEventListener("mousedown", onOutsideClick);
    return () => document.removeEventListener("mousedown", onOutsideClick);
  }, []);

  function handleKeyDown(e) {
    if (!showDrop || suggestions.length === 0) {
      if (e.key === "Enter" && query.trim()) {
        setShowDrop(false);
        onSearch(query.trim(), 1);
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIdx >= 0) {
        const s = suggestions[activeIdx];
        setShowDrop(false);
        navigate(`/explore/${s.tmdb_id}`);
      } else {
        setShowDrop(false);
        onSearch(query.trim(), 1);
      }
    } else if (e.key === "Escape") {
      setShowDrop(false);
      setActiveIdx(-1);
    }
  }

  function pickSuggestion(s) {
    setShowDrop(false);
    navigate(`/explore/${s.tmdb_id}`);
  }

  const scoreColor = (r) =>
    r >= 7 ? "var(--gold)" : r >= 5 ? "#6ab0e3" : "var(--red)";

  return (
    <div ref={wrapRef} style={{ position: "relative", maxWidth: 580, marginTop: 28 }}>
      {/* Input */}
      <div style={{ position: "relative" }}>
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
          autoComplete="off"
          placeholder="Search any movie title — typos are fine…"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (suggestions.length > 0) setShowDrop(true); }}
          style={{
            width: "100%",
            background: "var(--surface-raised)",
            border: `1px solid ${showDrop && suggestions.length ? "var(--gold)" : "var(--border)"}`,
            borderRadius: showDrop && suggestions.length ? "var(--radius) var(--radius) 0 0" : "var(--radius)",
            color: "var(--text)",
            fontFamily: "var(--font-body)",
            fontSize: 16,
            padding: "14px 20px 14px 48px",
            outline: "none",
            transition: "border-color 0.15s, border-radius 0.15s, box-shadow 0.15s",
            boxShadow: showDrop && suggestions.length ? "0 0 0 3px rgba(227,179,65,0.12)" : "none",
          }}
        />
        {/* Spinner / loading indicator */}
        {sugLoading && (
          <span
            style={{
              position: "absolute",
              right: 16,
              top: "50%",
              transform: "translateY(-50%)",
              display: "flex",
              gap: 3,
            }}
          >
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background: "var(--gold)",
                  opacity: 0.6,
                  animation: `pulse 1s ease-in-out ${i * 0.15}s infinite`,
                }}
              />
            ))}
          </span>
        )}
      </div>

      {/* Dropdown */}
      {showDrop && suggestions.length > 0 && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            zIndex: 999,
            background: "var(--surface-raised)",
            border: "1px solid var(--gold)",
            borderTop: "1px solid var(--border-soft)",
            borderRadius: "0 0 var(--radius) var(--radius)",
            overflow: "hidden",
            boxShadow: "0 16px 40px -8px rgba(0,0,0,0.7)",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "6px 14px",
              background: "rgba(227,179,65,0.06)",
              borderBottom: "1px solid var(--border-soft)",
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              letterSpacing: "1px",
              textTransform: "uppercase",
              color: "var(--gold)",
            }}
          >
            Top suggestions by TMDB ratings
          </div>

          {suggestions.map((s, i) => {
            const year = s.release_date ? s.release_date.slice(0, 4) : "—";
            const isActive = i === activeIdx;
            return (
              <button
                key={s.tmdb_id}
                id={`suggest-item-${i}`}
                onMouseDown={(e) => { e.preventDefault(); pickSuggestion(s); }}
                onMouseEnter={() => setActiveIdx(i)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 14px",
                  background: isActive ? "rgba(227,179,65,0.1)" : "transparent",
                  border: "none",
                  borderBottom: i < suggestions.length - 1 ? "1px solid var(--border-soft)" : "none",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "background 0.1s",
                }}
              >
                {/* Poster thumbnail */}
                <div
                  style={{
                    width: 36,
                    height: 52,
                    borderRadius: 4,
                    overflow: "hidden",
                    flexShrink: 0,
                    background: "var(--bg-alt)",
                    border: "1px solid var(--border)",
                  }}
                >
                  {s.poster_url ? (
                    <img
                      src={s.poster_url}
                      alt=""
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 14,
                      }}
                    >
                      🎬
                    </div>
                  )}
                </div>

                {/* Text info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: 14,
                      color: isActive ? "var(--gold)" : "var(--text)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      transition: "color 0.1s",
                    }}
                  >
                    {s.title}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--text-faint)",
                      fontFamily: "var(--font-mono)",
                      marginTop: 2,
                    }}
                  >
                    {year}
                    {s.vote_count ? ` · ${fmtVotes(s.vote_count)}` : ""}
                  </div>
                </div>

                {/* Score badge */}
                {s.tmdb_rating > 0 && (
                  <div
                    style={{
                      flexShrink: 0,
                      fontFamily: "var(--font-mono)",
                      fontWeight: 700,
                      fontSize: 13,
                      color: scoreColor(s.tmdb_rating),
                      padding: "2px 8px",
                      borderRadius: 4,
                      background: `${scoreColor(s.tmdb_rating)}18`,
                      border: `1px solid ${scoreColor(s.tmdb_rating)}40`,
                    }}
                  >
                    {s.tmdb_rating?.toFixed(1)}
                  </div>
                )}

                {/* Rank badge */}
                <div
                  style={{
                    flexShrink: 0,
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    background: isActive ? "var(--gold)" : "var(--border)",
                    color: isActive ? "#16130a" : "var(--text-faint)",
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "background 0.1s, color 0.1s",
                  }}
                >
                  {i + 1}
                </div>
              </button>
            );
          })}

          {/* Footer hint */}
          <div
            style={{
              padding: "6px 14px",
              borderTop: "1px solid var(--border-soft)",
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              color: "var(--text-faint)",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>↑↓ navigate · Enter select · Esc close</span>
            <span>Press Enter to search all results</span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Explore page                                                  */
/* ------------------------------------------------------------------ */
export default function Explore() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [committedQuery, setCommittedQuery] = useState("");
  const fullDebounce = useRef(null);

  // Full-page search triggered after a pause in typing (500 ms)
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setHasSearched(false);
      setTotalResults(0);
      setCommittedQuery("");
      return;
    }
    clearTimeout(fullDebounce.current);
    fullDebounce.current = setTimeout(() => doSearch(query.trim(), 1), 500);
    return () => clearTimeout(fullDebounce.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const doSearch = useCallback((q, p) => {
    setLoading(true);
    setError("");
    setPage(p);
    setCommittedQuery(q);
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
  }, []);

  function goPage(p) {
    if (p < 1 || p > totalPages) return;
    doSearch(query.trim(), p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <>
      {/* Keyframe for loading dots */}
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.4; }
          50% { transform: scale(1.5); opacity: 1; }
        }
      `}</style>

      {/* Hero / search header */}
      <section className="hero" style={{ paddingBottom: 60 }}>
        <div className="container">
          <div className="hero-eyebrow">TMDB Explorer &middot; Browse the full catalog</div>
          <h1>
            Discover any film
            <br />
            ever made.
          </h1>
          <p>
            Search over a million titles — typos welcome. Top suggestions are ranked by number of
            TMDB ratings so the most popular match always surfaces first.
          </p>

          <SmartSearchBar
            query={query}
            onQueryChange={setQuery}
            onSearch={doSearch}
          />
        </div>
      </section>

      <div className="container" style={{ paddingBottom: 60 }}>
        {/* Result count */}
        {hasSearched && !loading && (
          <div className="section-label" style={{ marginBottom: 16 }}>
            {totalResults > 0
              ? `${totalResults.toLocaleString()} results for "${committedQuery}"`
              : `No results for "${committedQuery}"`}
          </div>
        )}

        {error && <div className="error-msg">{error}</div>}
        {loading && <div className="loading-strip">Searching TMDB…</div>}

        {!hasSearched && !loading && (
          <div className="empty-state">
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎬</div>
            <h3>Start typing to explore</h3>
            <p>
              Search any movie — typos are fine. Top suggestions appear as you type,
              ranked by the number of TMDB user ratings.
            </p>
          </div>
        )}

        {/* Results grid */}
        {!loading && results.length > 0 && (
          <div className="movie-grid">
            {results.map((m) => (
              <ExploreCard key={m.tmdb_id} movie={m} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {hasSearched && !loading && totalPages > 1 && (
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
/*  ExploreCard — read-only card, TMDB score in blue, vote count shown */
/* ------------------------------------------------------------------ */
function ExploreCard({ movie }) {
  const year = movie.release_date ? movie.release_date.slice(0, 4) : "—";
  const score = movie.tmdb_rating ? movie.tmdb_rating.toFixed(1) : null;

  return (
    <Link to={`/explore/${movie.tmdb_id}`} className="ticket-card" style={{ textDecoration: "none" }}>
      <div className="ticket-poster">
        {score && (
          <span
            className="admin-score"
            style={{
              background: "rgba(20,60,120,0.88)",
              color: "#90c8f8",
              borderColor: "rgba(144,200,248,0.25)",
            }}
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
          {movie.vote_count > 0 && (
            <span style={{ color: "var(--text-faint)", fontSize: 11 }}>
              &middot; {fmtVotes(movie.vote_count)}
            </span>
          )}
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

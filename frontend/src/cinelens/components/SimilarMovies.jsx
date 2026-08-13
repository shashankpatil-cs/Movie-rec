import { useEffect, useRef, useState } from "react";
import { fetchSimilarMovies, searchMovies } from "../api";

const K_OPTIONS = [10, 15, 20];

export default function SimilarMovies() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [selected, setSelected] = useState(null); // { title, genres, num_ratings }
  const [minRatings, setMinRatings] = useState(100);
  const [k, setK] = useState(15);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const debounceRef = useRef(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }
    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const data = await searchMovies(query, 8);
        setSuggestions(data.results);
      } catch (_) {
        setSuggestions([]);
      } finally {
        setSearching(false);
      }
    }, 250);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  function pickMovie(movie) {
    setSelected(movie);
    setQuery(movie.title);
    setShowSuggestions(false);
    setResult(null);
    setError(null);
  }

  async function handleFind() {
    if (!selected) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await fetchSimilarMovies({ title: selected.title, minRatings, k });
      setResult(data);
    } catch (e) {
      setError(e.message || "Couldn't find similar movies.");
    } finally {
      setLoading(false);
    }
  }

  const maxSim = result?.results?.length ? Math.max(...result.results.map((r) => r.similarity)) : 1;

  return (
    <section className="panel">
      <p className="panel-title">Find Similar Movies</p>

      <div className="similar-search">
        <div className="search-box">
          <input
            className="search-input"
            type="text"
            placeholder="Search a movie title… (e.g. Star Wars)"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowSuggestions(true);
              if (selected && e.target.value !== selected.title) setSelected(null);
            }}
            onFocus={() => setShowSuggestions(true)}
          />
          {showSuggestions && query.trim() && (
            <div className="suggestions">
              {searching && <div className="suggestion-empty">searching…</div>}
              {!searching && suggestions.length === 0 && (
                <div className="suggestion-empty">no matches</div>
              )}
              {!searching &&
                suggestions.map((m) => (
                  <button key={m.title} className="suggestion-item" onClick={() => pickMovie(m)}>
                    <span className="s-title">{m.title}</span>
                    <span className="s-meta">
                      {m.genres.replace(/\|/g, " · ")} · {m.num_ratings} ratings
                    </span>
                  </button>
                ))}
            </div>
          )}
        </div>

        <div className="similar-controls">
          <label className="mini-label">
            Min ratings
            <input
              type="number"
              min={1}
              max={1000}
              value={minRatings}
              onChange={(e) => setMinRatings(Math.max(1, parseInt(e.target.value, 10) || 1))}
              className="mini-input"
            />
          </label>

          <div className="k-row">
            {K_OPTIONS.map((n) => (
              <button
                key={n}
                className={`method-pill k-pill ${k === n ? "active" : ""}`}
                onClick={() => setK(n)}
              >
                Top {n}
              </button>
            ))}
          </div>

          <button className="btn btn-primary" onClick={handleFind} disabled={!selected || loading}>
            {loading ? "Finding…" : "Find Similar Movies"}
          </button>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {!loading && result && (
        <div className="similar-results">
          <div className="similar-results-head">
            <span>
              Most similar to <strong>{result.title}</strong>
            </span>
            <span className="results-meta">
              min {result.min_ratings} ratings · top {result.k} · {result.elapsed_seconds}s
            </span>
          </div>

          {result.results.length === 0 && (
            <div className="empty-note">
              No movies met the minimum-ratings threshold. Try lowering "Min ratings".
            </div>
          )}

          <ul className="similar-list">
            {result.results.map((m, i) => (
              <li key={m.title} className="similar-item">
                <span className="rank">{i + 1}</span>
                <div className="similar-item-body">
                  <div className="similar-item-title">{m.title}</div>
                  <div className="similar-item-genres">{m.genres.replace(/\|/g, " · ")}</div>
                  <div className="sim-bar-track">
                    <div
                      className="sim-bar-fill"
                      style={{ width: `${Math.max(4, (m.similarity / maxSim) * 100)}%` }}
                    />
                  </div>
                </div>
                <div className="similar-item-stats">
                  <span className="sim-score">{m.similarity.toFixed(3)}</span>
                  <span className="sim-sub">
                    {m.avg_rating}★ · {m.num_ratings} ratings
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

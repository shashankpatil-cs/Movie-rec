import { useEffect, useState } from "react";
import api from "../api/axios";
import MovieCard from "../components/MovieCard";
import SearchBar from "../components/SearchBar";

export default function Home() {
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState("");
  const [sort, setSort] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/movies/genres")
      .then((res) => setGenres(res.data))
      .catch(() => setGenres([])); // TMDB key missing/misconfigured — filter still degrades gracefully
  }, []);

  useEffect(() => {
    setLoading(true);
    setError("");
    const params = {};
    if (query) params.q = query;
    if (genre) params.genre = genre;
    params.sort = sort;

    const handle = setTimeout(() => {
      api
        .get("/movies", { params })
        .then((res) => setMovies(res.data))
        .catch(() => setError("Couldn't load the showcase. Is the backend running?"))
        .finally(() => setLoading(false));
    }, 250); // debounce typing

    return () => clearTimeout(handle);
  }, [query, genre, sort]);

  return (
    <>
      <section className="hero">
        <div className="container">
          <div className="hero-eyebrow">Now Showing &middot; Curated by the house</div>
          <h1>
            Every film worth
            <br />
            staying up for.
          </h1>
          <p>
            A running log of what's actually good — picked, rated, and reviewed by one admin
            with strong opinions. Browse by genre, or add your own rating once you've watched.
          </p>

          <SearchBar
            query={query}
            onQueryChange={setQuery}
            genre={genre}
            onGenreChange={setGenre}
            genres={genres}
            sort={sort}
            onSortChange={setSort}
          />
        </div>
      </section>

      <div className="container">
        <div className="section-label">
          {genre ? `${genre} picks` : "The showcase"} ({movies.length})
        </div>

        {loading && <div className="loading-strip">Rolling the film…</div>}
        {error && <div className="error-msg">{error}</div>}

        {!loading && !error && movies.length === 0 && (
          <div className="empty-state">
            <h3>Nothing here yet</h3>
            <p>
              {query || genre
                ? "No movies match that search. Try a different title or genre."
                : "The admin hasn't added any movies to the showcase yet."}
            </p>
          </div>
        )}

        {!loading && movies.length > 0 && (
          <div className="movie-grid">
            {movies.map((m) => (
              <MovieCard key={m.id} movie={m} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import MovieCard from "../components/MovieCard";
import SearchBar from "../components/SearchBar";
import { useAuth } from "../context/AuthContext";

/* ================================================================== */
/*  Landing page shown to guests (not logged in)                       */
/* ================================================================== */
function LandingPage() {
  const features = [
    {
      icon: "🎬",
      title: "Admin-Curated Picks",
      desc: "Every movie in the showcase is hand-picked, personally rated and reviewed by the admin — not an algorithm. No noise, just quality.",
    },
    {
      icon: "⭐",
      title: "Rate & Review",
      desc: "Log in and leave your own rating and written review for every film. Your score gets added to the audience average in real time.",
    },
    {
      icon: "🔍",
      title: "Explore the Full TMDB Catalog",
      desc: "Search over a million titles beyond the showcase. Typos are handled — suggestions are ranked by number of TMDB user ratings.",
    },
    {
      icon: "🏆",
      title: "Audience vs. Admin",
      desc: "See where your taste agrees or clashes with the admin. Each film shows both the admin score and the live audience average side by side.",
    },
    {
      icon: "🎭",
      title: "Genre Filtering",
      desc: "Browse picks by genre — filter the showcase to Thriller, Drama, Sci-Fi and more. Find your kind of film instantly.",
    },
    {
      icon: "🔒",
      title: "Your Personal Log",
      desc: "Every rating you submit is saved to your account. Build a personal record of everything you've watched and scored.",
    },
  ];

  return (
    <>
      {/* ── Hero ── */}
      <section
        style={{
          padding: "72px 0 64px",
          borderBottom: "1px dashed var(--border)",
          background:
            "linear-gradient(160deg, rgba(227,179,65,0.06) 0%, transparent 50%), " +
            "radial-gradient(circle at 80% 20%, rgba(193,68,60,0.07), transparent 50%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background film-strip decoration */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            right: -40,
            top: "50%",
            transform: "translateY(-50%) rotate(12deg)",
            width: 180,
            height: 520,
            opacity: 0.04,
            background:
              "repeating-linear-gradient(0deg, var(--gold) 0px, var(--gold) 20px, transparent 20px, transparent 40px)",
            borderLeft: "12px solid var(--gold)",
            borderRight: "12px solid var(--gold)",
          }}
        />

        <div className="container">
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              letterSpacing: "3px",
              textTransform: "uppercase",
              color: "var(--gold)",
              marginBottom: 14,
            }}
          >
            Late Show &middot; A personal film log
          </div>

          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(48px, 8vw, 96px)",
              lineHeight: 0.92,
              margin: "0 0 22px",
              letterSpacing: "0.5px",
            }}
          >
            Every film worth
            <br />
            <span style={{ color: "var(--gold)" }}>staying up for.</span>
          </h1>

          <p
            style={{
              maxWidth: 560,
              color: "var(--text-muted)",
              fontSize: 17,
              lineHeight: 1.65,
              margin: "0 0 36px",
            }}
          >
            A curated showcase of films hand-picked and reviewed by one admin with strong
            opinions. Join to rate films yourself, explore the full TMDB catalog, and see
            how your taste stacks up.
          </p>

          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <Link
              to="/register"
              className="pill-btn solid"
              style={{ fontSize: 15, padding: "12px 28px" }}
            >
              Join for free
            </Link>
            <Link
              to="/login"
              className="pill-btn"
              style={{ fontSize: 15, padding: "12px 28px" }}
            >
              Log in
            </Link>
          </div>
        </div>
      </section>

      {/* ── Feature grid ── */}
      <div className="container" style={{ padding: "64px 24px" }}>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "2px",
            textTransform: "uppercase",
            color: "var(--text-faint)",
            marginBottom: 32,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          What you unlock after joining
          <span style={{ flex: 1, height: 1, background: "var(--border)" }} />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: 20,
          }}
        >
          {features.map((f, i) => (
            <div
              key={i}
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                padding: "24px 26px",
                transition: "border-color 0.2s, transform 0.2s",
                cursor: "default",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--gold-dim)";
                e.currentTarget.style.transform = "translateY(-3px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div style={{ fontSize: 30, marginBottom: 14 }}>{f.icon}</div>
              <h3
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 22,
                  margin: "0 0 8px",
                  letterSpacing: "0.3px",
                }}
              >
                {f.title}
              </h3>
              <p
                style={{
                  color: "var(--text-muted)",
                  fontSize: 14,
                  lineHeight: 1.65,
                  margin: 0,
                }}
              >
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Teaser blurred preview of admin picks ── */}
      <div
        style={{
          borderTop: "1px dashed var(--border)",
          padding: "48px 0 60px",
          background: "linear-gradient(180deg, var(--bg-alt), var(--bg))",
        }}
      >
        <div className="container">
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              letterSpacing: "2px",
              textTransform: "uppercase",
              color: "var(--text-faint)",
              marginBottom: 20,
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            Admin picks — members only
            <span style={{ flex: 1, height: 1, background: "var(--border)" }} />
          </div>

          {/* Blurred locked cards */}
          <div style={{ position: "relative" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                gap: 16,
                filter: "blur(6px)",
                pointerEvents: "none",
                userSelect: "none",
                opacity: 0.5,
              }}
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      aspectRatio: "2/3",
                      background: `linear-gradient(135deg, var(--surface-raised), var(--bg-alt))`,
                    }}
                  />
                  <div style={{ padding: "12px 14px" }}>
                    <div
                      style={{
                        height: 14,
                        background: "var(--border)",
                        borderRadius: 4,
                        marginBottom: 8,
                      }}
                    />
                    <div
                      style={{
                        height: 10,
                        width: "60%",
                        background: "var(--border)",
                        borderRadius: 4,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Lock overlay */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 16,
                background:
                  "radial-gradient(ellipse at center, rgba(14,17,22,0.0) 0%, rgba(14,17,22,0.85) 70%)",
              }}
            >
              <div
                style={{
                  background: "var(--surface-raised)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius)",
                  padding: "32px 40px",
                  textAlign: "center",
                  boxShadow: "0 20px 60px -10px rgba(0,0,0,0.8)",
                  backdropFilter: "blur(4px)",
                  maxWidth: 380,
                }}
              >
                <div style={{ fontSize: 36, marginBottom: 12 }}>🔒</div>
                <h3
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 26,
                    margin: "0 0 10px",
                    color: "var(--text)",
                  }}
                >
                  Members only
                </h3>
                <p
                  style={{
                    color: "var(--text-muted)",
                    fontSize: 14,
                    margin: "0 0 22px",
                    lineHeight: 1.6,
                  }}
                >
                  Create a free account to unlock the full showcase, rate films, and explore
                  the entire TMDB catalog.
                </p>
                <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                  <Link to="/register" className="btn primary">
                    Join free
                  </Link>
                  <Link to="/login" className="btn">
                    Log in
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom CTA strip ── */}
      <div
        style={{
          borderTop: "1px solid var(--border)",
          padding: "40px 24px",
          textAlign: "center",
          background: "var(--bg-alt)",
        }}
      >
        <p
          style={{
            color: "var(--text-muted)",
            fontSize: 15,
            margin: "0 0 18px",
          }}
        >
          Ready to start watching?
        </p>
        <Link
          to="/register"
          className="pill-btn solid"
          style={{ fontSize: 15, padding: "12px 32px" }}
        >
          Create your free account →
        </Link>
      </div>
    </>
  );
}

/* ================================================================== */
/*  Showcase page shown to logged-in users                             */
/* ================================================================== */
function ShowcasePage() {
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
      .catch(() => setGenres([]));
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
    }, 250);

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
            Hand-picked, rated and reviewed by the admin. Browse by genre, or add your own
            rating once you&apos;ve watched.
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

/* ================================================================== */
/*  Home — routes between landing and showcase based on auth state     */
/* ================================================================== */
export default function Home() {
  const { user, loading } = useAuth();

  // While auth is resolving show nothing (avoids flash of landing page for logged-in users)
  if (loading) return <div className="loading-strip" style={{ paddingTop: 80 }}>Loading…</div>;

  return user ? <ShowcasePage /> : <LandingPage />;
}

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
/*  LoggedInHomePage — Curated Movie Showcase                         */
/* ================================================================== */
function LoggedInHomePage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [genre, setGenre] = useState("");
  const [sort, setSort] = useState("newest");
  const [loadingShowcase, setLoadingShowcase] = useState(false);
  const [ratedIds, setRatedIds] = useState(new Set());
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "small" | "list"

  // Load showcase genres
  useEffect(() => {
    api
      .get("/movies/genres")
      .then((res) => setGenres(res.data))
      .catch(() => setGenres([]));
  }, []);

  // Fetch which showcase movies the logged-in user has already rated
  useEffect(() => {
    api
      .get("/movies/my-rated-ids")
      .then((res) => setRatedIds(new Set(res.data)))
      .catch(() => setRatedIds(new Set()));
  }, [isAdmin]);

  // Load showcase movies
  useEffect(() => {
    setLoadingShowcase(true);
    const params = {};
    if (genre) params.genre = genre;
    params.sort = sort;

    const handle = setTimeout(() => {
      api
        .get("/movies", { params })
        .then((res) => setMovies(res.data))
        .catch(() => setMovies([]))
        .finally(() => setLoadingShowcase(false));
    }, 200);

    return () => clearTimeout(handle);
  }, [genre, sort]);

  // Split showcase: unrated movies first, already-rated at bottom
  const unratedMovies = !isAdmin ? movies.filter((m) => !ratedIds.has(m.id)) : movies;
  const ratedMovies = !isAdmin ? movies.filter((m) => ratedIds.has(m.id)) : [];
  const allWatched = !isAdmin && movies.length > 0 && unratedMovies.length === 0;

  return (
    <>
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
            {isAdmin ? "Admin Operations · Control & Monitoring" : "Curated Cinema Hub"}
          </div>

          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(32px, 5vw, 52px)",
              lineHeight: 1.02,
              margin: "0 0 20px",
              color: "var(--text)",
            }}
          >
            {isAdmin ? (
              <>
                Showcase <span style={{ color: "var(--gold)" }}>Monitor &amp; Maintain</span>
              </>
            ) : (
              <>
                Welcome to your <span style={{ color: "var(--gold)" }}>Movie Hub</span>
              </>
            )}
          </h1>

          {/* Admin Quick Action Controls */}
          {isAdmin && (
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
              <Link
                to="/admin"
                className="pill-btn"
                style={{
                  fontSize: 14,
                  padding: "10px 22px",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  textDecoration: "none",
                }}
              >
                <span>⚙️ Admin Dashboard</span>
              </Link>
              <Link
                to="/admin/add"
                className="pill-btn solid"
                style={{
                  fontSize: 14,
                  padding: "10px 22px",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  textDecoration: "none",
                }}
              >
                <span>+ Add Movie</span>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ── Main Showcase Container ── */}
      <div className="container" style={{ padding: "36px 24px 60px" }}>
        <div>
          <div style={{ marginBottom: 24 }}>
            <div className="hero-eyebrow" style={{ fontSize: 11, marginBottom: 4 }}>
              Curated Showcase &middot; Admin Picks
            </div>
            <h2 style={{ fontSize: 28, margin: "0 0 12px", fontFamily: "var(--font-display)" }}>
              Curated Movies
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: 14, margin: "0 0 20px" }}>
              Browse the complete list of films hand-picked, rated, and reviewed.
            </p>

            {/* Genres filter + View toggle row */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginTop: 16 }}>
              <SearchBar
                genre={genre}
                onGenreChange={setGenre}
                genres={genres}
              />

              {/* View mode toggle */}
              <div className="view-toggle" role="group" aria-label="View mode">
                <button
                  className={`view-btn${viewMode === "grid" ? " active" : ""}`}
                  onClick={() => setViewMode("grid")}
                  title="Grid view"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <rect x="1" y="1" width="6" height="6" rx="1" />
                    <rect x="9" y="1" width="6" height="6" rx="1" />
                    <rect x="1" y="9" width="6" height="6" rx="1" />
                    <rect x="9" y="9" width="6" height="6" rx="1" />
                  </svg>
                </button>
                <button
                  className={`view-btn${viewMode === "small" ? " active" : ""}`}
                  onClick={() => setViewMode("small")}
                  title="Small grid"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <rect x="1" y="1" width="4" height="4" rx="0.75" />
                    <rect x="6" y="1" width="4" height="4" rx="0.75" />
                    <rect x="11" y="1" width="4" height="4" rx="0.75" />
                    <rect x="1" y="6" width="4" height="4" rx="0.75" />
                    <rect x="6" y="6" width="4" height="4" rx="0.75" />
                    <rect x="11" y="6" width="4" height="4" rx="0.75" />
                    <rect x="1" y="11" width="4" height="4" rx="0.75" />
                    <rect x="6" y="11" width="4" height="4" rx="0.75" />
                    <rect x="11" y="11" width="4" height="4" rx="0.75" />
                  </svg>
                </button>
                <button
                  className={`view-btn${viewMode === "list" ? " active" : ""}`}
                  onClick={() => setViewMode("list")}
                  title="List view"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <rect x="1" y="2" width="14" height="2.5" rx="1" />
                    <rect x="1" y="6.75" width="14" height="2.5" rx="1" />
                    <rect x="1" y="11.5" width="14" height="2.5" rx="1" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {loadingShowcase && <div className="loading-strip">Loading showcase movies…</div>}

          {!loadingShowcase && movies.length === 0 && (
            <div className="empty-state">
              <h3>No movies match your filter</h3>
              <p>Try resetting your genre filter.</p>
            </div>
          )}

          {!loadingShowcase && movies.length > 0 && (
            <>
              {/* All-watched banner */}
              {allWatched && (
                <div
                  style={{
                    background: "rgba(106,176,232,0.08)",
                    border: "1px solid rgba(106,176,232,0.3)",
                    borderRadius: "var(--radius)",
                    padding: "16px 22px",
                    marginBottom: 24,
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <span style={{ fontSize: 22 }}>🎉</span>
                  <div>
                    <div style={{ fontWeight: 600, color: "var(--text)", fontSize: 15 }}>
                      You've watched everything in the showcase!
                    </div>
                    <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>
                      All movies are shown below. Explore the TMDB catalog for more.
                    </div>
                  </div>
                </div>
              )}

              {/* Unrated / all movies */}
              <div className={`movie-grid${viewMode === "small" ? " movie-grid--small" : viewMode === "list" ? " movie-grid--list" : ""}`}>
                {(allWatched ? movies : unratedMovies).map((m) => (
                  <MovieCard key={m.id} movie={m} />
                ))}
              </div>

              {/* Already-watched section */}
              {!allWatched && ratedMovies.length > 0 && (
                <>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      margin: "36px 0 18px",
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      letterSpacing: "2px",
                      textTransform: "uppercase",
                      color: "var(--text-faint)",
                    }}
                  >
                    ✅ Already Watched ({ratedMovies.length})
                    <span style={{ flex: 1, height: 1, background: "var(--border)" }} />
                  </div>
                  <div className={`movie-grid${viewMode === "small" ? " movie-grid--small" : viewMode === "list" ? " movie-grid--list" : ""}`} style={{ opacity: 0.55 }}>
                    {ratedMovies.map((m) => (
                      <MovieCard key={m.id} movie={m} />
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}


/* ================================================================== */
/*  Home — routes between landing and LoggedInHomePage                 */
/* ================================================================== */
export default function Home() {
  const { user, loading } = useAuth();

  if (loading) return <div className="loading-strip" style={{ paddingTop: 80 }}>Loading…</div>;

  return user ? <LoggedInHomePage /> : <LandingPage />;
}


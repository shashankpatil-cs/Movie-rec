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
/*  LoggedInHomePage — Recommendation Hub + Optional Admin Showcase     */
/* ================================================================== */
function LoggedInHomePage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [activeTab, setActiveTab] = useState("admin_showcase");
  const [recData, setRecData] = useState(null);
  const [loadingRecs, setLoadingRecs] = useState(true);

  // Admin showcase state
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [genre, setGenre] = useState("");
  const [sort, setSort] = useState("newest");
  const [loadingShowcase, setLoadingShowcase] = useState(false);
  const [quickRateMsg, setQuickRateMsg] = useState("");
  const [ratedIds, setRatedIds] = useState(new Set());
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "small" | "list"

  // Load recommendations (only for regular audience users, not admins)
  function fetchRecommendations() {
    if (isAdmin) return;
    setLoadingRecs(true);
    api
      .get("/recommendations")
      .then((res) => setRecData(res.data))
      .catch(() => setRecData(null))
      .finally(() => setLoadingRecs(false));
  }

  useEffect(() => {
    if (!isAdmin) {
      fetchRecommendations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  // Load admin showcase genres
  useEffect(() => {
    api
      .get("/movies/genres")
      .then((res) => setGenres(res.data))
      .catch(() => setGenres([]));
  }, []);

  // Fetch which showcase movies the logged-in user has already rated
  useEffect(() => {
    if (isAdmin) return;
    api
      .get("/movies/my-rated-ids")
      .then((res) => setRatedIds(new Set(res.data)))
      .catch(() => setRatedIds(new Set()));
  }, [isAdmin]);

  // Load admin showcase movies if activeTab === 'admin_showcase'
  useEffect(() => {
    if (activeTab !== "admin_showcase") return;
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
  }, [activeTab, genre, sort]);

  // Quick rate handler for locked state
  async function submitQuickRating(movieId, ratingScore) {
    try {
      await api.post(`/movies/${movieId}/rate`, { rating: ratingScore });
      setQuickRateMsg("\u2605 Rating submitted successfully!");
      setTimeout(() => setQuickRateMsg(""), 3500);
      if (!isAdmin) {
        fetchRecommendations();
        api.get("/movies/my-rated-ids").then((res) => setRatedIds(new Set(res.data))).catch(() => {});
      }
    } catch (err) {
      setQuickRateMsg(err?.response?.data?.detail || "Could not submit rating.");
    }
  }

  // Split showcase: unrated movies first, already-rated at bottom
  const unratedMovies = !isAdmin ? movies.filter((m) => !ratedIds.has(m.id)) : movies;
  const ratedMovies = !isAdmin ? movies.filter((m) => ratedIds.has(m.id)) : [];
  const allWatched = !isAdmin && movies.length > 0 && unratedMovies.length === 0;

  return (
    <>
      {/* ── Top Navigation Banner / Tab Switcher ── */}
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
            {isAdmin ? "Admin Operations · Control & Monitoring" : "Personalized Cinema Hub"}
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

          {/* Mode Switcher / Admin Controls */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <button
              onClick={() => setActiveTab("admin_showcase")}
              className={`pill-btn ${activeTab === "admin_showcase" ? "solid" : ""}`}
              style={{
                fontSize: 14,
                padding: "10px 22px",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span>🎬 Movie Showcase</span>
            </button>

            {!isAdmin && (
              <button
                onClick={() => setActiveTab("recommendations")}
                className={`pill-btn ${activeTab === "recommendations" ? "solid" : ""}`}
                style={{
                  fontSize: 14,
                  padding: "10px 22px",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span>✨ AI Recommendation</span>
              </button>
            )}

            {isAdmin && (
              <>
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
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Main Content Container ── */}
      <div className="container" style={{ padding: "36px 24px 60px" }}>
        {/* ================================================================== */}
        {/* TAB 1: PERSONALIZED RECOMMENDATIONS (AUDIENCE ONLY)                 */}
        {/* ================================================================== */}
        {!isAdmin && activeTab === "recommendations" && (
          <div>
            {loadingRecs && <div className="loading-strip">Analyzing your movie preferences…</div>}

            {!loadingRecs && recData && (
              <>
                {/* ── Situation 1: Locked (< 3 ratings) ── */}
                {recData.status === "locked" && (
                  <div>
                    <div
                      style={{
                        background: "var(--surface)",
                        border: "1px solid var(--gold-dim)",
                        borderRadius: "var(--radius)",
                        padding: "28px 32px",
                        marginBottom: 36,
                        boxShadow: "0 12px 30px -10px rgba(0,0,0,0.5)",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                        <span style={{ fontSize: 28 }}>🔒</span>
                        <div>
                          <span className="genre-tag" style={{ background: "rgba(227,179,65,0.15)", color: "var(--gold)", border: "1px solid var(--gold-dim)" }}>
                            {recData.badge}
                          </span>
                          <h2 style={{ fontSize: 24, margin: "6px 0 0", fontFamily: "var(--font-display)" }}>
                            Unlock Your Personalized Recommendations
                          </h2>
                        </div>
                      </div>

                      <p style={{ color: "var(--text-muted)", fontSize: 15, lineHeight: 1.6, margin: "0 0 20px" }}>
                        {recData.message} Rate at least <strong>3 movies</strong> so our system can learn your film tastes and generate custom recommendations for you.
                      </p>

                      {/* Rating Progress Bar */}
                      <div style={{ maxWidth: 440 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontFamily: "var(--font-mono)", color: "var(--text-muted)", marginBottom: 6 }}>
                          <span>Progress:</span>
                          <span style={{ color: "var(--gold)", fontWeight: 700 }}>
                            {recData.user_rating_count} / {recData.required_ratings} Movies Rated
                          </span>
                        </div>
                        <div style={{ height: 8, background: "var(--border)", borderRadius: 4, overflow: "hidden" }}>
                          <div
                            style={{
                              width: `${Math.min(100, (recData.user_rating_count / recData.required_ratings) * 100)}%`,
                              height: "100%",
                              background: "linear-gradient(90deg, var(--gold-dim), var(--gold))",
                              borderRadius: 4,
                              transition: "width 0.4s ease",
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Quick-Rate Section */}
                    <div>
                      <div className="section-label">⭐ Quick-Rate Showcase Movies To Unlock ({recData.user_rating_count}/3 Rated)</div>
                      {quickRateMsg && <div className="success-msg" style={{ marginBottom: 16 }}>{quickRateMsg}</div>}
                      
                      <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 20 }}>
                        Click a star rating on any film below to submit your score:
                      </p>

                      <QuickRateGrid onRate={submitQuickRating} />
                    </div>
                  </div>
                )}

                {/* ── Situation 2 & 3: Unlocked (Content-Based or Hybrid) ── */}
                {recData.status === "unlocked" && (
                  <div>
                    {/* Algorithm Status Banner */}
                    <div
                      style={{
                        background: recData.recommendation_type === "hybrid" ? "rgba(106,176,232,0.08)" : "rgba(227,179,65,0.08)",
                        border: `1px solid ${recData.recommendation_type === "hybrid" ? "rgba(106,176,232,0.3)" : "var(--gold-dim)"}`,
                        borderRadius: "var(--radius)",
                        padding: "20px 24px",
                        marginBottom: 32,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: 16,
                      }}
                    >
                      <div>
                        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "1px", textTransform: "uppercase", color: recData.recommendation_type === "hybrid" ? "#6ab0e3" : "var(--gold)", marginBottom: 4 }}>
                          AI Recommendation Active
                        </div>
                        <h2 style={{ fontSize: 22, margin: 0, fontFamily: "var(--font-display)", color: "var(--text)" }}>
                          {recData.badge}
                        </h2>
                        <p style={{ fontSize: 13.5, color: "var(--text-muted)", margin: "4px 0 0" }}>
                          {recData.message}
                        </p>
                      </div>

                      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", padding: "6px 14px", fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-muted)" }}>
                        {recData.user_rating_count} Movies Rated by You
                      </div>
                    </div>

                    {/* Movie Grid */}
                    {recData.movies.length === 0 ? (
                      <div className="empty-state">
                        <h3>No unrated recommendations available right now</h3>
                        <p>You have rated most available movies! Explore the full catalog to rate more films.</p>
                      </div>
                    ) : (
                      <div className="movie-grid">
                        {recData.movies.map((m) => (
                          <MovieCard key={m.id} movie={m} />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ================================================================== */}
        {/* TAB 2: OPTIONAL ADMIN SHOWCASE VIEW                                */}
        {/* ================================================================== */}
        {activeTab === "admin_showcase" && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <div className="hero-eyebrow" style={{ fontSize: 11, marginBottom: 4 }}>
                Curated Showcase &middot; Admin Picks
              </div>
              <h2 style={{ fontSize: 28, margin: "0 0 12px", fontFamily: "var(--font-display)" }}>
                Admin Curated Movies
              </h2>
              <p style={{ color: "var(--text-muted)", fontSize: 14, margin: "0 0 20px" }}>
                Browse the complete list of films hand-picked, rated, and reviewed by the admin.
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
                      <rect x="1" y="1" width="6" height="6" rx="1"/>
                      <rect x="9" y="1" width="6" height="6" rx="1"/>
                      <rect x="1" y="9" width="6" height="6" rx="1"/>
                      <rect x="9" y="9" width="6" height="6" rx="1"/>
                    </svg>
                  </button>
                  <button
                    className={`view-btn${viewMode === "small" ? " active" : ""}`}
                    onClick={() => setViewMode("small")}
                    title="Small grid"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <rect x="1" y="1" width="4" height="4" rx="0.75"/>
                      <rect x="6" y="1" width="4" height="4" rx="0.75"/>
                      <rect x="11" y="1" width="4" height="4" rx="0.75"/>
                      <rect x="1" y="6" width="4" height="4" rx="0.75"/>
                      <rect x="6" y="6" width="4" height="4" rx="0.75"/>
                      <rect x="11" y="6" width="4" height="4" rx="0.75"/>
                      <rect x="1" y="11" width="4" height="4" rx="0.75"/>
                      <rect x="6" y="11" width="4" height="4" rx="0.75"/>
                      <rect x="11" y="11" width="4" height="4" rx="0.75"/>
                    </svg>
                  </button>
                  <button
                    className={`view-btn${viewMode === "list" ? " active" : ""}`}
                    onClick={() => setViewMode("list")}
                    title="List view"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <rect x="1" y="2" width="14" height="2.5" rx="1"/>
                      <rect x="1" y="6.75" width="14" height="2.5" rx="1"/>
                      <rect x="1" y="11.5" width="14" height="2.5" rx="1"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {loadingShowcase && <div className="loading-strip">Loading showcase movies…</div>}

            {!loadingShowcase && movies.length === 0 && (
              <div className="empty-state">
                <h3>No movies match your filter</h3>
                <p>Try resetting your search query or genre filter.</p>
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
        )}
      </div>
    </>
  );
}

/* Helper: Quick-Rate Grid Component for locked state */
function QuickRateGrid({ onRate }) {
  const [showcaseMovies, setShowcaseMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/movies")
      .then((res) => {
        const list = res.data || [];
        // Shuffle randomly and take top 5 movies
        const shuffled = [...list].sort(() => 0.5 - Math.random());
        setShowcaseMovies(shuffled.slice(0, 5));
      })
      .catch(() => setShowcaseMovies([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-strip">Loading 5 random top movies to rate…</div>;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 20 }}>
      {showcaseMovies.map((m) => (
        <div
          key={m.id}
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ display: "flex", gap: 14, padding: 14, borderBottom: "1px solid var(--border)" }}>
            <img
              src={m.poster_url}
              alt={m.title}
              style={{ width: 64, height: 96, objectFit: "cover", borderRadius: "var(--radius-sm)" }}
            />
            <div>
              <Link to={`/movies/${m.id}`} style={{ fontWeight: 700, color: "var(--text)", textDecoration: "none", fontSize: 15 }}>
                {m.title}
              </Link>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                {m.release_date?.slice(0, 4)} {m.runtime ? `· ${m.runtime}m` : ""}
              </div>
              <div style={{ fontSize: 11, color: "var(--gold)", marginTop: 4, fontFamily: "var(--font-mono)" }}>
                Admin ★ {m.admin_rating?.toFixed(1)}
              </div>
            </div>
          </div>

          <div style={{ padding: "12px 14px", background: "var(--bg-alt)" }}>
            <div style={{ fontSize: 11, color: "var(--text-faint)", fontFamily: "var(--font-mono)", marginBottom: 8 }}>
              Select your rating (1 - 10):
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 4 }}>
              {[2, 4, 6, 8, 10].map((score) => (
                <button
                  key={score}
                  type="button"
                  onClick={() => onRate(m.id, score)}
                  style={{
                    padding: "6px 0",
                    fontSize: 12,
                    fontFamily: "var(--font-mono)",
                    fontWeight: 700,
                    background: "var(--surface)",
                    border: "1px solid var(--gold-dim)",
                    color: "var(--gold)",
                    borderRadius: "var(--radius-sm)",
                    cursor: "pointer",
                    transition: "background 0.15s ease",
                  }}
                  title={`Rate ${score}/10`}
                >
                  ★ {score}
                </button>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
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


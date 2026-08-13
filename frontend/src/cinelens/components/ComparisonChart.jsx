const MODEL_CONFIG = {
  collaborative: {
    key: "collaborative",
    label: "Collaborative",
    icon: "🤝",
    color: "#4fd1c5",
  },
  content_based: {
    key: "content_based",
    label: "Content-Based",
    icon: "🎬",
    color: "#9f7aea",
  },
  hybrid: {
    key: "hybrid",
    label: "Hybrid",
    icon: "⚡",
    color: "#e8a33d",
  },
};

const MODEL_ORDER = ["collaborative", "content_based", "hybrid"];
const MEDALS = ["🥇", "🥈", "🥉"];

export default function ComparisonChart({ averages, bestModel, k = 10 }) {
  if (!averages) return null;

  const winnerKey = bestModel?.best_model || "hybrid";
  const winnerConfig = MODEL_CONFIG[winnerKey] || MODEL_CONFIG.hybrid;
  const topScore = bestModel?.ranking?.[0]?.score != null
    ? Math.round(bestModel.ranking[0].score * 100)
    : 100;

  // Metric cards configuration
  const metrics = [
    {
      id: "precision_at_k",
      title: `PRECISION@K`,
      subtitle: "Fraction of top-k recommendations that were relevant",
      winner: bestModel?.winner_by_metric?.precision_at_k || winnerKey,
    },
    {
      id: "recall_at_k",
      title: `RECALL@K`,
      subtitle: "Fraction of relevant items found in top-k",
      winner: bestModel?.winner_by_metric?.recall_at_k || winnerKey,
    },
    {
      id: "hit_rate_at_k",
      title: `HIT RATE@K`,
      subtitle: "% of users with at least one correct recommendation",
      winner: bestModel?.winner_by_metric?.hit_rate_at_k || winnerKey,
    },
  ];

  // Ranking list sorted by score
  const rankingList = bestModel?.ranking && bestModel.ranking.length > 0
    ? bestModel.ranking
    : MODEL_ORDER.map((m, i) => ({ model: m, score: 1 - i * 0.25 }));

  return (
    <div className="eval-results-container">
      {/* ── 1. Top Card: BEST OVERALL MODEL ── */}
      <div className="best-model-hero-card">
        <div className="best-model-hero-left">
          <span className="hero-crown-icon" role="img" aria-label="crown">👑</span>
          <div className="hero-text-block">
            <span className="hero-eyebrow-text">BEST OVERALL MODEL</span>
            <div className="hero-winner-row">
              <span className="hero-model-icon" style={{ color: winnerConfig.color }}>
                {winnerConfig.icon}
              </span>
              <span className="hero-model-title" style={{ color: winnerConfig.color }}>
                {winnerConfig.label}
              </span>
            </div>
          </div>
        </div>

        <div className="hero-score-badge-circle" style={{ borderColor: winnerConfig.color }}>
          <span className="hero-score-number">{topScore}</span>
          <span className="hero-score-sub">SCORE</span>
        </div>
      </div>

      {/* ── 2. Middle Row: 3 Metric Cards ── */}
      <div className="eval-metrics-grid">
        {metrics.map((m) => {
          const mWinnerConfig = MODEL_CONFIG[m.winner] || winnerConfig;
          const maxVal = Math.max(
            ...MODEL_ORDER.map((key) => averages[key]?.[m.id] ?? 0),
            0.001
          );

          return (
            <div key={m.id} className="eval-metric-card">
              <div className="eval-metric-header">
                <span className="eval-metric-title">{m.title}</span>
                <span
                  className="eval-winner-pill"
                  style={{
                    color: mWinnerConfig.color,
                    borderColor: `${mWinnerConfig.color}55`,
                    background: `${mWinnerConfig.color}18`,
                  }}
                >
                  {mWinnerConfig.icon} {mWinnerConfig.label}
                </span>
              </div>

              <p className="eval-metric-subtitle">{m.subtitle}</p>

              <div className="eval-metric-bars">
                {MODEL_ORDER.map((modelKey) => {
                  const cfg = MODEL_CONFIG[modelKey];
                  const rawVal = averages[modelKey]?.[m.id] ?? 0;
                  const pctText = `${(rawVal * 100).toFixed(1)}%`;
                  const barWidth = Math.max(4, Math.min(100, (rawVal / maxVal) * 92));

                  return (
                    <div key={modelKey} className="metric-bar-row">
                      <span className="metric-bar-icon" title={cfg.label}>
                        {cfg.icon}
                      </span>
                      <div className="metric-bar-track">
                        <div
                          className="metric-bar-fill"
                          style={{
                            width: `${barWidth}%`,
                            backgroundColor: cfg.color,
                          }}
                        />
                      </div>
                      <span className="metric-bar-val">{pctText}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── 3. Bottom Card: OVERALL RANKING ── */}
      <div className="overall-ranking-card">
        <span className="ranking-section-title">OVERALL RANKING</span>

        <div className="ranking-rows-list">
          {rankingList.map((item, idx) => {
            const cfg = MODEL_CONFIG[item.model] || {
              label: item.model,
              icon: "📊",
              color: "var(--text)",
            };
            const pct = Math.max(0, Math.min(100, item.score * 100));
            const pctText = `${pct.toFixed(1)}%`;

            return (
              <div key={item.model} className="ranking-row-item">
                <span className="ranking-medal-badge">{MEDALS[idx] || `#${idx + 1}`}</span>
                <span className="ranking-row-icon" style={{ color: cfg.color }}>
                  {cfg.icon}
                </span>
                <span className="ranking-row-name" style={{ color: cfg.color }}>
                  {cfg.label}
                </span>
                <div className="ranking-full-track">
                  <div
                    className="ranking-full-fill"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: cfg.color,
                    }}
                  />
                </div>
                <span className="ranking-row-pct">{pctText}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

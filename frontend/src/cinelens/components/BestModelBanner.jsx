const MODEL_COLORS = {
  collaborative: "#4fd1c5",
  content_based: "#b794f6",
  hybrid:        "#e8a33d",
};

const MODEL_LABELS = {
  collaborative: "Collaborative",
  content_based: "Content-Based",
  hybrid:        "Hybrid",
};

const MODEL_ICONS = {
  collaborative: "🤝",
  content_based: "🎬",
  hybrid:        "⚡",
};

const METRIC_LABELS = {
  precision_at_k: "Precision@k",
  recall_at_k:    "Recall@k",
  hit_rate_at_k:  "Hit Rate@k",
};

const METRIC_DESC = {
  precision_at_k: "Fraction of top-k recommendations that were relevant",
  recall_at_k:    "Fraction of relevant items found in top-k",
  hit_rate_at_k:  "% of users with at least one correct recommendation",
};

const RANK_MEDALS = ["🥇", "🥈", "🥉"];

export default function BestModelBanner({ averages, bestModel }) {
  const { best_model: best, ranking, winner_by_metric: winnerByMetric } = bestModel;
  const bestColor = MODEL_COLORS[best];
  const bestLabel = MODEL_LABELS[best];
  const bestIcon  = MODEL_ICONS[best];

  return (
    <div className="eval-section">
      {/* ── Winner Hero ── */}
      <div className="eval-winner-card" style={{ "--w-color": bestColor }}>
        <div className="eval-winner-glow" />
        <div className="eval-winner-inner">
          <div className="eval-winner-left">
            <span className="eval-crown">👑</span>
            <div>
              <p className="eval-winner-eyebrow">Best Overall Model</p>
              <p className="eval-winner-name" style={{ color: bestColor }}>
                {bestIcon} {bestLabel}
              </p>
            </div>
          </div>
          <div className="eval-score-ring" style={{ "--ring-color": bestColor }}>
            <span className="eval-score-val">
              {(ranking[0].score * 100).toFixed(0)}
            </span>
            <span className="eval-score-unit">score</span>
          </div>
        </div>
      </div>

      {/* ── Metric Tiles ── */}
      <div className="eval-metrics-grid">
        {Object.entries(METRIC_LABELS).map(([key, label]) => {
          const winner = winnerByMetric[key];
          const values = Object.keys(MODEL_LABELS).map((m) => ({
            model: m,
            val: averages[m][key],
          }));
          const max = Math.max(...values.map((v) => v.val));

          return (
            <div key={key} className="eval-metric-tile">
              <div className="eval-metric-header">
                <span className="eval-metric-name">{label}</span>
                {winner ? (
                  <span
                    className="eval-metric-winner-chip"
                    style={{
                      background: MODEL_COLORS[winner] + "22",
                      color: MODEL_COLORS[winner],
                      borderColor: MODEL_COLORS[winner] + "55",
                    }}
                  >
                    {MODEL_ICONS[winner]} {MODEL_LABELS[winner]}
                  </span>
                ) : (
                  <span className="eval-metric-tie-chip">= Tie</span>
                )}
              </div>
              <p className="eval-metric-desc">{METRIC_DESC[key]}</p>
              <div className="eval-bar-list">
                {values.map(({ model, val }) => {
                  const pct = max > 0 ? (val / max) * 100 : 0;
                  const isWin = winner === model;
                  return (
                    <div key={model} className="eval-bar-row">
                      <span className="eval-bar-model" style={{ color: isWin ? MODEL_COLORS[model] : "var(--text-faint)" }}>
                        {MODEL_ICONS[model]}
                      </span>
                      <div className="eval-bar-track">
                        <div
                          className="eval-bar-fill"
                          style={{
                            width: `${Math.max(2, pct)}%`,
                            background: MODEL_COLORS[model],
                            opacity: isWin ? 1 : 0.35,
                          }}
                        />
                      </div>
                      <span
                        className="eval-bar-val"
                        style={{ color: isWin ? MODEL_COLORS[model] : "var(--text-faint)" }}
                      >
                        {(val * 100).toFixed(1)}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Podium Ranking ── */}
      <div className="eval-podium">
        <p className="eval-podium-title">Overall Ranking</p>
        <div className="eval-podium-list">
          {ranking.map((r, i) => (
            <div
              key={r.model}
              className={`eval-podium-item${i === 0 ? " eval-podium-first" : ""}`}
            >
              <span className="eval-podium-medal">{RANK_MEDALS[i] ?? `#${i + 1}`}</span>
              <span className="eval-podium-icon">{MODEL_ICONS[r.model]}</span>
              <span
                className="eval-podium-label"
                style={{ color: i === 0 ? MODEL_COLORS[r.model] : "var(--text-dim)" }}
              >
                {MODEL_LABELS[r.model]}
              </span>
              <div className="eval-podium-bar-track">
                <div
                  className="eval-podium-bar-fill"
                  style={{
                    width: `${(r.score * 100).toFixed(1)}%`,
                    background: MODEL_COLORS[r.model],
                    opacity: i === 0 ? 1 : 0.5,
                  }}
                />
              </div>
              <span
                className="eval-podium-score"
                style={{ color: i === 0 ? MODEL_COLORS[r.model] : "var(--text-faint)" }}
              >
                {(r.score * 100).toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

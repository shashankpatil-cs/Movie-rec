import React from "react";

/*
 * HOW THE SCORE WORKS — important for correct labeling:
 *
 * The "Overall Score" is a RELATIVE EFFICIENCY INDEX, NOT an accuracy percentage.
 * The best-performing model among the 4 tested always gets score = 1.0000 (index top).
 * Other models are scored relative to it:
 *   e.g. score 0.963 means "96.3% as efficient as the top model"
 *
 * score = 1.0 does NOT mean "100% prediction accuracy".
 * It means "ranked #1 out of the 4 models tested in this experiment".
 *
 * We display this as a relative rank bar — wider bar = closer to the top model.
 * The score label is shown as "Relative Index: 0.9703" not as a bare "97%"
 * to avoid implying accuracy.
 */

const SCORE_TOOLTIP =
  "Relative Efficiency Index — 1.0000 = best model in this experiment. " +
  "Does NOT mean 100% prediction accuracy. All models are compared to each other.";

export default function OverallPerformance({ comparison }) {
  const {
    overall_best_model,
    overall_best_score,
    overall_best_metrics,
    ranking,
    overall_scores,
    best_by_rmse,
    best_by_mae,
    best_by_r2,
  } = comparison;

  const validScores = Object.values(overall_scores || {});
  const maxScore = validScores.length > 0 ? Math.max(...validScores) : 1.0;
  const minScore = validScores.length > 0 ? Math.min(...validScores) : 0.0;
  const spreadPct = maxScore > 0 ? (((maxScore - minScore) / maxScore) * 100).toFixed(1) : "0.0";

  return (
    <div className="panel">
      <div className="panel-title">Overall Model Performance</div>

      {/* Score methodology note */}
      <div className="score-methodology-note" title={SCORE_TOOLTIP}>
        <span className="info-icon">ℹ</span>
        <span>
          Scores are a <strong>Relative Efficiency Index</strong> (1.0 = best among 4 models tested).{" "}
          <em>Not</em> a prediction accuracy percentage.
          Score spread this run: <strong>{spreadPct}%</strong> between best and worst model.
        </span>
      </div>

      <div className="best-model-hero">
        <div className="trophy">🏆</div>
        <div>
          <div className="name">{overall_best_model}</div>
          <div className="score">
            <span className="hero-score-label">#1 of 4 models</span>
            {" · "}
            Relative Index: {overall_best_score.toFixed(4)}
            {" · "}
            RMSE {overall_best_metrics.rmse.toFixed(4)} · MAE{" "}
            {overall_best_metrics.mae.toFixed(4)} · R² {overall_best_metrics.r2.toFixed(4)}
          </div>
        </div>
      </div>

      <div className="metric-winners">
        <div className="winner-chip">
          <div className="metric-label">Best by RMSE</div>
          <div className="metric-model">{best_by_rmse}</div>
        </div>
        <div className="winner-chip">
          <div className="metric-label">Best by MAE</div>
          <div className="metric-model">{best_by_mae}</div>
        </div>
        <div className="winner-chip">
          <div className="metric-label">Best by R²</div>
          <div className="metric-model">{best_by_r2}</div>
        </div>
      </div>

      <div className="panel-title" style={{ marginTop: 8 }}>
        Composite Ranking — Relative Efficiency Index
      </div>

      {/* Axis labels for the bar chart */}
      <div className="ranking-axis">
        <span>← Worse</span>
        <span className="axis-label-center">Relative to best model in this run</span>
        <span>Best →</span>
      </div>

      <div className="ranking-list">
        {ranking.map((name, idx) => {
          const score = overall_scores[name] ?? 0;
          // Bar width: proportion relative to max score, minimum 10% for visibility
          const pctWidth = maxScore > 0 ? Math.max(10, (score / maxScore) * 100) : 10;
          // Relative gap from top model
          const gapFromTop = ((maxScore - score) * 100).toFixed(2);
          const isTop = idx === 0;

          return (
            <div key={name} className={`ranking-row rank-${idx + 1}`}>
              <div className="rank-num">#{idx + 1}</div>
              <div className="rank-name">{name}</div>
              <div className="score-bar-track">
                <div
                  className="score-bar-fill"
                  style={{ width: `${pctWidth}%` }}
                />
              </div>
              <div className="rank-score">
                <span className="score-index" title={SCORE_TOOLTIP}>
                  {score.toFixed(4)}
                </span>
                <span className="score-gap">
                  {isTop ? (
                    <span className="gap-top">↑ Top</span>
                  ) : (
                    <span className="gap-diff">−{gapFromTop}pp vs #1</span>
                  )}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer note */}
      <div className="ranking-footer-note">
        All models share the same train/test split and evaluation metrics.
        Index 1.0000 = best in <em>this</em> experiment only — not globally.
      </div>
    </div>
  );
}

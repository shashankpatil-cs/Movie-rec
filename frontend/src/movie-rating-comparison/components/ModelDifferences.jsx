import React from "react";

const MODEL_SPECS = {
  "Linear Regression": {
    category: "Baseline · Parametric Linear",
    color: "#5aa3e8",
    accentBg: "rgba(90, 163, 232, 0.12)",
    accentBorder: "rgba(90, 163, 232, 0.4)",
    icon: "📐",
    featuresCount: "41 Features (Full)",
    featureDesc: "User stats + Movie stats + Genre match + 18 Movie genres + 18 User preferences",
    complexity: "O(p²n) · Closed-Form OLS",
    scaling: "Raw Features (Scale Invariant)",
    tradeoff: "Fastest to train & highly interpretable baseline. Assumes linear relationship without interaction terms.",
  },
  "Polynomial Regression": {
    category: "Non-Linear · Polynomial Expansion",
    color: "#a58ae8",
    accentBg: "rgba(165, 138, 232, 0.12)",
    accentBorder: "rgba(165, 138, 232, 0.4)",
    icon: "📈",
    featuresCount: "5 Features (Core Subset)",
    featureDesc: "5 dense numeric features (User/Movie avg & count + Genre match score)",
    complexity: "O(C(n+d, d)) Combinatorial Expansion",
    scaling: "StandardScaler() Pipeline",
    tradeoff: "Captures non-linear curves & feature interactions. Restricted to 5 core features to avoid combinatorial explosion.",
  },
  "Random Forest": {
    category: "Non-Linear · Bagging Ensemble",
    color: "#62c98f",
    accentBg: "rgba(98, 201, 143, 0.12)",
    accentBorder: "rgba(98, 201, 143, 0.4)",
    icon: "🌲",
    featuresCount: "41 Features (Full)",
    featureDesc: "User stats + Movie stats + Genre match + 18 Movie genres + 18 User preferences",
    complexity: "O(n_trees · n · log(n) · p)",
    scaling: "Raw Features (Tree Scale-Invariant)",
    tradeoff: "Averages multiple randomized decision trees to reduce variance and resist overfitting without feature scaling.",
  },
  "XGBoost": {
    category: "Non-Linear · Gradient Boosting",
    color: "#e0b34a",
    accentBg: "rgba(224, 179, 74, 0.12)",
    accentBorder: "rgba(224, 179, 74, 0.4)",
    icon: "⚡",
    featuresCount: "41 Features (Full)",
    featureDesc: "User stats + Movie stats + Genre match + 18 Movie genres + 18 User preferences",
    complexity: "O(n_trees · depth · n · p)",
    scaling: "Raw Features (Tree Scale-Invariant)",
    tradeoff: "Sequentially optimizes second-order Taylor gradients with regularized trees (reg:squarederror).",
  },
};

export default function ModelDifferences({ modelResults, comparison, hyperparameters }) {
  const modelOrder = ["Linear Regression", "Polynomial Regression", "Random Forest", "XGBoost"];
  const bestModel = comparison.overall_best_model;

  return (
    <div className="panel">
      <div className="panel-header-row">
        <div>
          <div className="panel-title">Model-by-Model Separation &amp; Deep-Dive</div>
          <p className="panel-subtitle">
            Side-by-side breakdown of architecture, feature spaces, hyperparameters, and evaluation outcomes.
          </p>
        </div>
      </div>

      <div className="model-differences-grid">
        {modelOrder.map((name) => {
          const spec = MODEL_SPECS[name];
          const metrics = modelResults[name];
          const isBest = name === bestModel;
          const score = comparison.overall_scores?.[name];
          const isRmseWinner = comparison.best_by_rmse === name;
          const isMaeWinner = comparison.best_by_mae === name;
          const isR2Winner = comparison.best_by_r2 === name;

          return (
            <div
              key={name}
              className={`model-card-diff ${isBest ? "is-overall-best" : ""}`}
              style={{
                borderColor: isBest ? "var(--gold)" : spec.accentBorder,
              }}
            >
              <div className="model-card-header" style={{ background: spec.accentBg }}>
                <div className="model-icon-title">
                  <span className="model-icon">{spec.icon}</span>
                  <div>
                    <h3 className="model-card-name" style={{ color: spec.color }}>
                      {name}
                    </h3>
                    <span className="model-category">{spec.category}</span>
                  </div>
                </div>
                {isBest && <span className="badge badge-gold">🏆 BEST</span>}
              </div>

              <div className="model-card-body">
                {/* Metric Summary Bar */}
                {metrics && (
                  <div className="model-metric-pills">
                    <div className={`metric-pill ${isRmseWinner ? "is-winner" : ""}`}>
                      <span className="metric-pill-label">RMSE</span>
                      <span className="metric-pill-val">{metrics.rmse.toFixed(4)}</span>
                      {isRmseWinner && <span className="winner-tag">BEST</span>}
                    </div>
                    <div className={`metric-pill ${isMaeWinner ? "is-winner" : ""}`}>
                      <span className="metric-pill-label">MAE</span>
                      <span className="metric-pill-val">{metrics.mae.toFixed(4)}</span>
                      {isMaeWinner && <span className="winner-tag">BEST</span>}
                    </div>
                    <div className={`metric-pill ${isR2Winner ? "is-winner" : ""}`}>
                      <span className="metric-pill-label">R²</span>
                      <span className="metric-pill-val">{metrics.r2.toFixed(4)}</span>
                      {isR2Winner && <span className="winner-tag">BEST</span>}
                    </div>
                    {score !== undefined && (
                      <div className="metric-pill score-pill">
                        <span className="metric-pill-label">Score</span>
                        <span className="metric-pill-val">{score.toFixed(4)}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Separation Section: Feature Space */}
                <div className="diff-section">
                  <div className="diff-label">Input Feature Space</div>
                  <div className="diff-value-highlight" style={{ color: spec.color }}>
                    {spec.featuresCount}
                  </div>
                  <div className="diff-desc">{spec.featureDesc}</div>
                </div>

                {/* Separation Section: Hyperparameters */}
                <div className="diff-section">
                  <div className="diff-label">Hyperparameters Applied</div>
                  {name === "Linear Regression" && (
                    <div className="param-tag-list">
                      <span className="param-tag">fit_intercept: True</span>
                      <span className="param-tag">Unregularized OLS</span>
                    </div>
                  )}
                  {name === "Polynomial Regression" && (
                    <div className="param-tag-list">
                      <span className="param-tag highlight-param">
                        degree: {hyperparameters?.polynomial_degree || 2}
                      </span>
                      <span className="param-tag">StandardScaler: True</span>
                      <span className="param-tag">include_bias: False</span>
                    </div>
                  )}
                  {name === "Random Forest" && (
                    <div className="param-tag-list">
                      <span className="param-tag highlight-param">
                        n_estimators: {hyperparameters?.random_forest_n_estimators || 100}
                      </span>
                      <span className="param-tag">max_depth: None</span>
                      <span className="param-tag">random_state: 42</span>
                    </div>
                  )}
                  {name === "XGBoost" && (
                    <div className="param-tag-list">
                      <span className="param-tag highlight-param">
                        n_estimators: {hyperparameters?.xgboost_n_estimators || 100}
                      </span>
                      <span className="param-tag highlight-param">
                        learning_rate: {hyperparameters?.xgboost_learning_rate || 0.05}
                      </span>
                      <span className="param-tag highlight-param">
                        max_depth: {hyperparameters?.xgboost_max_depth || 6}
                      </span>
                      <span className="param-tag">objective: reg:squarederror</span>
                    </div>
                  )}
                </div>

                {/* Separation Section: Characteristics & Trade-offs */}
                <div className="diff-section">
                  <div className="diff-label">Key Behavioral Differences</div>
                  <p className="tradeoff-text">{spec.tradeoff}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

import React from "react";
import TrainTestBar from "./TrainTestBar.jsx";

const USER_OPTIONS = [250, 500, 750, 1000];
const POLY_DEGREES = [2, 3, 4, 5];
const RF_TREE_OPTIONS = [50, 100, 150, 200];

export default function Controls({
  params,
  setParams,
  onRun,
  onResetDefaults,
  onClearResults,
  loading,
  hasResults,
}) {
  const update = (key, value) => {
    setParams((p) => ({ ...p, [key]: value }));
  };

  return (
    <div className="panel controls-panel">
      <div className="panel-header-row">
        <div>
          <div className="panel-title">Model-Separated Hyperparameter Controls</div>
          <p className="panel-subtitle">
            Configure dataset subsampling and tune model parameters independently. Modifying any setting automatically resets the experiment state for a fresh comparison.
          </p>
        </div>
        <div className="header-actions">
          <button
            type="button"
            className="btn-ghost"
            onClick={onResetDefaults}
            disabled={loading}
            title="Reset all settings to default values"
          >
            ↺ Reset Defaults
          </button>
          {hasResults && (
            <button
              type="button"
              className="btn-ghost-danger"
              onClick={onClearResults}
              disabled={loading}
              title="Clear current experiment results"
            >
              ✕ Clear Results
            </button>
          )}
        </div>
      </div>

      {/* Global Dataset Configuration Card */}
      <div className="control-card dataset-card">
        <div className="card-header">
          <div className="card-title-group">
            <span className="card-badge badge-blue">SHARED DATASET &amp; SPLIT</span>
            <h3>MovieLens 1M Subsample &amp; 80/20 Train-Test Split</h3>
          </div>
          <div className="split-badge-group">
            <span className="info-chip">Split: 80% Train / 20% Test</span>
            <span className="info-chip">Seed: 42 (Reproducible)</span>
            <span className="info-chip info-chip-green">✓ Leakage-Free Fit</span>
          </div>
        </div>

        <div className="card-content">
          <div className="control-group">
            <div className="range-value">
              <label>Simulated Users</label>
              <span className="val">{params.num_users} Users</span>
            </div>
            <div className="pill-group">
              {USER_OPTIONS.map((count) => (
                <button
                  key={count}
                  type="button"
                  className={`pill ${params.num_users === count ? "active" : ""}`}
                  onClick={() => update("num_users", count)}
                >
                  {count} users
                </button>
              ))}
            </div>
            <div className="range-info">
              <div className="hint">
                Draws a reproducible sample of users and ratings from the MovieLens 1M dataset.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Separated Model Grid */}
      <div className="models-config-grid">
        {/* Model 1: Linear Regression */}
        <div className="control-card model-section-card card-linear">
          <div className="card-header">
            <div className="card-title-group">
              <div className="model-tag-row">
                <span className="model-dot dot-blue"></span>
                <span className="model-type-tag">MODEL 1</span>
              </div>
              <h4>Linear Regression</h4>
            </div>
            <span className="badge badge-blue">Baseline (OLS)</span>
          </div>
          <div className="card-content model-card-inner">
            <div className="feature-spec-box">
              <div className="spec-item">
                <span className="spec-label">Input Space:</span>
                <span className="spec-val">41 Features (Full Set)</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Optimization:</span>
                <span className="spec-val">Closed-form (Exact)</span>
              </div>
            </div>
            <div className="static-param-info">
              <span className="param-label">Hyperparameters:</span>
              <p className="param-desc">
                Standard Ordinary Least Squares (OLS) has no tunable hyperparameters. Acts as the baseline benchmark across all comparisons.
              </p>
            </div>
          </div>
        </div>

        {/* Model 2: Polynomial Regression */}
        <div className="control-card model-section-card card-poly">
          <div className="card-header">
            <div className="card-title-group">
              <div className="model-tag-row">
                <span className="model-dot dot-purple"></span>
                <span className="model-type-tag">MODEL 2</span>
              </div>
              <h4>Polynomial Regression</h4>
            </div>
            <span className="badge badge-purple">Pipeline</span>
          </div>
          <div className="card-content model-card-inner">
            <div className="feature-spec-box">
              <div className="spec-item">
                <span className="spec-label">Input Space:</span>
                <span className="spec-val">5 Features (Core Numeric)</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Pipeline:</span>
                <span className="spec-val">StandardScaler → Poly → LinReg</span>
              </div>
            </div>

            <div className="control-group">
              <div className="range-value">
                <label>Polynomial Degree</label>
                <span className="val highlight-purple">Degree {params.poly_degree}</span>
              </div>
              <div className="pill-group degree-pills">
                {POLY_DEGREES.map((deg) => (
                  <button
                    key={deg}
                    type="button"
                    className={`pill pill-purple ${params.poly_degree === deg ? "active" : ""}`}
                    onClick={() => update("poly_degree", deg)}
                  >
                    Degree {deg}
                  </button>
                ))}
              </div>
              <input
                type="range"
                min={2}
                max={5}
                step={1}
                value={params.poly_degree}
                onChange={(e) => update("poly_degree", Number(e.target.value))}
              />
              <div className="range-info">
                <div className="range-bounds">Allowed Degrees: 2, 3, 4, 5</div>
                {params.poly_degree >= 4 && (
                  <div className="warning">⚠️ High degree polynomial expands non-linear interaction terms</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Model 3: Random Forest */}
        <div className="control-card model-section-card card-rf">
          <div className="card-header">
            <div className="card-title-group">
              <div className="model-tag-row">
                <span className="model-dot dot-green"></span>
                <span className="model-type-tag">MODEL 3</span>
              </div>
              <h4>Random Forest</h4>
            </div>
            <span className="badge badge-green">Bagging Ensemble</span>
          </div>
          <div className="card-content model-card-inner">
            <div className="feature-spec-box">
              <div className="spec-item">
                <span className="spec-label">Input Space:</span>
                <span className="spec-val">41 Features (Full Set)</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Parallelism:</span>
                <span className="spec-val">n_jobs = -1 (All cores)</span>
              </div>
            </div>

            <div className="control-group">
              <div className="range-value">
                <label>Number of Trees (n_estimators)</label>
                <span className="val highlight-green">{params.rf_n_estimators} Trees</span>
              </div>
              <div className="pill-group rf-pills">
                {RF_TREE_OPTIONS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    className={`pill pill-green ${params.rf_n_estimators === t ? "active" : ""}`}
                    onClick={() => update("rf_n_estimators", t)}
                  >
                    {t} trees
                  </button>
                ))}
              </div>
              <input
                type="range"
                min={50}
                max={200}
                step={50}
                value={params.rf_n_estimators}
                onChange={(e) => update("rf_n_estimators", Number(e.target.value))}
              />
              <div className="range-info">
                <div className="range-bounds">Options: 50, 100, 150, 200 trees (default: 100)</div>
                <div className="hint">Averages uncorrelated bootstrap trees to reduce variance.</div>
              </div>
            </div>
          </div>
        </div>

        {/* Model 4: XGBoost */}
        <div className="control-card model-section-card card-xgb">
          <div className="card-header">
            <div className="card-title-group">
              <div className="model-tag-row">
                <span className="model-dot dot-gold"></span>
                <span className="model-type-tag">MODEL 4</span>
              </div>
              <h4>XGBoost Regressor</h4>
            </div>
            <span className="badge badge-gold">Gradient Boosting</span>
          </div>
          <div className="card-content model-card-inner">
            <div className="feature-spec-box">
              <div className="spec-item">
                <span className="spec-label">Input Space:</span>
                <span className="spec-val">41 Features (Full Set)</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Objective:</span>
                <span className="spec-val">reg:squarederror (Fixed)</span>
              </div>
            </div>

            {/* n_estimators */}
            <div className="control-group">
              <div className="range-value">
                <label>Boosting Trees (n_estimators)</label>
                <span className="val highlight-gold">{params.xgb_n_estimators}</span>
              </div>
              <input
                type="range"
                min={10}
                max={1000}
                step={10}
                value={params.xgb_n_estimators}
                onChange={(e) => update("xgb_n_estimators", Number(e.target.value))}
              />
              <div className="range-bounds">Range: 10 – 1000 rounds (default: 100)</div>
            </div>

            {/* learning rate */}
            <div className="control-group">
              <div className="range-value">
                <label>Learning Rate (eta)</label>
                <span className="val highlight-gold">{params.xgb_learning_rate.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min={0.01}
                max={0.5}
                step={0.01}
                value={params.xgb_learning_rate}
                onChange={(e) => update("xgb_learning_rate", Number(e.target.value))}
              />
              <div className="range-bounds">Range: 0.01 – 0.50 (default: 0.05)</div>
            </div>

            {/* max_depth */}
            <div className="control-group">
              <div className="range-value">
                <label>Max Tree Depth</label>
                <span className="val highlight-gold">Depth {params.xgb_max_depth}</span>
              </div>
              <input
                type="range"
                min={2}
                max={10}
                step={1}
                value={params.xgb_max_depth}
                onChange={(e) => update("xgb_max_depth", Number(e.target.value))}
              />
              <div className="range-bounds">Range: 2 – 10 (default: 6)</div>
            </div>
          </div>
        </div>
      </div>

      <div className="controls-footer">
        <button className="run-btn" onClick={onRun} disabled={loading} type="button">
          {loading ? (
            <span className="btn-loading-flex">
              <span className="spinner-sm"></span> Training All 4 Models on Same Split…
            </span>
          ) : (
            "⚡ Run Experiment & Compare Models"
          )}
        </button>
      </div>
    </div>
  );
}

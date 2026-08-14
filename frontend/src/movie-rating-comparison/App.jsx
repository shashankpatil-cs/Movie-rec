import React, { useState } from "react";
import Controls from "./components/Controls.jsx";
import ResultsTable from "./components/ResultsTable.jsx";
import Charts from "./components/Charts.jsx";
import OverallPerformance from "./components/OverallPerformance.jsx";
import ModelDifferences from "./components/ModelDifferences.jsx";
import Predictions from "./components/Predictions.jsx";
import { runExperiment } from "./api.js";

const DEFAULT_PARAMS = {
  num_users: 250,
  poly_degree: 2,
  rf_n_estimators: 100,
  xgb_n_estimators: 100,
  xgb_learning_rate: 0.05,
  xgb_max_depth: 6,
};

export default function App() {
  const [params, setParams] = useState(DEFAULT_PARAMS);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Automatically clear old results whenever any hyperparameter or dataset setting changes
  const handleSetParams = (updater) => {
    setResult(null);
    setError(null);
    setParams(updater);
  };

  const handleResetDefaults = () => {
    setParams(DEFAULT_PARAMS);
    setResult(null);
    setError(null);
  };

  const handleClearResults = () => {
    setResult(null);
    setError(null);
  };

  const handleRun = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await runExperiment(params);
      setResult(data);
    } catch (e) {
      setError(e.message || "Something went wrong running the experiment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <span className="eyebrow">MovieLens 1M · Supervised Regression Bake-Off</span>
          <h1>Rating Prediction Model Comparison</h1>
          <p>
            Fair, leakage-free benchmark comparing <strong>Linear Regression</strong>, <strong>Polynomial Regression</strong>, <strong>Random Forest</strong>, and <strong>XGBoost</strong> on a single synchronized 80/20 train/test split.
          </p>
        </div>
        <div className="system-status-badge">
          <span className="live-pulse"></span>
          <span>FastAPI + scikit-learn + XGBoost</span>
        </div>
      </header>

      {/* Model-Separated Hyperparameter Controls */}
      <Controls
        params={params}
        setParams={handleSetParams}
        onRun={handleRun}
        onResetDefaults={handleResetDefaults}
        onClearResults={handleClearResults}
        loading={loading}
        hasResults={Boolean(result)}
      />

      {error && (
        <div className="error-banner">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {loading && (
        <div className="panel">
          <div className="loading-block">
            <div className="spinner" />
            <p>Training &amp; Evaluating Linear, Polynomial, Random Forest &amp; XGBoost on the same split…</p>
            <span className="loading-subtext">Computing RMSE, MAE, R² and min-max composite ranking</span>
          </div>
        </div>
      )}

      {!loading && !result && !error && (
        <div className="panel empty-state-panel">
          <div className="empty-state">
            <div className="empty-icon">🎯</div>
            <h3>Ready for Model Evaluation</h3>
            <p>
              Select your simulated user volume and model hyperparameters above, then click <strong>Run Experiment</strong> to train all 4 models simultaneously on MovieLens 1M.
            </p>
          </div>
        </div>
      )}

      {!loading && result && (
        <>
          {/* Experiment Dataset Summary Metrics */}
          <div className="stats-strip">
            <div className="stat-card">
              <div className="label">Simulated Users</div>
              <div className="value">{result.num_users_used}</div>
            </div>
            <div className="stat-card">
              <div className="label">Train Rows (80%)</div>
              <div className="value">{result.train_size.toLocaleString()}</div>
            </div>
            <div className="stat-card">
              <div className="label">Test Rows (20%)</div>
              <div className="value">{result.test_size.toLocaleString()}</div>
            </div>
            <div className="stat-card">
              <div className="label">Total Ratings</div>
              <div className="value">{result.total_ratings_used.toLocaleString()}</div>
            </div>
            <div className="stat-card">
              <div className="label">Runtime</div>
              <div className="value">{result.elapsed_seconds}s</div>
            </div>
          </div>

          {/* Model Differences & Deep Dive Breakdown */}
          <ModelDifferences
            modelResults={result.model_results}
            comparison={result.comparison}
            hyperparameters={result.hyperparameters}
          />

          {/* Summary Metric Table */}
          <ResultsTable
            modelResults={result.model_results}
            bestModel={result.comparison.overall_best_model}
          />

          {/* Metric Bar Charts */}
          <Charts modelResults={result.model_results} />

          {/* Overall Composite Performance & Ranking */}
          <OverallPerformance comparison={result.comparison} />

          {/* Test Set Prediction Samples */}
          <Predictions samplePredictions={result.sample_predictions} />
        </>
      )}

      <footer className="app-footer">
        MovieLens 1M Benchmark · Zero-Leakage Pipeline · Reproducible Seed 42
      </footer>
    </div>
  );
}

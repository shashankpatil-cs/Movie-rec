import React from "react";

export default function TrainTestBar({ trainSize, testSize, totalRatings }) {
  const total = totalRatings || (trainSize && testSize ? trainSize + testSize : 0);
  const trainPct = total > 0 && trainSize ? ((trainSize / total) * 100).toFixed(1) : "80.0";
  const testPct = total > 0 && testSize ? ((testSize / total) * 100).toFixed(1) : "20.0";

  return (
    <div className="train-test-bar-container">
      <div className="split-bar-header">
        <div className="split-bar-title">
          <span className="split-icon">⚖️</span>
          <span className="split-title-text">Synchronized Train / Test Data Split</span>
        </div>
        <div className="split-bar-stats">
          <span className="split-stat-tag tag-train">
            Train: {trainSize ? trainSize.toLocaleString() : "80%"} ({trainPct}%)
          </span>
          <span className="split-divider">|</span>
          <span className="split-stat-tag tag-test">
            Test: {testSize ? testSize.toLocaleString() : "20%"} ({testPct}%)
          </span>
          {total > 0 && (
            <span className="split-total-tag">
              Total: {total.toLocaleString()} ratings
            </span>
          )}
        </div>
      </div>

      {/* Visual Dual-Segment Progress Bar */}
      <div className="split-bar-track">
        <div
          className="split-segment segment-train"
          style={{ width: `${trainPct}%` }}
          title={`Train Split: ${trainSize ? trainSize.toLocaleString() : "80%"} rows (${trainPct}%) - Used exclusively for fitting features and models`}
        >
          <div className="segment-content">
            <span className="segment-label">TRAIN SPLIT ({trainPct}%)</span>
            {trainSize && <span className="segment-count">{trainSize.toLocaleString()} rows</span>}
          </div>
          <div className="segment-glow"></div>
        </div>

        <div className="leakage-barrier" title="Strict Leakage-Free Isolation Barrier">
          <span className="barrier-line"></span>
          <span className="barrier-lock" title="Frozen training statistics; no test data leakage">🔒</span>
        </div>

        <div
          className="split-segment segment-test"
          style={{ width: `${testPct}%` }}
          title={`Test Holdout Split: ${testSize ? testSize.toLocaleString() : "20%"} rows (${testPct}%) - Shared evaluation target for all 4 models`}
        >
          <div className="segment-content">
            <span className="segment-label">TEST SPLIT ({testPct}%)</span>
            {testSize && <span className="segment-count">{testSize.toLocaleString()} rows</span>}
          </div>
          <div className="segment-glow"></div>
        </div>
      </div>

      <div className="split-bar-footer">
        <div className="footer-note train-note">
          <span className="legend-dot dot-train"></span>
          <span><strong>Train Set (80%):</strong> Computes user/movie means, genre prefs &amp; trains all 4 models.</span>
        </div>
        <div className="footer-note test-note">
          <span className="legend-dot dot-test"></span>
          <span><strong>Test Set (20%):</strong> Evaluates RMSE, MAE, R² on identical holdout records across all models.</span>
        </div>
      </div>
    </div>
  );
}

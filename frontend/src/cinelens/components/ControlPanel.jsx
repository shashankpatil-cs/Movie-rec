const METHODS = [
  { id: "pearson", label: "Pearson", sub: "linear corr · fastest" },
  { id: "spearman", label: "Spearman", sub: "rank corr · ~5s" },
  { id: "kendall", label: "Kendall", sub: "rank corr · ~30s" },
];

const USER_COUNTS = [100, 250, 500, 750, 1000];

export default function ControlPanel({
  users,
  usersLoading,
  onReroll,
  userCount,
  onUserCountChange,
  cfMethod,
  onMethodChange,
  testSize,
  onTestSizeChange,
  minCfRatings,
  onMinCfRatingsChange,
  onRun,
  running,
  error,
}) {
  const trainPct = Math.round((1 - testSize) * 100);
  const testPct  = Math.round(testSize * 100);

  return (
    <section className="panel">
      <div className="control-grid">
        <div>
          <p className="panel-title">Sampled Users</p>

          <div className="method-row" style={{ marginBottom: 12 }}>
            {USER_COUNTS.map((n) => (
              <button
                key={n}
                className={`method-pill ${userCount === n ? "active" : ""}`}
                onClick={() => onUserCountChange(n)}
                disabled={usersLoading || running}
              >
                {n} users
              </button>
            ))}
          </div>

          <div className="user-sample-card" style={{
            background: "var(--panel-alt)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-sm)",
            padding: "12px 14px",
            marginBottom: "12px",
            display: "flex",
            flexDirection: "column",
            gap: "6px"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--text)" }}>
                {usersLoading ? "Sampling users..." : `✓ ${users.length} Active Users Selected`}
              </span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--gold)" }}>
                {!usersLoading && users.length > 0 ? `Avg ~${Math.round(users.reduce((a, b) => a + b.rating_count, 0) / users.length)} ratings/user` : ""}
              </span>
            </div>
            <span style={{ fontSize: "11.5px", color: "var(--text-faint)" }}>
              {usersLoading
                ? "Selecting randomized users with ≥15 ratings..."
                : `User IDs #${users.slice(0, 3).map(u => u.user_id).join(", #")} ... #${users.slice(-1)[0]?.user_id} ready for evaluation`}
            </span>
          </div>

          <button className="btn btn-ghost" onClick={onReroll} disabled={usersLoading || running}>
            🎲 Re-roll random {userCount} users
          </button>
        </div>

        <div>
          <p className="panel-title">Collaborative Method</p>
          <div className="method-row">
            {METHODS.map((m) => (
              <button
                key={m.id}
                className={`method-pill ${cfMethod === m.id ? "active" : ""}`}
                onClick={() => onMethodChange(m.id)}
                disabled={running}
              >
                {m.label}
                <span className="sub">{m.sub}</span>
              </button>
            ))}
          </div>

          {/* Train / Test split slider */}
          <div className="alpha-row" style={{ marginTop: 16 }}>
            <div className="alpha-label">
              <span>Train / Test split</span>
              <span className="val">Train {trainPct}% · Test {testPct}%</span>
            </div>
            <input
              id="test-size-slider"
              type="range"
              min="0.05"
              max="0.5"
              step="0.05"
              value={testSize}
              onChange={(e) => onTestSizeChange(parseFloat(e.target.value))}
              disabled={running}
            />
            <div className="alpha-endpoints">
              <span>5% test (more train)</span>
              <span>50% test (equal split)</span>
            </div>
          </div>

          {/* CF rating threshold slider */}
          <div className="alpha-row" style={{ marginTop: 16 }}>
            <div className="alpha-label">
              <span>CF rating threshold</span>
              <span className="val">≥ {minCfRatings} ratings per movie</span>
            </div>
            <input
              id="min-cf-ratings-slider"
              type="range"
              min="10"
              max="500"
              step="10"
              value={minCfRatings}
              onChange={(e) => onMinCfRatingsChange(parseInt(e.target.value, 10))}
              disabled={running}
            />
            <div className="alpha-endpoints">
              <span>10 (more movies, noisier)</span>
              <span>500 (fewer, high-quality)</span>
            </div>
          </div>
        </div>
      </div>

      <div className="run-row" style={{ marginTop: 20 }}>
        <button className="btn btn-primary" onClick={onRun} disabled={running || usersLoading || users.length === 0}>
          {running ? "Running…" : "Run Comparison"}
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}
    </section>
  );
}

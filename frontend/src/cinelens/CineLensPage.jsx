import { useEffect, useState } from "react";
import "./CineLens.css";
import Header from "./components/Header";
import Nav from "./components/Nav";
import ControlPanel from "./components/ControlPanel";
import Loader from "./components/Loader";
import ComparisonChart from "./components/ComparisonChart";
import UserResults from "./components/UserResults";
import SimilarMovies from "./components/SimilarMovies";
import { fetchRandomUsers, runCompare } from "./api";

export default function CineLensPage() {
  const [page, setPage] = useState("compare");

  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState(null);

  const [cfMethod, setCfMethod] = useState("pearson");
  const [testSize, setTestSize] = useState(0.2);
  const [minCfRatings, setMinCfRatings] = useState(100);
  const [userCount, setUserCount] = useState(50);

  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [runError, setRunError] = useState(null);

  async function loadUsers(seed = null, n = userCount) {
    setUsersLoading(true);
    setUsersError(null);
    setResult(null);
    try {
      const data = await fetchRandomUsers(n, seed);
      setUsers(data.users);
    } catch (e) {
      setUsersError(e.message || "Failed to load users. Is the backend running?");
    } finally {
      setUsersLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleUserCountChange(n) {
    setUserCount(n);
    loadUsers(null, n);
  }

  async function handleRun() {
    setRunning(true);
    setRunError(null);
    try {
      const data = await runCompare({
        userIds: users.map((u) => u.user_id),
        cfMethod,
        testSize,
        minCfRatings,
      });
      setResult(data);
    } catch (e) {
      setRunError(e.message || "Comparison failed.");
    } finally {
      setRunning(false);
    }
  }

  const trainPct = Math.round((1 - (result?.test_size ?? testSize)) * 100);
  const testPct = Math.round((result?.test_size ?? testSize) * 100);

  return (
    <div className="cinelens-page">
      <div className="app">
        <Header />
        <Nav page={page} onPageChange={setPage} />

        {page === "compare" && (
          <>
            <ControlPanel
              users={users}
              usersLoading={usersLoading}
              onReroll={() => loadUsers(Math.floor(Math.random() * 1_000_000))}
              userCount={userCount}
              onUserCountChange={handleUserCountChange}
              cfMethod={cfMethod}
              onMethodChange={setCfMethod}
              testSize={testSize}
              onTestSizeChange={setTestSize}
              minCfRatings={minCfRatings}
              onMinCfRatingsChange={setMinCfRatings}
              onRun={handleRun}
              running={running}
              error={usersError || runError}
            />

            {running && <Loader cfMethod={cfMethod} />}

            {!running && result && (
              <section className="panel">
                <div className="results-header">
                  <h2>Average across {result.per_user.length} users</h2>
                  <span className="results-meta">
                    {result.cf_method} · k={result.k} · split {trainPct}/{testPct} · ≥{result.min_cf_ratings} ratings · {result.elapsed_seconds}s
                  </span>
                </div>
                <ComparisonChart averages={result.averages} bestModel={result.best_model} />
              </section>
            )}

            {!running && result && (
              <section className="panel">
                <p className="panel-title">Per-User Recommendations</p>
                <UserResults perUser={result.per_user} />
              </section>
            )}
          </>
        )}

        {page === "similar" && <SimilarMovies />}

        <div className="footer-note">MovieLens 1M · FastAPI + React · item-based CF / TF-IDF content / hybrid</div>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import ModelColumn from "./ModelColumn";

const MODEL_KEYS = ["collaborative", "content_based", "hybrid"];

function bestModelFor(user) {
  let best = null;
  let bestScore = -1;
  for (const key of MODEL_KEYS) {
    const score = user.models[key].precision_at_k;
    if (score > bestScore) {
      bestScore = score;
      best = key;
    }
  }
  return bestScore > 0 ? best : null;
}

export default function UserResults({ perUser }) {
  const [selectedId, setSelectedId] = useState(perUser[0]?.user_id);

  useEffect(() => {
    setSelectedId(perUser[0]?.user_id);
  }, [perUser]);

  const selected = perUser.find((u) => u.user_id === selectedId) || perUser[0];
  if (!selected) return null;

  return (
    <div>
      <div className="user-tabs">
        {perUser.map((u) => {
          const best = bestModelFor(u);
          return (
            <button
              key={u.user_id}
              className={`user-tab ${u.user_id === selected.user_id ? "active" : ""}`}
              onClick={() => setSelectedId(u.user_id)}
            >
              User #{u.user_id}
              {best && <span className="best-tag">★ {best === "collaborative" ? "CF" : best === "content_based" ? "CB" : "Hyb"}</span>}
            </button>
          );
        })}
      </div>

      <div className="user-detail-meta" style={{ display: "flex", gap: "20px", alignItems: "center", flexWrap: "wrap" }}>
        <span>
          Total Ratings: <b>{selected.train_count + selected.test_count}</b>
        </span>
        <span>
          Train Ratings: <b>{selected.train_count}</b>
        </span>
        <span>
          Held-out Test Ratings: <b>{selected.test_count}</b>
        </span>
        {bestModelFor(selected) && (
          <span style={{
            background: "rgba(111, 209, 140, 0.12)",
            border: "1px solid var(--green)",
            color: "var(--green)",
            padding: "2px 8px",
            borderRadius: "999px",
            fontFamily: "var(--font-mono)",
            fontSize: "11.5px"
          }}>
            ★ Top Performer: {bestModelFor(selected) === "collaborative" ? "Collaborative" : bestModelFor(selected) === "content_based" ? "Content-Based" : "Hybrid"}
          </span>
        )}
      </div>

      <div className="model-columns">
        {MODEL_KEYS.map((key) => (
          <ModelColumn key={key} modelKey={key} result={selected.models[key]} />
        ))}
      </div>
    </div>
  );
}

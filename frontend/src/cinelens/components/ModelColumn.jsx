const COLORS = {
  collaborative: "#4fd1c5",
  content_based: "#b794f6",
  hybrid: "#e8a33d",
};

const LABELS = {
  collaborative: "Collaborative",
  content_based: "Content-Based",
  hybrid: "Hybrid",
};

export default function ModelColumn({ modelKey, result }) {
  const hitsSet = new Set(result.hits);
  return (
    <div className="model-col">
      <div className="model-col-head">
        <div className="name" style={{ color: COLORS[modelKey] }}>
          {LABELS[modelKey]}
        </div>
        <div className="stats">
          <span>
            Precision
            <b>{result.precision_at_k.toFixed(2)}</b>
          </span>
          <span>
            Recall
            <b>{result.recall_at_k.toFixed(2)}</b>
          </span>
          <span>
            Hit
            <b>{result.hit_rate_at_k ? "Yes" : "No"}</b>
          </span>
        </div>
      </div>
      <ul className="rec-list scroll-thin">
        {result.recommended.length === 0 && <li className="empty-note">No candidates scored for this user.</li>}
        {result.recommended.map((title, i) => {
          const isHit = hitsSet.has(title);
          return (
            <li className={`rec-item ${isHit ? "hit" : ""}`} key={title}>
              <span className="rank">{i + 1}</span>
              <span className="title">{title}</span>
              {isHit && <span className="hit-mark">✓ in test set</span>}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

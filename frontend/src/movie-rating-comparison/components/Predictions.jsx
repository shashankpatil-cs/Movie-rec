import React from "react";

export default function Predictions({ samplePredictions }) {
  const { model_used, samples } = samplePredictions;

  return (
    <div className="panel">
      <div className="panel-title">Sample Predictions (test set)</div>
      <p style={{ color: "var(--text-secondary)", fontSize: 13, marginTop: -10, marginBottom: 16 }}>
        Random sample of test-set predictions from the overall best model:{" "}
        <strong style={{ color: "var(--gold)" }}>{model_used}</strong>
      </p>
      <table className="pred-table">
        <thead>
          <tr>
            <th>User ID</th>
            <th>Movie ID</th>
            <th>Actual Rating</th>
            <th>Predicted Rating</th>
            <th>Diff</th>
          </tr>
        </thead>
        <tbody>
          {samples.map((s, i) => {
            const diff = s.predicted_rating - s.actual_rating;
            const diffClass = Math.abs(diff) <= 0.5 ? "diff-good" : "diff-bad";
            return (
              <tr key={i}>
                <td>{s.user_id}</td>
                <td>{s.movie_id}</td>
                <td>{s.actual_rating.toFixed(1)}</td>
                <td>{s.predicted_rating.toFixed(3)}</td>
                <td className={diffClass}>
                  {diff > 0 ? "+" : ""}
                  {diff.toFixed(3)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

import React from "react";

export default function ResultsTable({ modelResults, bestModel }) {
  const modelOrder = ["Linear Regression", "Polynomial Regression", "Random Forest", "XGBoost"];

  return (
    <div className="panel">
      <div className="panel-title">Model Comparison Table</div>
      <table className="results-table">
        <thead>
          <tr>
            <th>Model</th>
            <th>RMSE ↓</th>
            <th>MAE ↓</th>
            <th>R² ↑</th>
          </tr>
        </thead>
        <tbody>
          {modelOrder.map((name) => {
            const r = modelResults[name];
            if (!r) return null;
            const isBest = name === bestModel;
            return (
              <tr key={name} className={isBest ? "best-row" : ""}>
                <td>
                  {name}
                  {isBest && <span className="badge">BEST</span>}
                </td>
                <td>{r.rmse.toFixed(4)}</td>
                <td>{r.mae.toFixed(4)}</td>
                <td>{r.r2.toFixed(4)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

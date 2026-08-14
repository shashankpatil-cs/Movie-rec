import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";

const COLORS = ["#5aa3e8", "#a58ae8", "#62c98f", "#e0b34a"];
const SHORT_NAMES = {
  "Linear Regression": "Linear",
  "Polynomial Regression": "Polynomial",
  "Random Forest": "Rand. Forest",
  XGBoost: "XGBoost",
};

function toChartData(modelResults, metricKey) {
  return Object.entries(modelResults).map(([name, r]) => ({
    name: SHORT_NAMES[name] || name,
    value: r[metricKey],
  }));
}

function MiniBarChart({ title, data, unit }) {
  return (
    <div className="chart-card">
      <h4>{title}</h4>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 4, right: 8, left: -12, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2f3d" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fill: "#9aa0b0", fontSize: 11.5 }}
            axisLine={{ stroke: "#2a2f3d" }}
            tickLine={false}
          />
          <YAxis tick={{ fill: "#9aa0b0", fontSize: 11 }} axisLine={{ stroke: "#2a2f3d" }} tickLine={false} />
          <Tooltip
            formatter={(v) => [`${Number(v).toFixed(4)}${unit || ""}`, title]}
            contentStyle={{
              background: "#1c202b",
              border: "1px solid #2a2f3d",
              borderRadius: 8,
              fontSize: 12.5,
              color: "#eceef2",
            }}
          />
          <Bar dataKey="value" radius={[6, 6, 0, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function Charts({ modelResults }) {
  const rmseData = toChartData(modelResults, "rmse");
  const maeData = toChartData(modelResults, "mae");
  const r2Data = toChartData(modelResults, "r2");

  return (
    <div className="panel">
      <div className="panel-title">Metric Charts</div>
      <div className="charts-grid">
        <MiniBarChart title="RMSE (lower is better)" data={rmseData} />
        <MiniBarChart title="MAE (lower is better)" data={maeData} />
        <MiniBarChart title="R² (higher is better)" data={r2Data} />
      </div>
    </div>
  );
}

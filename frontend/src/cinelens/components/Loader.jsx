const MESSAGES = {
  pearson: "Correlating movies (Pearson)…",
  spearman: "Ranking and correlating (Spearman)…",
  kendall: "Computing Kendall tau pairs — this is the slow one…",
};

export default function Loader({ cfMethod }) {
  return (
    <section className="panel loading-panel">
      <div className="spinner" />
      <div>{MESSAGES[cfMethod] || "Scoring recommendations…"}</div>
    </section>
  );
}

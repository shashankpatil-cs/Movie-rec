const PAGES = [
  { id: "compare", label: "Model Comparison" },
  { id: "similar", label: "Find Similar Movies" },
];

export default function Nav({ page, onPageChange }) {
  return (
    <nav className="top-nav">
      {PAGES.map((p) => (
        <button
          key={p.id}
          className={`top-nav-item ${page === p.id ? "active" : ""}`}
          onClick={() => onPageChange(p.id)}
        >
          {p.label}
        </button>
      ))}
    </nav>
  );
}

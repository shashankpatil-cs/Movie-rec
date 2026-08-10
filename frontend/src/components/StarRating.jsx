import { useState } from "react";

export default function StarRating({ value = 7, onChange, disabled = false }) {
  const [hoverValue, setHoverValue] = useState(null);

  const displayValue = hoverValue !== null ? hoverValue : value;

  function getRatingLabel(val) {
    if (val === 0) return "Not rated";
    if (val <= 2) return "Poor";
    if (val <= 4) return "Fair";
    if (val <= 6) return "Good";
    if (val <= 8) return "Very Good";
    if (val < 10) return "Great";
    return "Masterpiece!";
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 12,
        background: "var(--bg-alt)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-sm)",
        padding: "10px 14px",
      }}
    >
      {/* 10 Interactive Stars */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          cursor: disabled ? "not-allowed" : "pointer",
          userSelect: "none",
        }}
        onMouseLeave={() => setHoverValue(null)}
      >
        {Array.from({ length: 10 }, (_, i) => {
          const starNum = i + 1;
          const isFilled = displayValue >= starNum;
          const isHalf = displayValue >= starNum - 0.5 && displayValue < starNum;

          return (
            <button
              key={starNum}
              type="button"
              disabled={disabled}
              onClick={() => onChange && onChange(starNum)}
              onMouseEnter={() => setHoverValue(starNum)}
              style={{
                background: "none",
                border: "none",
                padding: "2px",
                fontSize: 22,
                lineHeight: 1,
                color: isFilled || isHalf ? "var(--gold)" : "var(--border)",
                transition: "transform 0.1s ease, color 0.15s ease",
                transform: hoverValue === starNum ? "scale(1.25)" : "scale(1)",
                cursor: disabled ? "not-allowed" : "pointer",
              }}
              title={`${starNum} / 10`}
            >
              ★
            </button>
          );
        })}
      </div>

      {/* Live Score Badge */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontFamily: "var(--font-mono)",
        }}
      >
        <span
          style={{
            background: "rgba(227,179,65,0.14)",
            border: "1px solid var(--gold)",
            color: "var(--gold)",
            fontWeight: 700,
            fontSize: 14,
            padding: "4px 10px",
            borderRadius: "var(--radius-sm)",
          }}
        >
          ★ {displayValue.toFixed(1)} / 10
        </span>
        <span style={{ fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
          {getRatingLabel(displayValue)}
        </span>
      </div>
    </div>

  );
}

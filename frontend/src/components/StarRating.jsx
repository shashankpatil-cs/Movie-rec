export default function StarRating({ value, onChange, disabled }) {
  return (
    <div className="rating-slider">
      <input
        type="range"
        min="0"
        max="10"
        step="0.5"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
      <span className="rating-value">{value.toFixed(1)}</span>
    </div>
  );
}

/**
 * RatingComparisonPage.jsx
 * Renders the Rating Prediction Model Comparison tool as a page
 * inside the main movie-website app (no separate React root needed).
 */
import ComparisonApp from "../movie-rating-comparison/App.jsx";
import "../movie-rating-comparison/index.css";

export default function RatingComparisonPage() {
  return <ComparisonApp />;
}

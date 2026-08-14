"""
comparison.py
--------------
Combines RMSE, MAE, and R2 for all four models into an interpretable, robust
"Overall Relative Efficiency Score" per model, plus a final ranking and individual
per-metric winners.

Overall Score Methodology
--------------------------
1. Relative Efficiency per Metric (scaled to [0, 1] where 1.0 is best):
   - RMSE:  score_rmse = min(RMSE) / model_RMSE
   - MAE:   score_mae  = min(MAE) / model_MAE
   - R²:    score_r2   = max(0.0, model_R2 / max(R2))  (0.0 if R² <= 0)

   Why Relative Efficiency Ratio vs. Linear Min-Max:
   - Linear min-max artificially collapses the lowest-ranked model to 0.0000
     even when its error is only 2-3% higher than the top model, creating a
     misleading impression of complete failure.
   - Relative efficiency accurately reflects that a model with RMSE 0.95 vs
     best 0.92 operates at ~96.8% relative efficiency.

2. Composite Overall Score:
   - overall_score = (score_rmse + score_mae + score_r2) / 3.0

3. Ranking:
   - Ranked primarily by overall_score, with tie-breaking on lowest RMSE and
     highest R².
"""

from typing import Dict


def compare_models(model_results: Dict[str, dict]) -> dict:
    """
    model_results: { model_name: {"rmse": ..., "mae": ..., "r2": ...}, ... }
    Returns the full comparison payload: per-model overall scores, final
    ranking, and best model per individual metric.
    """
    names = list(model_results.keys())
    rmses = [model_results[n]["rmse"] for n in names]
    maes = [model_results[n]["mae"] for n in names]
    r2s = [model_results[n]["r2"] for n in names]

    min_rmse = min(rmses) if rmses else 1.0
    min_mae = min(maes) if maes else 1.0
    max_r2 = max(r2s) if r2s else 1.0

    overall_scores = {}
    for n in names:
        m = model_results[n]
        # Calculate ratio relative to best performer
        s_rmse = (min_rmse / m["rmse"]) if m["rmse"] > 0 else 0.0
        s_mae = (min_mae / m["mae"]) if m["mae"] > 0 else 0.0
        s_r2 = max(0.0, m["r2"] / max_r2) if max_r2 > 0 else 0.0

        score = (s_rmse + s_mae + s_r2) / 3.0
        overall_scores[n] = round(score, 4)

    # Multi-level tie-breaking: overall score -> lowest RMSE -> highest R2
    ranking = sorted(
        names,
        key=lambda n: (
            overall_scores[n],
            -model_results[n]["rmse"],
            model_results[n]["r2"],
        ),
        reverse=True,
    )

    best_by_rmse = min(names, key=lambda n: model_results[n]["rmse"])
    best_by_mae = min(names, key=lambda n: model_results[n]["mae"])
    best_by_r2 = max(names, key=lambda n: model_results[n]["r2"])

    overall_best = ranking[0]

    return {
        "overall_scores": overall_scores,
        "ranking": ranking,  # ordered best -> worst
        "overall_best_model": overall_best,
        "overall_best_score": overall_scores[overall_best],
        "overall_best_metrics": model_results[overall_best],
        "best_by_rmse": best_by_rmse,
        "best_by_mae": best_by_mae,
        "best_by_r2": best_by_r2,
    }

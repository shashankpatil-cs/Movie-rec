from typing import Dict, Iterable, List


def evaluate_topk(recommended_titles: Iterable[str], test_titles: Iterable[str], k: int = 10) -> Dict:
    recommended = list(recommended_titles)[:k]
    recommended_set = set(recommended)
    actual = set(test_titles)
    hits = recommended_set & actual

    precision = len(hits) / k if k > 0 else 0.0
    recall = len(hits) / len(actual) if len(actual) > 0 else 0.0
    hit_rate = 1.0 if len(hits) > 0 else 0.0

    return {
        "precision_at_k": round(precision, 4),
        "recall_at_k": round(recall, 4),
        "hit_rate_at_k": hit_rate,
        "hits": sorted(hits),
        "recommended": recommended,
    }


def average_metrics(per_user_metrics: List[Dict]) -> Dict:
    if not per_user_metrics:
        return {"precision_at_k": 0.0, "recall_at_k": 0.0, "hit_rate_at_k": 0.0}
    n = len(per_user_metrics)
    return {
        "precision_at_k": round(sum(m["precision_at_k"] for m in per_user_metrics) / n, 4),
        "recall_at_k": round(sum(m["recall_at_k"] for m in per_user_metrics) / n, 4),
        "hit_rate_at_k": round(sum(m["hit_rate_at_k"] for m in per_user_metrics) / n, 4),
    }


def pick_best_model(averages: Dict[str, Dict]) -> Dict:
    """
    Determine the best-performing model across all metrics.

    Scoring: each model's three metrics are normalised to [0, 1] relative to
    the best value across all models for that metric, then averaged. This gives
    equal weight to every metric regardless of its absolute magnitude.

    Returns:
        best_model      – name of the overall winner
        ranking         – list of {model, score} ordered best → worst
        winner_by_metric – {metric: model_name} (None when tied)
    """
    models = list(averages.keys())
    metrics = ["precision_at_k", "recall_at_k", "hit_rate_at_k"]

    max_per_metric = {
        metric: max(averages[m][metric] for m in models)
        for metric in metrics
    }

    def normalised_score(model: str) -> float:
        parts = []
        for metric in metrics:
            top = max_per_metric[metric]
            parts.append(averages[model][metric] / top if top > 0 else 0.0)
        return round(sum(parts) / len(parts), 4)

    scores = {model: normalised_score(model) for model in models}
    ranking = sorted(models, key=lambda m: scores[m], reverse=True)

    winner_by_metric = {}
    for metric in metrics:
        top_val = max_per_metric[metric]
        tied = [m for m in models if averages[m][metric] == top_val]
        winner_by_metric[metric] = tied[0] if len(tied) == 1 else None  # None = tie

    return {
        "best_model": ranking[0],
        "ranking": [{"model": m, "score": scores[m]} for m in ranking],
        "winner_by_metric": winner_by_metric,
    }


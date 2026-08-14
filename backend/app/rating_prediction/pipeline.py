"""
pipeline.py
-----------
Orchestrates the full training flow described in the system design:

MovieLens data
  -> Select simulated users
  -> Create common 80/20 train-test split
  -> Training-only feature engineering
  -> Train all four models
  -> Predict the same test records
  -> Calculate RMSE, MAE, R2
  -> Compare models
  -> Determine overall best model
  -> Return results
"""

import time
import numpy as np

from app.rating_prediction.data_loader import load_raw_data, select_simulated_users
from app.rating_prediction.splitter import create_common_split
from app.rating_prediction.feature_engineering import build_features
from app.rating_prediction.evaluation import evaluate_predictions
from app.rating_prediction.comparison import compare_models

from app.rating_prediction.models.linear_model import train_linear_regression, predict_linear_regression
from app.rating_prediction.models.polynomial_model import train_polynomial_regression, predict_polynomial_regression
from app.rating_prediction.models.random_forest_model import train_random_forest, predict_random_forest
from app.rating_prediction.models.xgboost_model import train_xgboost, predict_xgboost

_RATINGS = None
_MOVIES = None


def _get_raw_data():
    """Cache the raw .dat files in memory across requests (read-only data)."""
    global _RATINGS, _MOVIES
    if _RATINGS is None:
        _RATINGS, _MOVIES, _ = load_raw_data()  # users.dat unused in pipeline
    return _RATINGS, _MOVIES


def _sample_predictions(test_transformed, y_test, y_pred, n=10, seed=42):
    rng = np.random.default_rng(seed)
    idx = rng.choice(len(y_test), size=min(n, len(y_test)), replace=False)
    samples = []
    for i in idx:
        row = test_transformed.iloc[int(i)]
        samples.append({
            "user_id": int(row["user_id"]),
            "movie_id": int(row["movie_id"]),
            "actual_rating": float(y_test[i]),
            "predicted_rating": round(float(y_pred[i]), 3),
        })
    return samples


def run_experiment(
    num_users: int,
    poly_degree: int,
    rf_n_estimators: int,
    xgb_n_estimators: int,
    xgb_learning_rate: float,
    xgb_max_depth: int,
):
    start = time.time()

    ratings, movies = _get_raw_data()

    # 1. Select simulated users
    ratings_subset, selected_user_ids = select_simulated_users(ratings, num_users)

    # 2. Common 80/20 train/test split (identical for every model)
    train_df, test_df = create_common_split(ratings_subset)

    # 3. Training-only feature engineering (no leakage)
    feats = build_features(train_df, test_df, movies)
    X_train_full, X_test_full = feats["X_train_full"], feats["X_test_full"]
    X_train_core, X_test_core = feats["X_train_core"], feats["X_test_core"]
    y_train, y_test = feats["y_train"], feats["y_test"]

    model_results = {}
    predictions_by_model = {}
    trained_models = {}

    # 4. Train all four models + 5. Predict the same test records

    # -- Linear Regression --
    lin_model = train_linear_regression(X_train_full, y_train)
    lin_pred = predict_linear_regression(lin_model, X_test_full)
    model_results["Linear Regression"] = evaluate_predictions(y_test, lin_pred)
    predictions_by_model["Linear Regression"] = lin_pred
    trained_models["Linear Regression"] = lin_model

    # -- Polynomial Regression --
    poly_model = train_polynomial_regression(X_train_core, y_train, degree=poly_degree)
    poly_pred = predict_polynomial_regression(poly_model, X_test_core)
    model_results["Polynomial Regression"] = evaluate_predictions(y_test, poly_pred)
    predictions_by_model["Polynomial Regression"] = poly_pred
    trained_models["Polynomial Regression"] = poly_model

    # -- Random Forest --
    rf_model = train_random_forest(X_train_full, y_train, n_estimators=rf_n_estimators)
    rf_pred = predict_random_forest(rf_model, X_test_full)
    model_results["Random Forest"] = evaluate_predictions(y_test, rf_pred)
    predictions_by_model["Random Forest"] = rf_pred
    trained_models["Random Forest"] = rf_model

    # -- XGBoost --
    xgb_model = train_xgboost(
        X_train_full, y_train,
        n_estimators=xgb_n_estimators,
        learning_rate=xgb_learning_rate,
        max_depth=xgb_max_depth,
    )
    xgb_pred = predict_xgboost(xgb_model, X_test_full)
    model_results["XGBoost"] = evaluate_predictions(y_test, xgb_pred)
    predictions_by_model["XGBoost"] = xgb_pred
    trained_models["XGBoost"] = xgb_model

    # 6-8. Compare models, determine overall best, ranking
    comparison = compare_models(model_results)

    # Sample predictions from the overall best model for display
    best_model_name = comparison["overall_best_model"]
    sample_preds = _sample_predictions(
        feats["test_transformed"], y_test, predictions_by_model[best_model_name]
    )

    elapsed = round(time.time() - start, 2)

    return {
        "num_users_requested": num_users,
        "num_users_used": len(selected_user_ids),
        "train_size": int(len(train_df)),
        "test_size": int(len(test_df)),
        "total_ratings_used": int(len(ratings_subset)),
        "hyperparameters": {
            "polynomial_degree": poly_degree,
            "random_forest_n_estimators": rf_n_estimators,
            "xgboost_n_estimators": xgb_n_estimators,
            "xgboost_learning_rate": xgb_learning_rate,
            "xgboost_max_depth": xgb_max_depth,
            "xgboost_objective": "reg:squarederror",
        },
        "model_results": model_results,
        "comparison": comparison,
        "sample_predictions": {
            "model_used": best_model_name,
            "samples": sample_preds,
        },
        "elapsed_seconds": elapsed,
    }

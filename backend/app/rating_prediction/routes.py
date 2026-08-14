"""
routes.py
---------
FastAPI route definitions for the model comparison experiment API.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.rating_prediction.pipeline import run_experiment

router = APIRouter()

ALLOWED_USER_COUNTS = {250, 500, 750, 1000}


class ExperimentRequest(BaseModel):
    num_users: int = Field(250, description="Number of simulated users: 250, 500, 750, or 1000")
    poly_degree: int = Field(2, ge=2, le=5, description="Polynomial Regression degree (2-5)")
    rf_n_estimators: int = Field(100, ge=50, le=200, description="Random Forest number of trees (50, 100, 150, or 200)")
    xgb_n_estimators: int = Field(100, ge=10, le=1000, description="XGBoost n_estimators")
    xgb_learning_rate: float = Field(0.05, gt=0, le=1, description="XGBoost learning_rate")
    xgb_max_depth: int = Field(6, ge=1, le=20, description="XGBoost max_depth")


@router.get("/health")
def health_check():
    return {"status": "ok"}


@router.get("/config")
def get_config():
    """Exposes valid selection ranges to the frontend so controls stay in sync."""
    return {
        "allowed_user_counts": sorted(ALLOWED_USER_COUNTS),
        "poly_degree_range": [2, 3, 4, 5],
        "allowed_rf_trees": [50, 100, 150, 200],
        "rf_n_estimators_range": {"min": 50, "max": 200},
        "xgb_n_estimators_range": {"min": 10, "max": 1000},
        "xgb_learning_rate_range": {"min": 0.01, "max": 1.0},
        "xgb_max_depth_range": {"min": 1, "max": 20},
        "xgb_objective_fixed": "reg:squarederror",
    }


@router.post("/experiment/run")
def run_experiment_route(payload: ExperimentRequest):
    if payload.num_users not in ALLOWED_USER_COUNTS:
        raise HTTPException(
            status_code=400,
            detail=f"num_users must be one of {sorted(ALLOWED_USER_COUNTS)}",
        )
    try:
        result = run_experiment(
            num_users=payload.num_users,
            poly_degree=payload.poly_degree,
            rf_n_estimators=payload.rf_n_estimators,
            xgb_n_estimators=payload.xgb_n_estimators,
            xgb_learning_rate=payload.xgb_learning_rate,
            xgb_max_depth=payload.xgb_max_depth,
        )
    except Exception as exc:  # surfaced to the UI as a clear error message
        raise HTTPException(status_code=500, detail=str(exc))
    return result

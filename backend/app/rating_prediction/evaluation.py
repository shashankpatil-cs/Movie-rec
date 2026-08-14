"""
evaluation.py
-------------
Computes standard regression metrics (RMSE, MAE, R2) on the shared test set
for every model, using the same y_test for a fair, apples-to-apples comparison.

Prediction Clipping
--------------------
MovieLens ratings are integers in [1, 5]. Models like Linear Regression and
Polynomial Regression can predict values outside this range (e.g. -0.2 or 6.1)
because they have no structural bound. Random Forest naturally stays in [1, 5]
because it averages leaf node values that were all drawn from [1, 5] training
labels. Without clipping, RF gets a structural RMSE/MAE advantage — its
out-of-domain predictions are impossible by construction.

Clipping all predictions to [RATING_MIN, RATING_MAX] before metric computation
removes this structural bias and ensures every model is evaluated under the same
domain constraint, which is the correct real-world evaluation: a recommender
system should never recommend a rating of 0.1 or 6.3.
"""

import numpy as np
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score

RATING_MIN = 1.0
RATING_MAX = 5.0


def evaluate_predictions(y_true, y_pred) -> dict:
    # Clip to valid rating scale before metric computation — removes structural
    # bias where tree models (RF) naturally stay in [1,5] but linear models don't.
    y_pred_clipped = np.clip(y_pred, RATING_MIN, RATING_MAX)

    rmse = float(np.sqrt(mean_squared_error(y_true, y_pred_clipped)))
    mae = float(mean_absolute_error(y_true, y_pred_clipped))
    r2 = float(r2_score(y_true, y_pred_clipped))
    return {"rmse": round(rmse, 4), "mae": round(mae, 4), "r2": round(r2, 4)}

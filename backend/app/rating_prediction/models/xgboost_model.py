"""
xgboost_model.py
-----------------
XGBoost Regressor on the FULL feature set. Objective is FIXED to
reg:squarederror. User-selectable: n_estimators, learning_rate, max_depth.
"""

from xgboost import XGBRegressor

FIXED_OBJECTIVE = "reg:squarederror"


def train_xgboost(
    X_train,
    y_train,
    n_estimators: int = 100,
    learning_rate: float = 0.05,
    max_depth: int = 6,
    random_state: int = 42,
):
    model = XGBRegressor(
        objective=FIXED_OBJECTIVE,
        n_estimators=n_estimators,
        learning_rate=learning_rate,
        max_depth=max_depth,
        random_state=random_state,
        n_jobs=-1,
    )
    model.fit(X_train, y_train)
    return model


def predict_xgboost(model, X_test):
    return model.predict(X_test)

"""
random_forest_model.py
-----------------------
Random Forest Regressor on the FULL feature set. User-selectable number of
trees (n_estimators): 50, 100, 150, or 200 via the UI (ranged 50-200 by the API).
"""

from sklearn.ensemble import RandomForestRegressor

MIN_TREES = 50
MAX_TREES = 200


def train_random_forest(X_train, y_train, n_estimators: int = 100, random_state: int = 42):
    n_estimators = max(MIN_TREES, min(MAX_TREES, n_estimators))
    model = RandomForestRegressor(
        n_estimators=n_estimators,
        random_state=random_state,
        n_jobs=-1,
    )
    model.fit(X_train, y_train)
    return model


def predict_random_forest(model, X_test):
    return model.predict(X_test)

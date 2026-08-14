"""
polynomial_model.py
--------------------
Polynomial Regression = PolynomialFeatures(degree) + LinearRegression,
built as a single sklearn Pipeline. User-selectable degree: 2, 3, 4, or 5.

NOTE: this model is trained on the CORE feature set (5 numeric features),
not the full feature set, to keep the polynomial expansion tractable at
higher degrees (see feature_engineering.py for rationale).
"""

from sklearn.pipeline import Pipeline
from sklearn.preprocessing import PolynomialFeatures, StandardScaler
from sklearn.linear_model import LinearRegression

ALLOWED_DEGREES = {2, 3, 4, 5}


def train_polynomial_regression(X_train_core, y_train, degree: int = 2):
    if degree not in ALLOWED_DEGREES:
        raise ValueError(f"degree must be one of {sorted(ALLOWED_DEGREES)}, got {degree}")

    pipeline = Pipeline([
        ("scaler", StandardScaler()),
        ("poly", PolynomialFeatures(degree=degree, include_bias=False)),
        ("linreg", LinearRegression()),
    ])
    pipeline.fit(X_train_core, y_train)
    return pipeline


def predict_polynomial_regression(pipeline, X_test_core):
    return pipeline.predict(X_test_core)

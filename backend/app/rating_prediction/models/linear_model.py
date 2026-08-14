"""
linear_model.py
----------------
Baseline model: plain multiple Linear Regression on the FULL feature set.
"""

from sklearn.linear_model import LinearRegression


def train_linear_regression(X_train, y_train):
    model = LinearRegression()
    model.fit(X_train, y_train)
    return model


def predict_linear_regression(model, X_test):
    return model.predict(X_test)

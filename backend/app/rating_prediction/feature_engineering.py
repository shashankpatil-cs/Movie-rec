"""
feature_engineering.py
-----------------------
Builds all model features. CRITICAL RULE: every statistic (user averages,
movie averages, genre preferences, etc.) is computed ONLY from the training
split. The same fitted statistics are then applied to transform the test
split, so no information from the test set ever leaks into the features.

Two feature views are produced:

1. FULL feature set (used by Linear Regression, Random Forest, XGBoost):
   - user_avg_rating, user_rating_count
   - movie_avg_rating, movie_rating_count
   - genre_match_score
   - 18 movie genre binary columns (movie_genre_<Genre>)
   - 18 user genre preference columns (user_pref_<Genre>)
   => ~41 features total

2. CORE feature set (used by Polynomial Regression only):
   - user_avg_rating, user_rating_count, movie_avg_rating,
     movie_rating_count, genre_match_score
   This is intentionally a small, dense numeric subset. PolynomialFeatures
   blows up combinatorially with feature count (choose(n+d, d) terms), so a
   ~41-feature set would be computationally infeasible at degree 4-5. Using
   the 5 strongest numeric signals keeps polynomial degrees 2-5 tractable
   while preserving the core rating-prediction signal.
"""

import numpy as np
import pandas as pd

from app.rating_prediction.data_loader import GENRES, build_movie_genre_matrix

CORE_FEATURES = [
    "user_avg_rating",
    "user_rating_count",
    "movie_avg_rating",
    "movie_rating_count",
    "genre_match_score",
]

FULL_EXTRA_FEATURES = (
    [f"movie_genre_{g}" for g in GENRES] + [f"user_pref_{g}" for g in GENRES]
)
FULL_FEATURES = CORE_FEATURES + FULL_EXTRA_FEATURES


class FeatureBuilder:
    """
    Fit statistics on the TRAIN split only, then transform both train and
    test splits using those frozen statistics (no leakage).
    """

    def __init__(self, movies_df: pd.DataFrame):
        self.movie_genre_matrix = build_movie_genre_matrix(movies_df)
        self.global_avg_ = None
        self.user_stats_ = None   # avg rating + count per user (train only)
        self.movie_stats_ = None  # avg rating + count per movie (train only)
        self.user_genre_pref_ = None  # per-user avg rating per genre (train only)

    def fit(self, train_df: pd.DataFrame):
        self.global_avg_ = train_df["rating"].mean()

        self.user_stats_ = (
            train_df.groupby("user_id")["rating"]
            .agg(user_avg_rating="mean", user_rating_count="count")
            .reset_index()
        )
        self.movie_stats_ = (
            train_df.groupby("movie_id")["rating"]
            .agg(movie_avg_rating="mean", movie_rating_count="count")
            .reset_index()
        )

        # Per-user, per-genre average rating computed only from training rows.
        merged = train_df.merge(
            self.movie_genre_matrix, left_on="movie_id", right_index=True, how="left"
        )
        pref_rows = []
        for genre in GENRES:
            mask = merged[genre] == 1
            genre_avg = (
                merged.loc[mask]
                .groupby("user_id")["rating"]
                .mean()
                .rename(f"user_pref_{genre}")
            )
            pref_rows.append(genre_avg)
        self.user_genre_pref_ = pd.concat(pref_rows, axis=1).reset_index()
        return self

    def transform(self, df: pd.DataFrame) -> pd.DataFrame:
        out = df[["user_id", "movie_id", "rating"]].copy()

        out = out.merge(self.user_stats_, on="user_id", how="left")
        out = out.merge(self.movie_stats_, on="movie_id", how="left")

        # Cold-start fallback: users/movies unseen in train fall back to the
        # global training average (still leakage-free, since it's a train stat).
        out["user_avg_rating"] = out["user_avg_rating"].fillna(self.global_avg_)
        out["user_rating_count"] = out["user_rating_count"].fillna(0)
        out["movie_avg_rating"] = out["movie_avg_rating"].fillna(self.global_avg_)
        out["movie_rating_count"] = out["movie_rating_count"].fillna(0)

        # Movie genre binary features
        genre_feats = self.movie_genre_matrix.reindex(out["movie_id"]).reset_index(drop=True)
        genre_feats.columns = [f"movie_genre_{g}" for g in GENRES]
        genre_feats = genre_feats.fillna(0)

        # User genre preference features
        out = out.merge(self.user_genre_pref_, on="user_id", how="left")
        for genre in GENRES:
            col = f"user_pref_{genre}"
            out[col] = out[col].fillna(self.global_avg_)

        out = pd.concat([out.reset_index(drop=True), genre_feats], axis=1)

        # genre_match_score: how well the movie's genres align with the
        # user's historical preference for those genres (train-only signal).
        user_pref_matrix = out[[f"user_pref_{g}" for g in GENRES]].values
        movie_genre_matrix_vals = genre_feats.values
        genre_counts = movie_genre_matrix_vals.sum(axis=1)
        genre_counts[genre_counts == 0] = 1  # avoid divide by zero
        out["genre_match_score"] = (
            (user_pref_matrix * movie_genre_matrix_vals).sum(axis=1) / genre_counts
        )

        return out

    def get_X_y(self, transformed_df: pd.DataFrame, feature_set: str = "full"):
        cols = FULL_FEATURES if feature_set == "full" else CORE_FEATURES
        X = transformed_df[cols].astype(float).values
        y = transformed_df["rating"].astype(float).values
        return X, y


def build_features(train_df: pd.DataFrame, test_df: pd.DataFrame, movies_df: pd.DataFrame):
    """
    Fit the FeatureBuilder on train_df ONLY, transform both splits, and
    return ready-to-use (X, y) arrays for both the full and core feature
    sets, plus the transformed DataFrames (useful for prediction display).
    """
    builder = FeatureBuilder(movies_df).fit(train_df)

    train_transformed = builder.transform(train_df)
    test_transformed = builder.transform(test_df)

    X_train_full, y_train = builder.get_X_y(train_transformed, "full")
    X_test_full, y_test = builder.get_X_y(test_transformed, "full")

    X_train_core, _ = builder.get_X_y(train_transformed, "core")
    X_test_core, _ = builder.get_X_y(test_transformed, "core")

    return {
        "builder": builder,
        "X_train_full": X_train_full,
        "X_test_full": X_test_full,
        "X_train_core": X_train_core,
        "X_test_core": X_test_core,
        "y_train": y_train,
        "y_test": y_test,
        "train_transformed": train_transformed,
        "test_transformed": test_transformed,
        "full_feature_names": FULL_FEATURES,
        "core_feature_names": CORE_FEATURES,
    }

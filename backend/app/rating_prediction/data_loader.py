"""
data_loader.py
---------------
Loads the raw MovieLens 1M dataset files (ratings.dat, movies.dat, users.dat)
and exposes a function to select a reproducible simulated subset of users.

MovieLens 1M format (:: separated, latin-1 encoded):
  ratings.dat -> UserID::MovieID::Rating::Timestamp
  movies.dat  -> MovieID::Title::Genres (Genres pipe-separated)
  users.dat   -> UserID::Gender::Age::Occupation::Zip-code
"""

import os
import pandas as pd

# __file__ is .../backend/app/rating_prediction/data_loader.py
# dirname x3 reaches backend/, then we go into data/ml-1m/
DATA_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
    "data", "ml-1m"
)

GENRES = [
    "Action", "Adventure", "Animation", "Children's", "Comedy", "Crime",
    "Documentary", "Drama", "Fantasy", "Film-Noir", "Horror", "Musical",
    "Mystery", "Romance", "Sci-Fi", "Thriller", "War", "Western",
]


def load_raw_data(data_dir: str = DATA_DIR):
    """Load the three raw MovieLens 1M .dat files into DataFrames."""
    ratings_path = os.path.join(data_dir, "ratings.dat")
    movies_path = os.path.join(data_dir, "movies.dat")
    users_path = os.path.join(data_dir, "users.dat")

    ratings = pd.read_csv(
        ratings_path, sep="::", engine="python",
        names=["user_id", "movie_id", "rating", "timestamp"],
        encoding="latin-1",
    )
    movies = pd.read_csv(
        movies_path, sep="::", engine="python",
        names=["movie_id", "title", "genres"],
        encoding="latin-1",
    )
    # users.dat is optional — not used in the prediction pipeline
    if os.path.exists(users_path):
        users = pd.read_csv(
            users_path, sep="::", engine="python",
            names=["user_id", "gender", "age", "occupation", "zip_code"],
            encoding="latin-1",
        )
    else:
        users = pd.DataFrame(columns=["user_id", "gender", "age", "occupation", "zip_code"])
    return ratings, movies, users


def select_simulated_users(ratings: pd.DataFrame, num_users: int, random_state: int = 42):
    """
    Select `num_users` distinct users (reproducibly) from the ratings data and
    return the subset of ratings belonging to those users.

    A fixed random_state guarantees that "50 users", "100 users", etc. are
    always drawn the same way for a given run configuration, making results
    comparable across repeated experiments with the same num_users value.
    """
    all_user_ids = ratings["user_id"].unique()
    num_users = min(num_users, len(all_user_ids))

    rng = pd.Series(all_user_ids).sample(
        n=num_users, random_state=random_state
    ).values

    subset = ratings[ratings["user_id"].isin(rng)].reset_index(drop=True)
    return subset, sorted(rng.tolist())


def build_movie_genre_matrix(movies: pd.DataFrame) -> pd.DataFrame:
    """Return a DataFrame indexed by movie_id with one binary column per genre."""
    genre_df = pd.DataFrame(0, index=movies["movie_id"], columns=GENRES)
    for _, row in movies.iterrows():
        movie_genres = str(row["genres"]).split("|")
        for g in movie_genres:
            if g in GENRES:
                genre_df.loc[row["movie_id"], g] = 1
    return genre_df

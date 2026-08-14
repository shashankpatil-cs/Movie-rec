"""
splitter.py
-----------
Creates ONE common, reproducible 80/20 train/test split of the ratings
subset. Every model in the comparison trains on the exact same `train_df`
and is evaluated on the exact same `test_df`, which is required for a fair
comparison and to avoid data leakage between models.
"""

from sklearn.model_selection import train_test_split

RANDOM_STATE = 42
TEST_SIZE = 0.2


def create_common_split(ratings_subset):
    """
    Split the ratings subset (for the selected simulated users) into a single
    80/20 train/test split, shared by every model.
    """
    train_df, test_df = train_test_split(
        ratings_subset,
        test_size=TEST_SIZE,
        random_state=RANDOM_STATE,
        shuffle=True,
    )
    train_df = train_df.reset_index(drop=True)
    test_df = test_df.reset_index(drop=True)
    return train_df, test_df

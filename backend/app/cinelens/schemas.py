from typing import Any, Dict, List, Literal, Optional
from pydantic import BaseModel, Field

CfMethod = Literal["pearson", "spearman", "kendall"]


class UserInfo(BaseModel):
    user_id: int
    rating_count: int


class UsersResponse(BaseModel):
    users: List[UserInfo]
    seed: int


class CompareRequest(BaseModel):
    user_ids: List[int] = Field(..., min_length=1, max_length=150)
    cf_method: CfMethod = "pearson"
    k: int = 10
    alpha: float = 0.5  # hybrid blend weight: alpha * CF + (1 - alpha) * Content
    test_size: float = Field(0.2, ge=0.05, le=0.5)   # train/test split ratio
    min_cf_ratings: int = Field(100, ge=10, le=500)  # min ratings for CF pool
    seed: int = 42


class ModelResult(BaseModel):
    recommended: List[str]
    hits: List[str]
    precision_at_k: float
    recall_at_k: float
    hit_rate_at_k: float


class UserResult(BaseModel):
    user_id: int
    train_count: int
    test_count: int
    test_titles: List[str]
    models: dict  # model_name -> ModelResult


class BestModelResult(BaseModel):
    best_model: str
    ranking: List[Dict[str, Any]]        # [{model, score}, ...] ordered best -> worst
    winner_by_metric: Dict[str, Optional[str]]  # metric -> model name, or None on tie


class CompareResponse(BaseModel):
    cf_method: CfMethod
    k: int
    alpha: float
    test_size: float
    min_cf_ratings: int
    per_user: List[UserResult]
    averages: dict  # model_name -> {precision_at_k, recall_at_k, hit_rate_at_k}
    best_model: BestModelResult
    elapsed_seconds: float


# --- Single-movie similarity search ---

class MovieMatch(BaseModel):
    title: str
    genres: str
    num_ratings: int


class MovieSearchResponse(BaseModel):
    query: str
    results: List[MovieMatch]


class SimilarMovie(BaseModel):
    title: str
    genres: str
    similarity: float
    num_ratings: int
    avg_rating: float


class SimilarMoviesResponse(BaseModel):
    title: str
    min_ratings: int
    k: int
    results: List[SimilarMovie]
    elapsed_seconds: float

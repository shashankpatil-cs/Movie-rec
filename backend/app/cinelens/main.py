import random
import time

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from .data_store import store
from .evaluate import average_metrics, evaluate_topk, pick_best_model
from .movie_similarity import DEFAULT_MIN_RATINGS, DEFAULT_TOP_N, search_movies, similar_movies
from .recommenders import (
    build_corr_matrix,
    build_train_only_ratings,
    collaborative_recommend,
    content_recommend,
    hybrid_recommend,
    train_test_split_user,
)
from .schemas import (
    CompareRequest,
    CompareResponse,
    MovieSearchResponse,
    SimilarMoviesResponse,
    UserInfo,
    UsersResponse,
)

app = FastAPI(title="MovieLens CF vs Content vs Hybrid API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "active_users": len(store.active_user_ids),
        "popular_movie_pool": len(store.popular_titles),
        "total_movies": len(store.movies),
    }


@app.get("/api/methods")
def methods():
    return {"cf_methods": ["pearson", "spearman", "kendall"]}


@app.get("/api/users", response_model=UsersResponse)
def get_random_users(n: int = Query(50, ge=1, le=150), seed: int = Query(None)):
    """Pick n random users from the active-user pool (>= 15 ratings so an 80/20 split is meaningful)."""
    if seed is None:
        seed = random.randint(0, 1_000_000)
    rng = random.Random(seed)

    eligible = [uid for uid in store.active_user_ids if store.user_rating_count(uid) >= 15]
    if len(eligible) < n:
        raise HTTPException(status_code=500, detail="Not enough eligible users in dataset")

    chosen = rng.sample(eligible, n)
    users = [UserInfo(user_id=uid, rating_count=store.user_rating_count(uid)) for uid in chosen]
    return UsersResponse(users=users, seed=seed)


@app.post("/api/compare", response_model=CompareResponse)
def compare(req: CompareRequest):
    t0 = time.time()

    for uid in req.user_ids:
        if uid not in store.active_user_ids:
            raise HTTPException(status_code=400, detail=f"user_id {uid} not in active user pool")

    # 1. Split each user's ratings into train/test
    train_test = {uid: train_test_split_user(uid, req.test_size, req.seed) for uid in req.user_ids}

    # 2. Build train-only movie stats + correlation matrix (test ratings masked out)
    train_ratings_df = build_train_only_ratings(train_test)
    movie_stats = train_ratings_df.groupby("title").agg(num_ratings=("rating", "count"), mean_rating=("rating", "mean"))
    corr_matrix = build_corr_matrix(req.cf_method, train_test, req.min_cf_ratings)

    # 3. Build the shared eligible-title pool: movies that meet the rating
    #    threshold across ALL three models, ensuring a consistent candidate
    #    space for CF, Content-Based, and Hybrid.
    eligible_titles = store.movie_stats_full[
        store.movie_stats_full["num_ratings"] >= req.min_cf_ratings
    ].index.tolist()

    per_user_results = []
    model_metrics = {"collaborative": [], "content_based": [], "hybrid": []}

    for uid, (train, test) in train_test.items():
        cf_df = collaborative_recommend(train, corr_matrix, movie_stats, req.k)
        content_df = content_recommend(train, req.k, eligible_titles)
        hybrid_df = hybrid_recommend(train, corr_matrix, movie_stats, req.k, req.alpha, eligible_titles)

        cf_eval = evaluate_topk(cf_df.index.tolist(), test.index.tolist(), req.k)
        content_eval = evaluate_topk(content_df.index.tolist(), test.index.tolist(), req.k)
        hybrid_eval = evaluate_topk(hybrid_df.index.tolist(), test.index.tolist(), req.k)

        model_metrics["collaborative"].append(cf_eval)
        model_metrics["content_based"].append(content_eval)
        model_metrics["hybrid"].append(hybrid_eval)

        per_user_results.append(
            {
                "user_id": uid,
                "train_count": len(train),
                "test_count": len(test),
                "test_titles": test.index.tolist(),
                "models": {
                    "collaborative": cf_eval,
                    "content_based": content_eval,
                    "hybrid": hybrid_eval,
                },
            }
        )

    averages = {name: average_metrics(evals) for name, evals in model_metrics.items()}
    best = pick_best_model(averages)

    return CompareResponse(
        cf_method=req.cf_method,
        k=req.k,
        alpha=req.alpha,
        test_size=req.test_size,
        min_cf_ratings=req.min_cf_ratings,
        per_user=per_user_results,
        averages=averages,
        best_model=best,
        elapsed_seconds=round(time.time() - t0, 2),
    )


@app.get("/api/movies/search", response_model=MovieSearchResponse)
def movies_search(q: str = Query(..., min_length=1), limit: int = Query(10, ge=1, le=25)):
    """Search movie titles by substring, for the similar-movies search box."""
    results = search_movies(q, limit)
    return MovieSearchResponse(query=q, results=results)


@app.get("/api/movies/similar", response_model=SimilarMoviesResponse)
def movies_similar(
    title: str = Query(..., min_length=1),
    min_ratings: int = Query(DEFAULT_MIN_RATINGS, ge=1, le=1000),
    k: int = Query(DEFAULT_TOP_N, ge=1, le=50),
):
    """Top-k movies most similar to `title` by the single-movie Pearson
    correlation approach from the original notebook (no train/test split --
    this is a direct catalog lookup, not an evaluated per-user recommender).
    `title` must match exactly (including year); use /api/movies/search to
    find the exact title first.
    """
    t0 = time.time()
    results = similar_movies(title, min_ratings, k)
    if results is None:
        raise HTTPException(
            status_code=404,
            detail=f'"{title}" not found in the ratings dataset. Use /api/movies/search to find the exact title.',
        )
    return SimilarMoviesResponse(
        title=title,
        min_ratings=min_ratings,
        k=k,
        results=results,
        elapsed_seconds=round(time.time() - t0, 2),
    )

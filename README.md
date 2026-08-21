<div align="center">

# 🎬 CinePredict AI

### *Intelligent Cinema Showcase · ML Rating Prediction Lab · Personalized CineLens Recommender*

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115.0-009688.svg?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.3.1-61DAFB.svg?style=flat-square&logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4.6-646CFF.svg?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB.svg?style=flat-square&logo=python&logoColor=white)](https://www.python.org/)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-1.3%2B-F7931E.svg?style=flat-square&logo=scikit-learn&logoColor=white)](https://scikit-learn.org/)
[![XGBoost](https://img.shields.io/badge/XGBoost-3.0.3-EB5424.svg?style=flat-square&logo=xgboost&logoColor=white)](https://xgboost.readthedocs.io/)
[![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-2.0.35-D71F00.svg?style=flat-square&logo=sqlalchemy&logoColor=white)](https://www.sqlalchemy.org/)
[![TMDB API](https://img.shields.io/badge/TMDB_API-v3-01B4E4.svg?style=flat-square&logo=themoviedatabase&logoColor=white)](https://www.themoviedb.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)

An end-to-end full-stack cinema platform combining hand-curated editorial showcases with machine learning intelligence — featuring personalized collaborative & content recommendation engines (MovieLens-1M) and a real-time rating prediction laboratory comparing Linear Regression, Polynomial Regression, Random Forest, and XGBoost.

**Powered by SHANKS**

---

</div>

## 📋 Table of Contents

- [🌟 Overview](#-overview)
- [🚀 Key Features](#-key-features)
  - [1. Curated Cinema Showcase](#1-curated-cinema-showcase)
  - [2. Personal Watched List & Film Diary](#2-personal-watched-list--film-diary)
  - [3. Full TMDB Catalog Explorer](#3-full-tmdb-catalog-explorer)
  - [4. CineLens Recommendation Engine](#4-cinelens-recommendation-engine)
  - [5. Rating Prediction Model Comparison Lab](#5-rating-prediction-model-comparison-lab)
  - [6. Admin Management & Moderation Suite](#6-admin-management--moderation-suite)
- [🤖 Machine Learning Architecture](#-machine-learning-architecture)
  - [CineLens Recommender System](#cinelens-recommender-system)
  - [Rating Prediction Regressor Pipeline](#rating-prediction-regressor-pipeline)
  - [Feature Engineering & Leakage Prevention](#feature-engineering--leakage-prevention)
- [🛠️ Technology Stack](#️-technology-stack)
- [🏗️ System Architecture & Data Flow](#️-system-architecture--data-flow)
- [🗄️ Database Schema & Entities](#️-database-schema--entities)
- [📁 Project Directory Structure](#-project-directory-structure)
- [💻 Step-by-Step Installation & Setup](#-step-by-step-installation--setup)
  - [Prerequisites](#prerequisites)
  - [Step 1: Obtain a Free TMDB API Key](#step-1-obtain-a-free-tmdb-api-key)
  - [Step 2: Backend Configuration & Startup](#step-2-backend-configuration--startup)
  - [Step 3: Frontend Configuration & Startup](#step-3-frontend-configuration--startup)
  - [Step 4: Accessing the Application & Default Credentials](#step-4-accessing-the-application--default-credentials)
- [📡 Complete REST API Reference](#-complete-rest-api-reference)
- [🔧 Troubleshooting & FAQ](#-troubleshooting--faq)
- [🚀 Deployment Guidelines](#-deployment-guidelines)
- [📄 License & Acknowledgements](#-license--acknowledgements)

---

## 🌟 Overview

**CinePredict AI** bridges the gap between editorial film curation, community engagement, and artificial intelligence:

1. **Curated Showcase**: Admins discover titles across TMDB's worldwide catalog, import them with complete metadata into the showcase, assign an official Admin Rating (`0.0 – 10.0`), write editorial reviews, and highlight premier titles as *Featured*.
2. **Interactive Community**: Registered users can browse films, search by title with instant fuzzy matching, filter by genre, sort by runtime or audience score, and submit their own ratings (`0.5 – 10.0`) and written reviews. Audience scores unlock once a film receives 3+ community ratings.
3. **Personal Watched List (`/watched`)**: A personal film diary tracking all rated films, personal scores, written review excerpts, and aggregated statistics (Total Films Watched, Cumulative Watch Time in hours and minutes, Average Score Given).
4. **CineLens Recommender (`/recommender`)**: A recommendation system trained on the 1,000,209 ratings in the **MovieLens-1M dataset**, comparing Item-Based Collaborative Filtering, TF-IDF Content-Based Filtering, and a Hybrid Model with real-time Precision@K, Recall@K, and Hit Rate@K evaluation metrics.
5. **Rating Prediction Lab (`/rating-comparison`)**: A live machine learning experiment playground evaluating 4 regression models (**Linear Regression**, **Polynomial Regression**, **Random Forest**, and **XGBoost**) on predicting viewer ratings across 41 engineered features with real-time RMSE, MAE, and R² evaluation metrics.
6. **Administrative Suite (`/admin`)**: A centralized dashboard to import TMDB films with 1-click auto-enrichment, manage showcase items, audit registered users, and moderate community reviews.

---

## 🚀 Key Features

### 1. Curated Cinema Showcase
- **Curated Catalog**: Hand-selected films complete with high-resolution posters, backdrops, plot synopses, runtimes, release dates, and genre tags.
- **Showcase Search Bar**: Debounced real-time title search with exact-match fallback and fuzzy string similarity scoring (`difflib`).
- **Flexible Sorting**: Sort showcase titles by:
  - *Newest Added*
  - *Admin Rating (Highest to Lowest)*
  - *Audience Rating (Unlocked at 3+ Community Reviews)*
  - *Alphabetical Title (A → Z)*
  - *Runtime: High to Low*
  - *Runtime: Low to High*
- **View Mode Switcher**: Toggle effortlessly between **Standard Grid**, **Compact Grid**, and **Detailed List** views.
- **Genre Filter Chips**: Filter the showcase dynamically by TMDB genres.
- **Audience Rating Unlock Mechanism**: Community ratings remain hidden until a movie receives at least 3 ratings, preventing early score skew.

### 2. Personal Watched List & Film Diary
- **Automated Diary Logging**: Submitting a rating automatically adds the film to the user's personal watched list.
- **Live Diary Statistics Banner**:
  - 🎞️ **Total Films Watched** (Count)
  - ⏱️ **Cumulative Watch Time** (formatted as `Xh Ym`, e.g., `48h 35m`)
  - ⭐ **Personal Average Score Given**
- **Personal Diary Cards**: Display the user's personal rating badge (`★ 9.0`), written review quote, admin score, runtime, genre tags, and direct links to update or delete ratings.

### 3. Full TMDB Catalog Explorer
- **Global Search (`/explore`)**: Search the full TMDB catalog containing hundreds of thousands of international movies.
- **Live Autocomplete (`/suggest`)**: Debounced 5-result live dropdown sorted by TMDB vote count with thumbnail posters and release years.
- **Comprehensive Movie Deep Dive (`/explore/:tmdbId`)**: Full details including backdrop artwork, tagline, production countries, spoken languages, vote counts, runtime, and overview.
- **Admin Direct Import**: When logged in as admin, explore pages feature a 1-click button to import any TMDB film directly into the showcase.

### 4. CineLens Recommendation Engine
- **Triple Model Bake-Off**: Side-by-side comparison of:
  - **Item-Based Collaborative Filtering** (Pearson, Spearman, or Kendall correlations).
  - **Content-Based Filtering** (TF-IDF vectorizer over Title + Genres with centered user profiles).
  - **Hybrid Model** (Min-max normalized score blend with configurable $\alpha$ balance).
- **Leakage-Free Train/Test Evaluation**: Dynamically masks each evaluation user's test ratings from the correlation matrix to ensure valid out-of-sample evaluation.
- **Evaluation Metrics**: Computes **Precision@K**, **Recall@K**, and **Hit Rate@K** across sample user pools with automated winner determination.
- **Similar Movies Finder**: Standalone Pearson correlation lookup to find the most mathematically similar movies to any title in the MovieLens catalog.

### 5. Rating Prediction Model Comparison Lab
- **4-Model Tournament**: Train and benchmark four distinct regression models on identical train/test splits:
  1. **Linear Regression** (Baseline reference)
  2. **Polynomial Regression** (Degree 2, 3, 4, or 5 with dense numeric core feature subset)
  3. **Random Forest Regressor** (50, 100, 150, or 200 estimators)
  4. **XGBoost Regressor** (Gradient boosted trees with configurable learning rate, depth, and estimators)
- **Interactive Hyperparameter Tuning**: Adjust simulated user sample size (250, 500, 750, 1000), tree counts, polynomial degree, and learning rate directly from the UI.
- **Comprehensive Evaluation**: Generates **RMSE** (Root Mean Squared Error), **MAE** (Mean Absolute Error), and **R²** (Coefficient of Determination) alongside interactive performance bar charts and test prediction samples.

### 6. Admin Management & Moderation Suite
- **1-Click TMDB Import**: Search TMDB or discover by genre, preview details, assign an official Admin Rating, write an editorial review, set Featured status, and auto-populate runtimes and genres.
- **Showcase Management**: Edit ratings, reviews, and featured status inline or delete titles from the showcase.
- **User Account Auditing**: Inspect all registered users, their registration dates, total reviews written, and average score given.
- **Review Moderation**: View all community ratings across the platform with filtering by user or movie, and delete inappropriate entries.

---

## 🤖 Machine Learning Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   CINEPREDICT AI ML ECOSYSTEM                                   │
├───────────────────────────────────────────────┬─────────────────────────────────────────────────┤
│          CINELENS RECOMMENDER SYSTEM          │          RATING PREDICTION MODEL LAB            │
├───────────────────────────────────────────────┼─────────────────────────────────────────────────┤
│ • Dataset: MovieLens-1M (1M+ ratings)         │ • Dataset: MovieLens-1M Sampled Users           │
│ • Models: Item-CF, Content-Based, Hybrid      │ • Models: Linear, Polynomial, RF, XGBoost       │
│ • Similarities: Pearson, Spearman, Kendall    │ • Feature Space: 41 Engineered Features         │
│ • Vectorizer: TF-IDF on Title + Genres        │ • Preprocessing: Training-only statistics       │
│ • Evaluation: Precision@K, Recall@K, Hit Rate │ • Metrics: RMSE, MAE, R² Score                  │
└───────────────────────────────────────────────┴─────────────────────────────────────────────────┘
```

### CineLens Recommender System

The CineLens recommender operates on the **MovieLens-1M** dataset (`backend/data/ml-1m/` containing 1,000,209 ratings across 3,900 movies and 6,040 users).

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                  CINELENS ALGORITHM FORMULATIONS                                │
├────────────────────────┬────────────────────────────────────────────────────────────────────────┤
│ Model                  │ Mathematical Formulation & Implementation Details                      │
├────────────────────────┼────────────────────────────────────────────────────────────────────────┤
│ Item-Based             │ 1. Centered Rating Weight: w(u, i) = r(u, i) - 3.0                     │
│ Collaborative          │    (Centering at 3.0 ensures 1-2 star ratings penalize recommendations)│
│ Filtering (CF)         │ 2. Similarity Matrix: S(i, j) = Corr(Movie_i, Movie_j)                 │
│                        │    (Pearson / Spearman / Kendall correlation with min_periods=5)       │
│                        │ 3. Raw Score: Score(u, j) = Σ [ w(u, i) × S(i, j) ]                    │
│                        │ 4. Blended Score: 0.60·Sim_norm + 0.20·Rating_norm + 0.20·Pop_norm    │
├────────────────────────┼────────────────────────────────────────────────────────────────────────┤
│ Content-Based          │ 1. Item Vector: v(i) = TF-IDF(Title_i + " " + Genres_i)                │
│ Filtering (CB)         │ 2. User Profile: p(u) = Normalize( Σ [ (r(u, i) - 3.0) × v(i) ] )      │
│                        │ 3. Candidate Score: Score(u, j) = Cosine_Similarity(p(u), v(j))        │
├────────────────────────┼────────────────────────────────────────────────────────────────────────┤
│ Hybrid                 │ 1. Normalize scores to [0, 1] range: S_norm = (S - S_min) / (S_max - S_min) │
│ Blend Model            │ 2. Weighted Ensemble: Hybrid_Score = α·CF_norm + (1 - α)·CB_norm       │
│                        │    (Default α = 0.50, adjustable from 0.0 to 1.0)                      │
└────────────────────────┴────────────────────────────────────────────────────────────────────────┘
```

#### Evaluation Methodology:
For each selected user, their rating history is partitioned into an **80% Training Set** and **20% Held-out Test Set**. To prevent data leakage, test movie ratings are masked (`np.nan`) prior to building the correlation matrix.
- **Precision@K**: $\frac{|\text{Recommended}_K \cap \text{Test}|}{K}$
- **Recall@K**: $\frac{|\text{Recommended}_K \cap \text{Test}|}{|\text{Test}|}$
- **Hit Rate@K**: $1.0$ if $|\text{Recommended}_K \cap \text{Test}| > 0$, else $0.0$

---

### Rating Prediction Regressor Pipeline

The Rating Prediction Lab evaluates regression models on their ability to predict the exact numerical rating ($1.0 - 5.0$) a user will assign to a movie.

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                 RATING PREDICTION REGRESSORS                                    │
├────────────────────────┬──────────────────────────────────────┬─────────────────────────────────┤
│ Model                  │ Hyperparameter Range                 │ Description                     │
├────────────────────────┼──────────────────────────────────────┼─────────────────────────────────┤
│ Linear Regression      │ Default OLS (Ordinary Least Squares) │ Baseline linear model trained   │
│                        │                                      │ on full 41-feature space.       │
├────────────────────────┼──────────────────────────────────────┼─────────────────────────────────┤
│ Polynomial Regression  │ Degree: 2, 3, 4, or 5                │ Non-linear polynomial feature   │
│                        │                                      │ expansion on 5 core features.   │
├────────────────────────┼──────────────────────────────────────┼─────────────────────────────────┤
│ Random Forest          │ n_estimators: 50, 100, 150, 200      │ Bootstrap aggregated ensemble of │
│ Regressor              │ random_state: 42                     │ decision trees to reduce error. │
├────────────────────────┼──────────────────────────────────────┼─────────────────────────────────┤
│ XGBoost                │ n_estimators: 10 – 1000              │ Gradient boosted decision trees │
│ Regressor              │ learning_rate: 0.01 – 1.0            │ optimizing squared error loss.  │
│                        │ max_depth: 1 – 20                    │                                 │
│                        │ objective: reg:squarederror          │                                 │
└────────────────────────┴──────────────────────────────────────┴─────────────────────────────────┘
```

---

### Feature Engineering & Leakage Prevention

To guarantee rigorous evaluation without data leakage, all statistical aggregations are computed **exclusively on the training split** and subsequently applied to transform the test split:

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                FEATURE ENGINEERING ARCHITECTURE                                 │
├─────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 1. Core Numeric Signals (5 Features - used by Polynomial Regression & Full Models):             │
│    • user_avg_rating    : Historical mean rating given by the user (train only)                 │
│    • user_rating_count  : Total number of ratings submitted by user (train only)                │
│    • movie_avg_rating   : Historical mean rating received by the movie (train only)             │
│    • movie_rating_count : Total number of ratings received by movie (train only)               │
│    • genre_match_score  : Cosine alignment between user genre affinity & movie genres         │
├─────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 2. Movie Genre Binary Indicators (18 Features - Action, Comedy, Drama, Sci-Fi, etc.):          │
│    • movie_genre_<Genre> : 1.0 if the movie belongs to <Genre>, else 0.0                        │
├─────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 3. User Genre Preference Signals (18 Features):                                                 │
│    • user_pref_<Genre>  : Mean rating given by user to <Genre> movies in training split         │
├─────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Total Feature Dimension: 41 Features (Full Models) | 5 Core Features (Polynomial Regression)    │
│ Cold-Start Handling: Missing user/movie statistics fall back to global training mean (no leak)  │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       TECH STACK MATRIX                                         │
├──────────────────────┬────────────────────────────────────────────┬─────────────────────────────┤
│ Layer                │ Technologies                               │ Key Libraries / Packages    │
├──────────────────────┼────────────────────────────────────────────┼─────────────────────────────┤
│ Frontend Client      │ React 18 · Vite 5 · React Router v6        │ react, react-dom,           │
│                      │                                            │ react-router-dom, axios     │
│ UI & Theme           │ Custom Modern CSS · Glassmorphism Design   │ Midnight Cinema Palette     │
│ Data Visualizations  │ Recharts (v3.10) · Inline Responsive SVG   │ recharts                    │
│ Backend API Server   │ FastAPI (v0.115) · Uvicorn ASGI Server     │ fastapi, uvicorn, httpx     │
│ Validation & Config  │ Pydantic v2 · Pydantic Settings            │ pydantic, pydantic-settings │
│ ORM & Persistence    │ SQLAlchemy v2.0 · PyMySQL / SQLite         │ sqlalchemy, pymysql         │
│ Authentication       │ OAuth2 Password Flow · JWT · bcrypt        │ python-jose, bcrypt         │
│ Machine Learning     │ scikit-learn · XGBoost · pandas · NumPy    │ scikit-learn, xgboost,      │
│                      │                                            │ pandas, numpy               │
│ External Data Source │ The Movie Database (TMDB) API v3           │ HTTPS REST Client (httpx)   │
└──────────────────────┴────────────────────────────────────────────┴─────────────────────────────┘
```

---

## 🏗️ System Architecture & Data Flow

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   SYSTEM TOPOLOGY & DATA FLOW                                   │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘

     ┌─────────────────────────────────────────────────────────────────────────┐
     │                React SPA Frontend (Vite Server :5173)                   │
     │  Home · Showcase · Watched List · CineLens · Model Lab · Admin Dashboard│
     └────────────────────────────────────┬────────────────────────────────────┘
                                          │
                                          │ HTTP / JSON Requests
                                          │ Authorization: Bearer <JWT_TOKEN>
                                          ▼
     ┌─────────────────────────────────────────────────────────────────────────┐
     │                 FastAPI Backend Application (:8000)                     │
     │                                                                         │
     │  ├── /api/auth               Registration, OAuth2 Login, Session Info   │
     │  ├── /api/movies             Showcase, Title Search, Watched List       │
     │  ├── /api/movies/{id}/rate   Community Ratings, User Reviews            │
     │  ├── /api/explore            Public TMDB Catalog Discovery & Auto-suggest│
     │  ├── /api/cinelens           MovieLens-1M CF / Content / Hybrid Engine  │
     │  ├── /api/rating-prediction  Linear, Poly, RF, XGBoost Experiment Lab   │
     │  └── /api/admin              Curation, User Audits, Review Moderation   │
     └───────────────────────┬─────────────────────────────┬───────────────────┘
                             │                             │
                             ▼                             ▼
       ┌───────────────────────────────┐     ┌───────────────────────────────┐
       │   Relational Database (ORM)   │     │    External TMDB API v3       │
       │   • users                     │     │    • Worldwide Movie Catalog  │
       │   • movies (curated showcase) │     │    • High-res Posters / Images│
       │   • user_ratings (diary/revs) │     │    • Genres, Cast & Synopses  │
       │   (MySQL or SQLite)           │     │    (https://api.themoviedb.org│
       └───────────────────────────────┘     └───────────────────────────────┘
                             │
                             ▼
       ┌───────────────────────────────────────────────────────────────────────┐
       │             MovieLens-1M Data Store (`backend/data/ml-1m/`)           │
       │             • 1,000,209 Ratings (`ratings.dat`)                       │
       │             • 3,900 Movie Titles & Genres (`movies.dat`)              │
       │             • Precomputed TF-IDF Matrices & Pivot Tables              │
       └───────────────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Database Schema & Entities

Defined with **SQLAlchemy 2.0 ORM** in [`backend/app/models.py`](file:///c:/Users/Shashank/Desktop/main_project/movie-website/backend/app/models.py):

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       RELATIONAL SCHEMA                                         │
├─────────────────────────────────────────────────────────────────────────────────────────────────┤
│  TABLE: users                                                                                   │
│  ├── id              : INTEGER (Primary Key, Auto Increment, Indexed)                           │
│  ├── username        : VARCHAR(50) (Unique, Indexed, NOT NULL)                                  │
│  ├── email           : VARCHAR(120) (Unique, Indexed, NOT NULL)                                 │
│  ├── hashed_password : VARCHAR(255) (NOT NULL)                                                  │
│  ├── role            : ENUM('admin', 'user') (Default: 'user', NOT NULL)                        │
│  └── created_at      : DATETIME(timezone=True) (Server Default: CURRENT_TIMESTAMP)              │
│  RELATIONSHIPS       : user_ratings (1-to-Many, cascade="all, delete-orphan")                   │
├─────────────────────────────────────────────────────────────────────────────────────────────────┤
│  TABLE: movies                                                                                  │
│  ├── id              : INTEGER (Primary Key, Auto Increment, Indexed)                           │
│  ├── tmdb_id         : INTEGER (Unique, Indexed, NOT NULL)                                      │
│  ├── title           : VARCHAR(255) (NOT NULL)                                                  │
│  ├── overview        : TEXT (Nullable)                                                          │
│  ├── release_date    : VARCHAR(20) (Nullable)                                                   │
│  ├── poster_path     : VARCHAR(255) (Nullable)                                                  │
│  ├── backdrop_path   : VARCHAR(255) (Nullable)                                                  │
│  ├── tmdb_rating     : FLOAT (Nullable)                                                         │
│  ├── runtime         : INTEGER (Minutes, Nullable)                                              │
│  ├── genres          : VARCHAR(500) (Comma-separated genre names, Nullable)                      │
│  ├── admin_rating    : FLOAT (0.0 – 10.0 scale, Default: 0.0, NOT NULL)                         │
│  ├── admin_review    : TEXT (Nullable)                                                          │
│  ├── is_featured     : BOOLEAN (Default: False, NOT NULL)                                       │
│  ├── created_at      : DATETIME(timezone=True) (Server Default: CURRENT_TIMESTAMP)              │
│  └── updated_at      : DATETIME(timezone=True) (Server Default: CURRENT_TIMESTAMP, onupdate)    │
│  RELATIONSHIPS       : user_ratings (1-to-Many, cascade="all, delete-orphan")                   │
├─────────────────────────────────────────────────────────────────────────────────────────────────┤
│  TABLE: user_ratings                                                                            │
│  ├── id              : INTEGER (Primary Key, Auto Increment, Indexed)                           │
│  ├── user_id         : INTEGER (Foreign Key -> users.id, ondelete="CASCADE", NOT NULL)          │
│  ├── movie_id        : INTEGER (Foreign Key -> movies.id, ondelete="CASCADE", NOT NULL)        │
│  ├── rating          : FLOAT (0.0 – 10.0 scale, NOT NULL)                                       │
│  ├── review          : TEXT (Nullable)                                                          │
│  ├── created_at      : DATETIME(timezone=True) (Server Default: CURRENT_TIMESTAMP)              │
│  ├── updated_at      : DATETIME(timezone=True) (Server Default: CURRENT_TIMESTAMP, onupdate)    │
│  └── CONSTRAINT      : UNIQUE(user_id, movie_id) (One rating per user per movie)                │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Directory Structure

```
movie-website/
├── README.md                                # Root Project Documentation
├── backend/
│   ├── .env.example                         # Environment template
│   ├── .env                                 # Local environment variables
│   ├── requirements.txt                     # Python dependencies
│   ├── data/
│   │   └── ml-1m/
│   │       ├── movies.dat                   # MovieLens-1M movie catalog (3,900 films)
│   │       └── ratings.dat                  # MovieLens-1M rating logs (1,000,209 ratings)
│   └── app/
│       ├── __init__.py
│       ├── main.py                          # FastAPI app entrypoint & lifespan bootstrap
│       ├── config.py                        # Pydantic Settings & environment loaders
│       ├── database.py                      # SQLAlchemy engine & session maker
│       ├── models.py                        # User, Movie, and UserRating ORM models
│       ├── schemas.py                       # Pydantic request/response validation schemas
│       ├── security.py                      # bcrypt hashing & JWT token encoding/decoding
│       ├── auth.py                          # FastAPI dependencies (get_current_user, require_admin)
│       ├── tmdb.py                          # TMDB API v3 wrapper client (httpx)
│       ├── routers/
│       │   ├── auth.py                      # /api/auth routes (login, register, me)
│       │   ├── movies.py                    # /api/movies routes (showcase, watched list, sort)
│       │   ├── ratings.py                   # /api/movies/{id}/rate routes (rate, review, delete)
│       │   ├── explore.py                   # /api/explore routes (TMDB search, suggest, details)
│       │   └── admin.py                     # /api/admin routes (import, manage, audit, moderate)
│       ├── cinelens/                        # CineLens Recommender Subsystem
│       │   ├── data_store.py                # In-memory pivot & TF-IDF matrices
│       │   ├── movie_similarity.py          # Standalone Pearson movie-movie similarity
│       │   ├── recommenders.py              # Item-CF, Content-Based, and Hybrid models
│       │   ├── evaluate.py                  # Precision@K, Recall@K, Hit Rate@K metrics
│       │   ├── schemas.py                   # CineLens Pydantic schemas
│       │   └── router.py                    # /api/cinelens API endpoints
│       └── rating_prediction/               # Rating Prediction Machine Learning Lab
│           ├── data_loader.py               # Simulated user selector & genre parser
│           ├── splitter.py                  # Common 80/20 train/test splitter
│           ├── feature_engineering.py       # 41-feature leak-free transformation builder
│           ├── evaluation.py                # RMSE, MAE, R2 calculation utilities
│           ├── comparison.py                # Cross-model benchmark & ranking engine
│           ├── pipeline.py                  # 4-model experiment training pipeline
│           ├── routes.py                    # /api/rating-prediction endpoints
│           └── models/
│               ├── linear_model.py          # Ordinary Least Squares Baseline
│               ├── polynomial_model.py      # PolynomialFeatures (degree 2-5) regressor
│               ├── random_forest_model.py   # RandomForestRegressor implementation
│               └── xgboost_model.py         # XGBoostRegressor implementation
└── frontend/
    ├── package.json                         # Node.js dependencies and build scripts
    ├── vite.config.js                       # Vite build & proxy configuration
    ├── index.html                           # SPA entry HTML
    └── src/
        ├── main.jsx                         # React root bootstrap
        ├── App.jsx                          # Route table & global layout
        ├── context/
        │   └── AuthContext.jsx              # Global authentication state provider
        ├── styles/
        │   └── index.css                    # Midnight Cinema design system & styles
        ├── components/
        │   ├── Navbar.jsx                   # Navigation bar with role badges & links
        │   ├── MovieCard.jsx                # Responsive showcase card
        │   ├── StarRating.jsx               # Interactive star selector (0.5 – 10.0)
        │   ├── SearchBar.jsx                # Debounced search input
        │   ├── RequireAuth.jsx              # Protected route wrapper for authenticated users
        │   └── RequireAdmin.jsx             # Protected route wrapper for administrators
        ├── pages/
        │   ├── Home.jsx                     # Landing page & showcase catalog
        │   ├── Login.jsx                    # User login page
        │   ├── Register.jsx                 # User registration page
        │   ├── MovieDetail.jsx              # Showcase movie detail & community reviews
        │   ├── WatchedList.jsx              # Personal film diary & watch statistics
        │   ├── Explore.jsx                  # TMDB catalog search & live suggestions
        │   ├── ExploreMovieDetail.jsx       # TMDB detailed movie view with admin import
        │   ├── RatingComparisonPage.jsx     # Rating prediction experiment playground
        │   ├── AdminDashboard.jsx           # Showcase management, user auditing, moderation
        │   └── AdminAddMovie.jsx            # TMDB search & 1-click import interface
        ├── cinelens/                        # CineLens UI Component Suite
        │   ├── CineLensPage.jsx             # CineLens interactive evaluation playground
        │   ├── CineLens.css                 # CineLens visual styling
        │   ├── api.js                       # CineLens API client
        │   └── components/                  # ControlPanel, ComparisonChart, SimilarMovies, etc.
        └── movie-rating-comparison/         # Rating Prediction UI Component Suite
            ├── App.jsx                      # Rating comparison interactive container
            ├── index.css                    # Model lab visualization styling
            ├── api.js                       # Rating prediction API client
            └── components/                  # Controls, Charts, TrainTestBar, Predictions, etc.
```

---

## 💻 Step-by-Step Installation & Setup

### Prerequisites
Ensure you have the following installed on your machine:
- **Python 3.10+** ([python.org](https://www.python.org/downloads/))
- **Node.js 18+** & **npm** ([nodejs.org](https://nodejs.org/))
- **MySQL 8.0+** (or SQLite for lightweight zero-config local development)
- A free **TMDB API Key** ([themoviedb.org](https://www.themoviedb.org/))

---

### Step 1: Obtain a Free TMDB API Key
1. Create a free account at [themoviedb.org](https://www.themoviedb.org/).
2. Navigate to **Account Settings → API**.
3. Request an **API Key (v3 auth)** (choose *Developer*).
4. Copy your **API Key** string for the `.env` file in the next step.

---

### Step 2: Backend Configuration & Startup

1. Open a terminal and navigate to the `backend/` directory:
   ```bash
   cd backend
   ```

2. Create and activate a Python virtual environment:
   ```bash
   # On Windows (PowerShell):
   python -m venv venv
   .\venv\Scripts\Activate.ps1

   # On macOS / Linux:
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Install all required dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create your `.env` configuration file:
   ```bash
   # On Windows:
   copy .env.example .env

   # On macOS / Linux:
   cp .env.example .env
   ```

5. Configure `.env` with your settings:
   ```env
   # ---- Database Configuration ----
   # Option A: MySQL (Default production)
   DATABASE_URL=mysql+pymysql://root:password@localhost:3306/movie_db

   # Option B: SQLite (Zero-config local file option)
   # DATABASE_URL=sqlite:///./movie.db

   # ---- JWT & Security ----
   SECRET_KEY=your_super_secret_jwt_key_string_min_32_chars
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=1440

   # ---- TMDB API ----
   TMDB_API_KEY=your_tmdb_v3_api_key_here

   # ---- CORS Policy ----
   FRONTEND_ORIGIN=http://localhost:5173

   # ---- Initial Bootstrap Admin Account ----
   FIRST_ADMIN_USERNAME=admin
   FIRST_ADMIN_EMAIL=admin@example.com
   FIRST_ADMIN_PASSWORD=change-this-password
   ```

6. Start the FastAPI development server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

> 💡 **Automatic Bootstrap**: Upon startup, FastAPI automatically builds all database tables and generates the default administrator account specified in your `.env` if none exists!

- **Backend API Base**: `http://localhost:8000`
- **Interactive Swagger Documentation**: `http://localhost:8000/docs`
- **Alternative Redoc Documentation**: `http://localhost:8000/redoc`

---

### Step 3: Frontend Configuration & Startup

1. Open a **second terminal** and navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```

2. Install all Node packages:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```

The application is now running at:
👉 **[http://localhost:5173](http://localhost:5173)**

---

### Step 4: Accessing the Application & Default Credentials

1. Open your browser and navigate to **`http://localhost:5173`**.
2. **Sign In as Administrator**:
   - **Username**: `admin`
   - **Password**: `change-this-password` (or the value set in `FIRST_ADMIN_PASSWORD`)
   - Access `/admin` to import films from TMDB, manage the showcase, view registered users, and moderate reviews.
3. **Sign Up as a Standard User**:
   - Click **Register** to create a user account.
   - Explore showcase films, search and filter by genre, rate movies (`0.5 - 10.0`), write reviews, and track your personal **Watched List** diary at `/watched`!
   - Run recommendation evaluations under **CineLens** (`/recommender`) and benchmark ML models under **Model Lab** (`/rating-comparison`)!

---

## 📡 Complete REST API Reference

### 🔐 Authentication & Session
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register a new user account with username, email, and password. |
| `POST` | `/api/auth/login` | Public | Authenticate via OAuth2 form data; returns JWT Bearer token. |
| `GET` | `/api/auth/me` | Authenticated | Retrieve profile details and role of the currently logged-in user. |

### 🎬 Curated Showcase Movies
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/movies` | Public | List showcase movies. Supports `?q=`, `?genre=`, `?sort=`, and `?featured_only=`. |
| `GET` | `/api/movies/{id}` | Public | Retrieve full details for a single showcase movie. |
| `GET` | `/api/movies/genres` | Public | Retrieve live list of available TMDB genres. |
| `GET` | `/api/movies/my-rated-ids`| Authenticated | Retrieve list of movie IDs rated by the current user. |
| `GET` | `/api/movies/my-ratings` | Authenticated | Retrieve dictionary mapping of `{movie_id: rating}` for the current user. |
| `GET` | `/api/movies/my-watched` | Authenticated | Retrieve full watched list with personal ratings, reviews, and timestamps. |

### ⭐ Ratings & Reviews
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/movies/{id}/rate` | Authenticated | Submit or update personal rating (`0.0 – 10.0`) and written review. |
| `GET` | `/api/movies/{id}/my-rating` | Authenticated | Get the current user's rating and review for a specific movie. |
| `DELETE`| `/api/movies/{id}/rate` | Authenticated | Remove the current user's rating and review for a specific movie. |
| `GET` | `/api/movies/{id}/ratings`| Public | List all public community ratings and reviews for a movie. |

### 🔍 TMDB Catalog Explorer
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/explore/suggest` | Public | Top-5 auto-complete suggestions sorted by popularity for instant search. |
| `GET` | `/api/explore/search` | Public | Search full TMDB catalog by query `?q=` or genre `?genre_id=`. |
| `GET` | `/api/explore/movie/{tmdb_id}` | Public | Fetch comprehensive metadata for any movie directly from TMDB. |

### 🤖 CineLens Recommendation Engine
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/cinelens/health` | Authenticated | Retrieve status of the in-memory MovieLens dataset. |
| `GET` | `/api/cinelens/methods` | Authenticated | List supported CF correlation methods (`pearson`, `spearman`, `kendall`). |
| `GET` | `/api/cinelens/users` | Authenticated | Sample active MovieLens users with $\ge 15$ ratings for evaluation. |
| `POST` | `/api/cinelens/compare` | Authenticated | Run 3-model bake-off (Item-CF vs Content-Based vs Hybrid) with Precision/Recall. |
| `GET` | `/api/cinelens/movies/search`| Authenticated | Substring search over MovieLens dataset titles. |
| `GET` | `/api/cinelens/movies/similar`| Authenticated | Direct Pearson correlation lookup for movies similar to a given title. |

### 📊 Rating Prediction Model Lab
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/rating-prediction/health` | Public | Health status check for the model comparison experiment API. |
| `GET` | `/api/rating-prediction/config` | Public | Retrieve valid hyperparameter selection boundaries and default ranges. |
| `POST` | `/api/rating-prediction/experiment/run` | Public | Train and benchmark Linear, Poly, Random Forest, and XGBoost regressors. |

### 🛡️ Admin Suite
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/admin/tmdb/search` | Admin Only | Search TMDB to select movies for showcase import. |
| `GET` | `/api/admin/tmdb/movie/{tmdb_id}` | Admin Only | Fetch TMDB details to auto-populate runtime, genres, and metadata. |
| `POST` | `/api/admin/movies` | Admin Only | Add a new movie to the showcase with admin rating & review. |
| `PUT` | `/api/admin/movies/{id}` | Admin Only | Update admin rating, review, or featured status of a showcase movie. |
| `DELETE`| `/api/admin/movies/{id}` | Admin Only | Remove a movie from the showcase. |
| `GET` | `/api/admin/users` | Admin Only | List all registered users with contribution counts and average scores. |
| `DELETE`| `/api/admin/users/{id}` | Admin Only | Permanently delete a user account and cascade delete their ratings. |
| `GET` | `/api/admin/ratings` | Admin Only | List all user ratings and reviews with optional movie or user filter. |
| `DELETE`| `/api/admin/ratings/{rating_id}`| Admin Only | Permanently delete any community rating or review. |

---

## 🔧 Troubleshooting & FAQ

<details>
<summary><b>1. TMDB API Returns 401 Unauthorized or Empty Posters</b></summary>

- Verify that your `TMDB_API_KEY` in `backend/.env` is valid and does not have extraneous quotes or spaces.
- Test your key manually in your browser: `https://api.themoviedb.org/3/movie/550?api_key=YOUR_KEY`.
</details>

<details>
<summary><b>2. MySQL Connection Error (`Can't connect to MySQL server`)</b></summary>

- Ensure your MySQL server service is running (`net start MySQL80` on Windows or `sudo systemctl start mysql` on Linux).
- Verify the database exists: `CREATE DATABASE movie_db;`.
- Alternatively, switch to zero-config SQLite by setting `DATABASE_URL=sqlite:///./movie.db` in `backend/.env`.
</details>

<details>
<summary><b>3. CORS Errors in Frontend Console</b></summary>

- Ensure `FRONTEND_ORIGIN` in `backend/.env` is set to `http://localhost:5173`.
- Restart the FastAPI server so updated environment variables take effect.
</details>

<details>
<summary><b>4. MovieLens Dataset Missing (`backend/data/ml-1m/`)</b></summary>

- The repository includes `backend/data/ml-1m/movies.dat` and `backend/data/ml-1m/ratings.dat`.
- Ensure these files exist and have read permissions.
</details>

---

## 🚀 Deployment Guidelines

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                     DEPLOYMENT TARGETS                                          │
├──────────────────────┬──────────────────────────────────────────────────────────────────────────┤
│ Frontend SPA         │ Run `npm run build` in `frontend/`. Deploy the compiled `dist/` directory│
│ (Static Hosting)     │ to Vercel, Netlify, Cloudflare Pages, or AWS S3 + CloudFront.            │
├──────────────────────┼──────────────────────────────────────────────────────────────────────────┤
│ Backend API          │ Deploy container or service to Render, Railway, AWS EC2, or Fly.io.      │
│ (ASGI Application)   │ Production launch command:                                               │
│                      │ `gunicorn -w 4 -k uvicorn.workers.UvicornWorker app.main:app`            │
├──────────────────────┼──────────────────────────────────────────────────────────────────────────┤
│ Managed Database     │ Use AWS RDS MySQL, PlanetScale, Supabase PostgreSQL, or Aiven MySQL.     │
│                      │ Provide connection string via `DATABASE_URL` environment variable.       │
├──────────────────────┼──────────────────────────────────────────────────────────────────────────┤
│ Environment Sync     │ Set `FRONTEND_ORIGIN` to your production frontend domain in `.env` to   │
│                      │ enforce CORS boundaries.                                                 │
└──────────────────────┴──────────────────────────────────────────────────────────────────────────┘
```

---

## 📄 License & Acknowledgements

This project is licensed under the **MIT License** — feel free to use, modify, and distribute for personal and educational portfolios.

- **MovieLens-1M**: Dataset provided by GroupLens Research at the University of Minnesota ([grouplens.org](https://grouplens.org/datasets/movielens/1m/)).
- **The Movie Database (TMDB)**: Movie posters, backdrops, and metadata provided by TMDB API. This product uses the TMDB API but is not endorsed or certified by TMDB.

---

<div align="center">

### 🎬 CinePredict AI
*Intelligent Cinema Showcase · ML Rating Prediction Lab · Personalized Recommender*

**Built with FastAPI, React, SQLAlchemy, XGBoost, scikit-learn, and TMDB API**  
**Powered by SHANKS**

</div>

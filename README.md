<div align="center">

# 🎬 CinePredict AI

### *Intelligent Cinema Showcase · ML Rating Prediction Lab · Personalized Recommender*

A full-stack movie platform combining hand-curated cinema showcase collections with machine learning intelligence — featuring collaborative filtering, content-based recommendation engines, and live rating prediction experiments using XGBoost, Random Forest, and Polynomial Regression.

**Powered by SHANKS**

---

</div>

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Machine Learning Architecture](#-machine-learning-architecture)
  - [1. CineLens Recommendation Engine](#1-cinelens-recommendation-engine)
  - [2. Rating Prediction Model Lab](#2-rating-prediction-model-lab)
- [Technology Stack](#-technology-stack)
- [System Architecture](#-system-architecture)
- [Database Schema](#-database-schema)
- [How to Run the Project](#-how-to-run-the-project)
  - [Prerequisites](#prerequisites)
  - [Step 1 · Obtain TMDB API Key](#step-1--obtain-tmdb-api-key)
  - [Step 2 · Backend Setup](#step-2--backend-setup)
  - [Step 3 · Frontend Setup](#step-3--frontend-setup)
  - [Step 4 · Accessing the Application](#step-4--accessing-the-application)
- [API Reference](#-api-reference)
- [Deployment Notes](#-deployment-notes)

---

## 🌟 Overview

**CinePredict AI** is an end-to-end full-stack movie platform and data science portfolio application. It bridges the gap between editorial film curation and artificial intelligence:

1. **Curated Showcase**: The admin discovers movies across TMDB, imports them into the showcase, assigns an official Admin Rating (`0.0 – 10.0`), writes an editorial review, and marks highlight films as Featured.
2. **Interactive Community**: Registered users can browse films, search by title in real-time, filter by genre, sort by runtime or release date, and submit their own ratings and written reviews.
3. **Personal Watched List (`/watched`)**: A personal film log displaying watched films, personal ratings, written review quotes, and aggregated diary statistics (Total Films Watched, Total Watch Time in hours/minutes, Average Score Given).
4. **Machine Learning Recommendation Engine (`CineLens`)**: A recommendation system powered by the MovieLens-1M dataset comparing Item-Based Collaborative Filtering, Content-Based Filtering, and a Hybrid Model with Leave-One-Out Cross-Validation metrics.
5. **Rating Prediction Laboratory (`Model Lab`)**: A live experiment playground comparing Polynomial Regression, Random Forest, and XGBoost on rating prediction accuracy with real-time RMSE, MAE, and R² evaluation metrics.

---

## 🚀 Key Features

### 🎬 Curated Cinema Showcase
- **Curated Catalog**: Admin imports movies with posters, backdrops, plot synopses, runtimes, and genre tags directly from TMDB.
- **Showcase Search Bar**: Small, debounced search bar inside the showcase toolbar for instant real-time title filtering.
- **Runtime Sorting**: Sort films by *Runtime: High to Low* or *Runtime: Low to High* to plan movie nights by duration.
- **Genre & View Modes**: Filter by TMDB genres and toggle between Grid, Small Grid, and List views.

### 🍿 Personal Watched List (`/watched`)
- **Automated Diary**: As soon as a user rates any film, it automatically enters their personal Watched List.
- **Live Watch Statistics**: Displays total films watched, cumulative watch time (e.g. `48h 35m`), and average rating given.
- **Personal Log Cards**: Displays personal rating badge (`★ 9.0`), custom written review, admin score, runtime, and genre tags.

### 🔍 Full TMDB Catalog Explorer (`/explore`)
- **Global Search**: Search through movies in TMDB's worldwide database.
- **Instant Suggestions**: 5-result live autocomplete dropdown with poster thumbnails and release years.
- **Movie Deep-Dive**: Explore global audience ratings, release dates, full overview, and backdrop artwork.

### 🛡️ Admin Management Dashboard (`/admin`)
- **Film Control Panel**: Add new movies via TMDB search, edit ratings/reviews, toggle featured status, or delete films.
- **User Management**: View all registered user accounts, their review counts, average scores given, and role privileges.

---

## 🤖 Machine Learning Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          MACHINE LEARNING ARCHITECTURE                          │
├───────────────────────────────────────┬─────────────────────────────────────────┤
│          RECOMMENDER ENGINE           │          RATING PREDICTION LAB          │
│              (CineLens)               │               (Model Lab)               │
├───────────────────────────────────────┼─────────────────────────────────────────┤
│ • Item-Based Collaborative Filtering  │ • Polynomial Regression (Degree 2–5)    │
│ • Content-Based (Genre Weights)       │ • Random Forest Regressor (50–200 trees)│
│ • Hybrid Model (50/50 Weighted Blend) │ • XGBoost Regressor (Gradient Boosting) │
│ • Leave-One-Out Cross-Validation      │ • Evaluation Metrics: RMSE, MAE, R²     │
└───────────────────────────────────────┴─────────────────────────────────────────┘
```

### 1. CineLens Recommendation Engine

The CineLens recommender is trained on the **MovieLens-1M dataset** (`backend/data/ml-1m/` with ratings, movies, and users):

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           CINELENS RECOMMENDER MODELS                           │
├───────────────────┬─────────────────────────────────────────────────────────────┤
│ Model             │ Algorithm Details & Mathematical Approach                   │
├───────────────────┼─────────────────────────────────────────────────────────────┤
│ Collaborative     │ Computes pairwise item correlation matrices using Pearson,  │
│ Filtering (CF)    │ Spearman, or Kendall correlation. Predicts scores using     │
│                   │ weighted neighborhood similarity:                           │
│                   │   Score = Σ(Similarity(i, j) × Rating(u, j)) / Σ(|Sim|)     │
├───────────────────┼─────────────────────────────────────────────────────────────┤
│ Content-Based     │ Constructs user taste profiles by weighting genres by user  │
│ Filtering (CB)    │ ratings (Rating - 5.0). Computes candidate match scores:    │
│                   │   Score = Σ(UserGenreWeight × MovieGenreVector)             │
├───────────────────┼─────────────────────────────────────────────────────────────┤
│ Hybrid Model      │ Normalizes CF and CB score distributions to a [0, 10] scale │
│                   │ and calculates a 50/50 weighted ensemble score:             │
│                   │   Hybrid Score = (0.50 × CF_Score) + (0.50 × CB_Score)      │
└───────────────────┴─────────────────────────────────────────────────────────────┘
```

#### Evaluation Framework: Leave-One-Out Cross-Validation
- **Precision@5 / Precision@10**: Proportion of top-K recommended movies that are relevant.
- **Recall@5 / Recall@10**: Ability of the algorithm to retrieve the user's favorite held-out film in top-K suggestions.
- **MAE / RMSE**: Mean Absolute Error and Root Mean Squared Error evaluating numerical rating accuracy.

---

### 2. Rating Prediction Model Lab

The Model Comparison Lab allows users to test and benchmark machine learning regression models on predicting viewer ratings:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         RATING PREDICTION REGRESSORS                            │
├──────────────────────┬──────────────────────────────────────────────────────────┤
│ Model                │ Hyperparameters & Mechanism                              │
├──────────────────────┼──────────────────────────────────────────────────────────┤
│ Polynomial           │ • Degree: 2, 3, 4, or 5 (configurable)                   │
│ Regression           │ • Maps features into non-linear polynomial space to      │
│                      │   capture curve relationships in user rating behavior.   │
├──────────────────────┼──────────────────────────────────────────────────────────┤
│ Random Forest        │ • Trees: 50, 100, 150, 200 estimators                    │
│ Regressor            │ • Bootstrap aggregating (bagging) of decision trees;     │
│                      │   reduces variance and prevents overfitting on ratings.  │
├──────────────────────┼──────────────────────────────────────────────────────────┤
│ XGBoost              │ • n_estimators: 10 – 1000                                │
│ Regressor            │ • learning_rate: 0.01 – 1.0                              │
│                      │ • max_depth: 1 – 20                                      │
│                      │ • Objective: reg:squarederror                            │
│                      │ • Sequential gradient boosting for optimal accuracy.     │
└──────────────────────┴──────────────────────────────────────────────────────────┘
```

#### Evaluation Metrics Output:
- **RMSE (Root Mean Squared Error)**: Penalizes large prediction misses; primary benchmark metric.
- **MAE (Mean Absolute Error)**: Average absolute deviation between predicted score and actual score.
- **R² Score (Coefficient of Determination)**: Proportion of variance explained by the model (`1.0` = perfect fit).

---

## 🛠️ Technology Stack

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                 TECH STACK MATRIX                               │
├───────────────────┬──────────────────────────────────┬──────────────────────────┤
│ Layer             │ Technologies                     │ Packages Used            │
├───────────────────┼──────────────────────────────────┼──────────────────────────┤
│ Frontend Client   │ React 18 · Vite 5 · React Router │ react, react-dom,        │
│                   │                                  │ react-router-dom, axios  │
│ UI & Styling      │ Vanilla CSS · Custom Properties  │ Midnight Cinema Theme    │
│ Visualizations    │ Recharts (v3.10) · Inline SVG    │ recharts                 │
│ Backend API       │ FastAPI (v0.115) · Uvicorn ASGI  │ fastapi, uvicorn, httpx  │
│ Data Validation   │ Pydantic v2 · Pydantic Settings  │ pydantic, pydantic-sett. │
│ ORM & Persistence │ SQLAlchemy (v2.0) · PyMySQL      │ sqlalchemy, pymysql      │
│ Security & Auth   │ python-jose · bcrypt             │ python-jose, bcrypt      │
│ Machine Learning  │ scikit-learn · XGBoost · pandas  │ scikit-learn, xgboost,   │
│                   │ · NumPy                          │ pandas, numpy            │
│ Metadata Provider │ The Movie Database (TMDB) API v3 │ HTTPS Client (httpx)     │
└───────────────────┴──────────────────────────────────┴──────────────────────────┘
```

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                SYSTEM TOPOLOGY                                  │
└─────────────────────────────────────────────────────────────────────────────────┘

     [ Browser Client / React SPA (Vite Dev Server :5173) ]
                           │
                           │  HTTP / JSON (Bearer JWT Authorization)
                           │  Proxy forwarding /api/*
                           ▼
     [ FastAPI Application Server (Uvicorn :8000) ]
      ├── /api/auth               (Register, Login, Session Check)
      ├── /api/movies             (Showcase, Search, Runtime Sort, Watched List)
      ├── /api/ratings            (Rate, Review, Delete User Scores)
      ├── /api/explore            (TMDB Catalog Integration)
      ├── /api/admin              (Showcase Management, User Auditing)
      ├── /api/cinelens           (Collaborative & Content Recommendation Engine)
      └── /api/rating-prediction  (XGBoost, Random Forest, Poly Reg Benchmark Lab)
                           │
              ┌────────────┴────────────┐
              ▼                         ▼
     [ Relational Database ]    [ External TMDB API v3 ]
     (MySQL / SQLite via ORM)   (Posters, Backdrops, Metadata)
```

---

## 🗄️ Database Schema

Exact schema defined in `backend/app/models.py`:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                DATABASE SCHEMA                                  │
├─────────────────────────────────────────────────────────────────────────────────┤
│  users                                                                          │
│  ├── id: Integer (PK, indexed)                                                  │
│  ├── username: String(50) (Unique, indexed, not null)                           │
│  ├── email: String(120) (Unique, indexed, not null)                             │
│  ├── hashed_password: String(255) (not null)                                    │
│  ├── role: Enum ('admin', 'user') (default 'user', not null)                    │
│  └── created_at: DateTime(timezone=True) (server default now)                   │
├─────────────────────────────────────────────────────────────────────────────────┤
│  movies                                                                         │
│  ├── id: Integer (PK, indexed)                                                  │
│  ├── tmdb_id: Integer (Unique, indexed, not null)                               │
│  ├── title: String(255) (not null)                                              │
│  ├── overview: Text (nullable)                                                  │
│  ├── release_date: String(20) (nullable)                                        │
│  ├── poster_path: String(255) (nullable)                                        │
│  ├── backdrop_path: String(255) (nullable)                                      │
│  ├── tmdb_rating: Float (nullable)                                              │
│  ├── runtime: Integer (minutes, nullable)                                       │
│  ├── genres: String(500) (comma-separated genre names, nullable)                │
│  ├── admin_rating: Float (0.0 – 10.0, default 0, not null)                       │
│  ├── admin_review: Text (nullable)                                              │
│  ├── is_featured: Boolean (default False)                                       │
│  ├── created_at: DateTime(timezone=True) (server default now)                   │
│  └── updated_at: DateTime(timezone=True) (server default now, on update now)     │
├─────────────────────────────────────────────────────────────────────────────────┤
│  user_ratings                                                                   │
│  ├── id: Integer (PK, indexed)                                                  │
│  ├── user_id: Integer (FK -> users.id, ondelete CASCADE, not null)               │
│  ├── movie_id: Integer (FK -> movies.id, ondelete CASCADE, not null)             │
│  ├── rating: Float (0.0 – 10.0, not null)                                       │
│  ├── review: Text (nullable)                                                    │
│  ├── created_at: DateTime(timezone=True) (server default now)                   │
│  ├── updated_at: DateTime(timezone=True) (server default now, on update now)     │
│  └── CONSTRAINT: UNIQUE(user_id, movie_id)                                      │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 💻 How to Run the Project

### Prerequisites
Make sure you have the following installed on your machine:
- **Python 3.10+**
- **Node.js 18+** and **npm**
- A free **TMDB API Key** (Get one at [themoviedb.org](https://www.themoviedb.org/) under Account Settings → API)

---

### Step 1 · Obtain TMDB API Key
1. Create a free account on [The Movie Database (TMDB)](https://www.themoviedb.org/).
2. Navigate to **Settings → API** and request a Developer API key.
3. Save your API key for the backend environment setup.

---

### Step 2 · Backend Setup

Open a terminal and navigate to the backend directory:

```bash
cd backend

# 1. Create a Python virtual environment
python -m venv venv

# 2. Activate the virtual environment
# On Windows (PowerShell):
.\venv\Scripts\Activate
# On macOS / Linux:
# source venv/bin/activate

# 3. Install all required dependencies
pip install -r requirements.txt

# 4. Create your .env environment configuration file
cp .env.example .env
```

Configure your `.env` file with your credentials:

```env
DATABASE_URL          = mysql+pymysql://root:password@localhost:3306/movie_db
# Or SQLite: sqlite:///./movie.db
SECRET_KEY            = your_super_secret_jwt_key_string_here
TMDB_API_KEY          = your_tmdb_v3_api_key_here
FIRST_ADMIN_USERNAME  = admin
FIRST_ADMIN_EMAIL     = admin@example.com
FIRST_ADMIN_PASSWORD  = change-this-password
FRONTEND_ORIGIN       = http://localhost:5173
```

Start the backend development server:

```bash
uvicorn app.main:app --reload --port 8000
```

> 💡 **Auto-Bootstrap**: On first run, FastAPI automatically generates the database schema and initializes the admin account specified in your `.env`.

- **Backend API Base**: `http://localhost:8000`
- **Interactive Swagger Docs**: `http://localhost:8000/docs`

---

### Step 3 · Frontend Setup

Open a **second terminal** and navigate to the frontend directory:

```bash
cd frontend

# 1. Install Node dependencies
npm install

# 2. Start the Vite development server
npm run dev
```

The frontend development server will launch at:
👉 **[http://localhost:5173](http://localhost:5173)**

---

### Step 4 · Accessing the Application

1. Open your browser at `http://localhost:5173`.
2. **Admin Access**:
   - **Username**: `admin`
   - **Password**: `change-this-password` (or whatever was set in your `.env`)
   - Access the `/admin` dashboard to search TMDB, add movies, and manage the showcase.
3. **Regular User Access**:
   - Click **Register** to create a personal user account.
   - Browse the curated showcase, search for titles, rate films, and check your **My Watched List**!
   - Test recommendation models under **CineLens** and run prediction benchmarks under **Model Lab**!

---

## 📡 API Reference

| Group | Method | Endpoint | Description | Auth |
|---|---|---|---|---|
| **Auth** | `POST` | `/api/auth/register` | Register a new user account | Public |
| | `POST` | `/api/auth/login` | Login with OAuth2 form data (returns JWT) | Public |
| | `GET` | `/api/auth/me` | Fetch authenticated user profile | User |
| **Showcase** | `GET` | `/api/movies` | List showcase movies (`?q=`, `?genre=`, `?sort=`) | Public |
| | `GET` | `/api/movies/{id}` | Get single showcase movie details | Public |
| | `GET` | `/api/movies/genres` | Get all available showcase genres | Public |
| | `GET` | `/api/movies/my-watched` | Get user's rated watched list with stats | User |
| | `GET` | `/api/movies/my-ratings` | Get map of user rated movie IDs & scores | User |
| **Ratings** | `POST` | `/api/movies/{id}/rate` | Submit or update movie rating & review | User |
| | `GET` | `/api/movies/{id}/my-rating`| Get authenticated user's rating for movie | User |
| | `DELETE`| `/api/movies/{id}/rate` | Remove authenticated user's rating | User |
| | `GET` | `/api/movies/{id}/ratings` | List all community ratings for a film | Public |
| **Explore** | `GET` | `/api/explore/search` | Search TMDB catalog (`?q=query`) | User |
| | `GET` | `/api/explore/movie/{tmdb_id}` | Get full TMDB movie details | User |
| **Admin** | `GET` | `/api/admin/tmdb/search` | TMDB search for adding to showcase | Admin |
| | `POST` | `/api/admin/movies` | Add new movie to showcase | Admin |
| | `PUT` | `/api/admin/movies/{id}` | Update admin rating, review, or featured | Admin |
| | `DELETE`| `/api/admin/movies/{id}` | Remove movie from showcase | Admin |
| | `GET` | `/api/admin/users` | List all user accounts and review metrics | Admin |
| | `DELETE`| `/api/admin/users/{id}` | Delete user account & user ratings | Admin |
| **CineLens** | `GET` | `/api/cinelens/health` | CineLens data store status | User |
| | `GET` | `/api/cinelens/users` | List available MovieLens users for test | User |
| | `POST` | `/api/cinelens/compare` | Run CF vs Content vs Hybrid bake-off | User |
| | `GET` | `/api/cinelens/movies/similar`| Find similar movies by title & correlation | User |
| **Prediction**| `GET` | `/api/rating-prediction/config` | Hyperparameter constraints & settings | Public |
| | `POST` | `/api/rating-prediction/experiment/run` | Run Poly, Random Forest, XGBoost comparison | Public |

---

## 🚀 Deployment Notes

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                               DEPLOYMENT GUIDELINES                             │
├───────────────────┬─────────────────────────────────────────────────────────────┤
│ Frontend Bundle   │ Run `npm run build` in `frontend/`. Static assets compile   │
│                   │ to `dist/`. Deployable to Vercel, Netlify, or Nginx.       │
├───────────────────┼─────────────────────────────────────────────────────────────┤
│ Backend Hosting   │ Deployable on Render, Railway, AWS EC2, or Docker. Run with │
│                   │ `gunicorn -k uvicorn.workers.UvicornWorker app.main:app`.   │
├───────────────────┼─────────────────────────────────────────────────────────────┤
│ Database Hosting  │ Set `DATABASE_URL` to your MySQL or PostgreSQL instance.    │
├───────────────────┼─────────────────────────────────────────────────────────────┤
│ CORS Policy       │ Update `FRONTEND_ORIGIN` in `.env` to match your production │
│                   │ frontend domain to secure API access.                       │
└───────────────────┴─────────────────────────────────────────────────────────────┘
```

---

<div align="center">

**CinePredict AI**  
*Built with FastAPI, React, SQLAlchemy, XGBoost, scikit-learn, and TMDB API*  
**Powered by SHANKS**

</div>



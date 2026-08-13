# 🎬 Late Show — Personal Movie Showcase

> A full-stack personal movie platform where the admin curates a hand-picked film
> collection, visitors explore the entire TMDB catalog, and logged-in users
> contribute ratings that power AI-driven personalized recommendations.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [How It Works](#how-it-works)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Quick Start Guide](#quick-start-guide)
  - [Prerequisites](#prerequisites)
  - [1 · Get a TMDB API Key](#1--get-a-tmdb-api-key)
  - [2 · Set Up MySQL](#2--set-up-mysql)
  - [3 · Configure & Run the Backend](#3--configure--run-the-backend)
  - [4 · Run the Frontend](#4--run-the-frontend)
- [Deployment Notes](#deployment-notes)

---

## Overview

**Late Show** is a personal movie showcase and recommendation engine. The admin
picks films they love, rates them, and writes reviews. Regular users browse the
collection, search the full TMDB catalog, and submit their own ratings — which
feed into a real machine-learning recommendation system that gets smarter as
more people use the site.

```
movie-website/
├── backend/    FastAPI · SQLAlchemy · MySQL · JWT · TMDB client
└── frontend/   React (Vite) · Vanilla CSS · dark cinema UI
```

---

## Key Features

### 🎬 Curated Movie Showcase

The admin hand-picks every film in the collection.

- **Import any movie** from the full TMDB catalog via the Admin Dashboard
- Set a personal **admin rating** (0–10) and write a custom **review**
- Mark films as **Featured** to highlight them on the homepage
- Edit or remove any entry at any time

---

### 👥 User Accounts & Ratings

- **Register / Log in** with a secure JWT-authenticated account
- Submit a personal **rating + optional review** for any showcased movie
- The **Audience Score** is hidden until a film has at least **3 ratings** — preventing misleading averages from a single vote
- Your previous rating is pre-filled when you revisit a movie

---

### 🔍 Smart Search Engine

Two search modes powered by fuzzy matching:

| Mode | Searches | Who Can Use |
|---|---|---|
| **Showcase Search** | Admin's local catalog | Everyone |
| **Explore / TMDB** | Full TMDB (millions of titles) | Everyone |

**Typo-tolerant** — `"intersteller"` finds *Interstellar* using `difflib`
sequence matching. Results with ≥ 45% similarity are shown, sorted by relevance.

Other capabilities:
- **Genre filtering** — any of the 19 TMDB genres
- **Sort options** — Newest · Admin Rating · Title A→Z · Audience Rating
- **Live autocomplete** — 5-result instant suggestions in the Explore tab

---

### 🤖 AI Recommendation Engine

Recommendations unlock progressively as more data becomes available:

| Tier | When | Algorithm |
|---|---|---|
| 🔒 **Locked** | < 3 ratings | Prompt to rate more films |
| ✨ **Content-Based** | ≥ 3 ratings, limited community data | Genre affinity weighting |
| 🚀 **Hybrid** | ≥ 3 ratings + healthy community data | Content-Based + Collaborative Filtering |

- **Content-Based** — Builds a genre preference profile from your ratings. Movies matching your top genres score higher.
- **Collaborative Filtering** — Computes cosine similarity between your rating history and other users'. Predicts scores for films you haven't seen using weighted averages from similar users.
- **Hybrid** — Blends both approaches 50/50 for the best of both worlds.

---

### 🔬 ML Evaluation Dashboard

The Admin Dashboard includes a live model evaluation panel — no external tools needed.

**Method: Leave-One-Out Cross-Validation**

For each eligible user, the system temporarily hides their highest-rated movie,
runs all 3 models, then checks whether that movie was recommended in the top results.

**Metrics reported:**

| Metric | Description |
|---|---|
| **Precision@5 / @10** | Of the top-K recommendations, what fraction was actually relevant? |
| **Recall@5 / @10** | Was the relevant item found within the top K results? |
| **MAE** | Mean Absolute Error of predicted vs. actual rating *(Collaborative only)* |
| **RMSE** | Root Mean Squared Error of rating predictions *(Collaborative only)* |

Results are displayed as an animated comparison table — no setup required.

---

### 🛡️ Admin Dashboard

A clean 3-tab control panel for managing everything:

| Tab | Purpose |
|---|---|
| 🎬 **Movies** | Add · edit · delete showcase entries |
| 👥 **Users** | View all accounts, rating stats, delete users |
| 🔬 **ML Evaluation** | Live model quality metrics |

Tab selection is remembered across page refreshes (URL param + `localStorage`).

---

## How It Works

### Search — Step by Step

1. User types a query on the Home page
2. Backend tries an **exact substring match** against all movie titles in the DB
3. If nothing matches → **`difflib.SequenceMatcher`** scores every title; results above 45% similarity are returned, ranked by score

### Recommendation — Step by Step

1. User opens the AI Recommendation tab (requires ≥ 3 rated movies)
2. Backend checks community data volume to choose the right algorithm
3. Runs scoring:
   - **Content-Based** — genres weighted by `rating − 5.0`; candidates ranked by match + a small admin-rating boost
   - **Collaborative** — `predicted_score = Σ(similarity × rating) / Σ(similarity)`
   - **Hybrid** — both scores normalized to [0–10], then averaged
4. Returns top 12 recommendations to the frontend

### ML Evaluation — Step by Step

1. Admin opens the 🔬 ML Evaluation tab
2. Frontend calls `GET /api/admin/ml-evaluation`
3. Backend loops over all eligible users:
   - Holds out their highest-rated movie
   - Runs all 3 models on remaining ratings
   - Checks if held-out movie appears in top-5 / top-10
   - Records CF's predicted score vs. actual rating (for MAE/RMSE)
4. Returns averaged metrics — frontend renders the comparison table with animated bars

---

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│                  React Frontend  (Vite)                  │
│                                                          │
│  Home · MovieDetail · Explore · ExploreMovieDetail       │
│  Login · Register · AdminDashboard · AdminAddMovie       │
└───────────────────────┬──────────────────────────────────┘
                        │  REST API  ·  JWT Bearer Token
┌───────────────────────▼──────────────────────────────────┐
│                    FastAPI Backend                       │
│                                                          │
│  /api/auth               Register · Login · Me           │
│  /api/movies             Showcase + fuzzy search         │
│  /api/ratings            Submit / update / delete        │
│  /api/admin              Movie & user management         │
│  /api/explore            Full TMDB catalog (public)      │
│  /api/recommendations    AI recommendation engine        │
│  /api/admin/ml-evaluation   Cross-validation metrics     │
│                                                          │
│  SQLAlchemy ORM ──►  MySQL Database                      │
│  TMDB Client    ──►  themoviedb.org                      │
└──────────────────────────────────────────────────────────┘
```

### Database Tables

```
users
  id · username · email · hashed_password · role · created_at

movies
  id · tmdb_id · title · overview · release_date
  poster_path · backdrop_path · tmdb_rating · runtime
  genres (comma-separated) · admin_rating · admin_review
  is_featured · created_at · updated_at

user_ratings
  id · user_id (FK→users) · movie_id (FK→movies)
  rating · review · created_at · updated_at
  UNIQUE (user_id, movie_id)
```

---

## Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Backend** | [FastAPI](https://fastapi.tiangolo.com/) | REST API + auto Swagger docs |
| **ORM** | [SQLAlchemy](https://www.sqlalchemy.org/) | Database models & queries |
| **Database** | MySQL 8 | Persistent storage |
| **Auth** | python-jose + bcrypt | JWT signing · password hashing |
| **Movie Data** | [TMDB API v3](https://developers.themoviedb.org/) | Metadata · posters · genres |
| **Fuzzy Search** | Python `difflib` (stdlib) | Typo-tolerant title matching |
| **Recommender** | Pure Python (`math` stdlib) | Content-Based · CF · Hybrid |
| **Frontend** | [React 18](https://react.dev/) + [Vite](https://vitejs.dev/) | Single-page UI |
| **Styling** | Vanilla CSS (custom properties) | Dark cinema theme |
| **HTTP Client** | [Axios](https://axios-http.com/) | API calls from React |
| **Routing** | [React Router v6](https://reactrouter.com/) | Client-side navigation |

---

## Quick Start Guide

### Prerequisites

- Python **3.10+**
- Node.js **18+** and npm
- MySQL **8** running locally
- A free **TMDB API key**

---

### 1 · Get a TMDB API Key

1. Create a free account at [themoviedb.org](https://www.themoviedb.org/)
2. Go to **Settings → API** and request a Developer (v3) key
3. Copy the key — you'll need it in Step 3

---

### 2 · Set Up MySQL

Run in your MySQL shell:

```sql
CREATE DATABASE movie_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'movie_user'@'localhost' IDENTIFIED BY 'movie_pass';
GRANT ALL PRIVILEGES ON movie_db.* TO 'movie_user'@'localhost';
FLUSH PRIVILEGES;
```

> ✏️ Replace `movie_user` / `movie_pass` with your own credentials — just make
> sure they match what you put in `.env` in the next step.

---

### 3 · Configure & Run the Backend

```bash
cd backend

# Create and activate a virtual environment
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS / Linux

# Install dependencies
pip install -r requirements.txt

# Copy the example config and edit it
cp .env.example .env
```

Fill in `.env`:

```env
DATABASE_URL       = mysql+pymysql://movie_user:movie_pass@localhost/movie_db
SECRET_KEY         = replace-with-a-long-random-string
TMDB_API_KEY       = your_tmdb_v3_api_key
FIRST_ADMIN_USERNAME = admin
FIRST_ADMIN_EMAIL    = admin@example.com
FIRST_ADMIN_PASSWORD = changeme123
FRONTEND_ORIGIN    = http://localhost:5173
```

Start the server:

```bash
uvicorn app.main:app --reload --port 8000
```

| URL | What you'll find |
|---|---|
| `http://localhost:8000` | API base |
| `http://localhost:8000/docs` | Interactive Swagger UI |

> **First launch:** the backend auto-creates all database tables and seeds the
> first admin account from `FIRST_ADMIN_*`. Use those credentials to log into
> the Admin Dashboard.

---

### 4 · Run the Frontend

Open a **second terminal**:

```bash
cd frontend
npm install
npm run dev
```

Open **[http://localhost:5173](http://localhost:5173)** in your browser.

The Vite dev server automatically proxies all `/api/…` calls to
`http://localhost:8000` — no extra config needed.

> **Production build:** `npm run build` outputs static files to `frontend/dist/`.
> Serve with nginx, Vercel, Netlify, etc. Update `FRONTEND_ORIGIN` in `.env`
> to match your deployed frontend URL.

---

---

## CineLens Recommender (integrated feature)

The CineLens MovieLens-1M recommender bake-off (item-based collaborative
filtering vs. content-based vs. hybrid, plus a "find similar movies" tool)
is integrated into this same app rather than run as a separate project:

- **Backend:** its FastAPI routes live under `backend/app/cinelens/` and are
  mounted on this same FastAPI app at `/api/cinelens/*` (see
  `backend/app/main.py`). They run in the same `uvicorn` process on the
  same port — no second server. Its dataset lives in `backend/data/ml-1m/`.
  The `/api/cinelens/*` endpoints require the same login as the rest of the
  site (reuses `get_current_user` — there's no separate CineLens account
  system).
- **Frontend:** its UI lives under `frontend/src/cinelens/` and is exposed
  as the `/recommender` route in this same React app (see `src/App.jsx`),
  gated behind the existing `RequireAuth` — so it's only reachable once
  you're logged in, with **no second login screen**. Its stylesheet is
  scoped under a `.cinelens-page` wrapper so it can't leak onto (or be
  overridden by) the rest of the site's styling.
- One extra frontend dependency was added for its chart: `recharts` (see
  `frontend/package.json`). Run `npm install` in `frontend/` after pulling
  this to fetch it — this was not able to be installed automatically in the
  environment this integration was prepared in.

Nothing about existing login/logout, routing, or either project's core
functionality was changed beyond this wiring.

---

## Deployment Notes

| Topic | Detail |
|---|---|
| 🖼️ **Movie Posters** | Hot-linked from TMDB's CDN (`image.tmdb.org`). Not stored locally. |
| 🔐 **Promoting to Admin** | All sign-ups create `user` accounts. Promote manually: `UPDATE users SET role='admin' WHERE username='...';` |
| 🌐 **CORS** | Set `FRONTEND_ORIGIN` in `.env` to your deployed frontend URL before going live. |
| 📊 **ML Evaluation** | Needs ≥ 2 users each with ≥ 3 ratings and at least one ≥ 7/10. Shows a friendly empty state until then. |
| 🥶 **CF Cold Start** | Collaborative Filtering falls back to Content-Based until ≥ 3 other users and ≥ 10 total ratings exist. |
| 🚀 **Production** | Run `npm run build` to get a static bundle. Point the build at your backend API URL. |

---

<div align="center">
  <sub>Built with FastAPI · React · MySQL · TMDB API</sub>
</div>

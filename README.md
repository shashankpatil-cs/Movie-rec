# Late Show — Personal Movie Showcase

A personal movie website: the admin curates films with their own rating &
review, visitors browse/search by genre, and logged-in users leave their own
separate rating. Built with FastAPI + MySQL + JWT on the backend, React +
Vite on the frontend, and the TMDB API for movie data.

```
movie-website/
├── backend/     FastAPI + SQLAlchemy + MySQL + JWT auth + TMDB client
└── frontend/    React (Vite) app — "cinema ticket" themed UI
```

## 1. Get a TMDB API key

1. Create a free account at https://www.themoviedb.org/
2. Go to Settings → API → request a "Developer" API key (v3 auth)
3. Copy the key — you'll need it in step 3 below

## 2. Set up MySQL

Create a database and a user for the app. Example, run in the MySQL shell:

```sql
CREATE DATABASE movie_db CHARACTER SET utf8mb4;
CREATE USER 'movie_user'@'localhost' IDENTIFIED BY 'movie_pass';
GRANT ALL PRIVILEGES ON movie_db.* TO 'movie_user'@'localhost';
FLUSH PRIVILEGES;
```

(Use your own username/password — just make sure they match what you put in
`.env` in the next step.)

## 3. Backend setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# Now edit .env:
#   - DATABASE_URL      → your MySQL connection string
#   - SECRET_KEY         → any long random string (used to sign JWTs)
#   - TMDB_API_KEY        → the key from step 1
#   - FIRST_ADMIN_PASSWORD → password for the auto-created admin account

python main.py
```

The API now runs at `http://localhost:8000`. Interactive docs (Swagger UI)
are at `http://localhost:8000/docs`.

On first startup, the backend automatically creates the database tables and
a single admin account using the `FIRST_ADMIN_USERNAME` /
`FIRST_ADMIN_PASSWORD` you set in `.env`. Log in with those credentials to
access the admin dashboard — you can change the password later by editing
the row in the `users` table (or add an endpoint for that if you want one).

## 4. Frontend setup

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. The dev server proxies any request to `/api`
to `http://localhost:8000`, so both parts talk to each other with no extra
config.

To build for production: `npm run build` (outputs static files to
`frontend/dist`, which you can serve with nginx, Vercel, Netlify, etc. —
just point it at your deployed backend URL instead of the dev proxy).

## How the rating system works

- **Admin rating** — attached directly to each `Movie` row. Only the admin
  can set/edit it (via the Admin Dashboard or when adding a movie). This is
  the "curator's score" shown as a gold badge on every card.
- **User ratings** — stored in a separate `UserRating` table, one row per
  (user, movie) pair. Any logged-in non-admin can rate a movie; the movie
  detail page shows the average and every individual review underneath the
  admin's own write-up.

## Search & genre filtering

- The genre dropdown is populated live from TMDB's `/genre/movie/list`.
- Searching/filtering on the homepage filters the admin's *local* showcase
  (title search + genre match) — it does not search all of TMDB, since the
  showcase is meant to be a curated list, not the whole catalog.
- The **Admin → Add movie** page is the one place that searches the full
  TMDB catalog, so the admin can find and import any film.

## Notes & things you may want to extend

- All public sign-ups become regular `user` accounts. There's currently no
  self-serve way to promote a user to admin — do it directly in the
  database (`UPDATE users SET role='admin' WHERE username='...';`) if you
  want a second admin.
- Posters are hot-linked from TMDB's CDN (`image.tmdb.org`), not stored
  locally.
- CORS is configured for `http://localhost:5173` by default — update
  `FRONTEND_ORIGIN` in `.env` (and the CORS list in `app/main.py`) once you
  deploy the frontend somewhere else.

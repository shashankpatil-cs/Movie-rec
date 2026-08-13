// Talks to the CineLens endpoints mounted on the same backend as the rest of
// the site (see backend/app/cinelens/router.py), through the shared axios
// instance so requests automatically carry the logged-in user's token.
import api from "../api/axios";

function detailOf(err) {
  return err?.response?.data?.detail || err.message || "Request failed";
}

export async function fetchHealth() {
  try {
    const res = await api.get("/cinelens/health");
    return res.data;
  } catch (err) {
    throw new Error(detailOf(err));
  }
}

export async function fetchRandomUsers(n = 50, seed = null) {
  const params = { n };
  if (seed !== null) params.seed = seed;
  try {
    const res = await api.get("/cinelens/users", { params });
    return res.data;
  } catch (err) {
    throw new Error(detailOf(err));
  }
}

export async function runCompare({ userIds, cfMethod, k = 10, alpha = 0.5, testSize = 0.2, minCfRatings = 100, seed = 42 }) {
  try {
    const res = await api.post("/cinelens/compare", {
      user_ids: userIds,
      cf_method: cfMethod,
      k,
      alpha,
      test_size: testSize,
      min_cf_ratings: minCfRatings,
      seed,
    });
    return res.data;
  } catch (err) {
    throw new Error(detailOf(err));
  }
}

export async function searchMovies(query, limit = 10) {
  try {
    const res = await api.get("/cinelens/movies/search", { params: { q: query, limit } });
    return res.data;
  } catch (err) {
    throw new Error(detailOf(err));
  }
}

export async function fetchSimilarMovies({ title, minRatings = 100, k = 15 }) {
  try {
    const res = await api.get("/cinelens/movies/similar", {
      params: { title, min_ratings: minRatings, k },
    });
    return res.data;
  } catch (err) {
    throw new Error(detailOf(err));
  }
}

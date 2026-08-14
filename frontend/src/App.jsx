import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import RequireAdmin from "./components/RequireAdmin";
import RequireAuth from "./components/RequireAuth";
import { AuthProvider } from "./context/AuthContext";
import AdminAddMovie from "./pages/AdminAddMovie";
import AdminDashboard from "./pages/AdminDashboard";
import Explore from "./pages/Explore";
import ExploreMovieDetail from "./pages/ExploreMovieDetail";
import Home from "./pages/Home";
import Login from "./pages/Login";
import MovieDetail from "./pages/MovieDetail";
import Register from "./pages/Register";
import CineLensPage from "./cinelens/CineLensPage";
import RatingComparisonPage from "./pages/RatingComparisonPage";

export default function App() {
  return (
    <AuthProvider>
      <Navbar />
      <main style={{ flex: 1 }}>
        <Routes>
          {/* Public: landing page for guests, showcase for logged-in users */}
          <Route path="/" element={<Home />} />

          {/* Auth pages — always public */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected: logged-in users only */}
          <Route
            path="/movies/:id"
            element={
              <RequireAuth>
                <MovieDetail />
              </RequireAuth>
            }
          />
          <Route
            path="/explore"
            element={
              <RequireAuth>
                <Explore />
              </RequireAuth>
            }
          />
          <Route
            path="/explore/:tmdbId"
            element={
              <RequireAuth>
                <ExploreMovieDetail />
              </RequireAuth>
            }
          />

          {/* Protected: logged-in users only — CineLens recommender feature */}
          <Route
            path="/recommender"
            element={
              <RequireAuth>
                <CineLensPage />
              </RequireAuth>
            }
          />

          {/* Rating Prediction Model Comparison — public tool */}
          <Route path="/rating-comparison" element={<RatingComparisonPage />} />

          {/* Protected: admin only */}
          <Route
            path="/admin"
            element={
              <RequireAdmin>
                <AdminDashboard />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/add"
            element={
              <RequireAdmin>
                <AdminAddMovie />
              </RequireAdmin>
            }
          />
        </Routes>
      </main>
      <footer className="footer">LATE SHOW &mdash; a personal film log &middot; powered by TMDB</footer>
    </AuthProvider>
  );
}

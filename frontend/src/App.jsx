import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import RequireAdmin from "./components/RequireAdmin";
import { AuthProvider } from "./context/AuthContext";
import AdminAddMovie from "./pages/AdminAddMovie";
import AdminDashboard from "./pages/AdminDashboard";
import Home from "./pages/Home";
import Login from "./pages/Login";
import MovieDetail from "./pages/MovieDetail";
import Register from "./pages/Register";

export default function App() {
  return (
    <AuthProvider>
      <Navbar />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/movies/:id" element={<MovieDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
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

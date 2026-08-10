import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // sessionStorage is per-tab — each tab holds its own independent session
    const token = sessionStorage.getItem("access_token");
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get("/auth/me")
      .then((res) => setUser(res.data))
      .catch(() => {
        sessionStorage.removeItem("access_token");
      })
      .finally(() => setLoading(false));
  }, []);

  async function login(username, password) {
    const form = new URLSearchParams();
    form.append("username", username);
    form.append("password", password);
    const res = await api.post("/auth/login", form, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    sessionStorage.setItem("access_token", res.data.access_token);
    setUser(res.data.user);
    return res.data.user;
  }

  async function register(username, email, password) {
    await api.post("/auth/register", { username, email, password });
    return login(username, password);
  }

  function logout() {
    sessionStorage.removeItem("access_token");
    localStorage.removeItem("access_token"); // clear any stale legacy token
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

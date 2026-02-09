import axios from "axios";
import { useAuthStore } from "../store/auth"; // adjust path if needed

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 10000,
  withCredentials: true, // send httpOnly cookies automatically
  headers: { "Content-Type": "application/json" },
});

// Attach access token from localStorage to every request
api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 → try refresh token (SAFE version)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const { isAuthenticated, logout } = useAuthStore.getState();

    // 🚨 STOP CONDITION (THIS WAS MISSING)
    if (!isAuthenticated) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Call refresh endpoint (cookie sent automatically)
        const res = await api.post("/auth/refresh");

        const newAccessToken = res.data.accessToken;
        const roleFromToken = res.data.role || res.data.user?.role;

        if (!newAccessToken) {
          throw new Error("No access token returned");
        }

        localStorage.setItem("accessToken", newAccessToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // 🔥 FINAL STOP: refresh failed → logout once → stop all retries
        localStorage.removeItem("accessToken");
        logout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

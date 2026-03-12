import axios from "axios";
import { useAuthStore } from "../store/auth"; // adjust path if needed

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://sb-backend-ptnp.onrender.com/api",
  timeout: 10000,
  withCredentials: true, // ✅ send httpOnly cookies automatically
  headers: { "Content-Type": "application/json" },
});

// -----------------------------
// REMOVE request interceptor that reads localStorage
// -----------------------------
// Previously attaching Authorization header via localStorage is no longer needed
// api.interceptors.request.use(...) removed

// -----------------------------
// Optional: handle 401 by calling refresh endpoint
// -----------------------------
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const { isAuthenticated, logout } = useAuthStore.getState();

    if (!isAuthenticated) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Call refresh endpoint (cookie sent automatically)
        await api.post("/auth/refresh"); // accessToken updated in cookie automatically

        // Retry original request
        return api(originalRequest);
      } catch (refreshError) {
        // refresh failed → logout user
        logout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
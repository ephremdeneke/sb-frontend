import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/auth";
import api from "../api/axios";

export default function Login() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await api.post("/auth/login", { email, password });
      const accessToken = data.accessToken;
      const roleFromToken = data.role || data.user?.role;

      if (accessToken) localStorage.setItem("accessToken", accessToken);
      if (roleFromToken) login(roleFromToken);

      // Navigate
      if (roleFromToken === "Manager") navigate("/");
      else navigate("/sales");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Login failed. Check credentials or backend connection."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
      <form
        onSubmit={handleSubmit}
        className="w-80 bg-orange-500 rounded-lg p-5 space-y-4"
      >
        <h1 className="text-white text-center font-semibold text-lg">Login</h1>

        <input
          type="email"
          placeholder="Email"
          className="w-full px-3 py-2 rounded-lg outline-none"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full px-3 py-2 rounded-lg outline-none"
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="text-sm text-red-200 text-center">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-900 text-white py-2 rounded-lg hover:bg-orange-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}

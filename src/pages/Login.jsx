import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/auth";

export default function Login() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    let role = null;

    // 🔐 demo credentials (replace with API later)
    if (username === "manager" && password === "1234") {
      role = "Manager";
    } else if (username === "cashier" && password === "1234") {
      role = "Cashier";
    } else {
      setError("Invalid username or password");
      return;
    }

    // ✅ save role in Zustand
    login(role);

    // ✅ redirect by role
    if (role === "Manager") {
      navigate("/");
    } else {
      navigate("/sales");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
      <form
        onSubmit={handleSubmit}
        className="w-80 bg-orange-500 rounded-lg p-5 space-y-4"
      >
        <h1 className="text-white text-center font-semibold text-lg">
          Login
        </h1>

        <input
          type="text"
          placeholder="Username"
          className="w-full px-3 py-2 rounded-lg outline-none"
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full px-3 py-2 rounded-lg outline-none"
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && (
          <p className="text-sm text-red-200 text-center">{error}</p>
        )}

        <button
          type="submit"
          className="w-full bg-orange-900 text-white py-2 rounded-lg hover:bg-orange-800"
        >
          Login
        </button>
      </form>
    </div>
  );
}

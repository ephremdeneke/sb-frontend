import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/auth";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Ingredients from "./pages/Ingredients";
import Sales from "./pages/Sales";
import History from "./pages/History";
import Expenses from "./pages/Expenses";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import DashboardStock from "./pages/StockDashboard";
import StockIngredients from "./pages/StockIngredients";
import StockMovements from "./pages/StockMovements";
import StockHistory from "./pages/StockHistory";
import NotFound from "./pages/NotFound";
import NotificationContainer from "./components/Notification";
import api from "./api/axios";

export default function App() {
  const role = useAuthStore((s) => s.role); // should be "manager" | "cashier"
  const login = useAuthStore((s) => s.login);
  const logout = useAuthStore((s) => s.logout);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // ------------------ Persistent login ------------------
  useEffect(() => {
    async function restoreLogin() {
      try {
        const res = await api.post("/auth/refresh"); // cookie automatically sent
        const accessToken = res.data.accessToken;
        const roleFromToken = res.data.role ?? res.data.user?.role ?? null;

        if (!accessToken || !roleFromToken) {
          throw new Error("Invalid refresh response");
        }

        // restore access token
        localStorage.setItem("accessToken", accessToken);

        // restore auth state
        const label =
          res.data.user?.name ||
          res.data.user?.email ||
          res.data.user?.username ||
          roleFromToken;
        login(roleFromToken, label); // normalize inside store
      } catch (err) {
        localStorage.removeItem("accessToken");
        logout();
      } finally {
        setLoading(false);
      }
    }

    restoreLogin();
  }, [login, logout]);

  // ------------------ Responsive sidebar ------------------
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setSidebarOpen(false);
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  // ------------------ Show loader until auth restored ------------------
  if (loading) return <p className="text-center mt-10 text-sm text-slate-500">Loading...</p>;

  return (
    <div className="min-h-screen bg-[#f9fafb] text-slate-900">
      <Navbar onMenuClick={toggleSidebar} />
      <NotificationContainer />
      <div className="flex">
        {role && <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />}
        <main
          className={`flex-1 transition-all duration-300 ${
            role ? "lg:ml-72" : ""
          } px-4 sm:px-6 lg:px-8 py-6 pt-16 lg:pt-6`}
        >
          <div className="mx-auto w-full max-w-7xl">
            <Routes>
            {/* Login */}
            <Route path="/login" element={!role ? <Login /> : <Navigate to="/" />} />
            <Route
              path="/forgot-password"
              element={!role ? <ForgotPassword /> : <Navigate to="/" />}
            />

            {/* Dashboard accessible to both roles */}
            <Route element={<ProtectedRoute roles={["manager", "cashier", "stockman"]} />}>
              <Route path="/" element={<Dashboard />} />
            </Route>

            {/* Manager Routes */}
            <Route element={<ProtectedRoute roles={["manager"]} />}>
              <Route path="/products" element={<Products />} />
              <Route path="/ingredients" element={<Ingredients />} />
              <Route path="/expenses" element={<Expenses />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />
            </Route>


            {/* Cashier Routes */}
            <Route element={<ProtectedRoute roles={["cashier"]} />}>
              <Route path="/sales" element={<Sales />} />
              <Route path="/history" element={<History />} />
            </Route>

            {/* Stock Management Routes (Admin + Stock Man) */}
            <Route element={<ProtectedRoute roles={["manager", "stockman"]} />}>
              <Route path="/stock" element={<DashboardStock />} />
              <Route path="/stock/ingredients" element={<StockIngredients />} />
              <Route path="/stock/movements" element={<StockMovements />} />
              <Route path="/stock/history" element={<StockHistory />} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}
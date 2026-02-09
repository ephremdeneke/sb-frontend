import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/auth";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import Sales from "./pages/Sales";
import History from "./pages/History";
import Expenses from "./pages/Expenses";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
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
        const roleFromToken = res.data.role?.toLowerCase() || res.data.user?.role?.toLowerCase();

        if (!accessToken || !roleFromToken) {
          throw new Error("Invalid refresh response");
        }

        // restore access token
        localStorage.setItem("accessToken", accessToken);

        // restore auth state
        login(roleFromToken); // lowercase role
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
  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onMenuClick={toggleSidebar} />
      <NotificationContainer />
      <div className="flex">
        {role && <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />}
        <main
          className={`flex-1 transition-all duration-300 ${
            role ? "lg:ml-72" : ""
          } p-3 lg:p-4 pt-16 lg:pt-4`}
        >
          <Routes>
            {/* Login */}
            <Route path="/login" element={!role ? <Login /> : <Navigate to="/" />} />

            {/* Dashboard accessible to both roles */}
            <Route element={<ProtectedRoute roles={["manager", "cashier"]} />}>
              <Route path="/" element={<Dashboard />} />
            </Route>

            {/* Manager Routes */}
            <Route element={<ProtectedRoute roles={["manager"]} />}>
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/expenses" element={<Expenses />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />
            </Route>

            {/* Cashier Routes */}
            <Route element={<ProtectedRoute roles={["cashier"]} />}>
              <Route path="/sales" element={<Sales />} />
              <Route path="/history" element={<History />} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

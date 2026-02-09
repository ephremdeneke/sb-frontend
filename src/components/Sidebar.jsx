import React, { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  DollarSign,
  FileText,
  Settings,
  LogIn,
  LogOut,
  Coffee,
  X,
} from "lucide-react";
import { useAuthStore } from "../store/auth";

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const role = useAuthStore((s) => s.role); // "manager" | "cashier" | null
  const logout = useAuthStore((s) => s.logout);

  /* ---------------- Lock scroll on mobile ---------------- */

  useEffect(() => {
    document.body.style.overflow =
      isOpen && window.innerWidth < 1024 ? "hidden" : "unset";

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  /* ---------------- Navigation ---------------- */

  const baseItems = [
    { href: "/", icon: LayoutDashboard, label: t("nav.dashboard") },
  ];

  const managerItems = [
    { href: "/inventory", icon: Package, label: t("nav.inventory") },
    { href: "/expenses", icon: DollarSign, label: t("nav.expenses") },
    { href: "/reports", icon: FileText, label: t("nav.reports") },
    { href: "/settings", icon: Settings, label: t("nav.settings") },
  ];

  const cashierItems = [
    { href: "/sales", icon: ShoppingCart, label: t("nav.sales") },
    { href: "/history", icon: FileText, label: t("nav.history") },
  ];

  const navItems =
    role === "manager"
      ? [...baseItems, ...managerItems]
      : role === "cashier"
      ? [...baseItems, ...cashierItems]
      : baseItems;

  /* ---------------- Logout ---------------- */

  const handleLogout = async () => {
    try {
      await logout(); // calls backend, clears refresh cookie & store
      onClose?.();
      navigate("/login"); // optional but recommended
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed left-0 top-14 h-[calc(100vh-3.5rem)]
          bg-white border-r border-gray-200
          flex flex-col z-50
          transform transition-transform duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          w-64 lg:w-72 lg:translate-x-0
        `}
      >
        {/* Mobile close */}
        <div className="lg:hidden flex justify-end p-4 border-b">
          <button onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Logo */}
        <div className="p-4 border-b">
          <Link to="/" className="flex items-center gap-3">
            <div className="bg-primary-600 p-2 rounded-lg">
              <Coffee className="h-5 w-5 text-white" />
            </div>
            <h1 className="font-bold">{t("app.title")}</h1>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const active = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => window.innerWidth < 1024 && onClose()}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm
                  ${
                    active
                      ? "bg-primary-50 text-primary-700"
                      : "text-gray-600 hover:bg-gray-100"
                  }
                `}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Auth */}
        <div className="p-4 border-t">
          {role ? (
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100"
            >
              <LogOut className="h-5 w-5" />
              {t("auth.logout")}
            </button>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100"
            >
              <LogIn className="h-5 w-5" />
              {t("auth.login")}
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}

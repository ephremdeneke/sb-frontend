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
import { Button } from "./ui/button";

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
    { href: "/products", icon: Package, label: t("nav.products", { defaultValue: "Products" }) },
    { href: "/ingredients", icon: Coffee, label: t("nav.ingredients", { defaultValue: "Ingredients" }) },
    { href: "/expenses", icon: DollarSign, label: t("nav.expenses") },
    { href: "/reports", icon: FileText, label: t("nav.reports") },
    { href: "/settings", icon: Settings, label: t("nav.settings") },
  ];

  const cashierItems = [
    { href: "/sales", icon: ShoppingCart, label: t("nav.sales") },
    { href: "/history", icon: FileText, label: t("nav.history") },
  ];

  const stockItems = [
    {
      href: "/stock",
      icon: LayoutDashboard,
      label: t("nav.stock_dashboard", { defaultValue: "Stock Dashboard" }),
    },
    {
      href: "/stock/ingredients",
      icon: Package,
      label: t("nav.stock_ingredients", { defaultValue: "Ingredient Inventory" }),
    },
    {
      href: "/stock/movements",
      icon: DollarSign,
      label: t("nav.stock_movements", { defaultValue: "Stock In / Out" }),
    },
    {
      href: "/stock/history",
      icon: FileText,
      label: t("nav.stock_history", { defaultValue: "Stock History" }),
    },
  ];

  const navItems =
    role === "manager"
      ? [...baseItems, ...managerItems, ...stockItems]
      : role === "cashier"
      ? [...baseItems, ...cashierItems]
      : role === "stockman"
      ? [...baseItems, ...stockItems]
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
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed left-0 top-14 h-[calc(100vh-3.5rem)]
          bg-white border-r border-slate-200
          flex flex-col z-50
          transform transition-transform duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          w-64 lg:w-72 lg:translate-x-0
        `}
      >
        {/* Mobile close */}
        <div className="lg:hidden flex justify-end p-4 border-b border-slate-200">
          <Button variant="ghost" size="sm" onClick={onClose} leftIcon={X}>
            Close
          </Button>
        </div>

        {/* Logo */}
        <div className="p-4 border-b border-slate-200">
          <Link to="/" className="flex items-center gap-3">
            <div className="bg-primary-600 p-2 rounded-2xl shadow-sm">
              <Coffee className="h-5 w-5 text-white" />
            </div>
            <h1 className="font-semibold text-slate-900">{t("app.title")}</h1>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 custom-scrollbar overflow-auto">
          {navItems.map((item) => {
            const active = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => window.innerWidth < 1024 && onClose()}
                className={`flex items-center gap-3 px-3 py-2 rounded-2xl text-sm font-semibold transition
                  ${
                    active
                      ? "bg-primary-50 text-primary-700 ring-1 ring-inset ring-primary-600/15"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Auth */}
        <div className="p-4 border-t border-slate-200">
          {role ? (
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full justify-start"
              leftIcon={LogOut}
            >
              {t("auth.logout")}
            </Button>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-3 px-3 py-2 rounded-2xl text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900"
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
import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  FileText,
  Settings,
  LogOut,
  Coffee,
  X,
} from "lucide-react";
import { useAuthStore } from "../store/auth";

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const role = useAuthStore((s) => s.role);
  const { t } = useTranslation();

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (isOpen && window.innerWidth < 1024) {
        const sidebar = document.getElementById('mobile-sidebar');
        if (sidebar && !sidebar.contains(e.target)) {
          onClose();
        }
      }
    };

    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Define role-based navigation
  const baseItems = [{ 
    href: "/", 
    icon: LayoutDashboard, 
    label: t('nav.dashboard'),
    key: 'dashboard'
  }];

  const managerItems = [
    { href: "/inventory", icon: Package, label: t('nav.inventory'), key: 'inventory' },
    { href: "/expenses", icon: DollarSign, label: t('nav.expenses'), key: 'expenses' },
    { href: "/reports", icon: FileText, label: t('nav.reports'), key: 'reports' },
    { href: "/settings", icon: Settings, label: t('nav.settings'), key: 'settings' },
  ];

  const cashierItems = [
    { href: "/sales", icon: ShoppingCart, label: t('nav.sales'), key: 'sales' },
    { href: "/customers", icon: Users, label: t('nav.customers'), key: 'customers' },
  ];

  // Merge navigation based on role
  const navItems =
    role === "Manager"
      ? [...baseItems, ...managerItems]
      : role === "Cashier"
      ? [...baseItems, ...cashierItems]
      : baseItems;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside 
        id="mobile-sidebar"
        className={`
          fixed left-0 top-14 h-[calc(100vh-3.5rem)] bg-white border-r border-gray-200 flex flex-col z-50
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          w-64 lg:w-72 lg:translate-x-0 lg:fixed lg:z-auto lg:top-14
          ${role ? 'block' : 'hidden'}
        `}
      >
        {/* Mobile Close Button */}
        <div className="lg:hidden flex justify-end p-4 border-b border-gray-200">
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label={t('ui.close')}
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* Logo Section */}
        <div className="p-4 lg:p-6 border-b border-gray-200">
          <Link 
            to="/" 
            className="flex items-center gap-3"
            onClick={() => window.innerWidth < 1024 && onClose()}
          >
            <div className="bg-primary-600 rounded-lg p-2 flex-shrink-0">
              <Coffee className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm lg:text-lg font-bold text-gray-900 truncate">
                {t('app.title')}
              </h1>
              <p className="text-xs text-gray-500 hidden lg:block">
                {t('app.subtitle')}
              </p>
            </div>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-2 lg:py-4 overflow-y-auto space-y-1 px-2 lg:px-3 custom-scrollbar">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            const base =
              "flex items-center gap-2 lg:gap-3 px-2 lg:px-3 py-2 lg:py-2.5 rounded-lg text-xs lg:text-sm font-medium transition-all";
            const active = "bg-primary-50 text-primary-700 shadow-sm";
            const inactive = "text-gray-600 hover:bg-gray-100 hover:text-gray-900";
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`${base} ${isActive ? active : inactive}`}
                onClick={() => window.innerWidth < 1024 && onClose()}
              >
                <item.icon className="h-4 w-4 lg:h-5 lg:w-5 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="p-3 lg:p-4 border-t border-gray-200">
          <div className="flex items-center gap-2 lg:gap-3 mb-3 px-1 lg:px-2">
            <div className="h-8 w-8 lg:h-9 lg:w-9 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0">
              <span className="text-xs lg:text-sm font-medium text-white">
                {role?.[0] || "U"}
              </span>
            </div>
            <div className="flex-1 min-w-0 hidden lg:block">
              <p className="text-sm font-medium text-gray-900 truncate">
                {role || "User"}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {role?.toLowerCase()}@bakery.com
              </p>
            </div>
          </div>
          <button
            className="w-full justify-start gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-2 lg:px-3 py-2 rounded-lg flex items-center text-xs lg:text-sm"
            type="button"
          >
            <LogOut className="h-4 w-4 flex-shrink-0" />
            <span className="hidden lg:inline">{t('auth.signOut')}</span>
            <span className="lg:hidden">{t('auth.exit')}</span>
          </button>
        </div>
      </aside>
    </>
  );
}


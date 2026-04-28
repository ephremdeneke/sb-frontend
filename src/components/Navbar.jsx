import { Menu } from "lucide-react";
import { FiMoon, FiSun } from "react-icons/fi";
import { useAuthStore } from "../store/auth";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";
import { Button } from "./ui/button";
import { useTheme } from "../context/ThemeContext";

export default function Navbar({ onMenuClick }) {
  const role = useAuthStore((s) => s.role);
  const { t } = useTranslation();
  const { isDark, toggleTheme } = useTheme();

  // Get translated role name, fallback to original role if translation not found
  const translatedRole = role
    ? t(`roles.${role.toLowerCase()}`, { defaultValue: role })
    : "";
  
  return (
    <header className="fixed top-0 left-0 right-0 w-full border-b border-slate-200 bg-white/85 backdrop-blur z-30">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Hamburger Menu Button - Only show when user is logged in and on mobile */}
          {role && (
            <Button
              variant="outline"
              size="sm"
              onClick={onMenuClick}
              aria-label={t("ui.menu")}
              className="lg:hidden px-2"
              leftIcon={Menu}
            >
              Menu
            </Button>
          )}
          
          <div className="text-base font-semibold tracking-tight text-slate-900">
            <span className="text-primary-600">{t("app.title")}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 lg:gap-3">
          <LanguageSwitcher />
          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-200"
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? <FiSun className="w-4 h-4" /> : <FiMoon className="w-4 h-4" />}
          </button>
          {role && (
            <span className="hidden sm:inline text-xs bg-primary-50 text-primary-700 px-2.5 py-1 rounded-full ring-1 ring-inset ring-primary-600/20 ml-2 font-semibold">
              {translatedRole}
            </span>
          )}
        </div>
      </div>
    </header>
  )
}

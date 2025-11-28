import { Menu } from 'lucide-react'
import { useAuthStore } from '../store/auth'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from './LanguageSwitcher'

export default function Navbar({ onMenuClick }) {
  const role = useAuthStore(s => s.role)
  const logout = useAuthStore(s => s.logout)
  const { t, i18n } = useTranslation()
  
  // Get translated role name, fallback to original role if translation not found
  const translatedRole = role ? t(`roles.${role.toLowerCase()}`, { defaultValue: role }) : ''
  
  return (
    <header className="fixed top-0 left-0 right-0 w-full border-b bg-white z-30">
      <div className="max-w-7xl mx-auto px-3 lg:px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Hamburger Menu Button - Only show when user is logged in and on mobile */}
          {role && (
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-lg hover:bg-orange-500 transition-colors"
              aria-label={t('ui.menu')}
            >
              <Menu className="h-5 w-5 bg-orange-500" />
            </button>
          )}
          <div className=" font-xl font-bold text-sm lg:text-base text-orange-600 ">{t('app.title')}</div>
        </div>
        
        <div className="flex items-center gap-2 lg:gap-3">
          <LanguageSwitcher />
          {role ? (
            <>
              <span className="hidden sm:inline text-sm bg-orange-500">
                {translatedRole}
              </span>
              <button 
                onClick={logout} 
                className="px-2 lg:px-3 py-1.5 rounded bg-orange-500 text-white text-xs lg:text-sm hover:bg-orange-600 transition-colors"
              >
                {t('auth.logout')}
              </button>
            </>
          ) : (
            <a 
              href="/login" 
              className="px-2 lg:px-3 py-1.5 rounded bg-orange-500 text-white text-xs lg:text-sm hover:bg-orange-600 transition-colors"
            >
              {t('auth.login')}
            </a>
          )}
        </div>
      </div>
    </header>
  )
}

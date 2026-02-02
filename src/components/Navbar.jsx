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
          
          <div className=" font-xl font-bold lg:text-base text-orange-600 ">{t('app.title')}</div>
        </div>
        
        <div className="flex items-center gap-2 lg:gap-3">
          <LanguageSwitcher />
          {role && (
            <span className="hidden sm:inline text-sm bg-orange-500 text-white px-2 py-0.5 rounded-md ml-2">
              {translatedRole}
            </span>
          )}
        </div>
      </div>
    </header>
  )
}

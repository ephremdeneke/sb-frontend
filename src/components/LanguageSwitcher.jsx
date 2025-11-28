import { useTranslation } from 'react-i18next'
import { Languages } from "lucide-react";

export default function LanguageSwitcher() {
  const { i18n } = useTranslation()

  const changeLang = (lng) => {
    i18n.changeLanguage(lng)
    document.documentElement.lang = lng
  }

  const active = i18n.resolvedLanguage || i18n.language || 'en'

  return (
    <button
      onClick={() => changeLang(active === 'en' ? 'am' : 'en')}
      className="inline-flex items-center gap-1 px-3 py-1 text-sm rounded bg-orange-500 text-gray-800 hover:bg-orange-600 dark:bg-white-700 dark:text-white dark:hover:bg-gray-600"
    >
      <Languages size={16} />
      <span>{active === 'en' ? 'EN' : 'አማ'}</span>
    </button>
  )
}

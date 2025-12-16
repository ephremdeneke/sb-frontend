import { useEffect } from 'react'
import { useNotificationStore } from '../store/notifications'

export default function NotificationContainer() {
  const notifications = useNotificationStore(s => s.notifications)
  const removeNotification = useNotificationStore(s => s.removeNotification)

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return '✓'
      case 'warning':
        return '⚠'
      case 'error':
        return '✕'
      default:
        return 'ℹ'
    }
  }

  const getBgColor = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800'
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800'
    }
  }

  const getIconBgColor = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-100 text-green-600'
      case 'warning':
        return 'bg-yellow-100 text-yellow-600'
      case 'error':
        return 'bg-red-100 text-red-600'
      default:
        return 'bg-blue-100 text-blue-600'
    }
  }

  if (notifications.length === 0) return null

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2 max-w-md w-full">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={`${getBgColor(notification.type)} border rounded-lg shadow-lg p-4 flex items-start gap-3 animate-slide-in`}
        >
          <div className={`${getIconBgColor(notification.type)} rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0`}>
            {getIcon(notification.type)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm mb-1">{notification.title}</div>
            <div className="text-sm opacity-90">{notification.message}</div>
          </div>
          <button
            onClick={() => removeNotification(notification.id)}
            className="text-gray-400 hover:text-gray-600 flex-shrink-0"
            aria-label="Close notification"
          >
            ✕
          </button>
        </div>
      ))}
      <style>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}


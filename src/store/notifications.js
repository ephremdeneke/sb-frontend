import { create } from 'zustand'

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  
  addNotification: (notification) => {
    const id = crypto.randomUUID()
    const newNotification = {
      id,
      type: notification.type || 'info', // 'success', 'warning', 'error', 'info'
      title: notification.title,
      message: notification.message,
      timestamp: Date.now(),
      autoClose: notification.autoClose !== false, // Default to true
      duration: notification.duration || 5000, // 5 seconds default
    }
    
    set({ notifications: [...get().notifications, newNotification] })
    
    // Auto remove notification after duration
    if (newNotification.autoClose) {
      setTimeout(() => {
        get().removeNotification(id)
      }, newNotification.duration)
    }
    
    return id
  },
  
  removeNotification: (id) => {
    set({ notifications: get().notifications.filter(n => n.id !== id) })
  },
  
  clearAll: () => {
    set({ notifications: [] })
  },
  
  // Helper methods for different notification types
  notifyLowStock: (productName, currentStock, threshold) => {
    return get().addNotification({
      type: 'warning',
      title: 'Low Stock Alert',
      message: `${productName} is running low! Current stock: ${currentStock} (threshold: ${threshold})`,
      duration: 8000, // Show for 8 seconds
    })
  },
  
  notifyOutOfStock: (productName) => {
    return get().addNotification({
      type: 'error',
      title: 'Out of Stock',
      message: `${productName} is out of stock!`,
      duration: 10000, // Show for 10 seconds
    })
  },
  
  notifySuccess: (title, message) => {
    return get().addNotification({
      type: 'success',
      title,
      message,
      duration: 3000,
    })
  },
  
  notifyError: (title, message) => {
    return get().addNotification({
      type: 'error',
      title,
      message,
      duration: 6000,
    })
  },
}))


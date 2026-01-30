import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/auth'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Inventory from './pages/Inventory'
import Sales from './pages/Sales'
import History from './pages/History'
import Expenses from './pages/Expenses'
import Reports from './pages/Reports'
import NotFound from './pages/NotFound'
import Settings from './pages/Settings'
import NotificationContainer from './components/Notification'

export default function App() {
  const role = useAuthStore(s => s.role)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Close sidebar when screen size changes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    handleResize() // Check initial size

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const closeSidebar = () => {
    setSidebarOpen(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onMenuClick={toggleSidebar} />
      <NotificationContainer />
      <div className="flex">
        {role && (
          <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
        )}
        <main className={`flex-1 transition-all duration-300 ${role ? 'lg:ml-72' : ''} p-3 lg:p-4 pt-16 lg:pt-4`}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<ProtectedRoute roles={["Manager"]} />}> 
              <Route path="/" element={<Dashboard />} />
            </Route>
            <Route element={<ProtectedRoute roles={["Manager"]} />}> 
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/expenses" element={<Expenses />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
            <Route element={<ProtectedRoute roles={["Cashier"]} />}> 
              <Route path="/sales" element={<Sales />} />
              <Route path="/history" element={<History />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}


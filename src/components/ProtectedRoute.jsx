import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/auth'

export default function ProtectedRoute({ roles }){
  const role = useAuthStore(s=>s.role)
  const loc = useLocation()
  if(!role) return <Navigate to="/login" state={{ from: loc }} replace />
  if(roles && !roles.includes(role)) return <Navigate to="/" replace />
  return <Outlet />
}

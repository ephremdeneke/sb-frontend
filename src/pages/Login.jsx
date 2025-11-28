import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/auth'

export default function Login(){
  const login = useAuthStore(s=>s.login)
  const nav = useNavigate()
  const loc = useLocation()
  const from = loc.state?.from?.pathname || '/'
  function choose(role){
    login(role)
    nav(from, { replace: true })
  }
  return (
    <div className="h-[80vh] grid place-items-center border-radius-lg">
      <div className="w-80 bg-orange border rounded-lg p-4 space-y-3  bg-orange-500">
        <h1 className="text-lg font-semibold font-xl text-white text-center">Select role</h1>
        <button onClick={()=>choose('Manager')} className="w-full px-3 py-2 bg-orange-900 text-white rounded-lg border border-white-200 hover:bg-orange-800">Manager</button>
        <button onClick={()=>choose('Cashier')} className="w-full px-3 py-2 bg-orange-900 text-white rounded-lg border border-white-200 hover:bg-orange-800">Cashier</button>
      </div>
    </div>
  );
}

import { create } from 'zustand' // 

export const useAuthStore = create((set)=>({
  role: null,
  login: (role)=> set({ role }),
  logout: ()=> set({ role: null })
}))

import { create } from 'zustand' 

export const useAuthStore = create((set)=>({
  role: null,
  login: (role)=> set({ role }),
  logout: ()=> set({ role: null })
}))
// this page is to manage authentication state using Zustand store
// how is working with the Login.jsx page?
// In the Login.jsx page, instead of directly navigating based on hardcoded credentials, you would use the useAuthStore to set the user's role upon successful login. 
// For example, after verifying the username and password, you would call useAuthStore.getState().login('manager') or useAuthStore.getState().login('cashier') accordingly.
// Then, you can navigate to the respective pages based on the role stored in the Zustand store.
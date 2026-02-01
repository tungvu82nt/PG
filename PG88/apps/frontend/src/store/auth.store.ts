import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  token: string | null
  user: {
    id: number
    username: string
    email: string
    role: string
    balance: number
  } | null
  isAuthenticated: boolean
  isAdmin: boolean
  setToken: (token: string) => void
  setUser: (user: any) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      isAdmin: false,
      setToken: (token) => {
        set({ token, isAuthenticated: true })
      },
      setUser: (user) => {
        set({
          user,
          isAdmin: user.role === 'admin',
          isAuthenticated: true
        })
      },
      logout: () => {
        set({ token: null, user: null, isAuthenticated: false, isAdmin: false })
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user
      })
    }
  )
)

export const getToken = () => {
  const state = useAuthStore.getState()
  return state.token
}

export const isAuthenticated = () => {
  const state = useAuthStore.getState()
  return state.isAuthenticated
}

export const isAdminUser = () => {
  const state = useAuthStore.getState()
  return state.isAdmin
}
import { create } from 'zustand'
import type { Role } from '@prisma/client'

interface AuthUser {
  id: string
  email: string
  role: Role
  lang: string
}

interface AuthStore {
  user: AuthUser | null
  setUser: (user: AuthUser | null) => void
  clearUser: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
}))

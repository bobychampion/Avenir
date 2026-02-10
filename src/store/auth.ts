import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  isAdmin: boolean;
  adminId: string | null;
  setAdmin: (id: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAdmin: false,
      adminId: null,
      setAdmin: (id) => set({ isAdmin: true, adminId: id }),
      logout: () => set({ isAdmin: false, adminId: null })
    }),
    { name: 'avenir-auth' }
  )
);

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SessionState {
  activeSessionId: string | null;
  setActiveSession: (id: string | null) => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      activeSessionId: null,
      setActiveSession: (id) => set({ activeSessionId: id })
    }),
    { name: 'avenir-session' }
  )
);

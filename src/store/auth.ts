import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Profile, Subscription } from '@/types';

interface AuthState {
  user: Profile | null;
  subscription: Subscription | null;
  isLoading: boolean;
  setUser: (user: Profile | null) => void;
  setSubscription: (sub: Subscription | null) => void;
  setLoading: (loading: boolean) => void;
  isAdmin: () => boolean;
  isSubscribed: () => boolean;
  reset: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      subscription: null,
      // Start TRUE — always wait for AuthProvider to confirm session before rendering guards
      isLoading: true,
      setUser: (user) => set({ user }),
      setSubscription: (subscription) => set({ subscription }),
      setLoading: (isLoading) => set({ isLoading }),
      isAdmin: () => get().user?.role === 'admin',
      isSubscribed: () => get().subscription?.status === 'active',
      reset: () => set({ user: null, subscription: null, isLoading: false }),
    }),
    {
      name: 'golf-charity-auth',
      // Persist user + subscription so returning users see data immediately
      partialize: (s) => ({ user: s.user, subscription: s.subscription }),
      // After rehydration from localStorage, keep isLoading=true until AuthProvider confirms
      onRehydrateStorage: () => (state) => {
        if (state) state.isLoading = true;
      },
    }
  )
);
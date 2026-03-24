import { create } from 'zustand';
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

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  subscription: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setSubscription: (subscription) => set({ subscription }),
  setLoading: (isLoading) => set({ isLoading }),
  isAdmin: () => get().user?.role === 'admin',
  isSubscribed: () => get().subscription?.status === 'active',
  reset: () => set({ user: null, subscription: null, isLoading: false }),
}));
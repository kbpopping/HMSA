import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthAPI, Role } from '../api/endpoints';

type User = {
  role: Role;
  hospital_id?: string | null;
};

type AuthState = {
  user: User | null;
  status: 'idle' | 'loading' | 'authed';
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  tryRefresh: () => Promise<void>;
};

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      status: 'idle',

      async login(email, password) {
        set({ status: 'loading' });
        try {
          const response = await AuthAPI.login(email, password);
          const user = {
            role: response.role,
            hospital_id: response.hospital_id ?? null,
          };
          set({
            user,
            status: 'authed',
          });
          return user;
        } catch (error) {
          set({ status: 'idle' });
          throw error;
        }
      },

      async logout() {
        try {
          await AuthAPI.logout();
        } catch (error) {
          // Ignore logout errors in mock mode
        } finally {
          set({ user: null, status: 'idle' });
        }
      },

      async tryRefresh() {
        try {
          await AuthAPI.refresh();
          // Only update status if we have a user
          set((state) => {
            if (state.user) {
              return { status: 'authed' };
            }
            return state;
          });
        } catch (error) {
          // Only clear user if we don't have one
          set((state) => {
            if (!state.user) {
              return { status: 'idle', user: null };
            }
            return state;
          });
        }
      },
    }),
    {
      name: 'hospital-auth-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
);


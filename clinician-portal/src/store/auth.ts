import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthAPI, type User } from '../api/endpoints';

type AuthState = {
  user: User | null;
  status: 'idle' | 'loading' | 'authenticated';
  needsPasswordChange: boolean;
  onboardingComplete: boolean;
  
  // Actions
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  tryRefresh: () => Promise<void>;
  checkFirstLogin: () => Promise<void>;
  markPasswordChanged: () => void;
  markOnboardingComplete: () => void;
  updateUser: (userData: Partial<User>) => void;
  hasPermission: (permission: string) => boolean;
};

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      status: 'idle',
      needsPasswordChange: false,
      onboardingComplete: false,
      
      login: async (email: string, password: string) => {
        set({ status: 'loading' });
        try {
          const response = await AuthAPI.login(email, password);
          const user = response.user;
          
          set({
            user,
            status: 'authenticated',
            needsPasswordChange: user.needsPasswordChange ?? false,
            onboardingComplete: user.onboardingComplete ?? false,
          });
          
          return user;
        } catch (error) {
          set({ status: 'idle', user: null });
          throw error;
        }
      },
      
      logout: async () => {
        try {
          await AuthAPI.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          set({
            user: null,
            status: 'idle',
            needsPasswordChange: false,
            onboardingComplete: false,
          });
        }
      },
      
      tryRefresh: async () => {
        try {
          await AuthAPI.refresh();
          set({ status: 'authenticated' });
        } catch (error) {
          set({ status: 'idle', user: null });
        }
      },
      
      checkFirstLogin: async () => {
        try {
          const result = await AuthAPI.checkFirstLogin();
          set({
            needsPasswordChange: result.needsPasswordChange,
            onboardingComplete: result.onboardingComplete,
          });
        } catch (error) {
          console.error('Check first login error:', error);
        }
      },
      
      markPasswordChanged: () => {
        set({ needsPasswordChange: false });
        const { user } = get();
        if (user) {
          set({
            user: {
              ...user,
              needsPasswordChange: false,
            },
          });
        }
      },
      
      markOnboardingComplete: () => {
        set({ onboardingComplete: true });
        const { user } = get();
        if (user) {
          set({
            user: {
              ...user,
              onboardingComplete: true,
            },
          });
        }
      },
      
      updateUser: (userData: Partial<User>) => {
        const { user } = get();
        if (user) {
          set({
            user: {
              ...user,
              ...userData,
            },
          });
        }
      },
      
      hasPermission: (permission: string) => {
        const { user } = get();
        if (!user || !user.permissions) return false;
        return user.permissions.includes(permission);
      },
    }),
    {
      name: 'clinician-auth-storage',
      partialize: (state) => ({
        user: state.user,
        status: state.status,
        needsPasswordChange: state.needsPasswordChange,
        onboardingComplete: state.onboardingComplete,
      }),
    }
  )
);


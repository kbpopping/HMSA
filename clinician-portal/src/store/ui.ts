import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type UIState = {
  theme: 'light' | 'dark';
  sidebarCollapsed: boolean;
  
  // Actions
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
};

export const useUI = create<UIState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      sidebarCollapsed: false,
      
      setTheme: (theme: 'light' | 'dark') => {
        set({ theme });
        // Apply theme to document
        if (theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },
      
      toggleTheme: () => {
        const { theme, setTheme } = get();
        setTheme(theme === 'light' ? 'dark' : 'light');
      },
      
      setSidebarCollapsed: (collapsed: boolean) => {
        set({ sidebarCollapsed: collapsed });
      },
      
      toggleSidebar: () => {
        const { sidebarCollapsed } = get();
        set({ sidebarCollapsed: !sidebarCollapsed });
      },
    }),
    {
      name: 'clinician-ui-storage',
    }
  )
);

// Initialize theme on app load
if (typeof window !== 'undefined') {
  const storedTheme = localStorage.getItem('clinician-ui-storage');
  if (storedTheme) {
    try {
      const parsed = JSON.parse(storedTheme);
      if (parsed.state?.theme === 'dark') {
        document.documentElement.classList.add('dark');
      }
    } catch (e) {
      // Ignore parse errors
    }
  }
}


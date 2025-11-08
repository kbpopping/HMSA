import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type NotificationType = 
  | 'system_abnormal'
  | 'role_added'
  | 'role_deleted'
  | 'role_assigned'
  | 'role_changed'
  | 'hospital_admin_added'
  | 'hospital_admin_deleted'
  | 'hospital_added'
  | 'hospital_deleted'
  | 'user_added'
  | 'user_deleted'
  | 'user_role_assigned'
  | 'user_role_removed'
  | 'password_changed'
  | 'new_login'
  | 'n8n_workflow_healthy'
  | 'n8n_workflow_error'
  | 'n8n_workflow_warning'
  | 'n8n_workflow_running';

export type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  route?: string; // Route to navigate to when clicked
  metadata?: Record<string, any>; // Additional data like user ID, hospital ID, etc.
};

type NotificationState = {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAllNotifications: () => void;
  getUnreadCount: () => number;
};

const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const useNotifications = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],

      addNotification: (notification) => {
        const newNotification: Notification = {
          ...notification,
          id: generateId(),
          timestamp: new Date().toISOString(),
          read: false,
        };
        set((state) => ({
          notifications: [newNotification, ...state.notifications],
        }));
      },

      markAsRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        }));
      },

      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        }));
      },

      deleteNotification: (id) => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }));
      },

      clearAllNotifications: () => {
        set({ notifications: [] });
      },

      getUnreadCount: () => {
        return get().notifications.filter((n) => !n.read).length;
      },
    }),
    {
      name: 'notifications-storage',
    }
  )
);


import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type NotificationType = 
  | 'appointment_created'
  | 'appointment_cancelled'
  | 'appointment_confirmed'
  | 'appointment_no_show'
  | 'patient_added'
  | 'patient_updated'
  | 'clinician_added'
  | 'template_created'
  | 'template_updated'
  | 'notification_failed'
  | 'reminder_sent'
  | 'system_alert';

export type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  route?: string; // Route to navigate to when clicked
  metadata?: Record<string, any>; // Additional data like appointment ID, patient ID, etc.
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
      name: 'hospital-notifications-storage',
    }
  )
);


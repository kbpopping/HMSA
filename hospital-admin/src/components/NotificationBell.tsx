import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications, Notification, NotificationType } from '../store/notifications';
import clsx from 'clsx';

const NotificationBell = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const { notifications, markAsRead, markAllAsRead, deleteNotification, getUnreadCount } = useNotifications();
  const unreadCount = getUnreadCount();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    if (notification.route) {
      navigate(notification.route);
      setIsOpen(false);
    }
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'appointment_created':
      case 'appointment_confirmed':
        return 'event';
      case 'appointment_cancelled':
      case 'appointment_no_show':
        return 'event_busy';
      case 'patient_added':
      case 'patient_updated':
        return 'people';
      case 'clinician_added':
        return 'local_hospital';
      case 'template_created':
      case 'template_updated':
        return 'description';
      case 'notification_failed':
        return 'error';
      case 'reminder_sent':
        return 'notifications';
      case 'system_alert':
        return 'warning';
      default:
        return 'notifications';
    }
  };

  const getNotificationColor = (type: NotificationType) => {
    switch (type) {
      case 'notification_failed':
      case 'system_alert':
        return 'text-red-500 dark:text-red-400';
      case 'appointment_cancelled':
      case 'appointment_no_show':
        return 'text-yellow-500 dark:text-yellow-400';
      case 'appointment_confirmed':
      case 'reminder_sent':
        return 'text-green-500 dark:text-green-400';
      default:
        return 'text-primary';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors text-foreground-light dark:text-foreground-dark touch-manipulation"
        aria-label="Notifications"
      >
        <span className="material-symbols-outlined text-xl sm:text-2xl">notifications</span>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-xs font-bold text-white bg-red-500 rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] sm:w-80 lg:w-96 max-w-sm bg-card-light dark:bg-card-dark rounded-xl shadow-lg border border-border-light dark:border-border-dark z-50 max-h-[80vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border-light dark:border-border-dark">
            <h3 className="text-lg font-bold text-foreground-light dark:text-foreground-dark">
              Notifications
            </h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-primary hover:text-primary/80 transition-colors touch-manipulation"
                >
                  Mark all as read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg hover:bg-background-light dark:hover:bg-background-dark text-foreground-light dark:text-foreground-dark touch-manipulation"
                aria-label="Close"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-subtle-light dark:text-subtle-dark">
                <span className="material-symbols-outlined text-4xl mb-2 opacity-50">notifications_off</span>
                <p className="text-sm">No notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-border-light dark:divide-border-dark">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={clsx(
                      'p-4 cursor-pointer transition-colors hover:bg-background-light dark:hover:bg-background-dark',
                      !notification.read && 'bg-primary/5 dark:bg-primary/10'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={clsx(
                          'flex-shrink-0 p-2 rounded-lg bg-background-light dark:bg-background-dark',
                          getNotificationColor(notification.type)
                        )}
                      >
                        <span className="material-symbols-outlined text-lg">
                          {getNotificationIcon(notification.type)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm text-foreground-light dark:text-foreground-dark mb-1">
                              {notification.title}
                            </p>
                            <p className="text-xs text-subtle-light dark:text-subtle-dark line-clamp-2">
                              {notification.message}
                            </p>
                          </div>
                          {!notification.read && (
                            <div className="flex-shrink-0 w-2 h-2 bg-primary rounded-full mt-1" />
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-subtle-light dark:text-subtle-dark">
                            {formatTime(notification.timestamp)}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                            className="p-1 rounded hover:bg-background-light dark:hover:bg-background-dark text-subtle-light dark:text-subtle-dark hover:text-foreground-light dark:hover:text-foreground-dark touch-manipulation"
                            aria-label="Delete notification"
                          >
                            <span className="material-symbols-outlined text-sm">delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;


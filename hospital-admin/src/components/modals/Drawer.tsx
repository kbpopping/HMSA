import { ReactNode, useEffect } from 'react';
import clsx from 'clsx';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  position?: 'left' | 'right' | 'bottom';
  className?: string;
}

/**
 * Drawer - Mobile drawer component (slides in from side or bottom)
 * 
 * Note: For production, consider using @radix-ui/react-dialog for better accessibility
 */
const Drawer = ({
  isOpen,
  onClose,
  title,
  children,
  position = 'right',
  className,
}: DrawerProps) => {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const positionClasses = {
    left: 'left-0 top-0 h-full w-full sm:w-96',
    right: 'right-0 top-0 h-full w-full sm:w-96',
    bottom: 'bottom-0 left-0 right-0 h-[80vh] w-full',
  };

  const slideClasses = {
    left: isOpen ? 'translate-x-0' : '-translate-x-full',
    right: isOpen ? 'translate-x-0' : 'translate-x-full',
    bottom: isOpen ? 'translate-y-0' : 'translate-y-full',
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer Content */}
      <div
        className={clsx(
          'fixed bg-card-light dark:bg-card-dark shadow-lg',
          'border border-border-light dark:border-border-dark',
          positionClasses[position],
          slideClasses[position],
          'transition-transform duration-300 ease-in-out',
          className
        )}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border-light dark:border-border-dark">
            <h2 className="text-xl font-bold text-foreground-light dark:text-foreground-dark">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-background-light dark:hover:bg-background-dark text-foreground-light dark:text-foreground-dark transition-colors"
              aria-label="Close"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        )}

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto h-full">{children}</div>
      </div>
    </div>
  );
};

export default Drawer;


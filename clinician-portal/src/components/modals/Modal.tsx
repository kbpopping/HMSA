import { ReactNode, useEffect } from 'react';
import clsx from 'clsx';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

/**
 * Modal - Dialog modal component using Radix Dialog pattern
 * 
 * Note: For production, consider using @radix-ui/react-dialog for better accessibility
 */
const Modal = ({ isOpen, onClose, title, children, size = 'md', className }: ModalProps) => {
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

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal Content */}
      <div
        className={clsx(
          'relative z-50 w-full bg-card-light dark:bg-card-dark rounded-xl shadow-lg',
          'border border-border-light dark:border-border-dark',
          'max-h-[90vh] flex flex-col',
          sizeClasses[size],
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Fixed */}
        {title && (
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border-light dark:border-border-dark flex-shrink-0">
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

        {/* Content - Scrollable */}
        <div className="p-4 sm:p-6 max-h-[calc(100vh-200px)] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

export default Modal;


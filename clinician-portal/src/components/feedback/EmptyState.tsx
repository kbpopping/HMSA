import { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: string;
  message?: string;
  title?: string;
  description?: string;
  action?: ReactNode;
}

/**
 * EmptyState - Empty state component with icon, message/title, description, and optional action
 */
const EmptyState = ({ icon = 'inbox', message, title, description, action }: EmptyStateProps) => {
  const displayText = message || title || 'No data available';
  
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {icon && (
        <span className="material-symbols-outlined text-6xl text-subtle-light dark:text-subtle-dark mb-4 opacity-50">
          {icon}
        </span>
      )}
      <h3 className="text-lg font-semibold text-foreground-light dark:text-foreground-dark mb-2">
        {displayText}
      </h3>
      {description && (
        <p className="text-sm text-subtle-light dark:text-subtle-dark mb-6 max-w-md">
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
};

export default EmptyState;


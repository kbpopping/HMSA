import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

/**
 * PageHeader - Standard page header component
 * 
 * Features:
 * - Title and optional subtitle
 * - Action buttons area (right-aligned)
 * - Responsive design
 */
const PageHeader = ({ title, subtitle, actions }: PageHeaderProps) => {
  return (
    <div className="mb-6 sm:mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground-light dark:text-foreground-dark">
            {title}
          </h1>
          {subtitle && (
            <p className="text-subtle-light dark:text-subtle-dark mt-2 text-sm sm:text-base">
              {subtitle}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;


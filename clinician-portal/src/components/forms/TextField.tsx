import { forwardRef } from 'react';
import clsx from 'clsx';

interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

/**
 * TextField - Text input component with label and error handling
 */
const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, error, helperText, className, id, ...props }, ref) => {
    const inputId = id || `text-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-foreground-light dark:text-foreground-dark mb-2"
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          type="text"
          className={clsx(
            'w-full h-12 rounded-lg border px-4 text-base text-foreground-light dark:text-foreground-dark',
            'placeholder-subtle-light dark:placeholder-subtle-dark',
            'bg-background-light dark:bg-background-dark',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
            'transition-colors',
            error
              ? 'border-red-500 dark:border-red-400'
              : 'border-border-light dark:border-border-dark',
            props.disabled && 'opacity-60 cursor-not-allowed',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-500 dark:text-red-400">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-sm text-subtle-light dark:text-subtle-dark">{helperText}</p>
        )}
      </div>
    );
  }
);

TextField.displayName = 'TextField';

export default TextField;


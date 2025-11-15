import { useState } from 'react';
import clsx from 'clsx';

interface PasswordFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  helperText?: string;
}

/**
 * PasswordField - Password input with reveal/hide toggle
 */
const PasswordField = ({
  label,
  error,
  helperText,
  className,
  id,
  ...props
}: PasswordFieldProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id || `password-${Math.random().toString(36).substr(2, 9)}`;

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
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          id={inputId}
          className={clsx(
            'w-full rounded-lg border px-4 py-3 pr-12 text-foreground-light dark:text-foreground-dark',
            'placeholder-subtle-light dark:placeholder-subtle-dark',
            'bg-background-light dark:bg-background-dark',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
            'transition-colors',
            error
              ? 'border-red-500 dark:border-red-400'
              : 'border-border-light dark:border-border-dark',
            className
          )}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-subtle-light dark:text-subtle-dark hover:text-foreground-light dark:hover:text-foreground-dark transition-colors"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          <span className="material-symbols-outlined">
            {showPassword ? 'visibility_off' : 'visibility'}
          </span>
        </button>
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-500 dark:text-red-400">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-subtle-light dark:text-subtle-dark">{helperText}</p>
      )}
    </div>
  );
};

export default PasswordField;


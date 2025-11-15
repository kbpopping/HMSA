import { FormHTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';

interface FormProps extends FormHTMLAttributes<HTMLFormElement> {
  children: ReactNode;
  className?: string;
}

/**
 * Form - Form wrapper component with consistent spacing
 * 
 * Use with React Hook Form and Zod for validation
 */
const Form = ({ children, className, ...props }: FormProps) => {
  return (
    <form
      className={clsx('space-y-4 sm:space-y-6', className)}
      {...props}
    >
      {children}
    </form>
  );
};

export default Form;


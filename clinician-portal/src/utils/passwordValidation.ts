export type PasswordValidationResult = {
  valid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong';
};

/**
 * Validate password against security requirements
 * @param password - Password to validate
 * @returns Validation result with errors and strength
 */
export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];
  
  // Check minimum length
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  // Check for uppercase letter
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  // Check for lowercase letter
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  // Check for number
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  // Check for special character
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&* etc.)');
  }
  
  // Calculate password strength
  let strength: 'weak' | 'medium' | 'strong' = 'weak';
  
  if (errors.length === 0) {
    if (password.length >= 12) {
      strength = 'strong';
    } else if (password.length >= 10) {
      strength = 'medium';
    } else {
      strength = 'weak';
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
    strength,
  };
}

/**
 * Check if two passwords match
 * @param password - First password
 * @param confirmPassword - Confirmation password
 * @returns True if passwords match
 */
export function passwordsMatch(password: string, confirmPassword: string): boolean {
  return password === confirmPassword;
}

/**
 * Get password strength color class for Tailwind
 * @param strength - Password strength
 * @returns Tailwind color class
 */
export function getStrengthColor(strength: 'weak' | 'medium' | 'strong'): string {
  switch (strength) {
    case 'weak':
      return 'text-red-600 dark:text-red-400';
    case 'medium':
      return 'text-yellow-600 dark:text-yellow-400';
    case 'strong':
      return 'text-green-600 dark:text-green-400';
  }
}

/**
 * Get password strength label
 * @param strength - Password strength
 * @returns Human-readable label
 */
export function getStrengthLabel(strength: 'weak' | 'medium' | 'strong'): string {
  switch (strength) {
    case 'weak':
      return 'Weak';
    case 'medium':
      return 'Medium';
    case 'strong':
      return 'Strong';
  }
}


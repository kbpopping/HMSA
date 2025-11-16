import type { User, Role } from '../api/endpoints';

/**
 * Check if user has access to patient information
 * Based on role (clinician/nurse) OR Patient Management permission
 */
export function hasPatientAccess(user: User | null): boolean {
  if (!user) return false;
  
  // Check if role is clinician or nurse
  if (user.role === 'clinician' || user.role === 'nurse') {
    return true;
  }
  
  // Check if user has Patient Management permission
  if (user.permissions && user.permissions.includes('Patient Management')) {
    return true;
  }
  
  return false;
}

/**
 * Check if user has a specific permission
 */
export function hasPermission(user: User | null, permission: string): boolean {
  if (!user || !user.permissions) return false;
  return user.permissions.includes(permission);
}

/**
 * Check if user has any of the specified permissions
 */
export function hasAnyPermission(user: User | null, permissions: string[]): boolean {
  if (!user || !user.permissions) return false;
  return permissions.some(permission => user.permissions!.includes(permission));
}

/**
 * Check if user has all of the specified permissions
 */
export function hasAllPermissions(user: User | null, permissions: string[]): boolean {
  if (!user || !user.permissions) return false;
  return permissions.every(permission => user.permissions!.includes(permission));
}

/**
 * Get user role
 */
export function getUserRole(user: User | null): Role | null {
  return user?.role || null;
}

/**
 * Get user permissions array
 */
export function getUserPermissions(user: User | null): string[] {
  return user?.permissions || [];
}

/**
 * Check if user is a clinician
 */
export function isClinician(user: User | null): boolean {
  return user?.role === 'clinician';
}

/**
 * Check if user is a nurse
 */
export function isNurse(user: User | null): boolean {
  return user?.role === 'nurse';
}

/**
 * Check if user can manage appointments
 */
export function canManageAppointments(user: User | null): boolean {
  if (!user) return false;
  
  // Clinicians and nurses can manage appointments
  if (user.role === 'clinician' || user.role === 'nurse') {
    return true;
  }
  
  // Check for Appointments permission
  return hasPermission(user, 'Appointments');
}

/**
 * Check if user can access medical records
 */
export function canAccessMedicalRecords(user: User | null): boolean {
  if (!user) return false;
  
  // Clinicians and nurses can access medical records
  if (user.role === 'clinician' || user.role === 'nurse') {
    return true;
  }
  
  // Check for Medical Records permission
  return hasPermission(user, 'Medical Records');
}


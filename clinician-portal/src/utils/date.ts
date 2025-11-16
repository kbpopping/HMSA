import { format, parseISO, isValid } from 'date-fns';

/**
 * Format date to locale string
 */
export function formatDate(date: string | Date, formatStr: string = 'MMM dd, yyyy'): string {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return 'Invalid date';
    return format(dateObj, formatStr);
  } catch (error) {
    return 'Invalid date';
  }
}

/**
 * Format time to locale string
 */
export function formatTime(time: string): string {
  try {
    // Assuming time is in "HH:MM AM/PM" format
    return time;
  } catch (error) {
    return 'Invalid time';
  }
}

/**
 * Format date and time
 */
export function formatDateTime(date: string | Date, time?: string): string {
  const formattedDate = formatDate(date);
  if (time) {
    return `${formattedDate} at ${time}`;
  }
  return formattedDate;
}

/**
 * Get current date in ISO format
 */
export function getCurrentDate(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Get current time in "HH:MM AM/PM" format
 */
export function getCurrentTime(): string {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes.toString().padStart(2, '0');
  return `${displayHours}:${displayMinutes} ${ampm}`;
}

/**
 * Check if date is today
 */
export function isToday(date: string | Date): boolean {
  const today = new Date().toISOString().split('T')[0];
  const checkDate = typeof date === 'string' ? date.split('T')[0] : date.toISOString().split('T')[0];
  return today === checkDate;
}

/**
 * Get day of week from date
 */
export function getDayOfWeek(date: string | Date): string {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return '';
    return format(dateObj, 'EEEE');
  } catch (error) {
    return '';
  }
}

/**
 * Get relative time (e.g., "2 hours ago", "in 3 days")
 */
export function getRelativeTime(date: string | Date): string {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return 'Invalid date';
    
    const now = new Date();
    const diff = now.getTime() - dateObj.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  } catch (error) {
    return 'Invalid date';
  }
}


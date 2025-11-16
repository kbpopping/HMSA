import { PropsWithChildren, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { useAuth } from '../../store/auth';
import { useUI } from '../../store/ui';
import { hasPatientAccess } from '../../utils/permissions';

interface AppShellProps extends PropsWithChildren {}

/**
 * AppShell - Main layout component for Clinician Portal
 * 
 * Features:
 * - Responsive sidebar with mobile hamburger menu
 * - Role-based navigation (hides Patients menu if no access)
 * - User profile display
 * - Dark mode toggle
 * - Notification bell
 */
export default function AppShell({ children }: AppShellProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useUI();
  
  // Build navigation items based on user permissions
  const buildNavItems = () => {
    const baseItems = [
      { to: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
      { to: '/appointments', label: 'Appointments', icon: 'event' },
      { to: '/schedule', label: 'Schedule', icon: 'calendar_month' },
    ];
    
    // Add Patients menu only if user has patient access
    if (hasPatientAccess(user)) {
      baseItems.push({ to: '/patients', label: 'Patients', icon: 'people' });
    }
    
    baseItems.push(
      { to: '/earnings', label: 'Earnings', icon: 'payments' },
      { to: '/availability', label: 'Availability', icon: 'schedule' },
      { to: '/settings', label: 'Settings', icon: 'settings' }
    );
    
    return baseItems;
  };
  
  const navItems = buildNavItems();
  
  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
    setShowProfileDropdown(false);
  }, [location.pathname]);
  
  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      // Fallback: just navigate to login
      navigate('/login');
    }
  };
  
  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.name) return 'U';
    const names = user.name.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return user.name[0].toUpperCase();
  };
  
  return (
    <div className="flex min-h-screen w-full bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark">
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside className={clsx(
        'w-64 flex-shrink-0 bg-card-light dark:bg-card-dark border-r border-border-light dark:border-border-dark flex flex-col transition-transform duration-300 ease-in-out z-50',
        'fixed lg:static h-screen',
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        'p-6'
      )}>
        {/* Logo */}
        <div className="flex items-center justify-between gap-3 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-lg text-white">
              <span className="material-symbols-outlined text-xl">local_hospital</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground-light dark:text-foreground-dark font-inconsolata">
                HMSA
              </h1>
              <p className="text-xs text-subtle-light dark:text-subtle-dark">Clinician Portal</p>
            </div>
          </div>
          {/* Mobile Close Button */}
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-background-light dark:hover:bg-background-dark text-foreground-light dark:text-foreground-dark"
            aria-label="Close menu"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        {/* Navigation */}
        <nav className="flex flex-col space-y-2 flex-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            
            return (
              <Link
                key={item.to}
                to={item.to}
                className={clsx(
                  'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-foreground-light dark:text-foreground-dark hover:bg-background-light dark:hover:bg-background-dark'
                )}
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        
        {/* User Profile Section */}
        <div className="mt-6 pt-6 border-t border-border-light dark:border-border-dark">
          <div className="relative">
            <button
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-background-light dark:hover:bg-background-dark transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-semibold">
                {user?.profile_picture ? (
                  <img src={user.profile_picture} alt={user.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  getUserInitials()
                )}
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-sm text-foreground-light dark:text-foreground-dark truncate">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-subtle-light dark:text-subtle-dark truncate capitalize">
                  {user?.role || 'Clinician'}
                </p>
              </div>
              <span className="material-symbols-outlined text-subtle-light dark:text-subtle-dark">
                {showProfileDropdown ? 'expand_less' : 'expand_more'}
              </span>
            </button>
            
            {/* Profile Dropdown */}
            {showProfileDropdown && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-lg shadow-soft-lg overflow-hidden">
                <button
                  onClick={toggleTheme}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-background-light dark:hover:bg-background-dark transition-colors text-left"
                >
                  <span className="material-symbols-outlined text-subtle-light dark:text-subtle-dark">
                    {theme === 'dark' ? 'light_mode' : 'dark_mode'}
                  </span>
                  <span className="text-sm text-foreground-light dark:text-foreground-dark">
                    {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                  </span>
                </button>
                <Link
                  to="/settings"
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-background-light dark:hover:bg-background-dark transition-colors"
                >
                  <span className="material-symbols-outlined text-subtle-light dark:text-subtle-dark">
                    settings
                  </span>
                  <span className="text-sm text-foreground-light dark:text-foreground-dark">
                    Settings
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left text-red-600 dark:text-red-400"
                >
                  <span className="material-symbols-outlined">logout</span>
                  <span className="text-sm">Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="h-16 border-b border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark flex items-center justify-between px-4 lg:px-6">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-background-light dark:hover:bg-background-dark text-foreground-light dark:text-foreground-dark"
            aria-label="Open menu"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
          
          {/* Page Title or Hospital Name */}
          <div className="hidden lg:block">
            <h2 className="text-lg font-semibold text-foreground-light dark:text-foreground-dark">
              {user?.name ? `Welcome, ${user.name.split(' ')[0]}!` : 'Clinician Portal'}
            </h2>
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <button
              className="p-2 rounded-lg hover:bg-background-light dark:hover:bg-background-dark text-foreground-light dark:text-foreground-dark relative"
              aria-label="Notifications"
            >
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            
            {/* Theme Toggle (Desktop) */}
            <button
              onClick={toggleTheme}
              className="hidden lg:block p-2 rounded-lg hover:bg-background-light dark:hover:bg-background-dark text-foreground-light dark:text-foreground-dark"
              aria-label="Toggle theme"
            >
              <span className="material-symbols-outlined">
                {theme === 'dark' ? 'light_mode' : 'dark_mode'}
              </span>
            </button>
          </div>
        </header>
        
        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}


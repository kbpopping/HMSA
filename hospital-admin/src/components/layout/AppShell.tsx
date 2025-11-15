import { PropsWithChildren, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import { useProfile } from '../../store/profile';
import { useAuth } from '../../store/auth';
import NotificationBell from '../NotificationBell';
import { HospitalAPI, StaffRole } from '../../api/endpoints';

interface AppShellProps extends PropsWithChildren {
  role?: 'hospital_admin';
}

/**
 * AppShell - Main layout component for Hospital Admin
 * 
 * Features:
 * - Responsive sidebar with mobile hamburger menu
 * - Hospital Admin navigation
 * - User profile display
 * - Notification bell
 * - Dark mode support
 */
const AppShell = ({ children, role = 'hospital_admin' }: AppShellProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showStaffDropdown, setShowStaffDropdown] = useState(false);
  
  // Subscribe to profile store reactively
  const profileName = useProfile((state) => state.name);
  const profileEmail = useProfile((state) => state.email);
  const profilePicture = useProfile((state) => state.profilePicture);
  
  const { user: authUser } = useAuth();
  const hospitalId = authUser?.hospital_id || '1';
  
  // Fetch staff roles for dropdown
  const { data: staffRoles = [] } = useQuery<StaffRole[]>({
    queryKey: ['hospital', 'staff-roles', hospitalId],
    queryFn: async () => {
      try {
        const result = await HospitalAPI.listStaffRoles(hospitalId);
        return Array.isArray(result) ? result : [];
      } catch (err) {
        return [];
      }
    },
  });

  // Fetch hospital info for header
  const { data: hospital } = useQuery({
    queryKey: ['hospital', 'me', hospitalId],
    queryFn: () => HospitalAPI.me(hospitalId),
    staleTime: 0, // Always refetch when invalidated
  });

  // Get timezone abbreviation
  const getTimezoneAbbr = (timezone?: string) => {
    if (!timezone) return '';
    const tzMap: Record<string, string> = {
      'America/Los_Angeles': 'PST',
      'America/New_York': 'EST',
      'America/Chicago': 'CST',
      'America/Denver': 'MST',
    };
    return tzMap[timezone] || '';
  };

  // Use profile store for user data
  // Profile picture is persisted in the profile store when user uploads one
  // User-uploaded images are stored as base64 data URLs (starting with "data:image/")
  // The profile store has a default URL, but we want to show the actual saved image if it exists
  const defaultProfilePictureUrl = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDOqNgv11Cnx2gmDnVO9M-ENpIeWQ4-ObRIMQ_Y1gI_8CvEaffQ5lrgbIsxm2qKqUg0ZFYnioS-cujcfnL8cs8fCmnZXH6EPe1nzpqn7b_P-PjcChca2JfrTSqrVQ12K21tfWOuO4vJ1oV9K4DT8kp99K1pJ3MSbC_3unW4Dt1ghHcbRglxdUWleC5s5Lk4C31EVzKvI8kuCuSte9RIMzdxi1RuAgiec0d9u4kR_r1TiLL-rvudIsOsdJlLDGPTUoDydbTDTl9CYIU';
  
  // Check if profile picture is a user-uploaded image (base64 data URL)
  // User-uploaded images start with "data:image/" - these are the ones we want to display
  // If it's just the default URL, we'll show the initial letter instead
  const hasUserUploadedPicture = profilePicture && 
    profilePicture.trim() !== '' && 
    profilePicture.startsWith('data:image/');
  
  const user = {
    role: 'hospital_admin',
    email: profileEmail || 'admin@hospital.com',
    name: profileName || 'Dr. Evelyn Reed',
    // Only use profile picture if it's a user-uploaded image (base64 data URL)
    // Otherwise, show the initial letter
    profilePicture: hasUserUploadedPicture ? profilePicture : undefined,
  };

  const hospitalAdminNav = [
    { to: '/hospital/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { to: '/hospital/appointments', label: 'Appointments', icon: 'event' },
    { to: '/hospital/patients', label: 'Patients', icon: 'people' },
    { to: '/hospital/staff', label: 'Staff', icon: 'local_hospital', hasDropdown: true },
    { to: '/hospital/templates', label: 'Templates', icon: 'description' },
    { to: '/hospital/messaging', label: 'Messaging', icon: 'chat' },
    { to: '/hospital/billings', label: 'Billings', icon: 'payments' },
    { to: '/hospital/settings', label: 'Settings', icon: 'settings' },
  ];
  
  // Default staff categories
  const defaultStaffCategories = [
    { name: 'Clinician', route: '/hospital/staff/clinicians', icon: 'medical_services' },
    { name: 'Nurse', route: '/hospital/staff/nurses', icon: 'healing' },
    { name: 'Support Staff', route: '/hospital/staff/support-staff', icon: 'support_agent' },
    { name: 'Security', route: '/hospital/staff/security', icon: 'security' },
    { name: 'Receptionist', route: '/hospital/staff/receptionists', icon: 'person' },
  ];
  
  // Check if current path is a staff-related page
  const isStaffPage = location.pathname.startsWith('/hospital/staff');

  // Close mobile menu and dropdown when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
    setShowStaffDropdown(false);
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
      const { logout } = useAuth.getState();
      await logout();
      navigate('/login');
    } catch (error) {
      // Fallback: just navigate to login
      navigate('/login');
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark font-display">
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={clsx(
        'w-64 flex-shrink-0 bg-background-light dark:bg-background-dark border-r border-border-light dark:border-border-dark flex flex-col relative transition-transform duration-300 ease-in-out z-50',
        'fixed lg:static h-screen lg:h-auto',
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        'p-4 sm:p-6'
      )}>
        {/* Logo */}
        <div className="flex items-center justify-between gap-3 mb-6 sm:mb-8 lg:mb-10">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-primary rounded-lg text-white">
              <span className="material-symbols-outlined text-lg sm:text-xl">emergency</span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-foreground-light dark:text-foreground-dark">HMSA</h1>
          </div>
          {/* Mobile Close Button */}
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-primary/10 dark:hover:bg-primary/20 text-foreground-light dark:text-foreground-dark touch-manipulation"
            aria-label="Close menu"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col space-y-2 flex-1">
          {hospitalAdminNav.map((item) => {
            const isActive = location.pathname === item.to || 
                            (item.to === '/hospital/dashboard' && location.pathname === '/');
            const isStaffItem = item.hasDropdown;
            
            if (isStaffItem) {
              // Get all unique role names from staffRoles, excluding default categories
              const customRoles = staffRoles
                .filter(role => !defaultStaffCategories.some(cat => cat.name === role.name))
                .map(role => ({
                  name: role.name,
                  route: `/hospital/staff/${role.name.toLowerCase().replace(/\s+/g, '-')}`,
                  icon: 'badge',
                }));
              
              // Combine default categories with custom roles, then add Roles at the end
              const allCategories = [...defaultStaffCategories, ...customRoles, { name: 'Roles', route: '/hospital/staff/roles', icon: 'verified_user' }];
              
              return (
                <div key={item.to} className="relative">
                  <button
                    onClick={() => setShowStaffDropdown(!showStaffDropdown)}
                    className={clsx(
                      'w-full flex items-center justify-between gap-2 sm:gap-3 px-3 sm:px-4 py-2 rounded-lg transition-colors touch-manipulation text-sm sm:text-base',
                      isStaffPage
                        ? 'bg-primary/20 text-primary font-bold'
                        : 'hover:bg-primary/10 dark:hover:bg-primary/20 text-foreground-light dark:text-foreground-dark'
                    )}
                  >
                    <div className="flex items-center gap-2 sm:gap-3">
                      <span className="material-symbols-outlined text-lg sm:text-xl">{item.icon}</span>
                      <span>{item.label}</span>
                    </div>
                    <span className={clsx(
                      'material-symbols-outlined text-lg sm:text-xl transition-transform',
                      showStaffDropdown && 'rotate-180'
                    )}>
                      expand_more
                    </span>
                  </button>
                  
                  {/* Dropdown menu */}
                  {showStaffDropdown && (
                    <div className="mt-2 ml-3 sm:ml-4 space-y-2">
                      <Link
                        to="/hospital/staff"
                        className={clsx(
                          'flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 rounded-lg transition-colors touch-manipulation text-sm sm:text-base',
                          location.pathname === '/hospital/staff' && !location.pathname.includes('/staff/')
                            ? 'bg-primary/20 text-primary font-bold'
                            : 'hover:bg-primary/10 dark:hover:bg-primary/20 text-foreground-light dark:text-foreground-dark'
                        )}
                        onClick={() => setShowStaffDropdown(false)}
                      >
                        <span className="material-symbols-outlined text-lg sm:text-xl">people</span>
                        <span>All Staff</span>
                      </Link>
                      {allCategories.map((category) => {
                        const isCategoryActive = location.pathname === category.route;
                        return (
                          <Link
                            key={category.route}
                            to={category.route}
                            className={clsx(
                              'flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 rounded-lg transition-colors touch-manipulation text-sm sm:text-base',
                              isCategoryActive
                                ? 'bg-primary/20 text-primary font-bold'
                                : 'hover:bg-primary/10 dark:hover:bg-primary/20 text-foreground-light dark:text-foreground-dark'
                            )}
                            onClick={() => setShowStaffDropdown(false)}
                          >
                            <span className="material-symbols-outlined text-lg sm:text-xl">{category.icon}</span>
                            <span>{category.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }
            
            return (
              <Link
                key={item.to}
                to={item.to}
                className={clsx(
                  'flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 rounded-lg transition-colors touch-manipulation text-sm sm:text-base',
                  isActive
                    ? 'bg-primary/20 text-primary font-bold'
                    : 'hover:bg-primary/10 dark:hover:bg-primary/20 text-foreground-light dark:text-foreground-dark'
                )}
              >
                <span className="material-symbols-outlined text-lg sm:text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout and User Profile - positioned at bottom */}
        <div className="absolute bottom-4 sm:bottom-6 w-[calc(100%-2rem)] sm:w-[calc(100%-3rem)]">
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 rounded-lg hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors text-foreground-light dark:text-foreground-dark mb-3 sm:mb-4 touch-manipulation text-sm sm:text-base"
          >
            <span className="material-symbols-outlined text-lg sm:text-xl">logout</span>
            <span>Logout</span>
          </button>

          {/* User Profile */}
          <button
            onClick={() => navigate('/hospital/settings?tab=user-profile')}
            className="w-full flex items-center gap-2 sm:gap-3 p-2 rounded-lg hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors cursor-pointer"
          >
            <div className="size-8 sm:size-10 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden flex-shrink-0 relative border-2 border-border-light dark:border-border-dark">
              {user.profilePicture && user.profilePicture.trim() !== '' ? (
                <>
                  <img 
                    alt="User Avatar" 
                    className="w-full h-full object-cover" 
                    src={user.profilePicture}
                    onError={(e) => {
                      // Fallback to initial if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        const existingInitial = parent.querySelector('.sidebar-avatar-initial-fallback');
                        if (!existingInitial) {
                          const initial = document.createElement('span');
                          initial.className = 'sidebar-avatar-initial-fallback text-primary font-bold absolute inset-0 flex items-center justify-center text-xs sm:text-sm';
                          initial.textContent = user.name.charAt(0).toUpperCase();
                          parent.appendChild(initial);
                        }
                      }
                    }}
                  />
                  {/* Fallback initial (hidden by default, shown if image fails) */}
                  <span className="sidebar-avatar-initial-fallback text-primary font-bold absolute inset-0 flex items-center justify-center text-xs sm:text-sm hidden">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </>
              ) : (
                <span className="text-primary font-bold text-xs sm:text-sm">{user.name.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="font-bold text-foreground-light dark:text-foreground-dark truncate text-xs sm:text-sm">{user.name}</p>
              <p className="text-xs text-subtle-light dark:text-subtle-dark truncate">{user.email}</p>
            </div>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 xl:p-12 overflow-y-auto bg-background-light dark:bg-background-dark w-full lg:w-auto">
        {/* Mobile Header with Menu Button */}
        <div className="lg:hidden flex items-center justify-between mb-4 pb-4 border-b border-border-light dark:border-border-dark">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 rounded-lg hover:bg-primary/10 dark:hover:bg-primary/20 text-foreground-light dark:text-foreground-dark"
            aria-label="Open menu"
          >
            <span className="material-symbols-outlined text-2xl">menu</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary rounded-lg text-white">
              <span className="material-symbols-outlined text-sm">emergency</span>
            </div>
            <h1 className="text-lg font-bold text-foreground-light dark:text-foreground-dark">HMSA</h1>
          </div>
          <NotificationBell />
        </div>
        
        {/* Desktop Header with Hospital Name, Timezone, Notification Bell, and User Info */}
        <div className="hidden lg:flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-lg sm:text-xl font-semibold text-foreground-light dark:text-foreground-dark">
              {hospital?.name || 'Hospital'}
            </h2>
            {hospital?.timezone && (
              <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm font-medium">
                {getTimezoneAbbr(hospital.timezone)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell />
            <button
              onClick={() => navigate('/hospital/settings?tab=user-profile')}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden flex-shrink-0 relative">
                {user.profilePicture && user.profilePicture.trim() !== '' ? (
                  <>
                    <img
                      src={user.profilePicture}
                      alt={user.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback to initial if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          const existingInitial = parent.querySelector('.avatar-initial-fallback');
                          if (!existingInitial) {
                            const initial = document.createElement('span');
                            initial.className = 'avatar-initial-fallback text-primary font-bold absolute inset-0 flex items-center justify-center';
                            initial.textContent = user.name.charAt(0).toUpperCase();
                            parent.appendChild(initial);
                          }
                        }
                      }}
                    />
                    {/* Fallback initial (hidden by default, shown if image fails) */}
                    <span className="avatar-initial-fallback text-primary font-bold absolute inset-0 flex items-center justify-center hidden">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </>
                ) : (
                  <span className="text-primary font-bold">{user.name.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-foreground-light dark:text-foreground-dark">
                  {user.name}
                </p>
                <p className="text-xs text-subtle-light dark:text-subtle-dark">
                  Admin
                </p>
              </div>
            </button>
          </div>
        </div>
        
        {children}
      </main>
    </div>
  );
};

export default AppShell;


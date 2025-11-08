import { PropsWithChildren, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { useProfile } from '../../store/profile';
import { useAuth } from '../../store/auth';

interface AppShellProps extends PropsWithChildren {
  role?: 'super_admin' | 'hospital_admin';
}

/**
 * AppShell - Main layout component matching the exact image design
 * 
 * Development mode: Uses mock user data (no auth required)
 * To re-enable auth: Import useAuth and use user data from store
 */
const AppShell = ({ children, role }: AppShellProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Subscribe to profile store reactively - will re-render when profile changes
  const profileName = useProfile((state) => state.name);
  const profileEmail = useProfile((state) => state.email);
  const profilePicture = useProfile((state) => state.profilePicture);

  // Determine role based on current path or prop
  const currentPath = location.pathname;
  const isSuperAdmin = role === 'super_admin' || currentPath.startsWith('/super');
  const currentRole = isSuperAdmin ? 'super_admin' : 'hospital_admin';

  // Use profile store for user data (persists across sessions and updates reactively)
  // Ensure we have default values if profile hasn't loaded yet
  const user = {
    role: currentRole,
    email: profileEmail || 'admin@hmsa.dev',
    name: profileName || 'Super Admin',
    profilePicture: profilePicture || 'https://lh3.googleusercontent.com/aida-public/AB6AXuDOqNgv11Cnx2gmDnVO9M-ENpIeWQ4-ObRIMQ_Y1gI_8CvEaffQ5lrgbIsxm2qKqUg0ZFYnioS-cujcfnL8cs8fCmnZXH6EPe1nzpqn7b_P-PjcChca2JfrTSqrVQ12K21tfWOuO4vJ1oV9K4DT8kp99K1pJ3MSbC_3unW4Dt1ghHcbRglxdUWleC5s5Lk4C31EVzKvI8kuCuSte9RIMzdxi1RuAgiec0d9u4kR_r1TiLL-rvudIsOsdJlLDGPTUoDydbTDTl9CYIU',
  };

  const superAdminNav = [
    { to: '/super/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { to: '/super/hospitals', label: 'Hospitals', icon: 'apartment' },
    { to: '/super/users', label: 'Users', icon: 'group', hasDropdown: true },
    { to: '/super/settings', label: 'Settings', icon: 'settings' },
  ];

  const hospitalAdminNav = [
    { to: '/hospital/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { to: '/hospital/appointments', label: 'Appointments', icon: 'dashboard' },
    { to: '/hospital/patients', label: 'Patients', icon: 'group' },
    { to: '/hospital/clinicians', label: 'Clinicians', icon: 'group' },
    { to: '/hospital/templates', label: 'Templates', icon: 'dashboard' },
    { to: '/hospital/messaging', label: 'Messages', icon: 'dashboard' },
    { to: '/hospital/settings', label: 'Settings', icon: 'settings' },
  ];

  const navigation = isSuperAdmin ? superAdminNav : hospitalAdminNav;

  // Users dropdown state - show when on any users-related page
  const isUsersPage = currentPath.startsWith('/super/users');
  const [showUsersDropdown, setShowUsersDropdown] = useState(isUsersPage);

  // Update dropdown state when navigating to/from users pages
  useEffect(() => {
    setShowUsersDropdown(isUsersPage);
  }, [isUsersPage]);

  const handleLogout = async () => {
    try {
      // PRODUCTION: Replace with real auth logout
      const { logout } = useAuth.getState();
      await logout();
      navigate('/login');
    } catch (error) {
      // MOCK MODE: Just navigate to login (no actual logout)
      navigate('/login');
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark font-display">
      {/* Sidebar - matching exact HTML design */}
      <aside className="w-64 flex-shrink-0 bg-background-light dark:bg-background-dark p-6 border-r border-border-light dark:border-border-dark flex flex-col relative">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-10">
          <div className="p-2 bg-primary rounded-lg text-white">
            <span className="material-symbols-outlined">emergency</span>
          </div>
          <h1 className="text-xl font-bold text-foreground-light dark:text-foreground-dark">HMSA</h1>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col space-y-2 flex-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.to || 
                            (item.to === '/super/dashboard' && location.pathname === '/');
            const isUsersItem = item.hasDropdown && isSuperAdmin;
            
            if (isUsersItem) {
              return (
                <div key={item.to} className="relative">
                  <button
                    onClick={() => setShowUsersDropdown(!showUsersDropdown)}
                    className={clsx(
                      'w-full flex items-center justify-between gap-3 px-4 py-2 rounded-lg transition-colors',
                      isUsersPage
                        ? 'bg-primary/20 text-primary font-bold'
                        : 'hover:bg-primary/10 dark:hover:bg-primary/20 text-foreground-light dark:text-foreground-dark'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined">{item.icon}</span>
                      <span>{item.label}</span>
                    </div>
                    <span className={clsx(
                      'material-symbols-outlined transition-transform',
                      showUsersDropdown && 'rotate-180'
                    )}>
                      expand_more
                    </span>
                  </button>
                  
                  {/* Dropdown menu */}
                  {showUsersDropdown && (
                    <div className="mt-2 ml-4 space-y-2">
                      <Link
                        to="/super/users"
                        className={clsx(
                          'flex items-center gap-3 px-4 py-2 rounded-lg transition-colors',
                          location.pathname === '/super/users'
                            ? 'bg-primary/20 text-primary font-bold'
                            : 'hover:bg-primary/10 dark:hover:bg-primary/20 text-foreground-light dark:text-foreground-dark'
                        )}
                      >
                        <span className="material-symbols-outlined">person</span>
                        <span>Users</span>
                      </Link>
                      <Link
                        to="/super/users-roles"
                        className={clsx(
                          'flex items-center gap-3 px-4 py-2 rounded-lg transition-colors',
                          location.pathname === '/super/users-roles'
                            ? 'bg-primary/20 text-primary font-bold'
                            : 'hover:bg-primary/10 dark:hover:bg-primary/20 text-foreground-light dark:text-foreground-dark'
                        )}
                      >
                        <span className="material-symbols-outlined">verified_user</span>
                        <span>Roles</span>
                      </Link>
                      <Link
                        to="/super/users/monitoring"
                        className={clsx(
                          'flex items-center gap-3 px-4 py-2 rounded-lg transition-colors',
                          location.pathname === '/super/users/monitoring'
                            ? 'bg-primary/20 text-primary font-bold'
                            : 'hover:bg-primary/10 dark:hover:bg-primary/20 text-foreground-light dark:text-foreground-dark'
                        )}
                      >
                        <span className="material-symbols-outlined">monitoring</span>
                        <span>Monitoring</span>
                      </Link>
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
                  'flex items-center gap-3 px-4 py-2 rounded-lg transition-colors',
                  isActive
                    ? 'bg-primary/20 text-primary font-bold'
                    : 'hover:bg-primary/10 dark:hover:bg-primary/20 text-foreground-light dark:text-foreground-dark'
                )}
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout and User Profile - positioned at bottom */}
        <div className="absolute bottom-6 w-[calc(100%-3rem)]">
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors text-foreground-light dark:text-foreground-dark mb-4"
          >
            <span className="material-symbols-outlined">logout</span>
            <span>Logout</span>
          </button>

          {/* User Profile */}
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors">
            <img 
              alt="User Avatar" 
              className="size-10 rounded-full object-cover border-2 border-border-light dark:border-border-dark" 
              src={user.profilePicture}
              onError={(e) => {
                // Fallback if image fails to load
                const target = e.target as HTMLImageElement;
                target.src = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDOqNgv11Cnx2gmDnVO9M-ENpIeWQ4-ObRIMQ_Y1gI_8CvEaffQ5lrgbIsxm2qKqUg0ZFYnioS-cujcfnL8cs8fCmnZXH6EPe1nzpqn7b_P-PjcChca2JfrTSqrVQ12K21tfWOuO4vJ1oV9K4DT8kp99K1pJ3MSbC_3unW4Dt1ghHcbRglxdUWleC5s5Lk4C31EVzKvI8kuCuSte9RIMzdxi1RuAgiec0d9u4kR_r1TiLL-rvudIsOsdJlLDGPTUoDydbTDTl9CYIU';
              }}
            />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-foreground-light dark:text-foreground-dark truncate text-sm">{user.name}</p>
              <p className="text-xs text-subtle-light dark:text-subtle-dark truncate">{user.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto bg-background-light dark:bg-background-dark">
        {children}
      </main>
    </div>
  );
};

export default AppShell;

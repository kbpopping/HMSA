import { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Building2, 
  Calendar, 
  Users, 
  FileText, 
  MessageSquare, 
  Settings, 
  LogOut, 
  Menu, 
  X 
} from 'lucide-react';

interface DashboardLayoutProps {
  role: 'super-admin' | 'hospital-admin';
}

const DashboardLayout = ({ role }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const isSuperAdmin = role === 'super-admin';
  
  const navigation = isSuperAdmin 
    ? [
        { name: 'Dashboard', href: '/super/dashboard', icon: LayoutDashboard },
        { name: 'Hospitals', href: '/super/hospitals', icon: Building2 },
        { name: 'Settings', href: '/super/settings', icon: Settings },
      ]
    : [
        { name: 'Dashboard', href: '/hospital/dashboard', icon: LayoutDashboard },
        { name: 'Appointments', href: '/hospital/appointments', icon: Calendar },
        { name: 'Patients', href: '/hospital/patients', icon: Users },
        { name: 'Clinicians', href: '/hospital/clinicians', icon: Users },
        { name: 'Templates', href: '/hospital/templates', icon: FileText },
        { name: 'Messages', href: '/hospital/messages', icon: MessageSquare },
        { name: 'Settings', href: '/hospital/settings', icon: Settings },
      ];

  const handleLogout = () => {
    // In a real app, you would clear auth tokens/cookies here
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      {/* Mobile sidebar */}
      <div className={`md:hidden fixed inset-0 z-40 ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)}></div>
        <div className="fixed inset-y-0 left-0 flex flex-col w-full max-w-xs bg-primary-800">
          <div className="flex items-center justify-between h-16 px-4 bg-primary-900">
            <div className="text-xl font-bold text-white">HMSA</div>
            <button onClick={() => setSidebarOpen(false)} className="text-white">
              <X size={24} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <nav className="px-2 py-4 space-y-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                      isActive
                        ? 'bg-primary-900 text-white'
                        : 'text-white hover:bg-primary-700'
                    }`}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="sidebar hidden md:block">
        <div className="flex items-center justify-between h-16 px-4 bg-primary-900">
          <div className="text-xl font-bold text-white">HMSA</div>
        </div>
        <nav className="px-2 py-4 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                  isActive
                    ? 'bg-primary-900 text-white'
                    : 'text-white hover:bg-primary-700'
                }`}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main content */}
      <div className="main-content flex-1 overflow-auto">
        <header className="bg-white shadow">
          <div className="flex items-center justify-between px-4 py-4 sm:px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            >
              <Menu size={24} />
            </button>
            <div className="flex-1 md:ml-4">
              <h1 className="text-xl font-semibold text-gray-900">
                {navigation.find((item) => item.href === location.pathname)?.name || 'Dashboard'}
              </h1>
            </div>
            <div>
              <button
                onClick={handleLogout}
                className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
              >
                <LogOut className="mr-2 h-5 w-5" />
                Logout
              </button>
            </div>
          </div>
        </header>
        <main className="p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
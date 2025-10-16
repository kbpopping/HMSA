import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import ProfilePicture from '../../components/ProfilePicture';

// Mock data for monitoring
const mockUserActivity = [
  { time: '00:00', logins: 12, active: 8 },
  { time: '04:00', logins: 8, active: 5 },
  { time: '08:00', logins: 45, active: 42 },
  { time: '12:00', logins: 38, active: 35 },
  { time: '16:00', logins: 52, active: 48 },
  { time: '20:00', logins: 28, active: 25 },
];

const mockRoleDistribution = [
  { role: 'Hospital Admin', count: 23, color: '#607AFB' },
  { role: 'Clinician', count: 156, color: '#10b981' },
  { role: 'Receptionist', count: 89, color: '#f59e0b' },
  { role: 'Super Admin', count: 1, color: '#ef4444' },
];

const mockRecentActivity = [
  { 
    id: 1, 
    user: 'Dr. Amelia Harper', 
    action: 'Logged in', 
    timestamp: '2 minutes ago',
    type: 'login'
  },
  { 
    id: 2, 
    user: 'Dr. Benjamin Carter', 
    action: 'Created new appointment', 
    timestamp: '5 minutes ago',
    type: 'action'
  },
  { 
    id: 3, 
    user: 'Dr. Chloe Bennett', 
    action: 'Updated patient record', 
    timestamp: '8 minutes ago',
    type: 'action'
  },
  { 
    id: 4, 
    user: 'Dr. Daniel Evans', 
    action: 'Logged out', 
    timestamp: '12 minutes ago',
    type: 'logout'
  },
  { 
    id: 5, 
    user: 'Dr. Eleanor Foster', 
    action: 'Generated report', 
    timestamp: '15 minutes ago',
    type: 'action'
  },
];

const UsersMonitoring = () => {
  const navigate = useNavigate();
  const [showUsersDropdown, setShowUsersDropdown] = useState(true);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'login':
        return 'login';
      case 'logout':
        return 'logout';
      default:
        return 'edit';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'login':
        return 'text-green-600';
      case 'logout':
        return 'text-red-600';
      default:
        return 'text-blue-600';
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white flex flex-col p-4 border-r border-[#607AFB]/20 shadow-lg">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#607AFB]/20 rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-[#607AFB] text-sm">shield_person</span>
            </div>
            <h1 className="text-xl font-bold text-gray-800">HMSA</h1>
          </div>
          <button className="text-gray-800">
            <span className="material-symbols-outlined">menu</span>
          </button>
        </div>
        
        <nav className="flex-grow space-y-2">
          <Link 
            to="/super/dashboard" 
            className="flex items-center gap-3 px-4 py-2 text-gray-600 rounded hover:bg-[#607AFB]/20 hover:text-gray-800 transition-colors"
          >
            <span className="material-symbols-outlined">dashboard</span>
            <span>Dashboard</span>
          </Link>
          
          <Link 
            to="/super/hospitals" 
            className="flex items-center gap-3 px-4 py-2 text-gray-600 rounded hover:bg-[#607AFB]/20 hover:text-gray-800 transition-colors"
          >
            <span className="material-symbols-outlined">apartment</span>
            <span>Hospitals</span>
          </Link>
          
          {/* Users with dropdown */}
          <div className="relative">
            <button 
              onClick={() => setShowUsersDropdown(!showUsersDropdown)}
              className="flex items-center gap-3 px-4 py-2 rounded-lg bg-[#607AFB] text-white shadow-md w-full justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined">group</span>
                <span className="font-semibold">Users</span>
              </div>
              <span className={`material-symbols-outlined transition-transform ${showUsersDropdown ? 'rotate-180' : ''}`}>
                expand_more
              </span>
            </button>
            
            {/* Dropdown menu */}
            {showUsersDropdown && (
              <div className="mt-2 ml-4 space-y-2">
                <Link 
                  to="/super/users" 
                  className="flex items-center gap-3 px-4 py-2 text-gray-600 rounded hover:bg-[#607AFB]/20 hover:text-gray-800 transition-colors"
                >
                  <span className="material-symbols-outlined">person</span>
                  <span>Users</span>
                </Link>
                <Link 
                  to="/super/users/roles" 
                  className="flex items-center gap-3 px-4 py-2 text-gray-600 rounded hover:bg-[#607AFB]/20 hover:text-gray-800 transition-colors"
                >
                  <span className="material-symbols-outlined">verified_user</span>
                  <span>Roles</span>
                </Link>
                <Link 
                  to="/super/users/monitoring" 
                  className="flex items-center gap-3 px-4 py-2 text-gray-600 rounded bg-[#607AFB]/10 text-[#607AFB] font-bold"
                >
                  <span className="material-symbols-outlined">monitoring</span>
                  <span>Monitoring</span>
                </Link>
              </div>
            )}
          </div>
          
          <Link 
            to="/super/settings" 
            className="flex items-center gap-3 px-4 py-2 text-gray-600 rounded hover:bg-[#607AFB]/20 hover:text-gray-800 transition-colors"
          >
            <span className="material-symbols-outlined">settings</span>
            <span>Settings</span>
          </Link>
        </nav>
        
        <div className="mt-auto">
          <div className="border-t border-[#607AFB]/20 pt-4">
            <div className="flex items-center gap-3 mb-4">
              <ProfilePicture
                size="md"
                editable={false}
              />
              <div>
                <p className="font-semibold text-gray-800">Super Admin</p>
                <p className="text-sm text-gray-500">admin@hmsa.com</p>
              </div>
            </div>
            <button 
              onClick={() => navigate('/login')}
              className="flex items-center gap-3 px-4 py-2 text-gray-600 rounded hover:bg-[#607AFB]/20 hover:text-gray-800 transition-colors w-full"
            >
              <span className="material-symbols-outlined">logout</span>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">User Monitoring</h1>
            <p className="text-gray-600">Monitor user activity and system usage</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-800">269</p>
                </div>
                <div className="w-12 h-12 bg-[#607AFB]/10 rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#607AFB]">group</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Now</p>
                  <p className="text-2xl font-bold text-green-600">42</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined text-green-600">online_prediction</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Logins Today</p>
                  <p className="text-2xl font-bold text-blue-600">183</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined text-blue-600">login</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg. Session</p>
                  <p className="text-2xl font-bold text-purple-600">2.4h</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined text-purple-600">schedule</span>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* User Activity Chart */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-bold text-gray-800 mb-4">User Activity (24h)</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mockUserActivity} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="time" stroke="#666" fontSize={12} />
                    <YAxis stroke="#666" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="logins"
                      stroke="#607AFB"
                      strokeWidth={3}
                      dot={{ fill: '#607AFB', strokeWidth: 2, r: 4 }}
                      name="Logins"
                    />
                    <Line
                      type="monotone"
                      dataKey="active"
                      stroke="#10b981"
                      strokeWidth={3}
                      dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                      name="Active Users"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Role Distribution Chart */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Role Distribution</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mockRoleDistribution} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="role" stroke="#666" fontSize={12} />
                    <YAxis stroke="#666" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                    />
                    <Bar dataKey="count" fill="#607AFB" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-800">Recent Activity</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {mockRecentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getActivityColor(activity.type)} bg-opacity-10`}>
                      <span className="material-symbols-outlined text-sm">
                        {getActivityIcon(activity.type)}
                      </span>
                    </div>
                    <div className="flex-grow">
                      <p className="font-medium text-gray-800">{activity.user}</p>
                      <p className="text-sm text-gray-600">{activity.action}</p>
                    </div>
                    <div className="text-sm text-gray-500">
                      {activity.timestamp}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UsersMonitoring;

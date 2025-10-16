import { Link, useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ProfilePicture from '../../components/ProfilePicture';

const SuperAdminDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/login');
  };

  // Mock data for reminders chart
  const remindersData = [
    { day: 'Mon', sent: 1200, delivered: 1150 },
    { day: 'Tue', sent: 1450, delivered: 1380 },
    { day: 'Wed', sent: 1320, delivered: 1280 },
    { day: 'Thu', sent: 1580, delivered: 1520 },
    { day: 'Fri', sent: 1680, delivered: 1620 },
    { day: 'Sat', sent: 980, delivered: 950 },
    { day: 'Sun', sent: 850, delivered: 820 },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white p-6 shadow-lg flex flex-col">
        <div className="flex items-center gap-3 mb-10">
          <div className="bg-[#607AFB] p-2 rounded-lg">
            <span className="material-symbols-outlined text-white text-xl">shield_person</span>
          </div>
          <h1 className="text-xl font-bold text-[#607AFB]">Super Admin</h1>
        </div>
        
        <nav className="flex-grow">
          <ul className="space-y-2">
            <li>
              <Link 
                to="/super/dashboard" 
                className="flex items-center gap-3 px-4 py-2 rounded-lg bg-[#607AFB]/10 text-[#607AFB] font-bold"
              >
                <span className="material-symbols-outlined">dashboard</span>
                Dashboard
              </Link>
            </li>
            <li>
              <Link 
                to="/super/hospitals" 
                className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-[#607AFB]/5 transition-colors"
              >
                <span className="material-symbols-outlined">apartment</span>
                Hospitals
              </Link>
            </li>
            <li>
              <Link 
                to="/super/users" 
                className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-[#607AFB]/5 transition-colors"
              >
                <span className="material-symbols-outlined">group</span>
                Users
              </Link>
            </li>
            <li>
              <Link 
                to="/super/settings" 
                className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-[#607AFB]/5 transition-colors"
              >
                <span className="material-symbols-outlined">settings</span>
                Settings
              </Link>
            </li>
          </ul>
        </nav>
        
        <div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-[#607AFB]/5 transition-colors w-full"
          >
            <span className="material-symbols-outlined">logout</span>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8">
            <h2 className="text-3xl font-bold">Dashboard</h2>
            <p className="text-gray-600">Welcome back, Super Admin!</p>
          </header>

          {/* KPI Cards */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-600">Total Hospitals</p>
                  <p className="text-3xl font-bold">128</p>
                </div>
                <span className="material-symbols-outlined text-[#607AFB] text-3xl">apartment</span>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-600">Active Hospitals (24h)</p>
                  <p className="text-3xl font-bold">112</p>
                </div>
                <span className="material-symbols-outlined text-green-500 text-3xl">local_activity</span>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-600">Total Users</p>
                  <p className="text-3xl font-bold">1,452</p>
                </div>
                <span className="material-symbols-outlined text-[#607AFB] text-3xl">group</span>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-600">Outbound Queue</p>
                  <p className="text-3xl font-bold">42</p>
                </div>
                <span className="material-symbols-outlined text-orange-500 text-3xl">outgoing_mail</span>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-8">
              {/* Reminders Chart */}
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-bold mb-4">Reminders Sent</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={remindersData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="day" 
                        stroke="#666"
                        fontSize={12}
                      />
                      <YAxis 
                        stroke="#666"
                        fontSize={12}
                      />
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
                        dataKey="sent" 
                        stroke="#607AFB" 
                        strokeWidth={3}
                        dot={{ fill: '#607AFB', strokeWidth: 2, r: 4 }}
                        name="Sent"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="delivered" 
                        stroke="#10b981" 
                        strokeWidth={3}
                        dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                        name="Delivered"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* n8n Workflow Health */}
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-bold mb-4">n8n Workflow Health</h3>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                  <span className="material-symbols-outlined text-green-500">check_circle</span>
                  <span>All systems operational</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Last Run</p>
                    <p className="font-bold">2 min ago</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Failures (24h)</p>
                    <p className="font-bold text-green-500">0</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Avg. Latency</p>
                    <p className="font-bold">120ms</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Recent Activity */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-bold mb-4">Recent Activity</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-4">
                  <div className="bg-green-100 p-2 rounded-full">
                    <span className="material-symbols-outlined text-green-500">add_business</span>
                  </div>
                  <div>
                    <p className="font-medium">New hospital 'St. Jude's' created.</p>
                    <p className="text-sm text-gray-600">2 hours ago</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <span className="material-symbols-outlined text-[#607AFB]">badge</span>
                  </div>
                  <div>
                    <p className="font-medium">Impersonated 'Dr. Alan Grant' at 'City General'.</p>
                    <p className="text-sm text-gray-600">Yesterday</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="bg-red-100 p-2 rounded-full">
                    <span className="material-symbols-outlined text-red-500">error</span>
                  </div>
                  <div>
                    <p className="font-medium">API Error: 502 Bad Gateway on patient-sync.</p>
                    <p className="text-sm text-gray-600">Yesterday</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="bg-green-100 p-2 rounded-full">
                    <span className="material-symbols-outlined text-green-500">add_business</span>
                  </div>
                  <div>
                    <p className="font-medium">New hospital 'Mercy West' created.</p>
                    <p className="text-sm text-gray-600">2 days ago</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="bg-orange-100 p-2 rounded-full">
                    <span className="material-symbols-outlined text-orange-500">notification_important</span>
                  </div>
                  <div>
                    <p className="font-medium">High latency detected in outbound SMS queue.</p>
                    <p className="text-sm text-gray-600">3 days ago</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SuperAdminDashboard;
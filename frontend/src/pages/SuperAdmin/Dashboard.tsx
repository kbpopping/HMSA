import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import AppShell from '../../components/layout/AppShell';
import { SuperAPI } from '../../api/endpoints';

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  
  // Fetch hospitals data
  const { data: hospitals = [] } = useQuery({
    queryKey: ['super', 'hospitals'],
    queryFn: () => SuperAPI.listHospitals(),
  });

  // Chart data for reminders sent
  const remindersData = [
    { day: 'Mon', sent: 1200, delivered: 1150 },
    { day: 'Tue', sent: 1450, delivered: 1380 },
    { day: 'Wed', sent: 1320, delivered: 1280 },
    { day: 'Thu', sent: 1580, delivered: 1520 },
    { day: 'Fri', sent: 1680, delivered: 1620 },
    { day: 'Sat', sent: 980, delivered: 950 },
    { day: 'Sun', sent: 850, delivered: 820 },
  ];

  // Recent activity data matching the image
  const recentActivity = [
    {
      type: 'hospital_created',
      message: 'New Hospital Created: City General',
      time: '2 hours ago',
      icon: 'add_business',
      iconBg: 'bg-primary/20',
      iconColor: 'text-primary',
    },
    {
      type: 'impersonation',
      message: 'User Impersonation: Dr. Emily Carter by Admin',
      time: '4 hours ago',
      icon: 'supervised_user_circle',
      iconBg: 'bg-primary/20',
      iconColor: 'text-primary',
    },
    {
      type: 'error',
      message: 'Notable Error: Failed to send reminder (ID 12345)',
      time: '6 hours ago',
      icon: 'warning',
      iconBg: 'bg-orange-500/20',
      iconColor: 'text-orange-500',
    },
  ];

  return (
    <AppShell role="super_admin">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-6 sm:mb-8 lg:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground-light dark:text-foreground-dark">
            Dashboard
          </h2>
          <p className="text-sm sm:text-base text-subtle-light dark:text-subtle-dark mt-1 sm:mt-2">
            Welcome back, Super Admin!
          </p>
        </header>

        {/* Key Performance Indicators */}
        <section>
          <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-foreground-light dark:text-foreground-dark">
            Key Performance Indicators
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-card-light dark:bg-card-dark p-4 sm:p-6 rounded-xl shadow-soft">
              <p className="text-xs sm:text-sm text-subtle-light dark:text-subtle-dark mb-1">Total Hospitals</p>
              <p className="text-3xl sm:text-4xl font-bold text-foreground-light dark:text-foreground-dark">125</p>
            </div>
            <div className="bg-card-light dark:bg-card-dark p-4 sm:p-6 rounded-xl shadow-soft">
              <p className="text-xs sm:text-sm text-subtle-light dark:text-subtle-dark mb-1">Active Hospitals (24h)</p>
              <p className="text-3xl sm:text-4xl font-bold text-foreground-light dark:text-foreground-dark">118</p>
            </div>
            <div className="bg-card-light dark:bg-card-dark p-4 sm:p-6 rounded-xl shadow-soft">
              <p className="text-xs sm:text-sm text-subtle-light dark:text-subtle-dark mb-1">Total Users</p>
              <p className="text-3xl sm:text-4xl font-bold text-foreground-light dark:text-foreground-dark">542</p>
            </div>
            <div className="bg-card-light dark:bg-card-dark p-4 sm:p-6 rounded-xl shadow-soft">
              <p className="text-xs sm:text-sm text-subtle-light dark:text-subtle-dark mb-1">Queue Backlog</p>
              <p className="text-3xl sm:text-4xl font-bold text-foreground-light dark:text-foreground-dark">37</p>
            </div>
          </div>
        </section>

        {/* Reminders Sent & Health Card Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mt-6 sm:mt-8 lg:mt-12">
          {/* Reminders Sent Card */}
          <section className="lg:col-span-2">
            <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-foreground-light dark:text-foreground-dark">
              Reminders Sent
            </h3>
            <div className="bg-card-light dark:bg-card-dark p-4 sm:p-6 rounded-xl shadow-soft h-full">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-2 sm:gap-0 mb-4 sm:mb-0">
                <div>
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground-light dark:text-foreground-dark">1,234</p>
                  <p className="text-xs sm:text-sm text-subtle-light dark:text-subtle-dark">Last 30 Days</p>
                </div>
                <div className="flex items-center text-green-500 dark:text-green-400 text-xs sm:text-sm font-bold">
                  <span className="material-symbols-outlined text-sm sm:text-base">trending_up</span>
                  <span>+12%</span>
                </div>
              </div>
              <div className="mt-4 sm:mt-8 h-48 sm:h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart 
                    data={remindersData} 
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid 
                      strokeDasharray="3 3" 
                      stroke="currentColor" 
                      className="opacity-20 dark:opacity-10"
                    />
                    <XAxis 
                      dataKey="day" 
                      stroke="currentColor"
                      className="text-subtle-light dark:text-subtle-dark text-xs"
                    />
                    <YAxis 
                      stroke="currentColor"
                      className="text-subtle-light dark:text-subtle-dark text-xs"
                      domain={[0, 1800]}
                      ticks={[0, 450, 900, 1350, 1800]}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'transparent',
                        border: 'none',
                        boxShadow: 'none',
                      }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-lg p-3 shadow-lg">
                              <p className="font-semibold text-foreground-light dark:text-foreground-dark mb-2">
                                {payload[0].payload.day}
                              </p>
                              {payload.map((entry: any, index: number) => (
                                <p key={index} className="text-sm font-medium" style={{ color: entry.color }}>
                                  {entry.name}: {entry.value.toLocaleString()}
                                </p>
                              ))}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="sent"
                      stroke="#607afb"
                      strokeWidth={3}
                      dot={{ fill: '#607afb', strokeWidth: 2, r: 4 }}
                      name="Sent"
                      animationDuration={750}
                    />
                    <Line
                      type="monotone"
                      dataKey="delivered"
                      stroke="#10b981"
                      strokeWidth={3}
                      dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                      name="Delivered"
                      animationDuration={750}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>

          {/* Health Card */}
          <section>
            <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-foreground-light dark:text-foreground-dark">
              Health Card
            </h3>
            <div className="bg-card-light dark:bg-card-dark p-4 sm:p-6 rounded-xl shadow-soft h-full flex flex-col">
              <p className="font-bold text-sm sm:text-base text-foreground-light dark:text-foreground-dark">n8n Workflow Health</p>
              <div className="mt-4 space-y-3 text-xs sm:text-sm text-subtle-light dark:text-subtle-dark">
                <div className="flex justify-between items-center">
                  <span>Last Run:</span>
                  <span className="font-medium text-foreground-light dark:text-foreground-dark">2 min ago</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Status:</span>
                  <span className="font-medium text-green-500 dark:text-green-400 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm sm:text-base">check_circle</span>
                    Healthy
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Failures (24h):</span>
                  <span className="font-medium text-foreground-light dark:text-foreground-dark">2</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Avg. Latency:</span>
                  <span className="font-medium text-foreground-light dark:text-foreground-dark">150ms</span>
                </div>
              </div>
              <div className="mt-auto pt-4 sm:pt-6">
                <button 
                  onClick={() => navigate('/super/n8n-logs')}
                  className="w-full bg-primary/20 hover:bg-primary/30 dark:bg-primary/30 dark:hover:bg-primary/40 text-primary font-bold py-2.5 sm:py-2 px-4 rounded-lg transition-colors cursor-pointer text-sm sm:text-base touch-manipulation"
                >
                  View Logs
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* Recent Activity */}
        <section className="mt-6 sm:mt-8 lg:mt-12">
          <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-foreground-light dark:text-foreground-dark">
            Recent Activity
          </h3>
          <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-soft p-2 sm:p-4">
            <div className="flow-root">
              <ul className="divide-y divide-border-light dark:divide-border-dark">
                {recentActivity.map((activity, index) => {
                  return (
                    <li key={index} className="p-3 sm:p-4">
                      <div className="flex items-start space-x-3 sm:space-x-4">
                        <div className="flex-shrink-0">
                          <span className={`material-symbols-outlined text-lg sm:text-xl ${activity.iconColor} ${activity.iconBg} rounded-full p-1.5 sm:p-2`}>
                            {activity.icon}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm font-bold text-foreground-light dark:text-foreground-dark break-words">
                            {activity.message}
                          </p>
                          <p className="text-xs sm:text-sm text-subtle-light dark:text-subtle-dark mt-1">
                            {activity.time}
                          </p>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
};

export default SuperAdminDashboard;

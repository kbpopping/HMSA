import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import AppShell from '../components/layout/AppShell';
import { useAuth } from '../store/auth';
import { ClinicianAPI } from '../api/endpoints';
import { formatDate, formatTime, isToday } from '../utils/date';
import clsx from 'clsx';

export default function Dashboard() {
  const { user } = useAuth();
  
  // Fetch appointments
  const { data: appointments = [], isLoading: appointmentsLoading } = useQuery({
    queryKey: ['appointments', user?.hospital_id, user?.id],
    queryFn: () => ClinicianAPI.getAppointments(user!.hospital_id, user!.id),
    enabled: !!user?.hospital_id && !!user?.id,
  });
  
  // Fetch earnings
  const { data: earnings, isLoading: earningsLoading } = useQuery({
    queryKey: ['earnings', user?.hospital_id, user?.id],
    queryFn: () => ClinicianAPI.getEarnings(user!.hospital_id, user!.id),
    enabled: !!user?.hospital_id && !!user?.id,
  });
  
  // Calculate KPIs
  const appointmentsToday = appointments.filter(apt => isToday(apt.appointment_date)).length;
  const upcomingAppointments = appointments.filter(apt => apt.status !== 'completed' && apt.status !== 'cancelled').length;
  const patientsSeenThisWeek = appointments.filter(apt => apt.status === 'completed').length;
  const earningsThisMonth = earnings?.currentMonth || 0;
  
  // Get today's appointments
  const todayAppointments = appointments.filter(apt => isToday(apt.appointment_date)).slice(0, 5);
  
  return (
    <AppShell>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold text-foreground-light dark:text-foreground-dark mb-2">
            Welcome back, {user?.name?.split(' ')[0] || 'Doctor'}!
          </h1>
          <p className="text-subtle-light dark:text-subtle-dark">
            Here's an overview of your schedule and activities
          </p>
        </div>
        
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Appointments Today */}
          <div className="bg-card-light dark:bg-card-dark rounded-xl p-6 shadow-soft border border-border-light dark:border-border-dark">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-2xl">
                  event
                </span>
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground-light dark:text-foreground-dark mb-1">
              {appointmentsToday}
            </p>
            <p className="text-sm text-subtle-light dark:text-subtle-dark">
              Appointments Today
            </p>
          </div>
          
          {/* Upcoming Appointments */}
          <div className="bg-card-light dark:bg-card-dark rounded-xl p-6 shadow-soft border border-border-light dark:border-border-dark">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-purple-600 dark:text-purple-400 text-2xl">
                  schedule
                </span>
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground-light dark:text-foreground-dark mb-1">
              {upcomingAppointments}
            </p>
            <p className="text-sm text-subtle-light dark:text-subtle-dark">
              Upcoming
            </p>
          </div>
          
          {/* Patients Seen */}
          <div className="bg-card-light dark:bg-card-dark rounded-xl p-6 shadow-soft border border-border-light dark:border-border-dark">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-2xl">
                  people
                </span>
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground-light dark:text-foreground-dark mb-1">
              {patientsSeenThisWeek}
            </p>
            <p className="text-sm text-subtle-light dark:text-subtle-dark">
              Seen This Week
            </p>
          </div>
          
          {/* Earnings This Month */}
          <div className="bg-card-light dark:bg-card-dark rounded-xl p-6 shadow-soft border border-border-light dark:border-border-dark">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-yellow-600 dark:text-yellow-400 text-2xl">
                  payments
                </span>
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground-light dark:text-foreground-dark mb-1">
              ${earningsThisMonth.toLocaleString()}
            </p>
            <p className="text-sm text-subtle-light dark:text-subtle-dark">
              This Month
            </p>
          </div>
        </div>
        
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's Appointments */}
          <div className="lg:col-span-2 bg-card-light dark:bg-card-dark rounded-xl p-6 shadow-soft border border-border-light dark:border-border-dark">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground-light dark:text-foreground-dark">
                Today's Schedule
              </h2>
              <Link
                to="/appointments"
                className="text-sm text-primary hover:underline"
              >
                View All
              </Link>
            </div>
            
            {appointmentsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : todayAppointments.length > 0 ? (
              <div className="space-y-3">
                {todayAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between p-4 bg-background-light dark:bg-background-dark rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary">
                          person
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground-light dark:text-foreground-dark">
                          {appointment.patient_name}
                        </p>
                        <p className="text-sm text-subtle-light dark:text-subtle-dark">
                          {appointment.reason || 'Consultation'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-foreground-light dark:text-foreground-dark">
                        {formatTime(appointment.appointment_time)}
                      </p>
                      <span
                        className={clsx(
                          'inline-block px-2 py-0.5 rounded text-xs font-medium',
                          appointment.status === 'confirmed' && 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300',
                          appointment.status === 'scheduled' && 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300',
                          appointment.status === 'completed' && 'bg-gray-100 dark:bg-gray-900/20 text-gray-700 dark:text-gray-300',
                          appointment.status === 'cancelled' && 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                        )}
                      >
                        {appointment.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <span className="material-symbols-outlined text-5xl text-subtle-light dark:text-subtle-dark mb-4 block">
                  event_available
                </span>
                <p className="text-subtle-light dark:text-subtle-dark">
                  No appointments scheduled for today
                </p>
              </div>
            )}
          </div>
          
          {/* Quick Actions */}
          <div className="bg-card-light dark:bg-card-dark rounded-xl p-6 shadow-soft border border-border-light dark:border-border-dark">
            <h2 className="text-xl font-semibold text-foreground-light dark:text-foreground-dark mb-6">
              Quick Actions
            </h2>
            
            <div className="space-y-3">
              <Link
                to="/appointments"
                className="flex items-center gap-3 p-4 bg-background-light dark:bg-background-dark rounded-lg hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary">
                    event
                  </span>
                </div>
                <div>
                  <p className="font-medium text-foreground-light dark:text-foreground-dark">
                    View Appointments
                  </p>
                  <p className="text-xs text-subtle-light dark:text-subtle-dark">
                    Manage your schedule
                  </p>
                </div>
              </Link>
              
              <Link
                to="/patients"
                className="flex items-center gap-3 p-4 bg-background-light dark:bg-background-dark rounded-lg hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary">
                    people
                  </span>
                </div>
                <div>
                  <p className="font-medium text-foreground-light dark:text-foreground-dark">
                    Patient Records
                  </p>
                  <p className="text-xs text-subtle-light dark:text-subtle-dark">
                    Access health records
                  </p>
                </div>
              </Link>
              
              <Link
                to="/earnings"
                className="flex items-center gap-3 p-4 bg-background-light dark:bg-background-dark rounded-lg hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary">
                    account_balance_wallet
                  </span>
                </div>
                <div>
                  <p className="font-medium text-foreground-light dark:text-foreground-dark">
                    View Earnings
                  </p>
                  <p className="text-xs text-subtle-light dark:text-subtle-dark">
                    Track your salary
                  </p>
                </div>
              </Link>
              
              <Link
                to="/settings"
                className="flex items-center gap-3 p-4 bg-background-light dark:bg-background-dark rounded-lg hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary">
                    settings
                  </span>
                </div>
                <div>
                  <p className="font-medium text-foreground-light dark:text-foreground-dark">
                    Settings
                  </p>
                  <p className="text-xs text-subtle-light dark:text-subtle-dark">
                    Update preferences
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Team Updates / Notifications */}
        <div className="bg-card-light dark:bg-card-dark rounded-xl p-6 shadow-soft border border-border-light dark:border-border-dark">
          <h2 className="text-xl font-semibold text-foreground-light dark:text-foreground-dark mb-4">
            Team Updates
          </h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 flex-shrink-0">
                info
              </span>
              <div>
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  System Maintenance Scheduled
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                  The portal will be under maintenance on Saturday, 2:00 AM - 4:00 AM
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}


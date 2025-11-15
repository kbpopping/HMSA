import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import AppShell from '../../components/layout/AppShell';
import { HospitalAPI } from '../../api/endpoints';
import { useAuth } from '../../store/auth';
import { useMemo } from 'react';

/**
 * Hospital Admin Dashboard
 * 
 * Displays KPIs, charts, and upcoming appointments matching the design image
 */
const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const hospitalId = user?.hospital_id || '1';

  // Fetch dashboard metrics
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['hospital', 'metrics', hospitalId],
    queryFn: () => HospitalAPI.metrics(hospitalId),
  });

  // Fetch all appointments to calculate upcoming appointments (next 2 hours)
  const { data: allAppointments = [] } = useQuery({
    queryKey: ['hospital', 'appointments', hospitalId, 'all', 'all', 'all'],
    queryFn: async () => {
      try {
        const result = await HospitalAPI.listAppointments(hospitalId, {});
        return Array.isArray(result) ? result : [];
      } catch (err) {
        console.error('Error fetching appointments:', err);
        return [];
      }
    },
  });

  // Calculate upcoming appointments (next 2 hours)
  const upcomingAppointments = useMemo(() => {
    const now = new Date();
    const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    
    return allAppointments
      .filter(apt => {
        // Only show scheduled or confirmed appointments
        if (apt.status !== 'scheduled' && apt.status !== 'confirmed') {
          return false;
        }
        
        // Parse appointment date and time
        const appointmentDate = new Date(`${apt.appointment_date}T${apt.appointment_time}`);
        
        // Check if appointment is within the next 2 hours
        return appointmentDate >= now && appointmentDate <= twoHoursLater;
      })
      .sort((a, b) => {
        // Sort by appointment time
        const dateA = new Date(`${a.appointment_date}T${a.appointment_time}`);
        const dateB = new Date(`${b.appointment_date}T${b.appointment_time}`);
        return dateA.getTime() - dateB.getTime();
      })
      .slice(0, 10) // Limit to 10 appointments
      .map(apt => ({
        id: apt.id,
        patient_name: apt.patient_name,
        appointment_time: new Date(`${apt.appointment_date}T${apt.appointment_time}`).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        }),
        clinician_name: apt.clinician_names && apt.clinician_names.length > 0
          ? apt.clinician_names.join(', ')
          : apt.clinician_name,
        appointment_date: apt.appointment_date,
        appointment_time_raw: apt.appointment_time,
      }));
  }, [allAppointments]);

  // Status colors matching the image
  const statusColors: Record<string, { bg: string; text: string }> = {
    booked: { bg: 'bg-blue-500', text: 'text-blue-500' },
    confirmed: { bg: 'bg-green-500', text: 'text-green-500' },
    cancelled: { bg: 'bg-yellow-500', text: 'text-yellow-500' },
    'no-show': { bg: 'bg-red-500', text: 'text-red-500' },
  };

  // Calculate max value for status bars
  const maxStatusValue = metrics?.byStatus.reduce((max, item) => Math.max(max, item.count), 0) || 100;

  if (isLoading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto">
        {/* Dashboard Title */}
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground-light dark:text-foreground-dark mb-6 sm:mb-8">
          Dashboard
        </h1>

        {/* Top Row - 4 KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-card-light dark:bg-card-dark p-4 sm:p-6 rounded-xl shadow-soft">
            <p className="text-sm sm:text-base text-subtle-light dark:text-subtle-dark mb-2">
              Appointments today
            </p>
            <p className="text-3xl sm:text-4xl font-bold text-foreground-light dark:text-foreground-dark">
              {metrics?.appointmentsToday || 24}
            </p>
          </div>
          <div className="bg-card-light dark:bg-card-dark p-4 sm:p-6 rounded-xl shadow-soft">
            <p className="text-sm sm:text-base text-subtle-light dark:text-subtle-dark mb-2">
              Reminders sent today
            </p>
            <p className="text-3xl sm:text-4xl font-bold text-foreground-light dark:text-foreground-dark">
              {metrics?.remindersSentToday || 150}
            </p>
          </div>
          <div className="bg-card-light dark:bg-card-dark p-4 sm:p-6 rounded-xl shadow-soft">
            <p className="text-sm sm:text-base text-subtle-light dark:text-subtle-dark mb-2">
              No-shows this week
            </p>
            <p className="text-3xl sm:text-4xl font-bold text-foreground-light dark:text-foreground-dark">
              {metrics?.noShowsThisWeek || 3}
            </p>
          </div>
          <div className="bg-card-light dark:bg-card-dark p-4 sm:p-6 rounded-xl shadow-soft">
            <p className="text-sm sm:text-base text-subtle-light dark:text-subtle-dark mb-2">
              Opt-out rate
            </p>
            <p className="text-3xl sm:text-4xl font-bold text-foreground-light dark:text-foreground-dark">
              {metrics?.optOutRate?.toFixed(1) || '0.5'}%
            </p>
          </div>
        </div>

        {/* Middle Row - 2 Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Appointments by Status */}
          <div className="bg-card-light dark:bg-card-dark p-4 sm:p-6 rounded-xl shadow-soft">
            <h3 className="text-lg sm:text-xl font-bold text-foreground-light dark:text-foreground-dark mb-4 sm:mb-6">
              Appointments by Status
            </h3>
            <div className="space-y-4">
              {metrics?.byStatus.map((item) => {
                const statusColor = statusColors[item.status] || { bg: 'bg-gray-500', text: 'text-gray-500' };
                const percentage = (item.count / maxStatusValue) * 100;
                
                return (
                  <div key={item.status} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm sm:text-base font-medium text-foreground-light dark:text-foreground-dark capitalize">
                        {item.status === 'no-show' ? 'No-show' : item.status}
                      </span>
                      <span className="text-sm sm:text-base font-bold text-foreground-light dark:text-foreground-dark">
                        {item.count}
                      </span>
                    </div>
                    <div className="w-full bg-background-light dark:bg-background-dark rounded-full h-2 sm:h-3 overflow-hidden">
                      <div
                        className={`${statusColor.bg} h-full rounded-full transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 7-day Trend */}
          <div className="bg-card-light dark:bg-card-dark p-4 sm:p-6 rounded-xl shadow-soft">
            <h3 className="text-lg sm:text-xl font-bold text-foreground-light dark:text-foreground-dark mb-4 sm:mb-6">
              7-day Trend
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={metrics?.sevenDayTrend || []}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#607afb" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#607afb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-20" />
                <XAxis
                  dataKey="day"
                  tick={{ fill: 'currentColor', fontSize: 12 }}
                  className="text-subtle-light dark:text-subtle-dark"
                />
                <YAxis
                  tick={{ fill: 'currentColor', fontSize: 12 }}
                  className="text-subtle-light dark:text-subtle-dark"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card-light)',
                    border: '1px solid var(--border-light)',
                    borderRadius: '0.5rem',
                  }}
                  labelStyle={{ color: 'var(--foreground-light)' }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#607afb"
                  strokeWidth={2}
                  fill="url(#colorValue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom Row - 2 Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Upcoming Appointments */}
          <div className="bg-card-light dark:bg-card-dark p-4 sm:p-6 rounded-xl shadow-soft">
            <h3 className="text-lg sm:text-xl font-bold text-foreground-light dark:text-foreground-dark mb-4 sm:mb-6">
              Upcoming Appointments (next 2 hours)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border-light dark:border-border-dark">
                    <th className="text-left py-2 px-2 sm:px-4 text-sm sm:text-base font-medium text-subtle-light dark:text-subtle-dark">
                      Patient
                    </th>
                    <th className="text-left py-2 px-2 sm:px-4 text-sm sm:text-base font-medium text-subtle-light dark:text-subtle-dark">
                      Clinician
                    </th>
                    <th className="text-left py-2 px-2 sm:px-4 text-sm sm:text-base font-medium text-subtle-light dark:text-subtle-dark">
                      Time
                    </th>
                    <th className="text-left py-2 px-2 sm:px-4 text-sm sm:text-base font-medium text-subtle-light dark:text-subtle-dark">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {upcomingAppointments.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 px-4 text-center text-sm text-subtle-light dark:text-subtle-dark">
                        No upcoming appointments in the next 2 hours
                      </td>
                    </tr>
                  ) : (
                    upcomingAppointments.map((appointment) => (
                      <tr
                        key={appointment.id}
                        className="border-b border-border-light dark:border-border-dark hover:bg-background-light dark:hover:bg-background-dark transition-colors cursor-pointer"
                        onClick={() => navigate(`/hospital/appointments?appointmentId=${appointment.id}&date=${appointment.appointment_date}`)}
                      >
                        <td className="py-3 px-2 sm:px-4 text-sm sm:text-base text-foreground-light dark:text-foreground-dark">
                          {appointment.patient_name}
                        </td>
                        <td className="py-3 px-2 sm:px-4 text-sm sm:text-base text-foreground-light dark:text-foreground-dark">
                          {appointment.clinician_name}
                        </td>
                        <td className="py-3 px-2 sm:px-4 text-sm sm:text-base text-foreground-light dark:text-foreground-dark">
                          {appointment.appointment_time}
                        </td>
                        <td className="py-3 px-2 sm:px-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/hospital/appointments?appointmentId=${appointment.id}&date=${appointment.appointment_date}`);
                            }}
                            className="text-primary hover:underline text-sm sm:text-base font-medium"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Template Coverage */}
          <div className="bg-card-light dark:bg-card-dark p-4 sm:p-6 rounded-xl shadow-soft">
            <h3 className="text-lg sm:text-xl font-bold text-foreground-light dark:text-foreground-dark mb-4 sm:mb-6">
              Template Coverage
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm sm:text-base text-subtle-light dark:text-subtle-dark mb-2">
                  Active Templates by Channel
                </p>
                <p className="text-3xl sm:text-4xl font-bold text-foreground-light dark:text-foreground-dark mb-4">
                  {metrics?.templateCoverage?.overall || 75}%
                </p>
              </div>
              <div className="w-full bg-background-light dark:bg-background-dark rounded-full h-3 sm:h-4 overflow-hidden">
                <div
                  className="bg-primary h-full rounded-full transition-all duration-500"
                  style={{ width: `${metrics?.templateCoverage?.overall || 75}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default Dashboard;

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import clsx from 'clsx';
import AppShell from '../components/layout/AppShell';
import { useAuth } from '../store/auth';
import { ClinicianAPI, type Appointment, type Patient } from '../api/endpoints';
import { formatDate, formatTime, isToday, getDayOfWeek } from '../utils/date';
import BookNewAppointment from '../components/appointments/BookNewAppointment';
import CalendarView from '../components/appointments/CalendarView';

type ViewType = 'list' | 'calendar' | 'book';

export default function Appointments() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [view, setView] = useState<ViewType>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  
  // Fetch appointments
  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ['appointments', user?.hospital_id, user?.id],
    queryFn: () => ClinicianAPI.getAppointments(user!.hospital_id, user!.id),
    enabled: !!user?.hospital_id && !!user?.id,
  });
  
  // Fetch patients (for booking) - only if user has patient access
  const hasAccess = user?.role === 'clinician' || user?.role === 'nurse' || user?.permissions?.includes('Patient Management');
  const { data: patients = [] } = useQuery({
    queryKey: ['patients', user?.hospital_id],
    queryFn: () => ClinicianAPI.getPatients(user!.hospital_id, {}),
    enabled: !!user?.hospital_id && hasAccess,
  });
  
  // Update appointment status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ appointmentId, status }: { appointmentId: string; status: string }) =>
      ClinicianAPI.updateAppointmentStatus(user!.hospital_id, appointmentId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments', user?.hospital_id, user?.id] });
      toast.success('Appointment updated successfully');
      setSelectedAppointment(null);
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update appointment');
    },
  });
  
  // Filter and search appointments
  const filteredAppointments = useMemo(() => {
    let filtered = [...appointments];
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(apt =>
        apt.patient_name.toLowerCase().includes(query) ||
        apt.patient_mrn?.toLowerCase().includes(query) ||
        apt.reason?.toLowerCase().includes(query) ||
        apt.appointment_number?.toLowerCase().includes(query)
      );
    }
    
    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(apt => apt.status === statusFilter);
    }
    
    // Date filter
    if (dateFilter === 'today') {
      filtered = filtered.filter(apt => isToday(apt.appointment_date));
    } else if (dateFilter === 'upcoming') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      filtered = filtered.filter(apt => {
        const aptDate = new Date(apt.appointment_date);
        return aptDate >= today && apt.status !== 'completed' && apt.status !== 'cancelled';
      });
    } else if (dateFilter === 'past') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      filtered = filtered.filter(apt => {
        const aptDate = new Date(apt.appointment_date);
        return aptDate < today || apt.status === 'completed' || apt.status === 'cancelled';
      });
    }
    
    // Sort by date and time
    return filtered.sort((a, b) => {
      const dateA = new Date(`${a.appointment_date} ${a.appointment_time}`);
      const dateB = new Date(`${b.appointment_date} ${b.appointment_time}`);
      return dateB.getTime() - dateA.getTime(); // Most recent first
    });
  }, [appointments, searchQuery, statusFilter, dateFilter]);
  
  // Calculate summary statistics
  const summary = useMemo(() => {
    const today = appointments.filter(apt => isToday(apt.appointment_date));
    const upcoming = appointments.filter(apt => {
      const aptDate = new Date(apt.appointment_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return aptDate >= today && apt.status !== 'completed' && apt.status !== 'cancelled';
    });
    const completed = appointments.filter(apt => apt.status === 'completed');
    const cancelled = appointments.filter(apt => apt.status === 'cancelled');
    
    return {
      today: today.length,
      upcoming: upcoming.length,
      completed: completed.length,
      cancelled: cancelled.length,
    };
  }, [appointments]);
  
  // Status colors
  const statusColors: Record<string, { bg: string; text: string; border: string }> = {
    scheduled: { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-800' },
    confirmed: { bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-700 dark:text-green-300', border: 'border-green-200 dark:border-green-800' },
    completed: { bg: 'bg-gray-50 dark:bg-gray-800', text: 'text-gray-700 dark:text-gray-300', border: 'border-gray-200 dark:border-gray-700' },
    cancelled: { bg: 'bg-yellow-50 dark:bg-yellow-900/20', text: 'text-yellow-700 dark:text-yellow-300', border: 'border-yellow-200 dark:border-yellow-800' },
    'no-show': { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-700 dark:text-red-300', border: 'border-red-200 dark:border-red-800' },
  };
  
  const handleQuickAction = (appointment: Appointment, action: 'confirm' | 'cancel' | 'complete') => {
    const statusMap = {
      confirm: 'confirmed',
      cancel: 'cancelled',
      complete: 'completed',
    };
    updateStatusMutation.mutate({
      appointmentId: String(appointment.id),
      status: statusMap[action],
    });
  };
  
  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground-light dark:text-foreground-dark mb-2">
              Appointments
            </h1>
            <p className="text-subtle-light dark:text-subtle-dark">
              Manage your appointments and schedule
            </p>
          </div>
          
          {/* View Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setView('list')}
              className={clsx(
                'px-4 py-2 rounded-lg font-medium transition-colors',
                view === 'list'
                  ? 'bg-primary text-white'
                  : 'bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark hover:bg-card-light dark:hover:bg-card-dark'
              )}
            >
              <span className="material-symbols-outlined align-middle mr-2">list</span>
              List
            </button>
            <button
              onClick={() => setView('calendar')}
              className={clsx(
                'px-4 py-2 rounded-lg font-medium transition-colors',
                view === 'calendar'
                  ? 'bg-primary text-white'
                  : 'bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark hover:bg-card-light dark:hover:bg-card-dark'
              )}
            >
              <span className="material-symbols-outlined align-middle mr-2">calendar_month</span>
              Calendar
            </button>
            <button
              onClick={() => setView('book')}
              className={clsx(
                'px-4 py-2 rounded-lg font-medium transition-colors',
                view === 'book'
                  ? 'bg-primary text-white'
                  : 'bg-primary text-white hover:bg-primary/90'
              )}
            >
              <span className="material-symbols-outlined align-middle mr-2">add</span>
              Book New
            </button>
          </div>
        </div>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card-light dark:bg-card-dark rounded-xl p-6 shadow-soft border border-border-light dark:border-border-dark">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-subtle-light dark:text-subtle-dark">Today</span>
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">today</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground-light dark:text-foreground-dark">{summary.today}</p>
          </div>
          
          <div className="bg-card-light dark:bg-card-dark rounded-xl p-6 shadow-soft border border-border-light dark:border-border-dark">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-subtle-light dark:text-subtle-dark">Upcoming</span>
              <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-green-600 dark:text-green-400">schedule</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground-light dark:text-foreground-dark">{summary.upcoming}</p>
          </div>
          
          <div className="bg-card-light dark:bg-card-dark rounded-xl p-6 shadow-soft border border-border-light dark:border-border-dark">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-subtle-light dark:text-subtle-dark">Completed</span>
              <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <span className="material-symbols-outlined text-gray-600 dark:text-gray-400">check_circle</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground-light dark:text-foreground-dark">{summary.completed}</p>
          </div>
          
          <div className="bg-card-light dark:bg-card-dark rounded-xl p-6 shadow-soft border border-border-light dark:border-border-dark">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-subtle-light dark:text-subtle-dark">Cancelled</span>
              <div className="w-10 h-10 rounded-lg bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-yellow-600 dark:text-yellow-400">cancel</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground-light dark:text-foreground-dark">{summary.cancelled}</p>
          </div>
        </div>
        
        {/* Content Area */}
        {view === 'book' ? (
          <BookNewAppointment
            patients={patients}
            onClose={() => setView('list')}
            onSuccess={() => {
              setView('list');
              queryClient.invalidateQueries({ queryKey: ['appointments', user?.hospital_id, user?.id] });
            }}
          />
        ) : view === 'calendar' ? (
          <CalendarView
            appointments={filteredAppointments}
            onAppointmentClick={setSelectedAppointment}
          />
        ) : (
          /* List View */
          <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-soft border border-border-light dark:border-border-dark">
            {/* Filters */}
            <div className="p-6 border-b border-border-light dark:border-border-dark">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-subtle-light dark:text-subtle-dark">
                      search
                    </span>
                    <input
                      type="text"
                      placeholder="Search by patient name, MRN, or reason..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full h-12 pl-10 pr-4 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark placeholder-subtle-light dark:placeholder-subtle-dark focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
                
                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-12 px-4 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">All Status</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="no-show">No Show</option>
                </select>
                
                {/* Date Filter */}
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="h-12 px-4 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">All Dates</option>
                  <option value="today">Today</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="past">Past</option>
                </select>
              </div>
            </div>
            
            {/* Appointments List */}
            <div className="p-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : filteredAppointments.length === 0 ? (
                <div className="text-center py-12">
                  <span className="material-symbols-outlined text-5xl text-subtle-light dark:text-subtle-dark mb-4 block">
                    event_busy
                  </span>
                  <p className="text-subtle-light dark:text-subtle-dark">No appointments found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="p-4 bg-background-light dark:bg-background-dark rounded-lg border border-border-light dark:border-border-dark hover:shadow-soft transition-shadow"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        {/* Left: Appointment Info */}
                        <div className="flex-1">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <span className="material-symbols-outlined text-primary">person</span>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-1">
                                <h3 className="font-semibold text-foreground-light dark:text-foreground-dark">
                                  {appointment.patient_name}
                                </h3>
                                {appointment.appointment_number && (
                                  <span className="text-xs text-subtle-light dark:text-subtle-dark">
                                    {appointment.appointment_number}
                                  </span>
                                )}
                                <span
                                  className={clsx(
                                    'px-2 py-0.5 rounded text-xs font-medium border',
                                    statusColors[appointment.status].bg,
                                    statusColors[appointment.status].text,
                                    statusColors[appointment.status].border
                                  )}
                                >
                                  {appointment.status}
                                </span>
                              </div>
                              <div className="flex flex-wrap items-center gap-4 text-sm text-subtle-light dark:text-subtle-dark">
                                <span className="flex items-center gap-1">
                                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>calendar_today</span>
                                  {formatDate(appointment.appointment_date)} ({getDayOfWeek(appointment.appointment_date)})
                                </span>
                                <span className="flex items-center gap-1">
                                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>schedule</span>
                                  {formatTime(appointment.appointment_time)}
                                </span>
                                {appointment.patient_mrn && (
                                  <span className="flex items-center gap-1">
                                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>badge</span>
                                    {appointment.patient_mrn}
                                  </span>
                                )}
                                {appointment.reason && (
                                  <span className="flex items-center gap-1">
                                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>description</span>
                                    {appointment.reason}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Right: Actions */}
                        <div className="flex items-center gap-2">
                          {appointment.status === 'scheduled' && (
                            <button
                              onClick={() => handleQuickAction(appointment, 'confirm')}
                              disabled={updateStatusMutation.isPending}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>check</span>
                              Confirm
                            </button>
                          )}
                          {appointment.status !== 'completed' && appointment.status !== 'cancelled' && (
                            <>
                              <button
                                onClick={() => handleQuickAction(appointment, 'complete')}
                                disabled={updateStatusMutation.isPending}
                                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>done</span>
                                Complete
                              </button>
                              <button
                                onClick={() => handleQuickAction(appointment, 'cancel')}
                                disabled={updateStatusMutation.isPending}
                                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
                                Cancel
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => setSelectedAppointment(appointment)}
                            className="p-2 rounded-lg border border-border-light dark:border-border-dark hover:bg-background-light dark:hover:bg-background-dark transition-colors"
                          >
                            <span className="material-symbols-outlined text-foreground-light dark:text-foreground-dark">more_vert</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Appointment Details Modal */}
        {selectedAppointment && (
          <div
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedAppointment(null)}
          >
            <div
              className="bg-card-light dark:bg-card-dark rounded-xl shadow-soft-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-border-light dark:border-border-dark">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-foreground-light dark:text-foreground-dark">
                    Appointment Details
                  </h2>
                  <button
                    onClick={() => setSelectedAppointment(null)}
                    className="p-2 rounded-lg hover:bg-background-light dark:hover:bg-background-dark"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="text-sm font-medium text-subtle-light dark:text-subtle-dark">Patient</label>
                  <p className="text-foreground-light dark:text-foreground-dark font-semibold">{selectedAppointment.patient_name}</p>
                  {selectedAppointment.patient_mrn && (
                    <p className="text-sm text-subtle-light dark:text-subtle-dark">MRN: {selectedAppointment.patient_mrn}</p>
                  )}
                </div>
                
                <div>
                  <label className="text-sm font-medium text-subtle-light dark:text-subtle-dark">Date & Time</label>
                  <p className="text-foreground-light dark:text-foreground-dark">
                    {formatDate(selectedAppointment.appointment_date)} at {formatTime(selectedAppointment.appointment_time)}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-subtle-light dark:text-subtle-dark">Status</label>
                  <span
                    className={clsx(
                      'inline-block px-3 py-1 rounded-lg text-sm font-medium border',
                      statusColors[selectedAppointment.status].bg,
                      statusColors[selectedAppointment.status].text,
                      statusColors[selectedAppointment.status].border
                    )}
                  >
                    {selectedAppointment.status}
                  </span>
                </div>
                
                {selectedAppointment.reason && (
                  <div>
                    <label className="text-sm font-medium text-subtle-light dark:text-subtle-dark">Reason</label>
                    <p className="text-foreground-light dark:text-foreground-dark">{selectedAppointment.reason}</p>
                  </div>
                )}
                
                {selectedAppointment.notes && (
                  <div>
                    <label className="text-sm font-medium text-subtle-light dark:text-subtle-dark">Notes</label>
                    <p className="text-foreground-light dark:text-foreground-dark">{selectedAppointment.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}


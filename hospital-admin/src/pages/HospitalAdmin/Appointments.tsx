import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import clsx from 'clsx';
import AppShell from '../../components/layout/AppShell';
import { HospitalAPI } from '../../api/endpoints';
import { useAuth } from '../../store/auth';
import Modal from '../../components/modals/Modal';
import TextField from '../../components/forms/TextField';
import Select from '../../components/forms/Select';
import DateTimePicker from '../../components/forms/DateTimePicker';
import Spinner from '../../components/feedback/Spinner';
import EmptyState from '../../components/feedback/EmptyState';

type Appointment = {
  id: number;
  appointment_number?: string;
  patient_id: number;
  patient_name: string;
  patient_mrn?: string;
  clinician_id: number;
  clinician_name: string;
  clinician_ids?: number[];
  clinician_names?: string[];
  appointment_date: string;
  appointment_time: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  reason?: string;
  created_at: string;
};

type ViewMode = 'list' | 'calendar';

/**
 * Appointments Page
 * 
 * Features:
 * - List and Calendar view toggle
 * - Filter by status, clinician, date range
 * - Create appointment modal
 * - Quick actions (confirm, cancel, reschedule)
 */
const Appointments = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const hospitalId = user?.hospital_id || '1';

  // View mode state
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [clinicianFilter, setClinicianFilter] = useState<string>('all');
  const [dateRangeFilter, setDateRangeFilter] = useState<string>('today');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Handle navigation from dashboard
  useEffect(() => {
    const appointmentId = searchParams.get('appointmentId');
    const date = searchParams.get('date');
    
    if (appointmentId && date) {
      // Set the date range filter to show the appointment date
      const appointmentDate = new Date(date);
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      
      if (date === todayStr) {
        setDateRangeFilter('today');
      } else {
        // Check if it's in the current week
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
        
        if (appointmentDate >= weekStart && appointmentDate <= weekEnd) {
          setDateRangeFilter('week');
        } else if (appointmentDate.getMonth() === now.getMonth() && appointmentDate.getFullYear() === now.getFullYear()) {
          setDateRangeFilter('month');
        } else {
          setDateRangeFilter('all');
        }
      }
      
      // Switch to calendar view and set the calendar to the appointment date
      setViewMode('calendar');
      setCalendarMonth(appointmentDate.getMonth());
      setCalendarYear(appointmentDate.getFullYear());
      
      // Open the day modal to show the appointment
      setSelectedDate(date);
      
      // Clear the URL parameters
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);
  
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  // Initialize calendar to current month
  const now = new Date();
  const [calendarMonth, setCalendarMonth] = useState(now.getMonth());
  const [calendarYear, setCalendarYear] = useState(now.getFullYear());
  
  // Form state for create appointment
  const [formData, setFormData] = useState({
    patient_id: '',
    clinician_ids: [] as number[],
    appointment_date: '',
    appointment_time: '',
    reason: '',
  });

  // Fetch appointments
  const { data: appointments = [], isLoading, error } = useQuery<Appointment[]>({
    queryKey: ['hospital', 'appointments', hospitalId, statusFilter, clinicianFilter, dateRangeFilter],
    queryFn: async () => {
      try {
        const params: any = {};
        if (statusFilter !== 'all') params.status = statusFilter;
        if (clinicianFilter !== 'all') params.clinicianId = clinicianFilter;
        
        // Date range logic
        if (dateRangeFilter !== 'all') {
          const now = new Date();
          if (dateRangeFilter === 'today') {
            params.start = now.toISOString().split('T')[0];
            params.end = now.toISOString().split('T')[0];
          } else if (dateRangeFilter === 'week') {
            const weekStart = new Date(now);
            weekStart.setDate(now.getDate() - now.getDay());
            params.start = weekStart.toISOString().split('T')[0];
            params.end = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          } else if (dateRangeFilter === 'month') {
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
            params.start = monthStart.toISOString().split('T')[0];
            const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            params.end = monthEnd.toISOString().split('T')[0];
          }
        }
        
        const result = await HospitalAPI.listAppointments(hospitalId, params);
        return Array.isArray(result) ? result : [];
      } catch (err) {
        console.error('Error fetching appointments:', err);
        return [];
      }
    },
  });

  // Fetch patients for dropdown
  const { data: patients = [] } = useQuery({
    queryKey: ['hospital', 'patients', hospitalId],
    queryFn: async () => {
      try {
        const result = await HospitalAPI.listPatients(hospitalId);
        return Array.isArray(result) ? result : [];
      } catch (err) {
        console.error('Error fetching patients:', err);
        return [];
      }
    },
  });

  // Fetch clinicians for dropdown
  const { data: clinicians = [] } = useQuery({
    queryKey: ['hospital', 'clinicians', hospitalId],
    queryFn: async () => {
      try {
        const result = await HospitalAPI.listClinicians(hospitalId);
        return Array.isArray(result) ? result : [];
      } catch (err) {
        console.error('Error fetching clinicians:', err);
        return [];
      }
    },
  });

  // Create appointment mutation
  const createMutation = useMutation({
    mutationFn: (payload: any) => HospitalAPI.createAppointment(hospitalId, payload),
    onSuccess: async (data, variables) => {
      // If the appointment date is outside the current filter range, switch to "all" to show it
      if (dateRangeFilter !== 'all') {
        const appointmentDate = new Date(variables.appointment_date);
        const now = new Date();
        let shouldSwitchToAll = false;
        
        if (dateRangeFilter === 'today') {
          const todayStr = now.toISOString().split('T')[0];
          shouldSwitchToAll = variables.appointment_date !== todayStr;
        } else if (dateRangeFilter === 'week') {
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() - now.getDay());
          const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
          shouldSwitchToAll = appointmentDate < weekStart || appointmentDate > weekEnd;
        } else if (dateRangeFilter === 'month') {
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
          const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          shouldSwitchToAll = appointmentDate < monthStart || appointmentDate > monthEnd;
        }
        
        if (shouldSwitchToAll) {
          setDateRangeFilter('all');
          toast.info('Switched to "All Time" view to show your new appointment');
        }
      }
      
      // Invalidate all appointment queries (with any filters) and refetch
      await queryClient.invalidateQueries({ queryKey: ['hospital', 'appointments'], exact: false });
      await queryClient.invalidateQueries({ queryKey: ['hospital', 'metrics'] });
      
      // Refetch the current query to ensure the new appointment appears
      await queryClient.refetchQueries({ queryKey: ['hospital', 'appointments', hospitalId, statusFilter, clinicianFilter, dateRangeFilter] });
      
      toast.success('Appointment created successfully');
      setIsCreateModalOpen(false);
      setFormData({
        patient_id: '',
        clinician_ids: [],
        appointment_date: '',
        appointment_time: '',
        reason: '',
      });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create appointment');
    },
  });

  // Update appointment mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      HospitalAPI.updateAppointment(hospitalId, id, payload),
    onSuccess: () => {
      // Invalidate all appointment queries (with any filters)
      queryClient.invalidateQueries({ queryKey: ['hospital', 'appointments'], exact: false });
      queryClient.invalidateQueries({ queryKey: ['hospital', 'metrics'] });
      toast.success('Appointment updated successfully');
      setSelectedAppointment(null);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update appointment');
    },
  });

  // Filter appointments by search query
  const filteredAppointments = useMemo(() => {
    if (!searchQuery) return appointments;
    const query = searchQuery.toLowerCase();
    return appointments.filter(apt =>
      apt.patient_name.toLowerCase().includes(query) ||
      apt.clinician_name.toLowerCase().includes(query) ||
      apt.reason?.toLowerCase().includes(query)
    );
  }, [appointments, searchQuery]);

  // Status colors
  const statusColors: Record<string, { bg: string; text: string; border: string }> = {
    scheduled: { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-800' },
    confirmed: { bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-700 dark:text-green-300', border: 'border-green-200 dark:border-green-800' },
    completed: { bg: 'bg-gray-50 dark:bg-gray-800', text: 'text-gray-700 dark:text-gray-300', border: 'border-gray-200 dark:border-gray-700' },
    cancelled: { bg: 'bg-yellow-50 dark:bg-yellow-900/20', text: 'text-yellow-700 dark:text-yellow-300', border: 'border-yellow-200 dark:border-yellow-800' },
    'no-show': { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-700 dark:text-red-300', border: 'border-red-200 dark:border-red-800' },
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patient_id || formData.clinician_ids.length === 0 || !formData.appointment_date || !formData.appointment_time) {
      toast.error('Please fill all required fields');
      return;
    }
    createMutation.mutate({
      patient_id: Number(formData.patient_id),
      clinician_ids: formData.clinician_ids,
      appointment_date: formData.appointment_date,
      appointment_time: formData.appointment_time,
      reason: formData.reason || undefined,
    });
  };

  const handleQuickAction = (appointment: Appointment, action: 'confirm' | 'cancel' | 'complete') => {
    const statusMap = {
      confirm: 'confirmed',
      cancel: 'cancelled',
      complete: 'completed',
    };
    updateMutation.mutate({
      id: String(appointment.id),
      payload: { status: statusMap[action] },
    });
  };

  // Group appointments by date for calendar view
  const appointmentsByDate = useMemo(() => {
    const grouped: Record<string, Appointment[]> = {};
    filteredAppointments.forEach(apt => {
      const date = apt.appointment_date;
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(apt);
    });
    return grouped;
  }, [filteredAppointments]);

  // Get appointments for a specific date
  const getAppointmentsForDate = (date: string) => {
    return appointmentsByDate[date] || [];
  };

  // Check if date is in the past
  const isPastDate = (date: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date + 'T00:00:00');
    return checkDate < today;
  };

  // Check if date is today or future
  const isUpcomingDate = (date: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date + 'T00:00:00');
    return checkDate >= today;
  };

  // Render a single month calendar
  const renderMonthCalendar = (month: number, year: number) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    const days = [];
    // Empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dateAppointments = getAppointmentsForDate(dateStr);
      const isPast = isPastDate(dateStr);
      const isUpcoming = isUpcomingDate(dateStr);
      const isToday = dateStr === todayStr;
      
      days.push({
        day,
        date: dateStr,
        appointments: dateAppointments,
        isToday,
        isPast,
        isUpcoming,
      });
    }

    return (
      <div className="flex-1">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-semibold text-foreground-light dark:text-foreground-dark">
            {new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h3>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
            <div key={day} className="text-center text-xs font-semibold text-subtle-light dark:text-subtle-dark py-1">
              {day}
            </div>
          ))}
          {days.map((dayData, idx) => {
            if (!dayData) {
              return <div key={`empty-${idx}`} className="aspect-square" />;
            }
            const { day, date, appointments, isToday, isPast, isUpcoming } = dayData;
            const hasAppointments = appointments.length > 0;
            
            // Determine background color based on appointments and date
            // Orange for past appointments, blue for upcoming (including today), no color for empty dates
            return (
              <div
                key={date}
                className={clsx(
                  'aspect-square p-1 rounded border transition-all cursor-pointer relative group',
                  isToday && 'border-primary border-2',
                  !isToday && hasAppointments && isPast && 'border-orange-300 dark:border-orange-700',
                  !isToday && hasAppointments && isUpcoming && 'border-blue-300 dark:border-blue-700',
                  !isToday && !hasAppointments && 'border-border-light dark:border-border-dark',
                  hasAppointments && isPast && 'bg-orange-50 dark:bg-orange-900/20',
                  hasAppointments && isUpcoming && !isPast && 'bg-blue-50 dark:bg-blue-900/20',
                  !hasAppointments && 'hover:bg-background-light dark:hover:bg-background-dark'
                )}
                onClick={() => {
                  setSelectedDate(date);
                }}
                onMouseEnter={() => setHoveredDate(date)}
                onMouseLeave={() => setHoveredDate(null)}
              >
                <div className={clsx(
                  'text-xs font-medium',
                  isToday ? 'text-primary font-bold' : 'text-foreground-light dark:text-foreground-dark'
                )}>
                  {day}
                </div>
                
                {/* Hover tooltip */}
                {hoveredDate === date && hasAppointments && (
                  <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-lg shadow-lg">
                    <div className="text-xs font-semibold text-foreground-light dark:text-foreground-dark mb-2">
                      {appointments.length} appointment{appointments.length > 1 ? 's' : ''} on {new Date(date).toLocaleDateString()}
                    </div>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {appointments.slice(0, 3).map(apt => (
                        <div key={apt.id} className="text-xs text-subtle-light dark:text-subtle-dark">
                          <div className="font-medium text-foreground-light dark:text-foreground-dark">
                            {apt.patient_name}
                          </div>
                          <div>
                            {apt.appointment_time} - {apt.clinician_names && apt.clinician_names.length > 0
                              ? apt.clinician_names.join(', ')
                              : apt.clinician_name}
                          </div>
                        </div>
                      ))}
                      {appointments.length > 3 && (
                        <div className="text-xs text-subtle-light dark:text-subtle-dark">
                          +{appointments.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Calendar view - 2 months side by side
  const renderCalendarView = () => {
    // Show current month and next month
    const month1 = calendarMonth;
    const year1 = calendarYear;
    const month2 = month1 === 11 ? 0 : month1 + 1;
    const year2 = month1 === 11 ? year1 + 1 : year1;

    return (
      <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-soft p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const newDate = new Date(calendarYear, calendarMonth - 1, 1);
                setCalendarMonth(newDate.getMonth());
                setCalendarYear(newDate.getFullYear());
              }}
              className="p-1 rounded hover:bg-background-light dark:hover:bg-background-dark transition-colors"
            >
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            <button
              onClick={() => {
                const newDate = new Date(calendarYear, calendarMonth + 1, 1);
                setCalendarMonth(newDate.getMonth());
                setCalendarYear(newDate.getFullYear());
              }}
              className="p-1 rounded hover:bg-background-light dark:hover:bg-background-dark transition-colors"
            >
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
        </div>
        <div className="flex gap-6">
          {renderMonthCalendar(month1, year1)}
          {renderMonthCalendar(month2, year2)}
        </div>
      </div>
    );
  };

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground-light dark:text-foreground-dark">
            Appointments
          </h1>
          <div className="flex gap-3">
            <button
              onClick={() => {
                // Export CSV functionality
                const csvContent = [
                  ['Patient', 'Clinician', 'Date', 'Time', 'Status', 'Reason', 'MRN'].join(','),
                  ...filteredAppointments.map(apt => [
                    `"${apt.patient_name}"`,
                    `"${apt.clinician_name}"`,
                    apt.appointment_date,
                    apt.appointment_time,
                    apt.status,
                    `"${apt.reason || ''}"`,
                    apt.patient_mrn || '',
                  ].join(',')),
                ].join('\n');
                const blob = new Blob([csvContent], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `appointments-${new Date().toISOString().split('T')[0]}.csv`;
                a.click();
                window.URL.revokeObjectURL(url);
                toast.success('Appointments exported to CSV');
              }}
              className="px-4 py-2 border border-border-light dark:border-border-dark rounded-lg hover:bg-background-light dark:hover:bg-background-dark transition-colors font-medium flex items-center gap-2 text-foreground-light dark:text-foreground-dark"
            >
              <span className="material-symbols-outlined text-sm">download</span>
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium flex items-center gap-2 justify-center sm:justify-start"
            >
              <span className="material-symbols-outlined">add</span>
              <span>New Appointment</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-4 flex gap-1 border-b border-border-light dark:border-border-dark">
          <button
            onClick={() => setViewMode('calendar')}
            className={clsx(
              'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
              viewMode === 'calendar'
                ? 'border-primary text-primary'
                : 'border-transparent text-subtle-light dark:text-subtle-dark hover:text-foreground-light dark:hover:text-foreground-dark'
            )}
          >
            Calendar
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={clsx(
              'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
              viewMode === 'list'
                ? 'border-primary text-primary'
                : 'border-transparent text-subtle-light dark:text-subtle-dark hover:text-foreground-light dark:hover:text-foreground-dark'
            )}
          >
            List
          </button>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          {/* Search */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-subtle-light dark:text-subtle-dark text-sm">
              search
            </span>
            <input
              type="text"
              placeholder="Search appointments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark placeholder-subtle-light dark:placeholder-subtle-dark focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            />
          </div>

          {/* Filters - Horizontal, smaller boxes */}
          <div className="flex flex-wrap gap-3">
            <div className="w-auto min-w-[140px]">
              <Select
                label="Date Range"
                value={dateRangeFilter}
                onChange={(e) => setDateRangeFilter(e.target.value)}
                options={[
                  { value: 'today', label: 'Today' },
                  { value: 'week', label: 'This Week' },
                  { value: 'month', label: 'This Month' },
                  { value: 'all', label: 'All Time' },
                ]}
                className="w-full"
              />
            </div>
            <div className="w-auto min-w-[140px]">
              <Select
                label="Clinician"
                value={clinicianFilter}
                onChange={(e) => setClinicianFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'All Clinicians' },
                  ...(Array.isArray(clinicians) ? clinicians.map(c => ({ value: String(c.id), label: c.name })) : []),
                ]}
                className="w-full"
              />
            </div>
            <div className="w-auto min-w-[140px]">
              <Select
                label="Status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'All Status' },
                  { value: 'scheduled', label: 'Scheduled' },
                  { value: 'confirmed', label: 'Confirmed' },
                  { value: 'completed', label: 'Completed' },
                  { value: 'cancelled', label: 'Cancelled' },
                  { value: 'no-show', label: 'No-show' },
                ]}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Content */}
        {error ? (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-700 dark:text-red-300">
              Error loading appointments. Please try refreshing the page.
            </p>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : viewMode === 'calendar' ? (
          renderCalendarView()
        ) : filteredAppointments.length === 0 ? (
          <EmptyState
            icon="event_busy"
            title="No appointments found"
            description="Try adjusting your filters or create a new appointment"
            action={
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                Create Appointment
              </button>
            }
          />
        ) : (
          <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-soft overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-background-light dark:bg-background-dark border-b border-border-light dark:border-border-dark">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-medium text-subtle-light dark:text-subtle-dark">
                      Appointment ID
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-subtle-light dark:text-subtle-dark">
                      Patient
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-subtle-light dark:text-subtle-dark">
                      Clinician
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-subtle-light dark:text-subtle-dark">
                      Date & Time
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-subtle-light dark:text-subtle-dark">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-subtle-light dark:text-subtle-dark">
                      Reason
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-subtle-light dark:text-subtle-dark">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light dark:divide-border-dark">
                  {filteredAppointments.map((appointment) => (
                    <tr
                      key={appointment.id}
                      className="hover:bg-background-light dark:hover:bg-background-dark transition-colors cursor-pointer"
                      onClick={() => navigate(`/hospital/patients/${appointment.patient_id}`)}
                    >
                      <td className="py-3 px-4 text-sm font-mono font-semibold text-foreground-light dark:text-foreground-dark">
                        {appointment.appointment_number || `#${appointment.id}`}
                      </td>
                      <td className="py-3 px-4 text-sm text-foreground-light dark:text-foreground-dark">
                        {appointment.patient_name}
                      </td>
                      <td className="py-3 px-4 text-sm text-foreground-light dark:text-foreground-dark">
                        {appointment.clinician_names && appointment.clinician_names.length > 0
                          ? appointment.clinician_names.join(', ')
                          : appointment.clinician_name}
                      </td>
                      <td className="py-3 px-4 text-sm text-foreground-light dark:text-foreground-dark">
                        {new Date(appointment.appointment_date).toLocaleDateString()} at {appointment.appointment_time}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={clsx(
                            'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border',
                            statusColors[appointment.status]?.bg || 'bg-gray-100 dark:bg-gray-800',
                            statusColors[appointment.status]?.text || 'text-gray-700 dark:text-gray-300',
                            statusColors[appointment.status]?.border || 'border-gray-200 dark:border-gray-700'
                          )}
                        >
                          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-subtle-light dark:text-subtle-dark">
                        {appointment.reason || '-'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          {appointment.status === 'scheduled' && (
                            <button
                              onClick={() => handleQuickAction(appointment, 'confirm')}
                              className="p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                              title="Confirm"
                            >
                              <span className="material-symbols-outlined text-sm">check_circle</span>
                            </button>
                          )}
                          {appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
                            <button
                              onClick={() => handleQuickAction(appointment, 'cancel')}
                              className="p-2 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-colors"
                              title="Cancel"
                            >
                              <span className="material-symbols-outlined text-sm">cancel</span>
                            </button>
                          )}
                          {appointment.status === 'confirmed' && (
                            <button
                              onClick={() => handleQuickAction(appointment, 'complete')}
                              className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                              title="Mark Complete"
                            >
                              <span className="material-symbols-outlined text-sm">done</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Day Appointments Modal */}
        <Modal
          isOpen={selectedDate !== null}
          onClose={() => setSelectedDate(null)}
          title={`Appointments for ${selectedDate ? new Date(selectedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : ''}`}
          size="lg"
        >
          {selectedDate && (
            <div className="space-y-3">
              {getAppointmentsForDate(selectedDate).length === 0 ? (
                <p className="text-subtle-light dark:text-subtle-dark text-center py-4">
                  No appointments scheduled for this date.
                </p>
              ) : (
                getAppointmentsForDate(selectedDate).map((appointment) => (
                  <div
                    key={appointment.id}
                    className="p-4 border border-border-light dark:border-border-dark rounded-lg hover:bg-background-light dark:hover:bg-background-dark transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-foreground-light dark:text-foreground-dark">
                          {appointment.patient_name}
                        </h4>
                        <div className="flex items-center gap-3 mt-1">
                          {appointment.appointment_number && (
                            <p className="text-xs font-mono font-semibold text-foreground-light dark:text-foreground-dark">
                              ID: {appointment.appointment_number}
                            </p>
                          )}
                          {appointment.patient_mrn && (
                            <p className="text-xs text-subtle-light dark:text-subtle-dark">
                              MRN: {appointment.patient_mrn}
                            </p>
                          )}
                        </div>
                      </div>
                      <span
                        className={clsx(
                          'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border',
                          statusColors[appointment.status]?.bg || 'bg-gray-100 dark:bg-gray-800',
                          statusColors[appointment.status]?.text || 'text-gray-700 dark:text-gray-300',
                          statusColors[appointment.status]?.border || 'border-gray-200 dark:border-gray-700'
                        )}
                      >
                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm text-subtle-light dark:text-subtle-dark">
                      <p>
                        <span className="font-medium">Time:</span> {appointment.appointment_time}
                      </p>
                      <p>
                        <span className="font-medium">Clinician{appointment.clinician_names && appointment.clinician_names.length > 1 ? 's' : ''}:</span>{' '}
                        {appointment.clinician_names && appointment.clinician_names.length > 0
                          ? appointment.clinician_names.join(', ')
                          : appointment.clinician_name}
                      </p>
                      {appointment.reason && (
                        <p>
                          <span className="font-medium">Reason:</span> {appointment.reason}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </Modal>

        {/* Create Appointment Modal */}
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Create New Appointment"
          size="lg"
        >
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <Select
              label="Patient"
              value={formData.patient_id}
              onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
              options={[
                { value: '', label: 'Select a patient' },
                ...(Array.isArray(patients) ? patients.map(p => ({
                  value: String(p.id),
                  label: `${p.first_name} ${p.last_name} (${p.email})`,
                })) : []),
              ]}
              required
            />
            <div>
              <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark mb-2">
                Clinician(s) <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto border border-border-light dark:border-border-dark rounded-lg p-2">
                {Array.isArray(clinicians) && clinicians.length > 0 ? (
                  clinicians.map(c => (
                    <label key={c.id} className="flex items-center gap-2 p-2 hover:bg-background-light dark:hover:bg-background-dark rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.clinician_ids.includes(c.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({ ...formData, clinician_ids: [...formData.clinician_ids, c.id] });
                          } else {
                            setFormData({ ...formData, clinician_ids: formData.clinician_ids.filter(id => id !== c.id) });
                          }
                        }}
                        className="rounded border-border-light dark:border-border-dark text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-foreground-light dark:text-foreground-dark">
                        {c.name} {c.specialty && `(${c.specialty})`}
                      </span>
                    </label>
                  ))
                ) : (
                  <p className="text-sm text-subtle-light dark:text-subtle-dark p-2">No clinicians available</p>
                )}
              </div>
              {formData.clinician_ids.length === 0 && (
                <p className="text-xs text-red-500 mt-1">Please select at least one clinician</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <DateTimePicker
                label="Date"
                type="date"
                value={formData.appointment_date}
                onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
                required
              />
              <DateTimePicker
                label="Time"
                type="time"
                value={formData.appointment_time}
                onChange={(e) => setFormData({ ...formData, appointment_time: e.target.value })}
                required
              />
            </div>
            <TextField
              label="Reason (Optional)"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="Appointment reason"
            />
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createMutation.isPending ? 'Creating...' : 'Create Appointment'}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </AppShell>
  );
};

export default Appointments;

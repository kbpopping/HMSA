import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import clsx from 'clsx';
import AppShell from '../components/layout/AppShell';
import { useAuth } from '../store/auth';
import { ClinicianAPI, type ScheduleItem, type ScheduleType, type ScheduleStatus } from '../api/endpoints';
import { formatDate, formatTime, getDayOfWeek, isToday } from '../utils/date';
import ScheduleCalendarView from '../components/schedule/ScheduleCalendarView';
import ScheduleListView from '../components/schedule/ScheduleListView';
import AddScheduleModal from '../components/schedule/AddScheduleModal';
import ScheduleDetailsModal from '../components/schedule/ScheduleDetailsModal';

type ViewType = 'today' | 'week' | 'month' | 'previous-day' | 'previous-week' | 'previous-month';

export default function Schedule() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [view, setView] = useState<ViewType>('week');
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleItem | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Calculate date range based on view
  const dateRange = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    switch (view) {
      case 'today': {
        const end = new Date(today);
        end.setHours(23, 59, 59);
        return {
          start: today.toISOString().split('T')[0],
          end: end.toISOString().split('T')[0],
        };
      }
      case 'week': {
        const start = new Date(today);
        start.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        return {
          start: start.toISOString().split('T')[0],
          end: end.toISOString().split('T')[0],
        };
      }
      case 'month': {
        const start = new Date(today.getFullYear(), today.getMonth(), 1);
        const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        return {
          start: start.toISOString().split('T')[0],
          end: end.toISOString().split('T')[0],
        };
      }
      case 'previous-day': {
        const prevDay = new Date(today);
        prevDay.setDate(today.getDate() - 1);
        const end = new Date(prevDay);
        end.setHours(23, 59, 59);
        return {
          start: prevDay.toISOString().split('T')[0],
          end: end.toISOString().split('T')[0],
        };
      }
      case 'previous-week': {
        const prevWeek = new Date(today);
        prevWeek.setDate(today.getDate() - 7);
        const start = new Date(prevWeek);
        start.setDate(prevWeek.getDate() - prevWeek.getDay());
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        return {
          start: start.toISOString().split('T')[0],
          end: end.toISOString().split('T')[0],
        };
      }
      case 'previous-month': {
        const prevMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const end = new Date(today.getFullYear(), today.getMonth(), 0);
        return {
          start: prevMonth.toISOString().split('T')[0],
          end: end.toISOString().split('T')[0],
        };
      }
      default:
        return {
          start: today.toISOString().split('T')[0],
          end: today.toISOString().split('T')[0],
        };
    }
  }, [view]);
  
  // Fetch schedules
  const { data: schedules = [], isLoading } = useQuery({
    queryKey: ['schedule', user?.hospital_id, user?.id, dateRange.start, dateRange.end, typeFilter, statusFilter],
    queryFn: () => ClinicianAPI.getSchedule(user!.hospital_id, user!.id, {
      start: dateRange.start,
      end: dateRange.end,
      type: typeFilter !== 'all' ? typeFilter : null,
      status: statusFilter !== 'all' ? statusFilter : null,
    }),
    enabled: !!user?.hospital_id && !!user?.id,
  });
  
  // Filter schedules
  const filteredSchedules = useMemo(() => {
    let filtered = [...schedules];
    
    if (typeFilter !== 'all') {
      filtered = filtered.filter(s => s.type === typeFilter);
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(s => s.status === statusFilter);
    }
    
    return filtered.sort((a, b) => {
      const dateA = new Date(`${a.date} ${a.startTime}`);
      const dateB = new Date(`${b.date} ${b.startTime}`);
      return dateA.getTime() - dateB.getTime();
    });
  }, [schedules, typeFilter, statusFilter]);
  
  // Calculate summary statistics
  const summary = useMemo(() => {
    const pending = schedules.filter(s => s.status === 'pending').length;
    const accepted = schedules.filter(s => s.status === 'accepted' || s.status === 'approved').length;
    const completed = schedules.filter(s => s.status === 'completed').length;
    const today = schedules.filter(s => isToday(s.date)).length;
    
    return { pending, accepted, completed, today };
  }, [schedules]);
  
  // Action mutations
  const approveMutation = useMutation({
    mutationFn: (scheduleId: string) => ClinicianAPI.approveSchedule(user!.hospital_id, user!.id, scheduleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule'] });
      toast.success('Schedule approved');
      setSelectedSchedule(null);
    },
    onError: (error: any) => toast.error(error?.message || 'Failed to approve schedule'),
  });
  
  const rejectMutation = useMutation({
    mutationFn: ({ scheduleId, reason }: { scheduleId: string; reason?: string }) =>
      ClinicianAPI.rejectSchedule(user!.hospital_id, user!.id, scheduleId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule'] });
      toast.success('Schedule rejected');
      setSelectedSchedule(null);
    },
    onError: (error: any) => toast.error(error?.message || 'Failed to reject schedule'),
  });
  
  const acceptMutation = useMutation({
    mutationFn: (scheduleId: string) => ClinicianAPI.acceptSchedule(user!.hospital_id, user!.id, scheduleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule'] });
      toast.success('Schedule accepted');
      setSelectedSchedule(null);
    },
    onError: (error: any) => toast.error(error?.message || 'Failed to accept schedule'),
  });
  
  const completeMutation = useMutation({
    mutationFn: (scheduleId: string) => ClinicianAPI.completeSchedule(user!.hospital_id, user!.id, scheduleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule'] });
      toast.success('Schedule marked as completed');
      setSelectedSchedule(null);
    },
    onError: (error: any) => toast.error(error?.message || 'Failed to complete schedule'),
  });
  
  const updateMutation = useMutation({
    mutationFn: ({ scheduleId, data }: { scheduleId: string; data: Partial<ScheduleItem> }) =>
      ClinicianAPI.updateSchedule(user!.hospital_id, user!.id, scheduleId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule'] });
      toast.success('Schedule updated');
      setSelectedSchedule(null);
    },
    onError: (error: any) => toast.error(error?.message || 'Failed to update schedule'),
  });
  
  // Type colors
  const typeColors: Record<ScheduleType, string> = {
    appointment: 'bg-blue-500',
    surgery: 'bg-red-500',
    task: 'bg-green-500',
    administrative: 'bg-purple-500',
    meeting: 'bg-yellow-500',
    training: 'bg-indigo-500',
    consultation: 'bg-pink-500',
    'on-call': 'bg-orange-500',
    break: 'bg-gray-500',
    other: 'bg-teal-500',
  };
  
  // Status colors
  const statusColors: Record<ScheduleStatus, { bg: string; text: string; border: string }> = {
    pending: { bg: 'bg-yellow-50 dark:bg-yellow-900/20', text: 'text-yellow-700 dark:text-yellow-300', border: 'border-yellow-200 dark:border-yellow-800' },
    approved: { bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-700 dark:text-green-300', border: 'border-green-200 dark:border-green-800' },
    rejected: { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-700 dark:text-red-300', border: 'border-red-200 dark:border-red-800' },
    accepted: { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-800' },
    completed: { bg: 'bg-gray-50 dark:bg-gray-800', text: 'text-gray-700 dark:text-gray-300', border: 'border-gray-200 dark:border-gray-700' },
    cancelled: { bg: 'bg-gray-50 dark:bg-gray-800', text: 'text-gray-700 dark:text-gray-300', border: 'border-gray-200 dark:border-gray-700' },
  };
  
  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground-light dark:text-foreground-dark mb-2">
              Schedule
            </h1>
            <p className="text-subtle-light dark:text-subtle-dark">
              Manage your schedule, tasks, and appointments
            </p>
          </div>
          
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 h-12 bg-primary text-white rounded-lg font-semibold shadow-soft hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined">add</span>
            <span>Add Schedule</span>
          </button>
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
              <span className="text-sm text-subtle-light dark:text-subtle-dark">Pending</span>
              <div className="w-10 h-10 rounded-lg bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-yellow-600 dark:text-yellow-400">pending</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground-light dark:text-foreground-dark">{summary.pending}</p>
          </div>
          
          <div className="bg-card-light dark:bg-card-dark rounded-xl p-6 shadow-soft border border-border-light dark:border-border-dark">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-subtle-light dark:text-subtle-dark">Accepted</span>
              <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-green-600 dark:text-green-400">check_circle</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground-light dark:text-foreground-dark">{summary.accepted}</p>
          </div>
          
          <div className="bg-card-light dark:bg-card-dark rounded-xl p-6 shadow-soft border border-border-light dark:border-border-dark">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-subtle-light dark:text-subtle-dark">Completed</span>
              <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <span className="material-symbols-outlined text-gray-600 dark:text-gray-400">done_all</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground-light dark:text-foreground-dark">{summary.completed}</p>
          </div>
        </div>
        
        {/* View Toggle & Filters */}
        <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-soft border border-border-light dark:border-border-dark p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* View Toggle */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-foreground-light dark:text-foreground-dark">View:</span>
              {(['today', 'week', 'month', 'previous-day', 'previous-week', 'previous-month'] as ViewType[]).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={clsx(
                    'px-4 py-2 rounded-lg font-medium transition-colors capitalize',
                    view === v
                      ? 'bg-primary text-white'
                      : 'bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark hover:bg-card-light dark:hover:bg-card-dark'
                  )}
                >
                  {v.replace('-', ' ')}
                </button>
              ))}
            </div>
            
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4 flex-1">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="h-10 px-4 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Types</option>
                <option value="appointment">Appointment</option>
                <option value="surgery">Surgery</option>
                <option value="task">Task</option>
                <option value="administrative">Administrative</option>
                <option value="meeting">Meeting</option>
                <option value="training">Training</option>
                <option value="consultation">Consultation</option>
                <option value="on-call">On-Call</option>
                <option value="break">Break</option>
                <option value="other">Other</option>
              </select>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 px-4 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="accepted">Accepted</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Schedule Content */}
        {view === 'today' || view === 'previous-day' ? (
          <ScheduleListView
            schedules={filteredSchedules}
            onScheduleClick={setSelectedSchedule}
            onApprove={approveMutation.mutate}
            onReject={rejectMutation.mutate}
            onAccept={acceptMutation.mutate}
            onComplete={completeMutation.mutate}
            onUpdate={updateMutation.mutate}
            typeColors={typeColors}
            statusColors={statusColors}
            isLoading={isLoading}
          />
        ) : (
          <ScheduleCalendarView
            schedules={filteredSchedules}
            view={view}
            onScheduleClick={setSelectedSchedule}
            typeColors={typeColors}
            statusColors={statusColors}
            isLoading={isLoading}
          />
        )}
        
        {/* Add Schedule Modal */}
        {showAddModal && (
          <AddScheduleModal
            onClose={() => setShowAddModal(false)}
            onSuccess={() => {
              setShowAddModal(false);
              queryClient.invalidateQueries({ queryKey: ['schedule'] });
            }}
          />
        )}
        
        {/* Schedule Details Modal */}
        {selectedSchedule && (
          <ScheduleDetailsModal
            schedule={selectedSchedule}
            onClose={() => setSelectedSchedule(null)}
            onApprove={() => approveMutation.mutate(String(selectedSchedule.id))}
            onReject={(reason) => rejectMutation.mutate({ scheduleId: String(selectedSchedule.id), reason })}
            onAccept={() => acceptMutation.mutate(String(selectedSchedule.id))}
            onComplete={() => completeMutation.mutate(String(selectedSchedule.id))}
            onUpdate={(data) => updateMutation.mutate({ scheduleId: String(selectedSchedule.id), data })}
            typeColors={typeColors}
            statusColors={statusColors}
            isLoading={approveMutation.isPending || rejectMutation.isPending || acceptMutation.isPending || completeMutation.isPending || updateMutation.isPending}
          />
        )}
      </div>
    </AppShell>
  );
}


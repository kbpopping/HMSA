import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ColumnDef } from '@tanstack/react-table';
import clsx from 'clsx';
import AppShell from '../../components/layout/AppShell';
import { HospitalAPI, OutboundQueueItem, Notification } from '../../api/endpoints';
import { useAuth } from '../../store/auth';
import DataTable from '../../components/tables/DataTable';
import Spinner from '../../components/feedback/Spinner';
import Select from '../../components/forms/Select';
import DateTimePicker from '../../components/forms/DateTimePicker';

type TabType = 'queue' | 'notifications';

/**
 * Messaging Page
 * 
 * Features:
 * - Two tabs: Outbound Queue, Notifications (History)
 * - Outbound Queue table: appointment_id, channel, provider, status, attempts, next_retry
 * - Notifications table: filterable by status/provider/channel/date with Patient, Clinician columns
 * - Retry failed button
 * - Pagination
 */
const Messaging = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const hospitalId = user?.hospital_id || '1';

  // State
  const [activeTab, setActiveTab] = useState<TabType>('notifications');
  
  // Notification filters
  const [notificationFilters, setNotificationFilters] = useState({
    dateRange: '',
    channel: '',
    provider: '',
    status: '',
  });
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch outbound queue
  const { data: queueItems = [], isLoading: queueLoading, error: queueError } = useQuery<OutboundQueueItem[]>({
    queryKey: ['hospital', 'outbound-queue', hospitalId],
    queryFn: async () => {
      try {
        const result = await HospitalAPI.listOutboundQueue(hospitalId);
        return Array.isArray(result) ? result : [];
      } catch (err) {
        console.error('Error fetching outbound queue:', err);
        return [];
      }
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch notifications with filters
  const { data: allNotifications = [], isLoading: notificationsLoading, error: notificationsError } = useQuery<Notification[]>({
    queryKey: ['hospital', 'notifications', hospitalId, notificationFilters],
    queryFn: async () => {
      try {
        const params: any = {};
        if (notificationFilters.status) params.status = notificationFilters.status;
        if (notificationFilters.provider) params.provider = notificationFilters.provider;
        if (notificationFilters.channel) params.channel = notificationFilters.channel;
        
        // Handle date range
        if (notificationFilters.dateRange) {
          const now = new Date();
          if (notificationFilters.dateRange === 'today') {
            params.start = now.toISOString().split('T')[0];
            params.end = now.toISOString().split('T')[0];
          } else if (notificationFilters.dateRange === 'week') {
            const weekStart = new Date(now);
            weekStart.setDate(now.getDate() - now.getDay());
            params.start = weekStart.toISOString().split('T')[0];
            params.end = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          } else if (notificationFilters.dateRange === 'month') {
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
            params.start = monthStart.toISOString().split('T')[0];
            const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            params.end = monthEnd.toISOString().split('T')[0];
          }
        }
        
        const result = await HospitalAPI.listNotifications(hospitalId, params);
        return Array.isArray(result) ? result : [];
      } catch (err) {
        console.error('Error fetching notifications:', err);
        return [];
      }
    },
  });

  // Retry failed mutation (mock implementation)
  const retryFailedMutation = useMutation({
    mutationFn: async (itemId: number) => {
      // Mock retry - in production, this would call an API endpoint
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return { ok: true };
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['hospital', 'outbound-queue'], exact: false });
      toast.success('Failed items queued for retry');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to retry items');
    },
  });

  // Handle retry failed
  const handleRetryFailed = () => {
    const failedItems = queueItems.filter((item) => item.status === 'failed');
    if (failedItems.length === 0) {
      toast.info('No failed items to retry');
      return;
    }
    
    // Retry all failed items
    Promise.all(failedItems.map((item) => retryFailedMutation.mutateAsync(item.id)));
  };

  // Get unique providers from data
  const providers = useMemo(() => {
    const allProviders = new Set<string>();
    queueItems.forEach((item) => allProviders.add(item.provider));
    allNotifications.forEach((item) => allProviders.add(item.provider));
    return Array.from(allProviders).sort();
  }, [queueItems, allNotifications]);

  // Paginated notifications
  const paginatedNotifications = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return allNotifications.slice(start, end);
  }, [allNotifications, currentPage]);

  const totalPages = Math.ceil(allNotifications.length / itemsPerPage);

  // Outbound Queue columns
  const queueColumns: ColumnDef<OutboundQueueItem>[] = useMemo(
    () => [
      {
        accessorKey: 'appointment_number',
        header: 'Appointment ID',
        cell: ({ row }) => (
          <span className="font-mono text-sm font-semibold text-foreground-light dark:text-foreground-dark">
            {row.original.appointment_number || `#${row.original.appointment_id}`}
          </span>
        ),
      },
      {
        accessorKey: 'patient_name',
        header: 'Patient',
        cell: ({ row }) => (
          <span className="text-sm text-foreground-light dark:text-foreground-dark">
            {row.original.patient_name || '-'}
          </span>
        ),
      },
      {
        accessorKey: 'clinician_name',
        header: 'Clinician',
        cell: ({ row }) => (
          <span className="text-sm text-foreground-light dark:text-foreground-dark">
            {row.original.clinician_name || '-'}
          </span>
        ),
      },
      {
        accessorKey: 'channel',
        header: 'Channel',
        cell: ({ row }) => {
          const channel = row.original.channel;
          const channelColors: Record<string, string> = {
            email: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
            sms: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
            voice: 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
          };
          return (
            <span
              className={clsx(
                'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border',
                channelColors[channel] || 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              )}
            >
              {channel.toUpperCase()}
            </span>
          );
        },
      },
      {
        accessorKey: 'provider',
        header: 'Provider',
        cell: ({ row }) => (
          <span className="text-sm text-foreground-light dark:text-foreground-dark">
            {row.original.provider}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const status = row.original.status;
          const statusConfig: Record<string, { bg: string; text: string; border: string; icon: string }> = {
            queued: {
              bg: 'bg-orange-50 dark:bg-orange-900/20',
              text: 'text-orange-700 dark:text-orange-300',
              border: 'border-orange-200 dark:border-orange-800',
              icon: 'schedule',
            },
            sent: {
              bg: 'bg-green-50 dark:bg-green-900/20',
              text: 'text-green-700 dark:text-green-300',
              border: 'border-green-200 dark:border-green-800',
              icon: 'check_circle',
            },
            failed: {
              bg: 'bg-red-50 dark:bg-red-900/20',
              text: 'text-red-700 dark:text-red-300',
              border: 'border-red-200 dark:border-red-800',
              icon: 'error',
            },
          };
          const config = statusConfig[status] || {
            bg: 'bg-gray-100 dark:bg-gray-800',
            text: 'text-gray-700 dark:text-gray-300',
            border: 'border-gray-200 dark:border-gray-700',
            icon: 'help',
          };
          return (
            <span
              className={clsx(
                'inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border',
                config.bg,
                config.text,
                config.border
              )}
            >
              <span className="material-symbols-outlined text-xs">{config.icon}</span>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          );
        },
      },
      {
        accessorKey: 'attempts',
        header: 'Attempts',
        cell: ({ row }) => (
          <span className="text-sm text-foreground-light dark:text-foreground-dark">
            {row.original.attempts}
          </span>
        ),
      },
      {
        accessorKey: 'next_retry',
        header: 'Next Retry',
        cell: ({ row }) => {
          if (!row.original.next_retry) return <span className="text-sm text-subtle-light dark:text-subtle-dark">N/A</span>;
          const retryDate = new Date(row.original.next_retry);
          return (
            <span className="text-sm text-foreground-light dark:text-foreground-dark">
              {retryDate.toLocaleString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
              })}
            </span>
          );
        },
      },
      {
        accessorKey: 'created_at',
        header: 'Created',
        cell: ({ row }) => (
          <span className="text-sm text-subtle-light dark:text-subtle-dark">
            {new Date(row.original.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
            })}
          </span>
        ),
      },
    ],
    []
  );

  // Notifications columns
  const notificationColumns: ColumnDef<Notification>[] = useMemo(
    () => [
      {
        accessorKey: 'appointment_number',
        header: 'APPOINTMENT ID',
        cell: ({ row }) => (
          <span className="font-mono text-sm font-semibold text-foreground-light dark:text-foreground-dark">
            {row.original.appointment_number || (row.original.appointment_id ? `#${row.original.appointment_id}` : '-')}
          </span>
        ),
      },
      {
        accessorKey: 'patient_name',
        header: 'PATIENT',
        cell: ({ row }) => (
          <span className="text-sm text-foreground-light dark:text-foreground-dark">
            {row.original.patient_name || '-'}
          </span>
        ),
      },
      {
        accessorKey: 'clinician_name',
        header: 'CLINICIAN',
        cell: ({ row }) => (
          <span className="text-sm text-foreground-light dark:text-foreground-dark">
            {row.original.clinician_name || '-'}
          </span>
        ),
      },
      {
        accessorKey: 'channel',
        header: 'CHANNEL',
        cell: ({ row }) => {
          const channel = row.original.channel;
          const channelColors: Record<string, string> = {
            email: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
            sms: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
            voice: 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
          };
          return (
            <span
              className={clsx(
                'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border',
                channelColors[channel] || 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              )}
            >
              {channel.toUpperCase()}
            </span>
          );
        },
      },
      {
        accessorKey: 'provider',
        header: 'PROVIDER',
        cell: ({ row }) => (
          <span className="text-sm text-foreground-light dark:text-foreground-dark">
            {row.original.provider}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'STATUS',
        cell: ({ row }) => {
          const status = row.original.status;
          const statusConfig: Record<string, { bg: string; text: string; border: string; icon: string }> = {
            queued: {
              bg: 'bg-orange-50 dark:bg-orange-900/20',
              text: 'text-orange-700 dark:text-orange-300',
              border: 'border-orange-200 dark:border-orange-800',
              icon: 'schedule',
            },
            sent: {
              bg: 'bg-green-50 dark:bg-green-900/20',
              text: 'text-green-700 dark:text-green-300',
              border: 'border-green-200 dark:border-green-800',
              icon: 'check_circle',
            },
            failed: {
              bg: 'bg-red-50 dark:bg-red-900/20',
              text: 'text-red-700 dark:text-red-300',
              border: 'border-red-200 dark:border-red-800',
              icon: 'error',
            },
          };
          const config = statusConfig[status] || {
            bg: 'bg-gray-100 dark:bg-gray-800',
            text: 'text-gray-700 dark:text-gray-300',
            border: 'border-gray-200 dark:border-gray-700',
            icon: 'help',
          };
          return (
            <span
              className={clsx(
                'inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border',
                config.bg,
                config.text,
                config.border
              )}
            >
              <span className="material-symbols-outlined text-xs">{config.icon}</span>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          );
        },
      },
      {
        accessorKey: 'attempts',
        header: 'ATTEMPTS',
        cell: ({ row }) => (
          <span className="text-sm text-foreground-light dark:text-foreground-dark">
            {row.original.attempts || 0}
          </span>
        ),
      },
      {
        accessorKey: 'next_retry',
        header: 'NEXT RETRY',
        cell: ({ row }) => {
          if (!row.original.next_retry) return <span className="text-sm text-subtle-light dark:text-subtle-dark">N/A</span>;
          const retryDate = new Date(row.original.next_retry);
          return (
            <span className="text-sm text-foreground-light dark:text-foreground-dark">
              {retryDate.toLocaleString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
              })}
            </span>
          );
        },
      },
      {
        accessorKey: 'created_at',
        header: 'CRE',
        cell: ({ row }) => (
          <span className="text-sm text-subtle-light dark:text-subtle-dark">
            {new Date(row.original.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
            })}
          </span>
        ),
      },
    ],
    []
  );

  // Failed items count
  const failedCount = useMemo(() => {
    return queueItems.filter((item) => item.status === 'failed').length;
  }, [queueItems]);

  // Pagination helpers
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground-light dark:text-foreground-dark">
            Messaging
          </h1>
          <p className="text-subtle-light dark:text-subtle-dark mt-1">
            Monitor outbound queue and notification history
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-border-light dark:border-border-dark mb-6">
          <nav className="flex space-x-8 overflow-x-auto">
            {[
              { id: 'queue' as TabType, label: 'Outbound Queue', badge: queueItems.length },
              { id: 'notifications' as TabType, label: 'Notifications (History)', badge: allNotifications.length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setCurrentPage(1); // Reset pagination when switching tabs
                }}
                className={clsx(
                  'px-1 py-4 border-b-2 font-semibold transition-colors whitespace-nowrap flex items-center gap-2',
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-subtle-light dark:text-subtle-dark hover:text-primary hover:border-primary/50'
                )}
              >
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="ml-2 px-2 py-0.5 text-xs bg-background-light dark:bg-background-dark rounded-full">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'queue' && (
          <div className="space-y-6">
            {/* Actions */}
            {failedCount > 0 && (
              <div className="flex items-center justify-between bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <div>
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    {failedCount} failed {failedCount === 1 ? 'item' : 'items'} in queue
                  </p>
                  <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                    Click retry to queue failed items for resending
                  </p>
                </div>
                <button
                  onClick={handleRetryFailed}
                  disabled={retryFailedMutation.isPending}
                  className="h-10 px-4 rounded-lg font-semibold bg-yellow-600 text-white hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {retryFailedMutation.isPending && <Spinner size="sm" />}
                  <span>Retry Failed</span>
                </button>
              </div>
            )}

            {/* Outbound Queue Table */}
            {queueError ? (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-red-700 dark:text-red-300">
                  Error loading outbound queue. Please try refreshing the page.
                </p>
              </div>
            ) : (
              <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-soft overflow-hidden">
                <DataTable
                  data={queueItems}
                  columns={queueColumns}
                  isLoading={queueLoading}
                  emptyMessage="No items in outbound queue"
                  emptyIcon="send"
                />
              </div>
            )}
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-card-light dark:bg-card-dark p-4 rounded-xl shadow-soft">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Select
                  label="Date Range"
                  value={notificationFilters.dateRange}
                  onChange={(e) =>
                    setNotificationFilters({ ...notificationFilters, dateRange: e.target.value })
                  }
                  options={[
                    { value: '', label: 'All Time' },
                    { value: 'today', label: 'Today' },
                    { value: 'week', label: 'This Week' },
                    { value: 'month', label: 'This Month' },
                  ]}
                />
                <Select
                  label="Channel"
                  value={notificationFilters.channel}
                  onChange={(e) =>
                    setNotificationFilters({ ...notificationFilters, channel: e.target.value })
                  }
                  options={[
                    { value: '', label: 'All Channels' },
                    { value: 'email', label: 'Email' },
                    { value: 'sms', label: 'SMS' },
                    { value: 'voice', label: 'Voice' },
                  ]}
                />
                <Select
                  label="Provider"
                  value={notificationFilters.provider}
                  onChange={(e) =>
                    setNotificationFilters({ ...notificationFilters, provider: e.target.value })
                  }
                  options={[
                    { value: '', label: 'All Providers' },
                    ...providers.map((p) => ({ value: p, label: p })),
                  ]}
                />
                <Select
                  label="Status"
                  value={notificationFilters.status}
                  onChange={(e) =>
                    setNotificationFilters({ ...notificationFilters, status: e.target.value })
                  }
                  options={[
                    { value: '', label: 'All Status' },
                    { value: 'queued', label: 'Queued' },
                    { value: 'sent', label: 'Sent' },
                    { value: 'failed', label: 'Failed' },
                  ]}
                />
              </div>
            </div>

            {/* Notifications Table */}
            {notificationsError ? (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-red-700 dark:text-red-300">
                  Error loading notifications. Please try refreshing the page.
                </p>
              </div>
            ) : (
              <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-soft overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-background-light dark:bg-background-dark border-b border-border-light dark:border-border-dark">
                      <tr>
                        {notificationColumns.map((column) => (
                          <th
                            key={column.id || (column.accessorKey as string)}
                            className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-subtle-light dark:text-subtle-dark"
                          >
                            {typeof column.header === 'string' ? column.header : ''}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-light dark:divide-border-dark">
                      {notificationsLoading ? (
                        <tr>
                          <td colSpan={notificationColumns.length} className="py-12 text-center">
                            <Spinner size="lg" />
                          </td>
                        </tr>
                      ) : paginatedNotifications.length === 0 ? (
                        <tr>
                          <td colSpan={notificationColumns.length} className="py-12 text-center text-subtle-light dark:text-subtle-dark">
                            No notifications found
                          </td>
                        </tr>
                      ) : (
                        paginatedNotifications.map((notification) => (
                          <tr
                            key={notification.id}
                            className="hover:bg-background-light dark:hover:bg-background-dark/50 transition-colors"
                          >
                            {notificationColumns.map((column) => {
                              const cell = column.cell;
                              if (cell) {
                                return (
                                  <td key={column.id || (column.accessorKey as string)} className="py-3 px-4">
                                    {cell({ row: { original: notification } } as any)}
                                  </td>
                                );
                              }
                              return null;
                            })}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {!notificationsLoading && allNotifications.length > 0 && (
                  <div className="flex items-center justify-between px-4 py-3 border-t border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark">
                    <div className="text-sm text-subtle-light dark:text-subtle-dark">
                      Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                      {Math.min(currentPage * itemsPerPage, allNotifications.length)} of{' '}
                      {allNotifications.length} results
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className={clsx(
                          'p-2 rounded-lg border border-border-light dark:border-border-dark transition-colors',
                          currentPage === 1
                            ? 'opacity-50 cursor-not-allowed'
                            : 'hover:bg-card-light dark:hover:bg-card-dark'
                        )}
                      >
                        <span className="material-symbols-outlined text-sm">chevron_left</span>
                      </button>
                      {getPageNumbers().map((page, idx) => (
                        <button
                          key={idx}
                          onClick={() => typeof page === 'number' && setCurrentPage(page)}
                          disabled={typeof page !== 'number'}
                          className={clsx(
                            'min-w-[32px] h-8 px-2 rounded-lg text-sm font-medium transition-colors',
                            typeof page === 'number'
                              ? currentPage === page
                                ? 'bg-primary text-white'
                                : 'border border-border-light dark:border-border-dark hover:bg-card-light dark:hover:bg-card-dark text-foreground-light dark:text-foreground-dark'
                              : 'text-subtle-light dark:text-subtle-dark cursor-default'
                          )}
                        >
                          {page}
                        </button>
                      ))}
                      <button
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className={clsx(
                          'p-2 rounded-lg border border-border-light dark:border-border-dark transition-colors',
                          currentPage === totalPages
                            ? 'opacity-50 cursor-not-allowed'
                            : 'hover:bg-card-light dark:hover:bg-card-dark'
                        )}
                      >
                        <span className="material-symbols-outlined text-sm">chevron_right</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default Messaging;

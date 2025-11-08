import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../../components/layout/AppShell';
import { useNotifications } from '../../store/notifications';

// Mock n8n workflow logs data
const mockWorkflowLogs = [
  {
    id: 1,
    workflowName: 'Patient Reminder SMS',
    status: 'success',
    startedAt: '2024-01-15T10:30:00Z',
    finishedAt: '2024-01-15T10:30:15Z',
    duration: '15s',
    executions: 142,
    errors: 0,
    lastRun: '2 minutes ago',
  },
  {
    id: 2,
    workflowName: 'Appointment Confirmation',
    status: 'success',
    startedAt: '2024-01-15T10:28:00Z',
    finishedAt: '2024-01-15T10:28:08Z',
    duration: '8s',
    executions: 89,
    errors: 0,
    lastRun: '4 minutes ago',
  },
  {
    id: 3,
    workflowName: 'Daily Report Generation',
    status: 'success',
    startedAt: '2024-01-15T08:00:00Z',
    finishedAt: '2024-01-15T08:00:45Z',
    duration: '45s',
    executions: 1,
    errors: 0,
    lastRun: '2 hours ago',
  },
  {
    id: 4,
    workflowName: 'Data Sync to EMR',
    status: 'error',
    startedAt: '2024-01-15T09:15:00Z',
    finishedAt: '2024-01-15T09:15:22Z',
    duration: '22s',
    executions: 0,
    errors: 1,
    lastRun: '1 hour ago',
    errorMessage: 'Connection timeout to EMR system',
  },
  {
    id: 5,
    workflowName: 'Email Notifications',
    status: 'success',
    startedAt: '2024-01-15T10:25:00Z',
    finishedAt: '2024-01-15T10:25:12Z',
    duration: '12s',
    executions: 234,
    errors: 0,
    lastRun: '7 minutes ago',
  },
  {
    id: 6,
    workflowName: 'Backup Database',
    status: 'running',
    startedAt: '2024-01-15T10:29:00Z',
    finishedAt: null,
    duration: 'Ongoing',
    executions: 0,
    errors: 0,
    lastRun: '3 minutes ago',
  },
];

const N8nLogs = () => {
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const [selectedWorkflow, setSelectedWorkflow] = useState<number | null>(null);
  const [filter, setFilter] = useState<'all' | 'success' | 'error' | 'running'>('all');
  const [notifiedWorkflows, setNotifiedWorkflows] = useState<Set<number>>(new Set());

  const filteredLogs = mockWorkflowLogs.filter(log => {
    if (filter === 'all') return true;
    return log.status === filter;
  });

  // Monitor workflow status changes and send notifications
  useEffect(() => {
    mockWorkflowLogs.forEach(log => {
      if (!notifiedWorkflows.has(log.id)) {
        if (log.status === 'error') {
          addNotification({
            type: 'n8n_workflow_error',
            title: 'n8n Workflow Error',
            message: `Workflow "${log.workflowName}" has encountered an error: ${log.errorMessage || 'Unknown error'}`,
            route: '/super/n8n-logs',
            metadata: { workflowId: log.id, workflowName: log.workflowName },
          });
          setNotifiedWorkflows(prev => new Set(prev).add(log.id));
        } else if (log.status === 'running') {
          addNotification({
            type: 'n8n_workflow_running',
            title: 'n8n Workflow Running',
            message: `Workflow "${log.workflowName}" is currently running.`,
            route: '/super/n8n-logs',
            metadata: { workflowId: log.id, workflowName: log.workflowName },
          });
          setNotifiedWorkflows(prev => new Set(prev).add(log.id));
        }
      }
    });
  }, [addNotification, notifiedWorkflows]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
      case 'error':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
      case 'running':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
      default:
        return 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return 'check_circle';
      case 'error':
        return 'error';
      case 'running':
        return 'sync';
      default:
        return 'help';
    }
  };

  return (
    <AppShell role="super_admin">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-4 sm:mb-6 lg:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground-light dark:text-foreground-dark mb-1 sm:mb-2">
                n8n Workflow Logs
              </h1>
              <p className="text-xs sm:text-sm lg:text-base text-subtle-light dark:text-subtle-dark">
                Monitor and manage n8n workflow executions
              </p>
            </div>
            <button
              onClick={() => navigate('/super/dashboard')}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm text-subtle-light dark:text-subtle-dark hover:text-foreground-light dark:hover:text-foreground-dark transition-colors touch-manipulation whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-lg sm:text-xl">arrow_back</span>
              <span className="hidden sm:inline">Back to Dashboard</span>
              <span className="sm:hidden">Back</span>
            </button>
          </div>
        </header>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">
          <div className="bg-card-light dark:bg-card-dark p-3 sm:p-4 lg:p-6 rounded-xl shadow-soft">
            <p className="text-xs sm:text-sm text-subtle-light dark:text-subtle-dark mb-1">Total Workflows</p>
            <p className="text-2xl sm:text-3xl font-bold text-foreground-light dark:text-foreground-dark">
              {mockWorkflowLogs.length}
            </p>
          </div>
          <div className="bg-card-light dark:bg-card-dark p-3 sm:p-4 lg:p-6 rounded-xl shadow-soft">
            <p className="text-xs sm:text-sm text-subtle-light dark:text-subtle-dark mb-1">Successful</p>
            <p className="text-2xl sm:text-3xl font-bold text-green-500 dark:text-green-400">
              {mockWorkflowLogs.filter(log => log.status === 'success').length}
            </p>
          </div>
          <div className="bg-card-light dark:bg-card-dark p-3 sm:p-4 lg:p-6 rounded-xl shadow-soft">
            <p className="text-xs sm:text-sm text-subtle-light dark:text-subtle-dark mb-1">Errors</p>
            <p className="text-2xl sm:text-3xl font-bold text-red-500 dark:text-red-400">
              {mockWorkflowLogs.filter(log => log.status === 'error').length}
            </p>
          </div>
          <div className="bg-card-light dark:bg-card-dark p-3 sm:p-4 lg:p-6 rounded-xl shadow-soft">
            <p className="text-xs sm:text-sm text-subtle-light dark:text-subtle-dark mb-1">Running</p>
            <p className="text-2xl sm:text-3xl font-bold text-blue-500 dark:text-blue-400">
              {mockWorkflowLogs.filter(log => log.status === 'running').length}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-4 sm:mb-6 flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-xs sm:text-sm whitespace-nowrap touch-manipulation ${
              filter === 'all'
                ? 'bg-primary text-white'
                : 'bg-card-light dark:bg-card-dark text-foreground-light dark:text-foreground-dark hover:bg-primary/10 dark:hover:bg-primary/20'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('success')}
            className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-xs sm:text-sm whitespace-nowrap touch-manipulation ${
              filter === 'success'
                ? 'bg-green-500 text-white'
                : 'bg-card-light dark:bg-card-dark text-foreground-light dark:text-foreground-dark hover:bg-green-500/10 dark:hover:bg-green-500/20'
            }`}
          >
            Successful
          </button>
          <button
            onClick={() => setFilter('error')}
            className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-xs sm:text-sm whitespace-nowrap touch-manipulation ${
              filter === 'error'
                ? 'bg-red-500 text-white'
                : 'bg-card-light dark:bg-card-dark text-foreground-light dark:text-foreground-dark hover:bg-red-500/10 dark:hover:bg-red-500/20'
            }`}
          >
            Errors
          </button>
          <button
            onClick={() => setFilter('running')}
            className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-xs sm:text-sm whitespace-nowrap touch-manipulation ${
              filter === 'running'
                ? 'bg-blue-500 text-white'
                : 'bg-card-light dark:bg-card-dark text-foreground-light dark:text-foreground-dark hover:bg-blue-500/10 dark:hover:bg-blue-500/20'
            }`}
          >
            Running
          </button>
        </div>

        {/* Workflow Logs Table */}
        <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-soft overflow-hidden">
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle sm:px-0">
              <table className="min-w-full divide-y divide-border-light dark:divide-border-dark">
                <thead className="bg-background-light dark:bg-background-dark">
                  <tr>
                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-subtle-light dark:text-subtle-dark uppercase tracking-wider">
                      Workflow
                    </th>
                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-subtle-light dark:text-subtle-dark uppercase tracking-wider hidden sm:table-cell">
                      Status
                    </th>
                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-subtle-light dark:text-subtle-dark uppercase tracking-wider hidden md:table-cell">
                      Executions
                    </th>
                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-subtle-light dark:text-subtle-dark uppercase tracking-wider hidden lg:table-cell">
                      Duration
                    </th>
                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-subtle-light dark:text-subtle-dark uppercase tracking-wider hidden md:table-cell">
                      Last Run
                    </th>
                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-subtle-light dark:text-subtle-dark uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light dark:divide-border-dark bg-card-light dark:bg-card-dark">
                  {filteredLogs.map((log) => (
                    <tr
                      key={log.id}
                      className="hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors"
                    >
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        <div className="flex items-center min-w-0">
                          <span className="material-symbols-outlined text-primary mr-2 flex-shrink-0 text-lg sm:text-xl">
                            account_tree
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-sm sm:text-base text-foreground-light dark:text-foreground-dark truncate">
                              {log.workflowName}
                            </div>
                            {/* Mobile: Show status and last run below name */}
                            <div className="sm:hidden mt-1 space-y-1">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                  log.status
                                )}`}
                              >
                                <span className={`material-symbols-outlined text-xs ${log.status === 'running' ? 'animate-spin' : ''}`}>
                                  {getStatusIcon(log.status)}
                                </span>
                                {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                              </span>
                              <div className="text-xs text-subtle-light dark:text-subtle-dark">
                                {log.lastRun}
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 hidden sm:table-cell">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            log.status
                          )}`}
                        >
                          <span className={`material-symbols-outlined text-xs ${log.status === 'running' ? 'animate-spin' : ''}`}>
                            {getStatusIcon(log.status)}
                          </span>
                          {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 hidden md:table-cell text-xs sm:text-sm text-foreground-light dark:text-foreground-dark">
                        {log.executions}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 hidden lg:table-cell text-xs sm:text-sm text-foreground-light dark:text-foreground-dark">
                        {log.duration}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 hidden md:table-cell text-xs sm:text-sm text-subtle-light dark:text-subtle-dark">
                        {log.lastRun}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        <button
                          onClick={() => setSelectedWorkflow(selectedWorkflow === log.id ? null : log.id)}
                          className="text-xs sm:text-sm text-primary hover:text-primary/80 transition-colors touch-manipulation font-medium"
                        >
                          {selectedWorkflow === log.id ? 'Hide' : 'View'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Workflow Details */}
        {selectedWorkflow && (
          <div className="mt-4 sm:mt-6 bg-card-light dark:bg-card-dark rounded-xl shadow-soft p-4 sm:p-6">
            {(() => {
              const workflow = mockWorkflowLogs.find(log => log.id === selectedWorkflow);
              if (!workflow) return null;
              
              return (
                <div>
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <h3 className="text-lg sm:text-xl font-bold text-foreground-light dark:text-foreground-dark truncate flex-1 pr-2">
                      {workflow.workflowName} - Details
                    </h3>
                    <button
                      onClick={() => setSelectedWorkflow(null)}
                      className="text-subtle-light dark:text-subtle-dark hover:text-foreground-light dark:hover:text-foreground-dark flex-shrink-0 p-1 touch-manipulation"
                      aria-label="Close details"
                    >
                      <span className="material-symbols-outlined text-xl sm:text-2xl">close</span>
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <p className="text-xs sm:text-sm text-subtle-light dark:text-subtle-dark mb-1">Started At</p>
                      <p className="text-sm sm:text-base text-foreground-light dark:text-foreground-dark break-words">
                        {new Date(workflow.startedAt).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-subtle-light dark:text-subtle-dark mb-1">Finished At</p>
                      <p className="text-sm sm:text-base text-foreground-light dark:text-foreground-dark break-words">
                        {workflow.finishedAt ? new Date(workflow.finishedAt).toLocaleString() : 'Ongoing'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-subtle-light dark:text-subtle-dark mb-1">Executions</p>
                      <p className="text-sm sm:text-base text-foreground-light dark:text-foreground-dark">{workflow.executions}</p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-subtle-light dark:text-subtle-dark mb-1">Errors</p>
                      <p className={`text-sm sm:text-base font-medium ${workflow.errors > 0 ? 'text-red-500 dark:text-red-400' : 'text-green-500 dark:text-green-400'}`}>
                        {workflow.errors}
                      </p>
                    </div>
                  </div>
                  
                  {workflow.errorMessage && (
                    <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <p className="text-xs sm:text-sm font-medium text-red-800 dark:text-red-300 mb-1">Error Message</p>
                      <p className="text-xs sm:text-sm text-red-700 dark:text-red-400 break-words">{workflow.errorMessage}</p>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default N8nLogs;


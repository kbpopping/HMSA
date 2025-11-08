import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../../components/layout/AppShell';

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
  const [selectedWorkflow, setSelectedWorkflow] = useState<number | null>(null);
  const [filter, setFilter] = useState<'all' | 'success' | 'error' | 'running'>('all');

  const filteredLogs = mockWorkflowLogs.filter(log => {
    if (filter === 'all') return true;
    return log.status === filter;
  });

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
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-foreground-light dark:text-foreground-dark mb-2">
                n8n Workflow Logs
              </h1>
              <p className="text-subtle-light dark:text-subtle-dark">
                Monitor and manage n8n workflow executions
              </p>
            </div>
            <button
              onClick={() => navigate('/super/dashboard')}
              className="flex items-center gap-2 px-4 py-2 text-subtle-light dark:text-subtle-dark hover:text-foreground-light dark:hover:text-foreground-dark transition-colors"
            >
              <span className="material-symbols-outlined">arrow_back</span>
              Back to Dashboard
            </button>
          </div>
        </header>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-card-light dark:bg-card-dark p-6 rounded-xl shadow-soft">
            <p className="text-subtle-light dark:text-subtle-dark mb-1">Total Workflows</p>
            <p className="text-3xl font-bold text-foreground-light dark:text-foreground-dark">
              {mockWorkflowLogs.length}
            </p>
          </div>
          <div className="bg-card-light dark:bg-card-dark p-6 rounded-xl shadow-soft">
            <p className="text-subtle-light dark:text-subtle-dark mb-1">Successful</p>
            <p className="text-3xl font-bold text-green-500 dark:text-green-400">
              {mockWorkflowLogs.filter(log => log.status === 'success').length}
            </p>
          </div>
          <div className="bg-card-light dark:bg-card-dark p-6 rounded-xl shadow-soft">
            <p className="text-subtle-light dark:text-subtle-dark mb-1">Errors</p>
            <p className="text-3xl font-bold text-red-500 dark:text-red-400">
              {mockWorkflowLogs.filter(log => log.status === 'error').length}
            </p>
          </div>
          <div className="bg-card-light dark:bg-card-dark p-6 rounded-xl shadow-soft">
            <p className="text-subtle-light dark:text-subtle-dark mb-1">Running</p>
            <p className="text-3xl font-bold text-blue-500 dark:text-blue-400">
              {mockWorkflowLogs.filter(log => log.status === 'running').length}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-primary text-white'
                : 'bg-card-light dark:bg-card-dark text-foreground-light dark:text-foreground-dark hover:bg-primary/10 dark:hover:bg-primary/20'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('success')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'success'
                ? 'bg-green-500 text-white'
                : 'bg-card-light dark:bg-card-dark text-foreground-light dark:text-foreground-dark hover:bg-green-500/10 dark:hover:bg-green-500/20'
            }`}
          >
            Successful
          </button>
          <button
            onClick={() => setFilter('error')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'error'
                ? 'bg-red-500 text-white'
                : 'bg-card-light dark:bg-card-dark text-foreground-light dark:text-foreground-dark hover:bg-red-500/10 dark:hover:bg-red-500/20'
            }`}
          >
            Errors
          </button>
          <button
            onClick={() => setFilter('running')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
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
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-background-light dark:bg-background-dark border-b border-border-light dark:border-border-dark">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-subtle-light dark:text-subtle-dark uppercase tracking-wider">
                    Workflow
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-subtle-light dark:text-subtle-dark uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-subtle-light dark:text-subtle-dark uppercase tracking-wider">
                    Executions
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-subtle-light dark:text-subtle-dark uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-subtle-light dark:text-subtle-dark uppercase tracking-wider">
                    Last Run
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-subtle-light dark:text-subtle-dark uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light dark:divide-border-dark">
                {filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="material-symbols-outlined text-primary mr-2">
                          account_tree
                        </span>
                        <span className="font-medium text-foreground-light dark:text-foreground-dark">
                          {log.workflowName}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground-light dark:text-foreground-dark">
                      {log.executions}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground-light dark:text-foreground-dark">
                      {log.duration}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-subtle-light dark:text-subtle-dark">
                      {log.lastRun}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => setSelectedWorkflow(selectedWorkflow === log.id ? null : log.id)}
                        className="text-primary hover:text-primary/80 transition-colors"
                      >
                        {selectedWorkflow === log.id ? 'Hide Details' : 'View Details'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Workflow Details */}
        {selectedWorkflow && (
          <div className="mt-6 bg-card-light dark:bg-card-dark rounded-xl shadow-soft p-6">
            {(() => {
              const workflow = mockWorkflowLogs.find(log => log.id === selectedWorkflow);
              if (!workflow) return null;
              
              return (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-foreground-light dark:text-foreground-dark">
                      {workflow.workflowName} - Details
                    </h3>
                    <button
                      onClick={() => setSelectedWorkflow(null)}
                      className="text-subtle-light dark:text-subtle-dark hover:text-foreground-light dark:hover:text-foreground-dark"
                    >
                      <span className="material-symbols-outlined">close</span>
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-subtle-light dark:text-subtle-dark mb-1">Started At</p>
                      <p className="text-foreground-light dark:text-foreground-dark">
                        {new Date(workflow.startedAt).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-subtle-light dark:text-subtle-dark mb-1">Finished At</p>
                      <p className="text-foreground-light dark:text-foreground-dark">
                        {workflow.finishedAt ? new Date(workflow.finishedAt).toLocaleString() : 'Ongoing'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-subtle-light dark:text-subtle-dark mb-1">Executions</p>
                      <p className="text-foreground-light dark:text-foreground-dark">{workflow.executions}</p>
                    </div>
                    <div>
                      <p className="text-sm text-subtle-light dark:text-subtle-dark mb-1">Errors</p>
                      <p className={`font-medium ${workflow.errors > 0 ? 'text-red-500 dark:text-red-400' : 'text-green-500 dark:text-green-400'}`}>
                        {workflow.errors}
                      </p>
                    </div>
                  </div>
                  
                  {workflow.errorMessage && (
                    <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <p className="text-sm font-medium text-red-800 dark:text-red-300 mb-1">Error Message</p>
                      <p className="text-sm text-red-700 dark:text-red-400">{workflow.errorMessage}</p>
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


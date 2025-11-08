import { useQuery } from '@tanstack/react-query';
import { useState, useEffect, useRef } from 'react';
import AppShell from '../../components/layout/AppShell';
import { SuperAPI } from '../../api/endpoints';
import { useNotifications } from '../../store/notifications';

/**
 * Monitoring - Outbound Queue Overview and System Health
 * 
 * PRODUCTION: Replace with real API endpoints
 */
const Monitoring = () => {
  // Fetch monitoring data
  const { data: queueData, isLoading: queueLoading } = useQuery({
    queryKey: ['super', 'monitoring', 'queue'],
    queryFn: () => SuperAPI.getQueueOverview(),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: notificationsData, isLoading: notificationsLoading } = useQuery({
    queryKey: ['super', 'monitoring', 'notifications'],
    queryFn: () => SuperAPI.getNotificationsBreakdown(),
    refetchInterval: 30000,
  });

  const { data: n8nHealth, isLoading: n8nLoading } = useQuery({
    queryKey: ['super', 'monitoring', 'n8n'],
    queryFn: () => SuperAPI.getN8nHealth(),
    refetchInterval: 30000,
  });

  const { addNotification } = useNotifications();
  const [cardAnimations, setCardAnimations] = useState<Record<string, boolean>>({});
  const notifiedIssuesRef = useRef<Set<string>>(new Set());

  // Default data if API is loading
  const queueOverview = queueData || {
    queued: 150,
    sent: 1000,
    failed: 17,
    retryRate: 2.5,
  };

  const providerBreakdown = queueData?.providers || [
    { name: 'Provider A', queued: 120, sent: 500, failed: 10 },
    { name: 'Provider B', queued: 80, sent: 300, failed: 5 },
    { name: 'Provider C', queued: 50, sent: 200, failed: 2 },
  ];

  const notifications = notificationsData || [
    { channel: 'Email', provider: 'Provider A', status: 'Queued', count: 50, trend: 10, trendDirection: 'up' },
    { channel: 'Email', provider: 'Provider A', status: 'Sent', count: 200, trend: -5, trendDirection: 'down' },
    { channel: 'Email', provider: 'Provider A', status: 'Failed', count: 2, trend: 20, trendDirection: 'up' },
    { channel: 'SMS', provider: 'Provider B', status: 'Queued', count: 30, trend: 5, trendDirection: 'up' },
    { channel: 'SMS', provider: 'Provider B', status: 'Sent', count: 150, trend: -2, trendDirection: 'down' },
  ];

  const workflows = n8nHealth || [
    { name: 'Workflow A', lastSuccess: '2024-01-15 10:00', lastError: null, avgDuration: '2s' },
    { name: 'Workflow B', lastSuccess: '2024-01-15 10:05', lastError: '2024-01-14 15:00', avgDuration: '3s' },
    { name: 'Workflow C', lastSuccess: '2024-01-15 10:10', lastError: null, avgDuration: '1s' },
  ];

  useEffect(() => {
    // Trigger animations on mount
    const timer = setTimeout(() => {
      setCardAnimations({
        queued: true,
        sent: true,
        failed: true,
        retry: true,
      });
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Monitor for system abnormalities and send notifications
  useEffect(() => {
    // Check for high failure rate
    if (queueOverview.failed > 10 && !notifiedIssuesRef.current.has('high_failures')) {
      addNotification({
        type: 'system_abnormal',
        title: 'High Failure Rate Detected',
        message: `System has detected ${queueOverview.failed} failed messages. Please check the monitoring page.`,
        route: '/super/users/monitoring',
      });
      notifiedIssuesRef.current.add('high_failures');
    }

    // Check for high retry rate
    if (queueOverview.retryRate > 5 && !notifiedIssuesRef.current.has('high_retry')) {
      addNotification({
        type: 'system_abnormal',
        title: 'High Retry Rate Warning',
        message: `System retry rate is at ${queueOverview.retryRate}%. This may indicate system issues.`,
        route: '/super/users/monitoring',
      });
      notifiedIssuesRef.current.add('high_retry');
    }

    // Check for workflow errors
    workflows.forEach(workflow => {
      const issueKey = `workflow_error_${workflow.name}`;
      if (workflow.lastError && !notifiedIssuesRef.current.has(issueKey)) {
        addNotification({
          type: 'n8n_workflow_error',
          title: 'Workflow Error Detected',
          message: `Workflow "${workflow.name}" encountered an error. Last error: ${workflow.lastError}`,
          route: '/super/n8n-logs',
        });
        notifiedIssuesRef.current.add(issueKey);
      }
    });
  }, [queueOverview, workflows, addNotification]);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Queued':
        return 'px-3 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'Sent':
        return 'px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      case 'Failed':
        return 'px-3 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
      default:
        return 'px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  return (
    <AppShell role="super_admin">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <h2 className="text-4xl font-bold text-foreground-light dark:text-foreground-dark">
            Monitoring Outbound Queue Overview
          </h2>
        </header>

        {/* Outbound Queue Overview Cards */}
        <section className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Queued Card */}
            <div
              className={`bg-card-light dark:bg-card-dark rounded-xl shadow-soft p-6 transform transition-all duration-500 ${
                cardAnimations.queued ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              } hover:scale-[1.02] hover:shadow-lg border border-transparent hover:border-primary/20`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-subtle-light dark:text-subtle-dark">Queued</h3>
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
                  <span className="text-2xl">😊</span>
                </div>
              </div>
              <p className="text-3xl font-bold text-foreground-light dark:text-foreground-dark">
                {queueLoading ? '...' : queueOverview.queued.toLocaleString()}
              </p>
            </div>

            {/* Sent Card */}
            <div
              className={`bg-card-light dark:bg-card-dark rounded-xl shadow-soft p-6 transform transition-all duration-500 delay-100 ${
                cardAnimations.sent ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              } hover:scale-[1.02] hover:shadow-lg border border-transparent hover:border-primary/20`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-subtle-light dark:text-subtle-dark">Sent</h3>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-green-600 dark:text-green-400">check</span>
                </div>
              </div>
              <p className="text-3xl font-bold text-foreground-light dark:text-foreground-dark">
                {queueLoading ? '...' : queueOverview.sent.toLocaleString()}
              </p>
            </div>

            {/* Failed Card */}
            <div
              className={`bg-card-light dark:bg-card-dark rounded-xl shadow-soft p-6 transform transition-all duration-500 delay-200 ${
                cardAnimations.failed ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              } hover:scale-[1.02] hover:shadow-lg border border-transparent hover:border-primary/20`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-subtle-light dark:text-subtle-dark">Failed</h3>
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-red-600 dark:text-red-400">close</span>
                </div>
              </div>
              <p className="text-3xl font-bold text-foreground-light dark:text-foreground-dark">
                {queueLoading ? '...' : queueOverview.failed}
              </p>
            </div>

            {/* Retry Rate Card */}
            <div
              className={`bg-card-light dark:bg-card-dark rounded-xl shadow-soft p-6 transform transition-all duration-500 delay-300 ${
                cardAnimations.retry ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              } hover:scale-[1.02] hover:shadow-lg border border-transparent hover:border-primary/20`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-subtle-light dark:text-subtle-dark">Retry Rate</h3>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-purple-600 dark:text-purple-400">percent</span>
                </div>
              </div>
              <p className="text-3xl font-bold text-foreground-light dark:text-foreground-dark">
                {queueLoading ? '...' : `${queueOverview.retryRate}%`}
              </p>
            </div>
          </div>
        </section>

        {/* Breakdown by Provider */}
        <section className="mb-8">
          <h3 className="text-2xl font-bold text-foreground-light dark:text-foreground-dark mb-6">
            Breakdown by Provider
          </h3>
          <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-soft overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-background-light dark:bg-background-dark border-b border-border-light dark:border-border-dark">
                  <tr>
                    <th className="p-4 text-left font-bold text-foreground-light dark:text-foreground-dark">PROVIDER</th>
                    <th className="p-4 text-left font-bold text-foreground-light dark:text-foreground-dark">QUEUED</th>
                    <th className="p-4 text-left font-bold text-foreground-light dark:text-foreground-dark">SENT</th>
                    <th className="p-4 text-left font-bold text-foreground-light dark:text-foreground-dark">FAILED</th>
                  </tr>
                </thead>
                <tbody>
                  {providerBreakdown.map((provider, index) => (
                    <tr
                      key={provider.name}
                      className="border-b border-border-light dark:border-border-dark hover:bg-background-light dark:hover:bg-background-dark transition-colors"
                      style={{
                        animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`,
                      }}
                    >
                      <td className="p-4 text-foreground-light dark:text-foreground-dark font-medium">{provider.name}</td>
                      <td className="p-4 text-foreground-light dark:text-foreground-dark">{provider.queued.toLocaleString()}</td>
                      <td className="p-4 text-foreground-light dark:text-foreground-dark">{provider.sent.toLocaleString()}</td>
                      <td className="p-4 text-foreground-light dark:text-foreground-dark">{provider.failed}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Notifications Breakdown */}
        <section className="mb-8">
          <h3 className="text-2xl font-bold text-foreground-light dark:text-foreground-dark mb-6">
            Notifications Breakdown
          </h3>
          <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-soft overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-background-light dark:bg-background-dark border-b border-border-light dark:border-border-dark">
                  <tr>
                    <th className="p-4 text-left font-bold text-foreground-light dark:text-foreground-dark">CHANNEL</th>
                    <th className="p-4 text-left font-bold text-foreground-light dark:text-foreground-dark">PROVIDER</th>
                    <th className="p-4 text-left font-bold text-foreground-light dark:text-foreground-dark">STATUS</th>
                    <th className="p-4 text-left font-bold text-foreground-light dark:text-foreground-dark">COUNT</th>
                    <th className="p-4 text-left font-bold text-foreground-light dark:text-foreground-dark">TREND</th>
                  </tr>
                </thead>
                <tbody>
                  {notifications.map((notification, index) => (
                    <tr
                      key={`${notification.channel}-${notification.provider}-${notification.status}-${index}`}
                      className="border-b border-border-light dark:border-border-dark hover:bg-background-light dark:hover:bg-background-dark transition-colors"
                      style={{
                        animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`,
                      }}
                    >
                      <td className="p-4 text-foreground-light dark:text-foreground-dark font-medium">{notification.channel}</td>
                      <td className="p-4 text-foreground-light dark:text-foreground-dark">{notification.provider}</td>
                      <td className="p-4">
                        <span className={getStatusBadgeClass(notification.status)}>
                          {notification.status}
                        </span>
                      </td>
                      <td className="p-4 text-foreground-light dark:text-foreground-dark">{notification.count.toLocaleString()}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`material-symbols-outlined text-sm ${
                              notification.trendDirection === 'up'
                                ? 'text-green-500'
                                : 'text-red-500'
                            }`}
                          >
                            {notification.trendDirection === 'up' ? 'trending_up' : 'trending_down'}
                          </span>
                          <span
                            className={`text-sm font-medium ${
                              notification.trendDirection === 'up'
                                ? 'text-green-500'
                                : 'text-red-500'
                            }`}
                          >
                            {notification.trendDirection === 'up' ? '+' : ''}
                            {notification.trend}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* n8n Health */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-foreground-light dark:text-foreground-dark">
              n8n Health
            </h3>
            <a
              href="http://localhost:5678"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 transition-colors flex items-center gap-2 font-medium"
            >
              <span>View in n8n</span>
              <span className="material-symbols-outlined text-base">open_in_new</span>
            </a>
          </div>
          <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-soft overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-background-light dark:bg-background-dark border-b border-border-light dark:border-border-dark">
                  <tr>
                    <th className="p-4 text-left font-bold text-foreground-light dark:text-foreground-dark">WORKFLOW NAME</th>
                    <th className="p-4 text-left font-bold text-foreground-light dark:text-foreground-dark">LAST SUCCESS</th>
                    <th className="p-4 text-left font-bold text-foreground-light dark:text-foreground-dark">LAST ERROR</th>
                    <th className="p-4 text-left font-bold text-foreground-light dark:text-foreground-dark">AVG. DURATION</th>
                  </tr>
                </thead>
                <tbody>
                  {workflows.map((workflow, index) => (
                    <tr
                      key={workflow.name}
                      className="border-b border-border-light dark:border-border-dark hover:bg-background-light dark:hover:bg-background-dark transition-colors"
                      style={{
                        animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`,
                      }}
                    >
                      <td className="p-4 text-foreground-light dark:text-foreground-dark font-medium">{workflow.name}</td>
                      <td className="p-4 text-foreground-light dark:text-foreground-dark">{workflow.lastSuccess}</td>
                      <td className="p-4">
                        {workflow.lastError ? (
                          <span className="text-red-500 dark:text-red-400">{workflow.lastError}</span>
                        ) : (
                          <span className="text-subtle-light dark:text-subtle-dark">N/A</span>
                        )}
                      </td>
                      <td className="p-4 text-foreground-light dark:text-foreground-dark">{workflow.avgDuration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Add CSS animations */}
        <style>{`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </div>
    </AppShell>
  );
};

export default Monitoring;


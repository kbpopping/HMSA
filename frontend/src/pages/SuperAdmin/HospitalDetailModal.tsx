import { Hospital } from '../../api/endpoints';

interface HospitalDetailModalProps {
  hospital: Hospital;
  onClose: () => void;
}

/**
 * HospitalDetailModal - Shows comprehensive hospital information
 * 
 * PRODUCTION: Replace mock data with real API calls to fetch:
 * - Total employees, clinicians, patients
 * - Admin details
 * - System health metrics
 * - Database health status
 */
const HospitalDetailModal = ({ hospital, onClose }: HospitalDetailModalProps) => {
  // MOCK DATA - Replace with real API calls in production
  const mockStats = {
    totalEmployees: Math.floor(Math.random() * 200) + 50,
    totalClinicians: Math.floor(Math.random() * 50) + 10,
    totalPatients: Math.floor(Math.random() * 5000) + 1000,
    adminName: `Admin ${hospital.name.split(' ')[0]}`,
    dateJoined: new Date(hospital.created_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    lastLogin: new Date(Date.now() - Math.random() * 86400000 * 7).toLocaleString(),
    systemHealth: 'Healthy' as 'Healthy' | 'Warning' | 'Critical',
    databaseHealth: 'Operational' as 'Operational' | 'Degraded' | 'Down',
    uptime: '99.9%',
    activeAlerts: Math.floor(Math.random() * 3),
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-card-light dark:bg-card-dark min-h-screen w-full p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-foreground-light dark:text-foreground-dark">
            Hospital Details: {hospital.name}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-subtle-light dark:hover:bg-subtle-dark transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="bg-background-light dark:bg-background-dark p-6 rounded-lg">
            <h4 className="text-lg font-bold text-foreground-light dark:text-foreground-dark mb-4">
              Basic Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-subtle-light dark:text-subtle-dark">Hospital Name</p>
                <p className="font-medium text-foreground-light dark:text-foreground-dark">{hospital.name}</p>
              </div>
              <div>
                <p className="text-sm text-subtle-light dark:text-subtle-dark">Country</p>
                <p className="font-medium text-foreground-light dark:text-foreground-dark">{hospital.country || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm text-subtle-light dark:text-subtle-dark">Timezone</p>
                <p className="font-medium text-foreground-light dark:text-foreground-dark">{hospital.timezone}</p>
              </div>
              <div>
                <p className="text-sm text-subtle-light dark:text-subtle-dark">Created At</p>
                <p className="font-medium text-foreground-light dark:text-foreground-dark">{formatDate(hospital.created_at)}</p>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="bg-background-light dark:bg-background-dark p-6 rounded-lg">
            <h4 className="text-lg font-bold text-foreground-light dark:text-foreground-dark mb-4">
              Statistics
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-card-light dark:bg-card-dark rounded-lg">
                <p className="text-3xl font-bold text-primary">{mockStats.totalEmployees}</p>
                <p className="text-sm text-subtle-light dark:text-subtle-dark mt-1">Total Employees</p>
              </div>
              <div className="text-center p-4 bg-card-light dark:bg-card-dark rounded-lg">
                <p className="text-3xl font-bold text-primary">{mockStats.totalClinicians}</p>
                <p className="text-sm text-subtle-light dark:text-subtle-dark mt-1">Clinicians</p>
              </div>
              <div className="text-center p-4 bg-card-light dark:bg-card-dark rounded-lg">
                <p className="text-3xl font-bold text-primary">{mockStats.totalPatients.toLocaleString()}</p>
                <p className="text-sm text-subtle-light dark:text-subtle-dark mt-1">Total Patients</p>
              </div>
            </div>
          </div>

          {/* Admin Information */}
          <div className="bg-background-light dark:bg-background-dark p-6 rounded-lg">
            <h4 className="text-lg font-bold text-foreground-light dark:text-foreground-dark mb-4">
              Admin Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-subtle-light dark:text-subtle-dark">Admin Name</p>
                <p className="font-medium text-foreground-light dark:text-foreground-dark">{mockStats.adminName}</p>
              </div>
              <div>
                <p className="text-sm text-subtle-light dark:text-subtle-dark">Date Joined</p>
                <p className="font-medium text-foreground-light dark:text-foreground-dark">{mockStats.dateJoined}</p>
              </div>
              <div>
                <p className="text-sm text-subtle-light dark:text-subtle-dark">Last Login</p>
                <p className="font-medium text-foreground-light dark:text-foreground-dark">{mockStats.lastLogin}</p>
              </div>
            </div>
          </div>

          {/* System Health */}
          <div className="bg-background-light dark:bg-background-dark p-6 rounded-lg">
            <h4 className="text-lg font-bold text-foreground-light dark:text-foreground-dark mb-4">
              System Health
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-sm text-subtle-light dark:text-subtle-dark">System Status</p>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    mockStats.systemHealth === 'Healthy'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                      : mockStats.systemHealth === 'Warning'
                      ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                      : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                  }`}>
                    {mockStats.systemHealth}
                  </span>
                </div>
                <p className="text-sm text-subtle-light dark:text-subtle-dark">Uptime: {mockStats.uptime}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-sm text-subtle-light dark:text-subtle-dark">Database Status</p>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    mockStats.databaseHealth === 'Operational'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                      : mockStats.databaseHealth === 'Degraded'
                      ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                      : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                  }`}>
                    {mockStats.databaseHealth}
                  </span>
                </div>
                {mockStats.activeAlerts > 0 && (
                  <p className="text-sm text-yellow-600 dark:text-yellow-400">
                    {mockStats.activeAlerts} active alert{mockStats.activeAlerts > 1 ? 's' : ''} requiring attention
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Potential Issues */}
          {mockStats.activeAlerts > 0 && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-yellow-600 dark:text-yellow-400">warning</span>
                <div>
                  <p className="font-bold text-yellow-800 dark:text-yellow-300 mb-1">Potential Issues Detected</p>
                  <ul className="text-sm text-yellow-700 dark:text-yellow-400 space-y-1">
                    {mockStats.activeAlerts > 0 && (
                      <li>• High latency detected in appointment scheduling system</li>
                    )}
                    {mockStats.activeAlerts > 1 && (
                      <li>• Database backup overdue (last backup: 2 days ago)</li>
                    )}
                    {mockStats.activeAlerts > 2 && (
                      <li>• SMS delivery rate below threshold (85% success rate)</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-4 pt-4">
            <button
              onClick={onClose}
              className="bg-subtle-light dark:bg-subtle-dark text-foreground-light dark:text-foreground-dark px-5 py-2.5 rounded-lg font-bold hover:bg-subtle-light/80 dark:hover:bg-subtle-dark/80 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HospitalDetailModal;


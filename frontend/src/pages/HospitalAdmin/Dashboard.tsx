import AppShell from '../../components/layout/AppShell';

/**
 * HospitalAdminDashboard - Mock hospital admin dashboard
 * 
 * PRODUCTION: Replace with real hospital admin dashboard implementation
 * This is a placeholder page for when super admin impersonates a hospital
 * 
 * TODO: Implement full hospital admin dashboard with:
 * - Hospital-specific KPIs
 * - Appointments calendar
 * - Patient management
 * - Clinician management
 * - System health metrics
 */
const HospitalAdminDashboard = () => {
  return (
    <AppShell role="hospital_admin">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12">
          <h2 className="text-4xl font-bold text-foreground-light dark:text-foreground-dark">
            Hospital Admin Dashboard
          </h2>
          <p className="text-subtle-light dark:text-subtle-dark mt-2">
            Hospital management and operations overview.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-card-light dark:bg-card-dark p-6 rounded-xl shadow-soft">
            <p className="text-subtle-light dark:text-subtle-dark mb-1">Appointments Today</p>
            <p className="text-4xl font-bold text-foreground-light dark:text-foreground-dark">24</p>
          </div>
          <div className="bg-card-light dark:bg-card-dark p-6 rounded-xl shadow-soft">
            <p className="text-subtle-light dark:text-subtle-dark mb-1">Total Patients</p>
            <p className="text-4xl font-bold text-foreground-light dark:text-foreground-dark">1,234</p>
          </div>
          <div className="bg-card-light dark:bg-card-dark p-6 rounded-xl shadow-soft">
            <p className="text-subtle-light dark:text-subtle-dark mb-1">Active Clinicians</p>
            <p className="text-4xl font-bold text-foreground-light dark:text-foreground-dark">12</p>
          </div>
          <div className="bg-card-light dark:bg-card-dark p-6 rounded-xl shadow-soft">
            <p className="text-subtle-light dark:text-subtle-dark mb-1">Reminders Sent (Today)</p>
            <p className="text-4xl font-bold text-foreground-light dark:text-foreground-dark">156</p>
          </div>
        </div>

        <div className="bg-yellow-100 dark:bg-yellow-900/30 border-l-4 border-yellow-500 text-yellow-700 dark:text-yellow-300 p-4 rounded-lg mb-6">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined">info</span>
            <p>
              <span className="font-bold">This is a mock hospital admin dashboard.</span> Full implementation coming soon.
            </p>
          </div>
        </div>

        <div className="bg-card-light dark:bg-card-dark p-6 rounded-xl shadow-soft">
          <h3 className="text-xl font-bold text-foreground-light dark:text-foreground-dark mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 bg-background-light dark:bg-background-dark rounded-lg hover:bg-primary/10 transition-colors text-left">
              <span className="material-symbols-outlined text-primary mb-2">event</span>
              <p className="font-bold text-foreground-light dark:text-foreground-dark">View Appointments</p>
              <p className="text-sm text-subtle-light dark:text-subtle-dark">Manage schedule</p>
            </button>
            <button className="p-4 bg-background-light dark:bg-background-dark rounded-lg hover:bg-primary/10 transition-colors text-left">
              <span className="material-symbols-outlined text-primary mb-2">people</span>
              <p className="font-bold text-foreground-light dark:text-foreground-dark">Manage Patients</p>
              <p className="text-sm text-subtle-light dark:text-subtle-dark">View patient list</p>
            </button>
            <button className="p-4 bg-background-light dark:bg-background-dark rounded-lg hover:bg-primary/10 transition-colors text-left">
              <span className="material-symbols-outlined text-primary mb-2">local_hospital</span>
              <p className="font-bold text-foreground-light dark:text-foreground-dark">Clinicians</p>
              <p className="text-sm text-subtle-light dark:text-subtle-dark">Manage staff</p>
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default HospitalAdminDashboard;

